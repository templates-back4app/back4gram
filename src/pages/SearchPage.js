import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  Avatar,
  HStack,
  Tabs,
  Spinner,
  Center,
  Separator
} from '@chakra-ui/react';
import Parse from 'parse/dist/parse.min.js';
import { toaster } from '../components/ui/toaster';

function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Get search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
      handleSearch(query);
    }
  }, [location.search]);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await Parse.User.current();
        if (!user) {
          navigate('/login');
          return;
        }
        setCurrentUser(user);
      } catch (error) {
        console.error('Error checking authentication:', error);
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Function to handle search
  const handleSearch = async (query) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      // Search for users
      const userQuery = new Parse.Query(Parse.User);
      userQuery.contains('username', query);
      userQuery.limit(10);
      const userResults = await userQuery.find();
      
      const foundUsers = userResults.map(user => ({
        id: user.id,
        username: user.get('username'),
        avatar: user.get('avatar') ? user.get('avatar').url() : null
      }));
      
      // Search for posts
      const postQuery = new Parse.Query('Post');
      postQuery.contains('content', query);
      postQuery.include('author');
      postQuery.limit(20);
      const postResults = await postQuery.find();
      
      const foundPosts = postResults.map(post => ({
        id: post.id,
        content: post.get('content'),
        author: {
          id: post.get('author').id,
          username: post.get('author').get('username'),
          avatar: post.get('author').get('avatar') ? post.get('author').get('avatar').url() : null
        },
        likes: post.get('likes') || 0,
        createdAt: post.get('createdAt')
      }));
      
      setUsers(foundUsers);
      setPosts(foundPosts);
    } catch (error) {
      console.error('Error searching:', error);
      toaster.create({
        title: 'Error searching',
        description: error.message,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Box maxW="800px" mx="auto" p={4}>
      <Heading size="lg" mb={6}>Search</Heading>
      
      <form onSubmit={handleSearchSubmit}>
        <Flex mb={6}>
          <Input
            placeholder="Search users, posts, or hashtags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            mr={2}
          />
          <Button 
            type="submit" 
            colorScheme="blue"
            isLoading={isLoading}
          >
            Search
          </Button>
        </Flex>
      </form>
      
      {isLoading ? (
        <Center py={10}>
          <Spinner size="xl" />
        </Center>
      ) : (
        <Tabs.Root colorScheme="blue">
          <Tabs.List>
            <Tabs.Trigger value="all">All</Tabs.Trigger>
            <Tabs.Trigger value="users">Users ({users.length})</Tabs.Trigger>
            <Tabs.Trigger value="posts">Posts ({posts.length})</Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>
          
          {/* All Results Tab */}
          <Tabs.Content value="all">
            {users.length === 0 && posts.length === 0 ? (
              <Text color="gray.400">
                {searchQuery ? `No results found for "${searchQuery}"` : 'Try searching for users, posts, or hashtags'}
              </Text>
            ) : (
              <VStack align="stretch" spacing={6}>
                {users.length > 0 && (
                  <Box>
                    <Heading size="md" mb={3}>Users</Heading>
                    <VStack align="stretch" spacing={2}>
                      {users.slice(0, 3).map(user => (
                        <Box 
                          key={user.id} 
                          p={3} 
                          borderRadius="md" 
                          border="1px solid"
                          borderColor="gray.600"
                        >
                          <HStack>
                            <Avatar.Root size="md">
                              <Avatar.Fallback name={user.username} />
                              <Avatar.Image src={user.avatar} />
                            </Avatar.Root>
                            <Text fontWeight="bold">{user.username}</Text>
                            <Button 
                              ml="auto" 
                              size="sm" 
                              as={RouterLink} 
                              to={`/profile/${user.id}`}
                            >
                              View Profile
                            </Button>
                          </HStack>
                        </Box>
                      ))}
                      {users.length > 3 && (
                        <Button variant="ghost" onClick={() => document.getElementById('users-tab').click()}>
                          View all {users.length} users
                        </Button>
                      )}
                    </VStack>
                  </Box>
                )}
                
                {posts.length > 0 && (
                  <Box>
                    <Heading size="md" mb={3}>Posts</Heading>
                    <VStack align="stretch" spacing={4}>
                      {posts.slice(0, 3).map(post => (
                        <Box
                          key={post.id}
                          p={4}
                          borderRadius="md"
                          border="1px solid"
                          borderColor="gray.600"
                        >
                          <HStack mb={2}>
                            <Avatar.Root size="sm">
                              <Avatar.Fallback name={post.author.username} />
                              <Avatar.Image src={post.author.avatar} />
                            </Avatar.Root>
                            <Text fontWeight="bold">{post.author.username}</Text>
                            <Text fontSize="sm" color="gray.400">• {formatDate(post.createdAt)}</Text>
                          </HStack>
                          <Text mb={3}>{post.content}</Text>
                          <Button 
                            size="sm" 
                            as={RouterLink} 
                            to={`/post/${post.id}`}
                            variant="ghost"
                          >
                            View Post
                          </Button>
                        </Box>
                      ))}
                      {posts.length > 3 && (
                        <Button variant="ghost" onClick={() => document.getElementById('posts-tab').click()}>
                          View all {posts.length} posts
                        </Button>
                      )}
                    </VStack>
                  </Box>
                )}
              </VStack>
            )}
          </Tabs.Content>
          
          {/* Users Tab */}
          <Tabs.Content value="users" id="users-tab">
            {users.length === 0 ? (
              <Text color="gray.400">No users found matching "{searchQuery}"</Text>
            ) : (
              <VStack align="stretch" spacing={3}>
                {users.map(user => (
                  <Box 
                    key={user.id} 
                    p={4} 
                    borderRadius="md" 
                    border="1px solid"
                    borderColor="gray.600"
                  >
                    <HStack>
                      <Avatar.Root size="md">
                        <Avatar.Fallback name={user.username} />
                        <Avatar.Image src={user.avatar} />
                      </Avatar.Root>
                      <Text fontWeight="bold">{user.username}</Text>
                      <Button 
                        ml="auto" 
                        colorScheme="blue" 
                        size="sm" 
                        as={RouterLink} 
                        to={`/profile/${user.id}`}
                      >
                        View Profile
                      </Button>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </Tabs.Content>
          
          {/* Posts Tab */}
          <Tabs.Content value="posts" id="posts-tab">
            {posts.length === 0 ? (
              <Text color="gray.400">No posts found matching "{searchQuery}"</Text>
            ) : (
              <VStack align="stretch" spacing={4}>
                {posts.map(post => (
                  <Box
                    key={post.id}
                    p={4}
                    borderRadius="md"
                    border="1px solid"
                    borderColor="gray.600"
                  >
                    <HStack mb={2}>
                      <Avatar.Root size="sm">
                        <Avatar.Fallback name={post.author.username} />
                        <Avatar.Image src={post.author.avatar} />
                      </Avatar.Root>
                      <Text fontWeight="bold">{post.author.username}</Text>
                      <Text fontSize="sm" color="gray.400">• {formatDate(post.createdAt)}</Text>
                    </HStack>
                    <Text mb={4}>{post.content}</Text>
                    <HStack>
                      <Text>❤️ {post.likes}</Text>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        as={RouterLink} 
                        to={`/post/${post.id}`}
                      >
                        View Post
                      </Button>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </Tabs.Content>
        </Tabs.Root>
      )}
    </Box>
  );
}

export default SearchPage; 