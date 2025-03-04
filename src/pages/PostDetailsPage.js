import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Button,
  Avatar,
  HStack,
  Textarea,
  Spinner,
  Center,
  Separator,
  Image
} from '@chakra-ui/react';
import Parse from 'parse/dist/parse.min.js';
import { toaster } from '../components/ui/toaster';

function PostDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCommenting, setIsCommenting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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

  // Fetch post and comments
  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!currentUser) return;
      
      setIsLoading(true);
      try {
        // Get the post
        const query = new Parse.Query('Post');
        query.include('author');
        const postObject = await query.get(id);
        
        // Get comments
        const commentQuery = new Parse.Query('Comment');
        commentQuery.equalTo('post', postObject);
        commentQuery.include('author');
        commentQuery.ascending('createdAt');
        const commentResults = await commentQuery.find();
        
        // Convert post to plain object
        const fetchedPost = {
          id: postObject.id,
          content: postObject.get('content'),
          author: {
            id: postObject.get('author').id,
            username: postObject.get('author').get('username'),
            avatar: postObject.get('author').get('avatar') ? postObject.get('author').get('avatar').url() : null
          },
          likes: postObject.get('likes') || 0,
          createdAt: postObject.get('createdAt'),
          image: postObject.get('image') ? postObject.get('image').url() : null
        };
        
        // Convert comments to plain objects
        const fetchedComments = commentResults.map(comment => ({
          id: comment.id,
          content: comment.get('content'),
          author: {
            id: comment.get('author').id,
            username: comment.get('author').get('username'),
            avatar: comment.get('author').get('avatar') ? comment.get('author').get('avatar').url() : null
          },
          createdAt: comment.get('createdAt')
        }));
        
        setPost(fetchedPost);
        setComments(fetchedComments);
      } catch (error) {
        console.error('Error fetching post details:', error);
        toaster.create({
          title: 'Error loading post',
          description: error.message,
          type: 'error',
        });
        navigate('/feed');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchPostDetails();
    }
  }, [id, currentUser, navigate]);

  // Function to add a comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsCommenting(true);
    try {
      // Get the post object
      const postQuery = new Parse.Query('Post');
      const postObject = await postQuery.get(id);
      
      // Create a new Comment object
      const Comment = Parse.Object.extend('Comment');
      const comment = new Comment();
      
      // Set comment data
      comment.set('content', newComment);
      comment.set('author', currentUser);
      comment.set('post', postObject);
      
      // Save the comment
      await comment.save();
      
      // Add the new comment to the state
      const newCommentObj = {
        id: comment.id,
        content: comment.get('content'),
        author: {
          id: currentUser.id,
          username: currentUser.get('username'),
          avatar: currentUser.get('avatar') ? currentUser.get('avatar').url() : null
        },
        createdAt: comment.get('createdAt')
      };
      
      setComments([...comments, newCommentObj]);
      setNewComment('');
      
      toaster.create({
        title: 'Comment added',
        description: 'Your comment has been posted successfully!',
        type: 'success',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toaster.create({
        title: 'Error adding comment',
        description: error.message,
        type: 'error',
      });
    } finally {
      setIsCommenting(false);
    }
  };

  // Function to like the post
  const handleLikePost = async () => {
    try {
      // Get the post
      const query = new Parse.Query('Post');
      const postObject = await query.get(id);
      
      // Increment likes
      postObject.increment('likes');
      await postObject.save();
      
      // Update the post in the state
      setPost({
        ...post,
        likes: post.likes + 1
      });
    } catch (error) {
      console.error('Error liking post:', error);
      toaster.create({
        title: 'Error',
        description: 'Could not like the post. Please try again.',
        type: 'error',
      });
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

  if (!post) {
    return (
      <Center h="100vh">
        <VStack>
          <Text>Post not found</Text>
          <Button as={RouterLink} to="/feed" colorScheme="blue">
            Back to Feed
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Box maxW="800px" mx="auto" p={4}>
      <Button as={RouterLink} to="/feed" mb={4} variant="ghost">
        ← Back to Feed
      </Button>
      
      {/* Post */}
      <Box border="1px solid" borderColor="gray.600" p={6} borderRadius="md" mb={6}>
        <HStack mb={2}>
          <Avatar.Root size="sm">
            <Avatar.Fallback name={post.author.username} />
            <Avatar.Image src={post.author.avatar} />
          </Avatar.Root>
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold">{post.author.username}</Text>
            <Text fontSize="sm" color="gray.400">{formatDate(post.createdAt)}</Text>
          </VStack>
        </HStack>
        
        <Text fontSize="lg" my={post.image ? 2 : 4}>{post.content}</Text>
        
        {/* Display post image if available */}
        {post.image && (
          <Box my={4}>
            <Image 
              src={post.image} 
              alt="Post image" 
              borderRadius="md"
              maxH="500px"
              w="auto"
            />
          </Box>
        )}
        
        <HStack spacing={4}>
          <Button 
            variant="ghost" 
            onClick={handleLikePost}
          >
            ❤️ {post.likes}
          </Button>
          <Button variant="ghost">
            🔄 Share
          </Button>
        </HStack>
      </Box>
      
      {/* Comments Section */}
      <Box>
        <Heading size="md" mb={4}>
          Comments ({comments.length})
        </Heading>
        
        {/* Add Comment */}
        <Box mb={6}>
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            mb={2}
          />
          <Button
            colorScheme="blue"
            onClick={handleAddComment}
            isLoading={isCommenting}
            disabled={!newComment.trim()}
          >
            Post Comment
          </Button>
        </Box>
        
        <Separator mb={4} />
        
        {/* Comments List */}
        {comments.length > 0 ? (
          <VStack align="stretch" spacing={4}>
            {comments.map(comment => (
              <Box key={comment.id} p={4} bg="gray.700" borderRadius="md">
                <HStack mb={2}>
                  <Avatar.Root size="sm">
                    <Avatar.Fallback name={comment.author.username} />
                    <Avatar.Image src={comment.author.avatar} />
                  </Avatar.Root>
                  <Text fontWeight="bold">{comment.author.username}</Text>
                  <Text fontSize="sm" color="gray.400">• {formatDate(comment.createdAt)}</Text>
                </HStack>
                <Text>{comment.content}</Text>
              </Box>
            ))}
          </VStack>
        ) : (
          <Text color="gray.400">No comments yet. Be the first to comment!</Text>
        )}
      </Box>
    </Box>
  );
}

export default PostDetailsPage; 