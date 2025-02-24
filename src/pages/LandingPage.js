import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Image,
  Flex,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

function LandingPage() {
  return (
    <Box bg="dark.900" minH="100vh" color="white">
      {/* Hero Section */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        textAlign="center"
        py={20}
        bg="dark.800"
      >
        <Heading size="2xl" mb={4}>
          Back4gram
        </Heading>
        <Text fontSize="lg" maxW="600px" mb={8}>
        Join a vibrant community where your voice matters. Share stories, ideas, and moments with friends and the world.
        </Text>
        <VStack spacing={4} maxW="md" mx="auto">
          <Button
            as={RouterLink}
            to="/signup"
            colorScheme="blue"
            size="lg"
            w="full"
          >
            Create Account
          </Button>
          <Button
            as={RouterLink}
            to="/login"
            variant="outline"
            size="lg"
            w="full"
          >
            Log In
          </Button>
        </VStack>
      </Flex>

      {/* Features Section */}
      <Box px={8} py={16}>
        <Heading size="xl" textAlign="center" mb={12}>
          Why Choose Us?
        </Heading>
        <SimpleGrid columns={[1, 1, 3]} spacing={8}>
          <Box bg="dark.800" p={6} borderRadius="md" textAlign="center">
            <Flex direction="column" align="center">
              <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-share" mb={4}>
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              <Heading size="md" mb={2}>Share Your World</Heading>
              <Text>Post updates, photos, and videos with customizable privacy settings.</Text>
            </Flex>
          </Box>
          <Box bg="dark.800" p={6} borderRadius="md" textAlign="center">
            <Flex direction="column" align="center">
              <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-message-circle" mb={4}>
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              <Heading size="md" mb={2}>Real-Time Chat</Heading>
              <Text>Message friends privately or create groups for shared interests.</Text>
            </Flex>
          </Box>
          <Box bg="dark.800" p={6} borderRadius="md" textAlign="center">
            <Flex direction="column" align="center">
              <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-trending-up" mb={4}>
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
              <Heading size="md" mb={2}>Stay Updated</Heading>
              <Text>Follow hashtags, trends, and friends' stories that inspire you.</Text>
            </Flex>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Call to Action */}
      <Box bg="dark.700" py={12} textAlign="center">
        <Heading size="xl" mb={4}>
          Ready to Join?
        </Heading>
        <Text fontSize="lg" mb={8}>
          Sign up now and start connecting with people around the world.
        </Text>
        <Button as={RouterLink} to="/signup" colorScheme="primary" size="lg">
          Get Started
        </Button>
      </Box>

      {/* Footer */}
      <Box textAlign="center" py={8}>
        <Text mb={2}>
          Already a member? <RouterLink to="/login" style={{ color: "#3B82F6" }}>Log In</RouterLink>
        </Text>
        <Text>Join 1M+ users sharing 10K+ posts daily.</Text>
      </Box>
    </Box>
  );
}

export default LandingPage; 