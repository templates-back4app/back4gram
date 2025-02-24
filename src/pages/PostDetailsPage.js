import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Input
} from '@chakra-ui/react';

function PostDetailsPage() {
  // Example post data
  const post = {
    id: 123,
    author: 'Alice',
    content: 'This is the detailed view of a post!',
    likes: 1500,
  };

  const [comments, setComments] = useState(['Great post!', 'Awesome!']);
  const [newComment, setNewComment] = useState('');

  const handleCommentPost = () => {
    if (newComment.trim().length > 0) {
      setComments([...comments, newComment]);
      setNewComment('');
    }
  };

  return (
    <Box maxW="container.md" mx="auto" p={4}>
      <Heading size="lg" mb={4}>
        Post Details
      </Heading>

      <Box border="1px solid" borderColor="gray.200" p={4} borderRadius="md" mb={4}>
        <Text fontWeight="bold">{post.author}</Text>
        <Text mb={2}>{post.content}</Text>
        <Button size="sm" colorScheme="blue" mr={2}>
          Like ({post.likes.toLocaleString()})
        </Button>
        <Button size="sm" variant="outline">
          Share
        </Button>
      </Box>

      {/* Comments Section */}
      <Heading size="md" mb={2}>
        Comments
      </Heading>
      {comments.length === 0 ? (
        <Text>Be the first to comment!</Text>
      ) : (
        <VStack align="stretch" spacing={2} mb={4}>
          {comments.map((c, idx) => (
            <Box
              key={idx}
              border="1px solid"
              borderColor="gray.200"
              p={3}
              borderRadius="md"
            >
              {c}
            </Box>
          ))}
        </VStack>
      )}

      {/* Add Comment */}
      <Box mt={4}>
        <Input
          placeholder="Write a comment..."
          mb={2}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button colorScheme="blue" size="sm" onClick={handleCommentPost}>
          Post Comment
        </Button>
      </Box>
    </Box>
  );
}

export default PostDetailsPage; 