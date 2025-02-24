import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  SimpleGrid
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

function FeedPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  // Mocked posts
  const mockPosts = [
    { id: 1, author: 'Alice', content: 'Hello from Alice!' },
    { id: 2, author: 'Bob', content: 'What a wonderful day!' },
    { id: 3, author: 'Charlie', content: 'React + Chakra UI = ❤️' }
  ];

  return (
    <Flex minH="100vh" bg="gray.900" color="white">
      {/* Left Sidebar (optional) */}
      <Box
        bg="gray.700"
        w={['0px', '200px']}
        p={4}
        display={['none', 'block']}
        borderRight="1px solid"
        borderColor="gray.600"
      >
        <Heading size="md" mb={4}>
          Back4gram
        </Heading>
        <VStack align="start" spacing={2}>
          <Button
            as={RouterLink}
            to="/feed"
            variant="ghost"
            colorScheme="whiteAlpha"
          >
            My Feed
          </Button>
          <Button
            as={RouterLink}
            to="/messages"
            variant="ghost"
            colorScheme="whiteAlpha"
          >
            Messages
          </Button>
          <Button
            as={RouterLink}
            to="/profile/john_doe"
            variant="ghost"
            colorScheme="whiteAlpha"
          >
            Profile
          </Button>
          <Button
            as={RouterLink}
            to="/settings"
            variant="ghost"
            colorScheme="whiteAlpha"
          >
            Settings
          </Button>
        </VStack>
      </Box>

      {/* Main Feed Section */}
      <Box flex="1" p={4}>
        <Heading size="lg" mb={6}>
          Home / Feed
        </Heading>

        {/* Search Bar */}
        <Box as="form" onSubmit={handleSearchSubmit} mb={6}>
          <Flex gap={2}>
            <Input
              placeholder="Search posts, people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" colorScheme="blue">
              Search
            </Button>
          </Flex>
        </Box>

        {/* Post Creation Box */}
        <Box border="1px solid" borderColor="gray.600" p={4} mb={6} borderRadius="md">
          <Text mb={2}>What's on your mind?</Text>
          <Input placeholder="Share an update..." mb={2} />
          <Flex justify="space-between">
            <Button variant="outline" size="sm" mr={2}>
              Add Photo/Video
            </Button>
            <Button colorScheme="blue" size="sm">
              Post
            </Button>
          </Flex>
        </Box>

        {/* Feed Posts */}
        {mockPosts.length > 0 ? (
          <VStack align="stretch" spacing={4}>
            {mockPosts.map(post => (
              <Box
                key={post.id}
                border="1px solid"
                borderColor="gray.600"
                p={4}
                borderRadius="md"
              >
                <Text fontWeight="bold">{post.author}</Text>
                <Text>{post.content}</Text>
              </Box>
            ))}
          </VStack>
        ) : (
          <Text>Follow users or hashtags to see posts here!</Text>
        )}
      </Box>

      {/* Right Sidebar (Trending Hashtags) */}
      <Box
        w={['0px', '250px']}
        bg="gray.700"
        p={4}
        display={['none', 'block']}
        borderLeft="1px solid"
        borderColor="gray.600"
      >
        <Heading size="md" mb={4}>
          Trending Today
        </Heading>
        <SimpleGrid columns={1} spacing={2}>
          <Button variant="outline" size="sm" colorScheme="whiteAlpha">#Travel</Button>
          <Button variant="outline" size="sm" colorScheme="whiteAlpha">#Tech</Button>
          <Button variant="outline" size="sm" colorScheme="whiteAlpha">#Foodie</Button>
        </SimpleGrid>
      </Box>
    </Flex>
  );
}

export default FeedPage; 