import React from 'react';
import {
  Box,
  Heading,
  Input,
  Button,
  VStack,
  Text
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

function SignupPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Adicione aqui a lógica de cadastro
  };

  return (
    <Box maxW="md" mx="auto" p={8} border="1px solid" borderColor="gray.600" borderRadius="md">
      <Heading as="h1" size="xl" mb={6} textAlign="center">
        Join Back4gram
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <Input placeholder="Choose a username" />
          <Input placeholder="Enter your email" type="email" />
          <Input placeholder="Create a password (min. 8 characters)" type="password" />
          <Button colorScheme="blue" w="full">
            Sign Up
          </Button>

          <Text fontSize="sm">
            By signing up, you agree to our{' '}
            <RouterLink to="/terms">Terms</RouterLink> and{' '}
            <RouterLink to="/privacy">Privacy Policy</RouterLink>.
          </Text>

          <Text>
            Already have an account? <RouterLink to="/login">Log In</RouterLink>
          </Text>
        </VStack>
      </form>
    </Box>
  );
}

export default SignupPage; 