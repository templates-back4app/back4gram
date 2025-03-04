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
  const [processedMessageIds, setProcessedMessageIds] = useState(new Set());
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const liveQuerySubscription = useRef(null);
  const typingStatusSubscription = useRef(null);
  const navigate = useNavigate();
  const typingTimerRef = useRef(null);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        const user = await Parse.User.current();
        if (!user) {
          console.log('No user found, redirecting to login');
          navigate('/login');
          return;
        }
        console.log('User authenticated:', user.id, user.get('username'));
        setCurrentUser(user);
        fetchConversations(user);
      } catch (error) {
        console.error('Error checking authentication:', error);
        navigate('/login');
      }
    };
    
    checkAuth();
    
    // Clean up subscriptions and timer when component unmounts
    return () => {
      if (liveQuerySubscription.current) {
        liveQuerySubscription.current.unsubscribe();
      }
      if (typingStatusSubscription.current) {
        typingStatusSubscription.current.unsubscribe();
      }
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [navigate]);

  // Fetch user's conversations
  const fetchConversations = async (user) => {
    setIsLoading(true);
    try {
      console.log('Fetching conversations for user:', user.id);
      
      // Query conversations where the current user is a participant
      const query = new Parse.Query('Conversation');
      query.equalTo('participants', user);
      query.include('participants');
      query.descending('updatedAt');
      
      const results = await query.find();
      console.log('Found conversations:', results.length);
      
      // Format conversations
      const formattedConversations = results.map(conv => {
        const participants = conv.get('participants');
        // Find the other participant (not the current user)
        const otherParticipant = participants.find(p => p.id !== user.id);
        
        if (!otherParticipant) {
          console.warn('Could not find other participant in conversation:', conv.id);
          return null;
        }
        
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
      }).filter(Boolean); // Remove any null entries
      
      console.log('Formatted conversations:', formattedConversations);
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

  // Melhorar a função resetMessageState
  const resetMessageState = () => {
    console.log('Resetting message state');
    setMessages([]);
    setProcessedMessageIds(new Set());
    setOtherUserTyping(false);
    
    if (liveQuerySubscription.current) {
      liveQuerySubscription.current.unsubscribe();
      liveQuerySubscription.current = null;
      console.log('Unsubscribed from Live Query in resetMessageState');
    }
    
    if (typingStatusSubscription.current) {
      typingStatusSubscription.current.unsubscribe();
      typingStatusSubscription.current = null;
      console.log('Unsubscribed from typing status subscription in resetMessageState');
    }
  };

  // Update the fetchMessages function to reset state first
  const fetchMessages = async (conversationId) => {
    // Reset message state to avoid any lingering messages or subscriptions
    resetMessageState();
    
    try {
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
      
      // Initialize the set of processed message IDs
      const messageIds = new Set(formattedMessages.map(msg => msg.id));
      
      // Set state after processing all messages
      setMessages(formattedMessages);
      setProcessedMessageIds(messageIds);
      
      // Set up Live Query subscription for new messages
      setupLiveQuery(conversationId);
      
      // Set up typing status subscription
      setupTypingStatusSubscription(conversationId);
      
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
        if (processedMessageIds.has(message.id)) {
          console.log('Skipping duplicate message:', message.id);
          return;
        }
        
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
        
        // Add the message ID to the set of processed IDs
        setProcessedMessageIds(prevIds => {
          const newIds = new Set(prevIds);
          newIds.add(message.id);
          return newIds;
        });
        
        // Add the new message to the messages state
        setMessages(prevMessages => {
          // Check if the message is already in the list (additional duplicate check)
          if (prevMessages.some(msg => msg.id === message.id)) {
            console.log('Message already in list, not adding again:', message.id);
            return prevMessages;
          }
          return [...prevMessages, newMessage];
        });
        
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

  // Função para configurar a assinatura do status de digitação
  const setupTypingStatusSubscription = async (conversationId) => {
    // Cancelar assinatura anterior, se existir
    if (typingStatusSubscription.current) {
      typingStatusSubscription.current.unsubscribe();
      console.log('Unsubscribed from previous typing status subscription');
    }
    
    try {
      console.log('Setting up typing status subscription for conversation:', conversationId);
      
      // Criar uma consulta para a classe TypingStatus
      const query = new Parse.Query('TypingStatus');
      const conversation = new Parse.Object('Conversation');
      conversation.id = conversationId;
      
      // Filtrar por conversa
      query.equalTo('conversation', conversation);
      
      // Não incluir o status do usuário atual
      query.notEqualTo('user', currentUser);
      
      // Assinar à consulta
      typingStatusSubscription.current = await query.subscribe();
      console.log('Successfully subscribed to typing status');
      
      // Manipular eventos de criação
      typingStatusSubscription.current.on('create', (status) => {
        console.log('Typing status created:', status.get('isTyping'));
        setOtherUserTyping(status.get('isTyping'));
      });
      
      // Manipular eventos de atualização
      typingStatusSubscription.current.on('update', (status) => {
        console.log('Typing status updated:', status.get('isTyping'));
        setOtherUserTyping(status.get('isTyping'));
      });
      
      // Manipular erros
      typingStatusSubscription.current.on('error', (error) => {
        console.error('Typing status subscription error:', error);
      });
    } catch (error) {
      console.error('Error setting up typing status subscription:', error);
    }
  };

  // Função para atualizar o status de digitação
  const updateTypingStatus = async (isTyping) => {
    if (!activeConversation || !currentUser) return;
    
    try {
      // Verificar se já existe um status de digitação para este usuário e conversa
      const query = new Parse.Query('TypingStatus');
      const conversation = new Parse.Object('Conversation');
      conversation.id = activeConversation.id;
      
      query.equalTo('user', currentUser);
      query.equalTo('conversation', conversation);
      
      const existingStatus = await query.first();
      
      if (existingStatus) {
        // Atualizar o status existente
        existingStatus.set('isTyping', isTyping);
        await existingStatus.save();
      } else {
        // Criar um novo status
        const TypingStatus = Parse.Object.extend('TypingStatus');
        const newStatus = new TypingStatus();
        
        newStatus.set('user', currentUser);
        newStatus.set('conversation', conversation);
        newStatus.set('isTyping', isTyping);
        
        await newStatus.save();
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!message.trim() || !activeConversation) return;
    
    const messageText = message.trim(); // Store the message text
    setIsSending(true);
    setMessage(''); // Clear input immediately to prevent double-sending
    setIsTyping(false); // Clear typing status locally
    updateTypingStatus(false); // Clear typing status on server
    
    // Clear typing timer
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    
    try {
      // Create message
      const Message = Parse.Object.extend('Message');
      const newMessage = new Message();
      
      // Set conversation pointer
      const conversation = new Parse.Object('Conversation');
      conversation.id = activeConversation.id;
      
      newMessage.set('conversation', conversation);
      newMessage.set('sender', currentUser);
      newMessage.set('text', messageText);
      
      // Save the message but don't add it to UI - let Live Query handle it
      const savedMessage = await newMessage.save();
      
      // Add the message ID to the set of processed IDs to prevent duplication
      // when it comes back through Live Query
      setProcessedMessageIds(prevIds => {
        const newIds = new Set(prevIds);
        newIds.add(savedMessage.id);
        return newIds;
      });
      
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
      
    } catch (error) {
      console.error('Error sending message:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to send message',
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
      userQuery.contains('username', query.toLowerCase());
      
      // Don't include the current user in results
      userQuery.notEqualTo('objectId', currentUser.id);
      
      // Limit to 10 results
      userQuery.limit(10);
      
      // Execute the query
      const results = await userQuery.find();
      console.log('User search results:', results.length);
      
      // Format users
      const formattedUsers = results.map(user => ({
        id: user.id,
        username: user.get('username'),
        avatar: user.get('avatar') ? user.get('avatar').url() : null
      }));
      
      console.log('Formatted users:', formattedUsers);
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
      
      // Create pointers to both users
      const currentUserPointer = Parse.User.current();
      const otherUserPointer = new Parse.User();
      otherUserPointer.id = userId;
      
      // Find conversations where both users are participants
      query.containsAll('participants', [currentUserPointer, otherUserPointer]);
      
      const existingConv = await query.first();
      
      if (existingConv) {
        console.log('Found existing conversation:', existingConv.id);
        
        // Get the other user object
        const userQuery = new Parse.Query(Parse.User);
        const otherUser = await userQuery.get(userId);
        
        // Format the conversation
        const conversation = {
          id: existingConv.id,
          user: {
            id: otherUser.id,
            username: otherUser.get('username'),
            avatar: otherUser.get('avatar') ? otherUser.get('avatar').url() : null
          },
          lastMessage: existingConv.get('lastMessage') || '',
          updatedAt: existingConv.get('updatedAt')
        };
        
        // Set as active conversation
        setActiveConversation(conversation);
        fetchMessages(conversation.id);
      } else {
        console.log('Creating new conversation with user:', userId);
        
        // Get the other user object
        const userQuery = new Parse.Query(Parse.User);
        const otherUser = await userQuery.get(userId);
        
        // Create a new conversation
        const Conversation = Parse.Object.extend('Conversation');
        const newConversation = new Conversation();
        
        // Set participants
        newConversation.set('participants', [currentUserPointer, otherUserPointer]);
        newConversation.set('lastMessage', '');
        
        // Save the conversation
        const savedConv = await newConversation.save();
        console.log('New conversation created:', savedConv.id);
        
        // Format the conversation
        const conversation = {
          id: savedConv.id,
          user: {
            id: otherUser.id,
            username: otherUser.get('username'),
            avatar: otherUser.get('avatar') ? otherUser.get('avatar').url() : null
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
        description: 'Failed to start conversation',
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
              const value = e.target.value;
              setSearchQuery(value);
              if (value.trim().length > 0) {
                searchUsers(value);
              } else {
                setUsers([]);
              }
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
                      <Avatar.Fallback>{user.username[0]}</Avatar.Fallback>
                      <Avatar.Image src={user.avatar} alt={user.username} />
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
                    if (activeConversation?.id !== conv.id) {
                      setActiveConversation(conv);
                      fetchMessages(conv.id);
                    }
                  }}
                >
                  <HStack>
                    <Avatar.Root size="sm">
                      <Avatar.Fallback>{conv.user.username[0]}</Avatar.Fallback>
                      <Avatar.Image src={conv.user.avatar} alt={conv.user.username} />
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
                <Avatar.Fallback>{activeConversation.user.username[0]}</Avatar.Fallback>
                <Avatar.Image src={activeConversation.user.avatar} alt={activeConversation.user.username} />
          </Avatar.Root>
              <Text fontWeight="bold">{activeConversation.user.username}</Text>
          {otherUserTyping && (
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
              
              // Set typing status to true locally
              setIsTyping(true);
              
              // Update typing status on server
              updateTypingStatus(true);
              
              // Clear any existing timer
              if (typingTimerRef.current) {
                clearTimeout(typingTimerRef.current);
              }
              
              // Set a new timer to turn off typing status after 2 seconds of inactivity
              typingTimerRef.current = setTimeout(() => {
                setIsTyping(false);
                updateTypingStatus(false);
              }, 2000);
            }}
            mr={2}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
                // Also clear typing status when sending a message
                setIsTyping(false);
                updateTypingStatus(false);
                if (typingTimerRef.current) {
                  clearTimeout(typingTimerRef.current);
                }
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