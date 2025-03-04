import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Input,
  Button,
  VStack,
  Text,
  Avatar,
  Heading,
  Spinner,
  Center,
  HStack,
  Divider,
  useToast
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Parse from 'parse/dist/parse.min.js';
import { toaster } from '../components/ui/toaster';

function MessagesPage() {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const processedMessageIdsRef = useRef(new Set());
  
  const messagesEndRef = useRef(null);
  const liveQuerySubscription = useRef(null);
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    // Clear all state when component mounts
    setConversations([]);
    setActiveConversation(null);
    setMessages([]);
    setUsers([]);
    setSearchQuery('');
    setShowUserSearch(false);
    
    const checkAuth = async () => {
      try {
        const user = await Parse.User.current();
        if (!user) {
          navigate('/login');
          return;
        }
        setCurrentUser(user);
        fetchConversations(user);
      } catch (error) {
        console.error('Error checking authentication:', error);
        navigate('/login');
      }
    };
    
    checkAuth();
    
    // Clean up subscription when component unmounts
    return () => {
      if (liveQuerySubscription.current) {
        liveQuerySubscription.current.unsubscribe();
      }
    };
  }, [navigate]);

  // Fetch user's conversations
  const fetchConversations = async (user) => {
    setIsLoading(true);
    try {
      // Query conversations where the current user is a participant
      const query = new Parse.Query('Conversation');
      query.equalTo('participants', user);
      query.include('participants');
      query.descending('updatedAt');
      
      const results = await query.find();
      
      // Format conversations
      const formattedConversations = results.map(conv => {
        const participants = conv.get('participants');
        // Find the other participant (not the current user)
        const otherParticipant = participants.find(p => p.id !== user.id);
        
        return {
          id: conv.id,
          user: {
            id: otherParticipant.id,
            username: otherParticipant.get('username'),
            avatar: otherParticipant.get('avatar') ? otherParticipant.get('avatar').url() : null
          },
          lastMessage: conv.get('lastMessage') || '',
          updatedAt: conv.get('updatedAt')
        };
      });
      
      setConversations(formattedConversations);
      
      // If there are conversations, set the first one as active
      if (formattedConversations.length > 0) {
        setActiveConversation(formattedConversations[0]);
        fetchMessages(formattedConversations[0].id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to load conversations',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    try {
      // Clear the processed message IDs when fetching new messages
      processedMessageIdsRef.current = new Set();
      
      // Query messages for this conversation
      const query = new Parse.Query('Message');
      const conversation = new Parse.Object('Conversation');
      conversation.id = conversationId;
      
      query.equalTo('conversation', conversation);
      query.include('sender');
      query.ascending('createdAt');
      
      const results = await query.find();
      
      // Format messages
      const formattedMessages = results.map(msg => ({
        id: msg.id,
        text: msg.get('text'),
        sender: {
          id: msg.get('sender').id,
          username: msg.get('sender').get('username')
        },
        createdAt: msg.get('createdAt')
      }));
      
      // Add all message IDs to the processed set
      formattedMessages.forEach(msg => {
        processedMessageIdsRef.current.add(msg.id);
      });
      
      setMessages(formattedMessages);
      
      // Set up Live Query subscription for new messages
      setupLiveQuery(conversationId);
      
      // Scroll to bottom of messages
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to load messages',
        type: 'error',
      });
    }
  };

  // Set up Live Query subscription for real-time messages
  const setupLiveQuery = async (conversationId) => {
    // Capture the current user in a closure to avoid null reference later
    const capturedUser = currentUser;
    
    // Unsubscribe from previous subscription if exists
    if (liveQuerySubscription.current) {
      liveQuerySubscription.current.unsubscribe();
      console.log('Unsubscribed from previous Live Query');
    }
    
    try {
      console.log('Setting up Live Query for conversation:', conversationId);
      
      // Create a query that will be used for the subscription
      const query = new Parse.Query('Message');
      const conversation = new Parse.Object('Conversation');
      conversation.id = conversationId;
      query.equalTo('conversation', conversation);
      query.include('sender');
      
      console.log('Created query for Message class with conversation ID:', conversationId);
      
      // Subscribe to the query
      liveQuerySubscription.current = await query.subscribe();
      console.log('Successfully subscribed to Live Query');
      
      // Handle connection open
      liveQuerySubscription.current.on('open', () => {
        console.log('Live Query connection opened for conversation:', conversationId);
      });
      
      // Handle new messages
      liveQuerySubscription.current.on('create', (message) => {
        console.log('New message received via Live Query:', message.id);
        
        // Check if we've already processed this message
        if (processedMessageIdsRef.current.has(message.id)) {
          console.log('Skipping duplicate message:', message.id);
          return;
        }
        
        // Add the message ID to the processed set
        processedMessageIdsRef.current.add(message.id);
        
        // Format the new message
        const newMessage = {
          id: message.id,
          text: message.get('text'),
          sender: {
            id: message.get('sender').id,
            username: message.get('sender').get('username')
          },
          createdAt: message.get('createdAt')
        };
        
        console.log('Formatted new message:', newMessage);
        
        // Add the new message to the messages state
        setMessages(prevMessages => [...prevMessages, newMessage]);
        
        // Use the captured user to avoid null reference
        if (capturedUser && message.get('sender').id !== capturedUser.id) {
          setConversations(prevConversations => {
            return prevConversations.map(conv => {
              if (conv.id === conversationId) {
                return {
                  ...conv,
                  lastMessage: message.get('text'),
                  updatedAt: message.get('createdAt')
                };
              }
              return conv;
            });
          });
        } else {
          // If user check fails, update without the check
          setConversations(prevConversations => {
            return prevConversations.map(conv => {
              if (conv.id === conversationId) {
                return {
                  ...conv,
                  lastMessage: message.get('text'),
                  updatedAt: message.get('createdAt')
                };
              }
              return conv;
            });
          });
        }
        
        // Scroll to bottom of messages
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      });
      
      // Handle errors
      liveQuerySubscription.current.on('error', (error) => {
        console.error('Live Query error:', error);
      });
      
      // Handle subscription close
      liveQuerySubscription.current.on('close', () => {
        console.log('Live Query connection closed for conversation:', conversationId);
      });
      
    } catch (error) {
      console.error('Error setting up live query:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to set up real-time messaging',
        type: 'error',
      });
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!message.trim() || !activeConversation) return;
    
    setIsSending(true);
    const messageText = message; // Store the message text
    setMessage(''); // Clear input immediately for better UX
    
    try {
      // Get the current user again to ensure we have the latest reference
      const currentUserObj = Parse.User.current();
      if (!currentUserObj) {
        throw new Error('You are not logged in');
      }
      
      // Create message
      const Message = Parse.Object.extend('Message');
      const newMessage = new Message();
      
      // Set conversation pointer
      const conversation = new Parse.Object('Conversation');
      conversation.id = activeConversation.id;
      
      newMessage.set('conversation', conversation);
      newMessage.set('sender', currentUserObj);
      newMessage.set('text', messageText);
      
      const savedMessage = await newMessage.save();
      
      // Add the message ID to the processed set
      processedMessageIdsRef.current.add(savedMessage.id);
      
      // Add the message to the UI immediately for the sender
      const formattedMessage = {
        id: savedMessage.id,
        text: messageText,
        sender: {
          id: currentUserObj.id,
          username: currentUserObj.get('username')
        },
        createdAt: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, formattedMessage]);
      
      // Update conversation's lastMessage
      const conversationObj = await new Parse.Query('Conversation').get(activeConversation.id);
      conversationObj.set('lastMessage', messageText);
      await conversationObj.save();
      
      // Update the conversation in the list
      setConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.id === activeConversation.id) {
            return {
              ...conv,
              lastMessage: messageText,
              updatedAt: new Date()
            };
          }
          return conv;
        });
      });
      
      // Scroll to bottom of messages
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to send message: ' + error.message,
        type: 'error',
      });
      // If there's an error, put the message back in the input
      setMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  // Search for users to start a new conversation
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }
    
    try {
      console.log('Searching for users with query:', query);
      
      // Create a query for the User class
      const userQuery = new Parse.Query(Parse.User);
      
      // Search for username containing the query string (case insensitive)
      userQuery.contains('username', query);
      
      // Don't include the current user in results
      userQuery.notEqualTo('objectId', currentUser.id);
      
      // Limit to 10 results
      userQuery.limit(10);
      
      // Execute the query
      const results = await userQuery.find();
      
      // Format users
      const formattedUsers = results.map(user => ({
        id: user.id,
        username: user.get('username'),
        avatar: user.get('avatar') ? user.get('avatar').url() : null
      }));
      
      console.log('Search results:', formattedUsers);
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error searching users:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to search users',
        type: 'error',
      });
    }
  };

  // Start a new conversation with a user
  const startConversation = async (userId) => {
    console.log('Starting conversation with user ID:', userId);
    
    try {
      // Check if a conversation already exists with this user
      const query = new Parse.Query('Conversation');
      const otherUser = new Parse.User();
      otherUser.id = userId;
      
      query.equalTo('participants', currentUser);
      query.equalTo('participants', otherUser);
      
      const existingConv = await query.first();
      
      if (existingConv) {
        console.log('Found existing conversation:', existingConv.id);
        
        // Conversation exists, set it as active
        const participants = existingConv.get('participants') || [];
        const otherParticipant = participants.find(p => p && p.id !== currentUser.id);
        
        if (!otherParticipant) {
          throw new Error('Could not find the other participant in the conversation');
        }
        
        const conversation = {
          id: existingConv.id,
          user: {
            id: otherParticipant.id,
            username: otherParticipant.get('username') || 'Unknown User',
            avatar: otherParticipant.get('avatar') ? otherParticipant.get('avatar').url() : null
          },
          lastMessage: existingConv.get('lastMessage') || '',
          updatedAt: existingConv.get('updatedAt')
        };
        
        setActiveConversation(conversation);
        fetchMessages(conversation.id);
      } else {
        console.log('Creating new conversation with user:', userId);
        
        // Create a new conversation
        const Conversation = Parse.Object.extend('Conversation');
        const newConversation = new Conversation();
        
        // Get the other user object
        const userQuery = new Parse.Query(Parse.User);
        const otherUserObj = await userQuery.get(userId);
        
        if (!otherUserObj) {
          throw new Error('Could not find the user');
        }
        
        // Set participants
        newConversation.set('participants', [currentUser, otherUserObj]);
        newConversation.set('lastMessage', '');
        
        // Save the conversation
        const savedConv = await newConversation.save();
        console.log('New conversation created:', savedConv.id);
        
        // Format the conversation
        const conversation = {
          id: savedConv.id,
          user: {
            id: otherUserObj.id,
            username: otherUserObj.get('username') || 'Unknown User',
            avatar: otherUserObj.get('avatar') ? otherUserObj.get('avatar').url() : null
          },
          lastMessage: '',
          updatedAt: savedConv.get('updatedAt')
        };
        
        // Add to conversations list
        setConversations(prev => [conversation, ...prev]);
        
        // Set as active conversation
        setActiveConversation(conversation);
        setMessages([]);
        
        // Reset search
        setShowUserSearch(false);
        setSearchQuery('');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to start conversation: ' + error.message,
        type: 'error',
      });
    }
  };

  // Format date for messages
  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for conversation list
  const formatConversationDate = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    // If today, show time
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (messageDate.getFullYear() === now.getFullYear()) {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return messageDate.toLocaleDateString();
  };

  // Add this near the top of your component
  useEffect(() => {
    // Test Live Query connection
    const testLiveQuery = async () => {
      try {
        console.log('Testing Live Query connection...');
        console.log('Live Query URL:', Parse.liveQueryServerURL);
        
        const query = new Parse.Query('Message');
        console.log('Created test query for Message class');
        
        const subscription = await query.subscribe();
        console.log('Live Query subscription successful!');
        
        subscription.on('open', () => {
          console.log('Live Query connection opened successfully');
        });
        
        subscription.on('create', (object) => {
          console.log('Live Query create event received:', object.id);
        });
        
        subscription.on('update', (object) => {
          console.log('Live Query update event received:', object.id);
        });
        
        subscription.on('enter', (object) => {
          console.log('Live Query enter event received:', object.id);
        });
        
        subscription.on('leave', (object) => {
          console.log('Live Query leave event received:', object.id);
        });
        
        subscription.on('delete', (object) => {
          console.log('Live Query delete event received:', object.id);
        });
        
        subscription.on('error', (error) => {
          console.error('Live Query error:', error);
        });
        
        // Unsubscribe after a few seconds to test
        setTimeout(() => {
          subscription.unsubscribe();
          console.log('Unsubscribed from test Live Query');
        }, 10000);
      } catch (error) {
        console.error('Error testing Live Query:', error);
      }
    };
    
    testLiveQuery();
  }, []);

  return (
    <Flex h="100vh">
      {/* Chat List Sidebar */}
      <Box w="300px" borderRightWidth="1px" borderColor="gray.600" p={4} bg="gray.800">
        <Heading size="md" mb={4}>
          Messages
        </Heading>
        
        <Flex mb={4}>
          <Input 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchUsers(e.target.value);
            }}
            mr={2}
          />
          <Button 
            onClick={() => {
              setShowUserSearch(!showUserSearch);
              if (!showUserSearch) {
                setSearchQuery('');
                setUsers([]);
              }
            }}
          >
            {showUserSearch ? 'Cancel' : 'New'}
          </Button>
        </Flex>
        
        {isLoading ? (
          <Center py={10}>
            <Spinner size="lg" />
          </Center>
        ) : showUserSearch ? (
          // User search results
          <VStack align="stretch" spacing={2}>
            {users.length > 0 ? (
              users.map(user => (
                <Box 
                  key={user.id} 
                  p={3} 
                  borderRadius="md" 
                  _hover={{ bg: 'gray.700' }}
                  cursor="pointer"
                  onClick={() => startConversation(user.id)}
                >
                  <HStack>
                    <Avatar.Root size="sm">
                      <Avatar.Fallback>{user.username ? user.username[0] : '?'}</Avatar.Fallback>
                      <Avatar.Image src={user.avatar} alt={user.username || 'User'} />
                    </Avatar.Root>
                    <Text>{user.username}</Text>
                  </HStack>
                </Box>
              ))
            ) : searchQuery ? (
              <Text color="gray.400" textAlign="center">No users found</Text>
            ) : (
              <Text color="gray.400" textAlign="center">Search for users to message</Text>
            )}
          </VStack>
        ) : (
          // Conversations list
          <VStack align="stretch" spacing={0}>
            {conversations.length > 0 ? (
              conversations.map(conv => (
                <Box 
                  key={conv.id} 
                  p={3} 
                  borderRadius="md" 
                  bg={activeConversation?.id === conv.id ? 'gray.700' : 'transparent'}
                  _hover={{ bg: 'gray.700' }}
                  cursor="pointer"
                  onClick={() => {
                    setActiveConversation(conv);
                    fetchMessages(conv.id);
                  }}
                >
                  <HStack>
                    <Avatar.Root size="sm">
                      <Avatar.Fallback>{conv.user.username ? conv.user.username[0] : '?'}</Avatar.Fallback>
                      <Avatar.Image src={conv.user.avatar} alt={conv.user.username || 'User'} />
                    </Avatar.Root>
                    <Box flex="1" overflow="hidden">
                      <Flex justify="space-between" align="center">
                        <Text fontWeight="bold" noOfLines={1}>{conv.user.username}</Text>
                        <Text fontSize="xs" color="gray.400">
                          {formatConversationDate(conv.updatedAt)}
                        </Text>
                      </Flex>
                      <Text fontSize="sm" color="gray.400" noOfLines={1}>
                        {conv.lastMessage || 'No messages yet'}
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              ))
            ) : (
              <Text color="gray.400" textAlign="center" mt={8}>
                No conversations yet. Start a new one!
              </Text>
            )}
          </VStack>
        )}
      </Box>

      {/* Chat Window */}
      <Box flex={1} p={0} display="flex" flexDirection="column" bg="gray.900">
        {activeConversation ? (
          <>
        {/* Chat Header */}
            <Flex align="center" p={4} borderBottomWidth="1px" borderColor="gray.700">
          <Avatar.Root size="sm" mr={2}>
                <Avatar.Fallback>{activeConversation.user.username ? activeConversation.user.username[0] : '?'}</Avatar.Fallback>
                <Avatar.Image src={activeConversation.user.avatar} alt={activeConversation.user.username || 'User'} />
          </Avatar.Root>
              <Text fontWeight="bold">{activeConversation.user.username}</Text>
          {isTyping && (
                <Text ml={2} color="gray.400" fontSize="sm">
              is typing...
            </Text>
          )}
        </Flex>

        {/* Messages */}
            <Box 
              flex={1} 
              p={4} 
              overflowY="auto" 
              display="flex" 
              flexDirection="column"
            >
              {messages.length > 0 ? (
                messages.map((msg) => (
            <Box
              key={msg.id}
                    alignSelf={msg.sender.id === currentUser.id ? 'flex-end' : 'flex-start'}
                    bg={msg.sender.id === currentUser.id ? 'blue.500' : 'gray.700'}
                    color={msg.sender.id === currentUser.id ? 'white' : 'white'}
              p={3}
              borderRadius="lg"
              maxW="70%"
                    mb={2}
                  >
                    <Text>{msg.text}</Text>
                    <Text fontSize="xs" color={msg.sender.id === currentUser.id ? 'blue.100' : 'gray.400'} textAlign="right" mt={1}>
                      {formatMessageTime(msg.createdAt)}
                    </Text>
                  </Box>
                ))
              ) : (
                <Center flex={1}>
                  <Text color="gray.400">
                    No messages yet. Say hello!
                  </Text>
                </Center>
              )}
              <div ref={messagesEndRef} />
            </Box>

        {/* Message Input */}
            <Flex p={4} borderTopWidth="1px" borderColor="gray.700">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setIsTyping(e.target.value.length > 0);
            }}
                mr={2}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button 
                colorScheme="blue" 
                onClick={sendMessage}
                isLoading={isSending}
                disabled={!message.trim() || isSending}
              >
                Send
              </Button>
        </Flex>
          </>
        ) : (
          <Center flex={1}>
            <VStack>
              <Text fontSize="xl" fontWeight="bold">Welcome to Messages</Text>
              <Text color="gray.400">
                Select a conversation or start a new one
              </Text>
            </VStack>
          </Center>
        )}
      </Box>
    </Flex>
  );
}

export default MessagesPage; 