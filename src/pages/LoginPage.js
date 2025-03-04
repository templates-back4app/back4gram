import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Input,
  Button,
  Text,
  VStack,
  Link,
  Separator,
  IconButton
} from '@chakra-ui/react';

import Parse from 'parse/dist/parse.min.js';
import { toaster } from '../components/ui/toaster';
import { Field } from '../components/ui/field';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  const navigate = useNavigate();

  // Check if a user is already logged in
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const user = await Parse.User.current();
        if (user) {
          setCurrentUser(user);
          navigate('/feed');
        }
      } catch (error) {
        console.error('Error checking current user:', error);
      }
    };
    
    checkCurrentUser();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Login with Parse
      const loggedInUser = await Parse.User.logIn(username, password);
      
      toaster.create({
        title: 'Login successful!',
        description: `Welcome back, ${loggedInUser.getUsername()}!`,
        type: 'success',
      });
      
      // Redirect to feed after successful login
      navigate('/feed');
    } catch (error) {
      toaster.create({
        title: 'Login failed',
        description: error.message,
        type: 'error',
      });
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" p={8} border="1px solid" borderColor="gray.600" borderRadius="md">
      <Heading as="h1" size="xl" mb={6} textAlign="center">
        Back4gram Login
      </Heading>
      
      <form onSubmit={handleLogin}>
        <VStack spacing={4}>
          <Field label="Username">
            <Input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              required
            />
          </Field>
          
          <Field 
            label="Password" 
            errorText={error}
          >
            <Input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
            />
          </Field>
          
          <Link as={RouterLink} to="/reset-password" alignSelf="flex-end" fontSize="sm">
            Forgot password?
          </Link>
          
          <Button 
            colorScheme="blue" 
            width="full" 
            type="submit"
            loading={isLoading}
          >
            Log In
          </Button>
        </VStack>
      </form>
      
      <Separator my={6} />
      
      <Text textAlign="center">
        Don't have an account?{' '}
        <Link as={RouterLink} to="/signup" color="blue.500">
          Sign Up
        </Link>
      </Text>
    </Box>
  );
}

export default LoginPage; 