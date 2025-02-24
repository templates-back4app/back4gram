import React, { useState } from 'react';
import {
  Box,
  Heading,
  Input,
  Button,
  VStack,
  Text
} from '@chakra-ui/react';

function ResetPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);

  const handleSendResetLink = () => {
    // Example/mocked functionality:
    // In a real app, you'd call your backend to send a reset link.
    setEmailSent(true);
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={6}>
      <Heading mb={6}>Reset Your Password</Heading>

      {!emailSent ? (
        <VStack spacing={4}>
          <Input placeholder="Enter your email" type="email" />
          <Button colorScheme="blue" w="full" onClick={handleSendResetLink}>
            Send Reset Link
          </Button>
        </VStack>
      ) : (
        <Text>Check your inbox for a link to reset your password.</Text>
      )}
    </Box>
  );
}

export default ResetPasswordPage; 