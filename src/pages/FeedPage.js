import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  SimpleGrid,
  Avatar,
  HStack,
  IconButton,
  Textarea,
  Spinner,
  Center,
  Image,
  Field,
  Label
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import Parse from 'parse/dist/parse.min.js';
import { toaster } from '../components/ui/toaster';

function FeedPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // New state variables for image upload
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await Parse.User.current();
        if (!user) {
          // Redirect to login if not authenticated
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

  // Handle image selection
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear selected image
  const handleClearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      if (!currentUser) {
        console.log('No current user, skipping post fetch');
        return;
      }
      
      setIsLoading(true);
      console.log('Fetching posts for user:', currentUser.id);
      
      try {
        // Create a query for the Post class
        const query = new Parse.Query('Post');
        console.log('Created Post query');
        
        // Include the user who created the post
        query.include('author');
        console.log('Including author in query');
        
        // Sort by creation date, newest first
        query.descending('createdAt');
        
        // Limit to 20 posts
        query.limit(20);
        
        // Execute the query
        console.log('Executing query...');
        const results = await query.find();
        console.log('Query results received:', results.length, 'posts found');
        
        // Convert Parse objects to plain objects
        const fetchedPosts = [];
        
        for (let i = 0; i < results.length; i++) {
          const post = results[i];
          try {
            const author = post.get('author');
            console.log(`Processing post ${i+1}/${results.length}, author:`, author ? author.id : 'null');
            
            if (!author) {
              console.warn(`Post ${post.id} has no author, skipping`);
              continue;
            }
            
            const postObj = {
              id: post.id,
              content: post.get('content'),
              author: {
                id: author.id,
                username: author.get('username'),
                avatar: author.get('avatar') ? author.get('avatar').url() : null
              },
              image: post.get('image') ? post.get('image').url() : null,
              likes: post.get('likes') || 0,
              comments: post.get('comments') || [],
              createdAt: post.get('createdAt')
            };
            
            fetchedPosts.push(postObj);
          } catch (postError) {
            console.error(`Error processing post ${i+1}:`, postError);
            console.error('Post data:', post.toJSON());
          }
        }
        
        console.log('Successfully processed', fetchedPosts.length, 'posts');
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        console.error('Error details:', error.code, error.message);
        
        // Check if it's a Parse error
        if (error.code) {
          switch(error.code) {
            case Parse.Error.INVALID_SESSION_TOKEN:
              console.error('Invalid session token, logging out user');
              await Parse.User.logOut();
              navigate('/login');
              break;
            case Parse.Error.OBJECT_NOT_FOUND:
              console.error('Post class might not exist in the database');
              break;
            default:
              console.error('Unhandled Parse error code:', error.code);
          }
        }
        
        toaster.create({
          title: 'Error loading posts',
          description: error.message,
          type: 'error',
        });
      } finally {
        setIsLoading(false);
        console.log('Post loading completed');
      }
    };
    
    fetchPosts();
  }, [currentUser, navigate]);

  // Function to create a new post with image
  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !selectedImage) return;
    
    setIsPosting(true);
    console.log('Creating new post...');
    
    try {
      // Create a new Post object
      const Post = Parse.Object.extend('Post');
      const post = new Post();
      
      // Set post data
      post.set('content', newPostContent);
      post.set('author', currentUser);
      post.set('likes', 0);
      post.set('comments', []);
      
      // Handle image upload if an image is selected
      if (selectedImage) {
        console.log('Uploading image...');
        const parseFile = new Parse.File(selectedImage.name, selectedImage);
        await parseFile.save();
        post.set('image', parseFile);
        console.log('Image uploaded successfully');
      }
      
      console.log('Post object created, saving to database...');
      
      // Save the post
      const savedPost = await post.save();
      console.log('Post saved successfully with ID:', savedPost.id);
      
      // Add the new post to the state
      const newPost = {
        id: savedPost.id,
        content: savedPost.get('content'),
        author: {
          id: currentUser.id,
          username: currentUser.get('username'),
          avatar: currentUser.get('avatar') ? currentUser.get('avatar').url() : null
        },
        image: savedPost.get('image') ? savedPost.get('image').url() : null,
        likes: 0,
        comments: [],
        createdAt: savedPost.get('createdAt')
      };
      
      console.log('Adding new post to state');
      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setSelectedImage(null);
      setImagePreview(null);
      
      toaster.create({
        title: 'Post created',
        description: 'Your post has been published successfully!',
        type: 'success',
      });
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Error details:', error.code, error.message);
      
      // Check if it's a Parse error
      if (error.code) {
        switch(error.code) {
          case Parse.Error.INVALID_SESSION_TOKEN:
            console.error('Invalid session token, logging out user');
            await Parse.User.logOut();
            navigate('/login');
            break;
          case Parse.Error.OBJECT_NOT_FOUND:
            console.error('Post class might not exist in the database');
            break;
          default:
            console.error('Unhandled Parse error code:', error.code);
        }
      }
      
      toaster.create({
        title: 'Error creating post',
        description: error.message,
        type: 'error',
      });
    } finally {
      setIsPosting(false);
      console.log('Post creation completed');
    }
  };

  // Function to like a post
  const handleLikePost = async (postId) => {
    try {
      // Get the post
      const query = new Parse.Query('Post');
      const post = await query.get(postId);
      
      // Increment likes
      post.increment('likes');
      await post.save();
      
      // Update the post in the state
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return { ...p, likes: p.likes + 1 };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error liking post:', error);
      toaster.create({
        title: 'Error',
        description: 'Could not like the post. Please try again.',
        type: 'error',
      });
    }
  };

  // Function to logout
  const handleLogout = async () => {
    try {
      await Parse.User.logOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
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
    <Flex direction="row" h="100vh">
      {/* Left Sidebar (Navigation) */}
      <Box
        w={['0px', '250px']}
        bg="gray.700"
        p={4}
        display={['none', 'block']}
        borderRight="1px solid"
        borderColor="gray.600"
      >
        <VStack align="stretch" spacing={4}>
          <Heading size="md">Back4gram</Heading>
          <Button as={RouterLink} to="/feed" variant="ghost" justifyContent="flex-start">
            Home
          </Button>
          <Button as={RouterLink} to="/search" variant="ghost" justifyContent="flex-start">
            Search
          </Button>
          <Button as={RouterLink} to="/messages" variant="ghost" justifyContent="flex-start">
            Messages
          </Button>
          <Button as={RouterLink} to="/profile" variant="ghost" justifyContent="flex-start">
            Profile
          </Button>
          <Button onClick={handleLogout} variant="ghost" colorScheme="red" justifyContent="flex-start">
            Logout
          </Button>
        </VStack>
      </Box>

      {/* Main Content (Feed) */}
      <Box flex="1" p={4} overflowY="auto">
        <form onSubmit={handleSearchSubmit}>
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            mb={4}
          />
        </form>

        {/* Create Post with Image Upload */}
        <Box border="1px solid" borderColor="gray.600" p={4} borderRadius="md" mb={6}>
          <Textarea
            placeholder="What's on your mind?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            mb={2}
            resize="none"
          />
          
          {/* Image Preview */}
          {imagePreview && (
            <Box position="relative" mb={2}>
              <Image 
                src={imagePreview} 
                alt="Preview" 
                maxH="200px" 
                borderRadius="md"
              />
              <Button
                position="absolute"
                top="2"
                right="2"
                size="sm"
                colorScheme="red"
                onClick={handleClearImage}
              >
                Remove
              </Button>
            </Box>
          )}
          
          <Box>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              ref={fileInputRef}
              id="image-upload"
            />
            <Button
              as="label"
              htmlFor="image-upload"
              cursor="pointer"
              variant="outline"
              size="sm"
              mr={2}
              mb={0}
            >
              📷 Add Photo
            </Button>
          </Box>
          
          <Button
            colorScheme="blue"
            onClick={handleCreatePost}
            isLoading={isPosting}
            disabled={(!newPostContent.trim() && !selectedImage) || isPosting}
          >
            Post
          </Button>
        </Box>

        {/* Posts Feed with Images */}
        {isLoading ? (
          <Center py={10}>
            <Spinner size="xl" />
          </Center>
        ) : posts.length > 0 ? (
          <VStack align="stretch" spacing={4}>
            {posts.map(post => (
              <Box
                key={post.id}
                border="1px solid"
                borderColor="gray.600"
                p={4}
                borderRadius="md"
              >
                <HStack mb={2}>
                  <Avatar.Root size="sm">
                    <Avatar.Fallback name={post.author.username} />
                    <Avatar.Image src={post.author.avatar} />
                  </Avatar.Root>
                  <Text fontWeight="bold">{post.author.username}</Text>
                  <Text fontSize="sm" color="gray.400">• {formatDate(post.createdAt)}</Text>
                </HStack>
                
                <Text mb={post.image ? 2 : 4}>{post.content}</Text>
                
                {/* Display post image if available */}
                {post.image && (
                  <Box mb={4}>
                    <Image 
                      src={post.image} 
                      alt="Post image" 
                      borderRadius="md"
                      maxH="400px"
                      w="auto"
                    />
                  </Box>
                )}
                
                <HStack spacing={4}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleLikePost(post.id)}
                  >
                    ❤️ {post.likes}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    as={RouterLink} 
                    to={`/post/${post.id}`}
                  >
                    💬 Comment
                  </Button>
                  <Button variant="ghost" size="sm">
                    🔄 Share
                  </Button>
                </HStack>
              </Box>
            ))}
          </VStack>
        ) : (
          <Text>No posts yet. Follow users or create your first post!</Text>
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