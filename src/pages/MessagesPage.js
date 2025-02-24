import React, { useState } from 'react';
import {
  Box,
  Flex,
  Input,
  Button,
  VStack,
  Text,
  Avatar,
  Heading
} from '@chakra-ui/react';

function MessagesPage() {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Mock data
  const chats = [];
  const activeChat = {
    user: 'johndoe',
    messages: [
      { id: 1, text: 'Hey there!', sender: 'them' },
      { id: 2, text: 'Hi! How are you?', sender: 'me' },
    ]
  };

  return (
    <Flex h="100vh">
      {/* Chat List Sidebar */}
      <Box w="300px" borderRightWidth="1px" borderColor="gray.200" p={4}>
        <Heading size="md" mb={4}>
          Back4gram Messages
        </Heading>
        <Input placeholder="Search users..." mb={4} />
        
        {chats.length === 0 ? (
          <Text color="gray.500" textAlign="center" mt={8}>
            Start a conversation by searching for a user above!
          </Text>
        ) : (
          <VStack align="stretch">
            {/* Chat items would go here */}
          </VStack>
        )}
      </Box>

      {/* Chat Window */}
      <Box flex={1} p={4} display="flex" flexDirection="column">
        {/* Chat Header */}
        <Flex align="center" mb={4}>
          <Avatar.Root size="sm" mr={2}>
            <Avatar.Fallback>{activeChat.user[0]}</Avatar.Fallback>
            <Avatar.Image src="" alt={activeChat.user} />
          </Avatar.Root>
          <Text fontWeight="bold">{activeChat.user}</Text>
          {isTyping && (
            <Text ml={2} color="gray.500" fontSize="sm">
              is typing...
            </Text>
          )}
        </Flex>

        <Box divideY="1px" divideColor="gray.200" mb={4} />

        {/* Messages */}
        <VStack flex={1} align="stretch" spacing={4} overflowY="auto" mb={4}>
          {activeChat.messages.map((msg) => (
            <Box
              key={msg.id}
              alignSelf={msg.sender === 'me' ? 'flex-end' : 'flex-start'}
              bg={msg.sender === 'me' ? 'blue.500' : 'gray.100'}
              color={msg.sender === 'me' ? 'white' : 'black'}
              p={3}
              borderRadius="lg"
              maxW="70%"
            >
              {msg.text}
            </Box>
          ))}
        </VStack>

        {/* Message Input */}
        <Flex gap={2}>
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setIsTyping(e.target.value.length > 0);
            }}
          />
          <Button variant="outline">Attach File</Button>
          <Button colorScheme="blue">Send</Button>
        </Flex>
      </Box>
    </Flex>
  );
}

export default MessagesPage; 