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

function LoginPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Adicione aqui a lógica de autenticação
  };

  return (
    <Box maxW="md" mx="auto" p={8} border="1px solid" borderColor="gray.600" borderRadius="md">
      <Heading as="h1" size="xl" mb={6} textAlign="center">
        Back4gram Login
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <Input placeholder="Enter your email" type="email" />
          <Input placeholder="Enter your password" type="password" />
          <Button colorScheme="blue" w="full">
            Log In
          </Button>

          <Text>
            <RouterLink to="/reset-password">Forgot password?</RouterLink>
          </Text>

          <Text>Or continue with [Google] [Facebook]</Text>

          <Text>
            New here? <RouterLink to="/signup">Create an account</RouterLink>
          </Text>
        </VStack>
      </form>
    </Box>
  );
}

export default LoginPage; 