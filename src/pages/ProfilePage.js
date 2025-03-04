import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Button,
  Avatar,
  HStack,
  Tabs,
  Spinner,
  Center,
  Separator,
  SimpleGrid,
  Stat,
  Image
} from '@chakra-ui/react';
import Parse from 'parse/dist/parse.min.js';
import { toaster } from '../components/ui/toaster';

function ProfilePage() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0
  });

  // Check if user is authenticated and load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUser = await Parse.User.current();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        
        setUser({
          id: currentUser.id,
          username: currentUser.get('username'),
          email: currentUser.get('email'),
          bio: currentUser.get('bio') || '',
          avatar: currentUser.get('avatar') ? currentUser.get('avatar').url() : null
        });
        
        // Fetch user posts
        const query = new Parse.Query('Post');
        query.equalTo('author', currentUser);
        query.descending('createdAt');
        const results = await query.find();
        
        const userPosts = results.map(post => ({
          id: post.id,
          content: post.get('content'),
          likes: post.get('likes') || 0,
          createdAt: post.get('createdAt'),
          image: post.get('image') ? post.get('image').url() : null
        }));
        
        setPosts(userPosts);
        
        // Set stats
        setStats({
          posts: userPosts.length,
          followers: currentUser.get('followers') || 0,
          following: currentUser.get('following') || 0
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading profile:', error);
        toaster.create({
          title: 'Error loading profile',
          description: error.message,
          type: 'error',
        });
        navigate('/feed');
      }
    };
    
    loadProfile();
  }, [navigate]);

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await Parse.User.logOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box maxW="800px" mx="auto" p={4}>
      {/* Profile Header */}
      <Flex 
        direction={['column', 'row']} 
        align={['center', 'start']} 
        mb={8} 
        p={6} 
        border="1px solid" 
        borderColor="gray.600" 
        borderRadius="md"
      >
        <Avatar.Root 
          size="2xl" 
          mb={[4, 0]} 
          mr={[0, 8]} 
        >
          <Avatar.Fallback name={user.username} />
          <Avatar.Image src={user.avatar} />
        </Avatar.Root>
        
        <Box flex="1">
          <Heading size="lg" mb={2}>{user.username}</Heading>
          <Text color="gray.400" mb={4}>{user.email}</Text>
          
          {user.bio && (
            <Text mb={4}>{user.bio}</Text>
          )}
          
          <SimpleGrid columns={3} spacing={4} mb={4}>
            <Stat.Root>
              <Stat.Label>Posts</Stat.Label>
              <Stat.ValueText>{stats.posts}</Stat.ValueText>
            </Stat.Root>
            <Stat.Root>
              <Stat.Label>Followers</Stat.Label>
              <Stat.ValueText>{stats.followers}</Stat.ValueText>
            </Stat.Root>
            <Stat.Root>
              <Stat.Label>Following</Stat.Label>
              <Stat.ValueText>{stats.following}</Stat.ValueText>
            </Stat.Root>
          </SimpleGrid>
          
          <HStack>
            <Button as={RouterLink} to="/settings" colorScheme="blue">
              Edit Profile
            </Button>
            <Button onClick={handleLogout} variant="ghost" colorScheme="red">
              Logout
            </Button>
          </HStack>
        </Box>
      </Flex>
      
      {/* Tabs for Posts, Saved, etc. */}
      <Tabs.Root colorScheme="blue">
        <Tabs.List>
          <Tabs.Trigger value="posts">Posts</Tabs.Trigger>
          <Tabs.Trigger value="saved">Saved</Tabs.Trigger>
          <Tabs.Trigger value="tagged">Tagged</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
        
        <Tabs.Content value="posts">
          {posts.length > 0 ? (
            <VStack align="stretch" spacing={4}>
              {posts.map(post => (
                <Box
                  key={post.id}
                  border="1px solid"
                  borderColor="gray.600"
                  p={4}
                  borderRadius="md"
                >
                  <Text mb={2} color="gray.400">{formatDate(post.createdAt)}</Text>
                  <Text mb={post.image ? 2 : 4}>{post.content}</Text>
                  
                  {/* Display post image if available */}
                  {post.image && (
                    <Box mb={4}>
                      <Image 
                        src={post.image} 
                        alt="Post image" 
                        borderRadius="md"
                        maxH="300px"
                        w="auto"
                      />
                    </Box>
                  )}
                  
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
          ) : (
            <Center py={10}>
              <VStack>
                <Text>You haven't posted anything yet.</Text>
                <Button as={RouterLink} to="/feed" colorScheme="blue">
                  Create Your First Post
                </Button>
              </VStack>
            </Center>
          )}
        </Tabs.Content>
        
        <Tabs.Content value="saved">
          <Center py={10}>
            <Text>No saved posts yet.</Text>
          </Center>
        </Tabs.Content>
        
        <Tabs.Content value="tagged">
          <Center py={10}>
            <Text>No tagged posts yet.</Text>
          </Center>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}

export default ProfilePage;
