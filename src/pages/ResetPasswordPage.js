import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Input,
  Button,
  Text,
  VStack,
  Link,
  Alert,
} from '@chakra-ui/react';
import Parse from 'parse/dist/parse.min.js';
import { toaster } from '../components/ui/toaster';
import { Field } from '../components/ui/field';

function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Request password reset
      await Parse.User.requestPasswordReset(email);
      
      setIsSuccess(true);
      toaster.create({
        title: 'Email sent',
        description: 'Check your inbox for password reset instructions.',
        type: 'success',
      });
    } catch (error) {
      toaster.create({
        title: 'Reset request failed',
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
        Reset Password
      </Heading>
      
      {isSuccess ? (
        <Alert.Root type="success" borderRadius="md">
          <Alert.Indicator />
          <Alert.Content>
            Email sent successfully! Check your inbox for password reset instructions.
          </Alert.Content>
        </Alert.Root>
      ) : (
        <form onSubmit={handleResetPassword}>
          <VStack spacing={4}>
            <Text>
              Enter your email and we'll send you instructions to reset your password.
            </Text>
            
            <Field 
              label="Email" 
              errorText={error}
            >
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
              />
            </Field>
            
            <Button 
              colorScheme="blue" 
              width="full" 
              type="submit"
              loading={isLoading}
            >
              Send Instructions
            </Button>
            
            <Link as={RouterLink} to="/login" color="blue.500">
              Back to Login
            </Link>
          </VStack>
        </form>
      )}
    </Box>
  );
}

export default ResetPasswordPage; 