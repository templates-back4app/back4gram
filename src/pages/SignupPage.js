import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Input,
  VStack,
  Link,
  Field,
  Text,
  IconButton,
  Flex
} from '@chakra-ui/react';
import Parse from 'parse/dist/parse.min.js';
import { toaster } from '../components/ui/toaster';

function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create a new user
      const user = new Parse.User();
      user.set('username', username);
      user.set('email', email);
      user.set('password', password);
      
      await user.signUp();
      
      toaster.create({
        title: 'Success',
        description: 'Account created successfully!',
        type: 'success',
      });
      
      navigate('/feed');
    } catch (error) {
      console.error('Error signing up:', error);
      
      toaster.create({
        title: 'Error',
        description: error.message,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="400px" mx="auto" p={4}>
      <VStack spacing={6} align="stretch">
        <Heading textAlign="center">Create an Account</Heading>
        
        <form onSubmit={handleSignup}>
          <VStack spacing={4} align="stretch">
            <Field.Root invalid={!!errors.username}>
              <Field.Label>Username</Field.Label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {errors.username && (
                <Field.ErrorText>{errors.username}</Field.ErrorText>
              )}
            </Field.Root>
            
            <Field.Root invalid={!!errors.email}>
              <Field.Label>Email</Field.Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <Field.ErrorText>{errors.email}</Field.ErrorText>
              )}
            </Field.Root>
            
            <Field.Root invalid={!!errors.password}>
              <Field.Label>Password</Field.Label>
              <Flex position="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  pr="2.5rem"
                  width="100%"
                />
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  icon={showPassword ? '👁️' : '👁️‍🗨️'}
                  variant="ghost"
                  size="sm"
                  position="absolute"
                  right="0.25rem"
                  top="50%"
                  transform="translateY(-50%)"
                  onClick={() => setShowPassword(!showPassword)}
                />
              </Flex>
              {errors.password && (
                <Field.ErrorText>{errors.password}</Field.ErrorText>
              )}
            </Field.Root>
            
            <Field.Root invalid={!!errors.confirmPassword}>
              <Field.Label>Confirm Password</Field.Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && (
                <Field.ErrorText>{errors.confirmPassword}</Field.ErrorText>
              )}
            </Field.Root>
            
            <Button 
              type="submit" 
              colorScheme="blue" 
              isLoading={isLoading}
              mt={2}
            >
              Sign Up
            </Button>
          </VStack>
        </form>
        
        <Text textAlign="center">
          Already have an account?{' '}
          <Link as={RouterLink} to="/login" color="blue.400">
            Log In
          </Link>
        </Text>
      </VStack>
    </Box>
  );
}

export default SignupPage; 