import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  VStack,
  Field,
  Tabs,
  Dialog,
  Select,
  Switch
} from '@chakra-ui/react';

function SettingsPage() {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    postPrivacy: 'friends'
  });
  
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const cancelRef = useRef();

  return (
    <Box maxW="container.md" mx="auto" p={4}>
      <Tabs.Root defaultValue="privacy">
        <Tabs.List>
          <Tabs.Trigger value="privacy">Privacy</Tabs.Trigger>
          <Tabs.Trigger value="account">Account</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>

        <Tabs.Content value="privacy">
          <VStack spacing={6} align="stretch">
            <Field.Root>
              <Field.Label>Who can see your profile?</Field.Label>
              <Select.Root
                value={privacySettings.profileVisibility}
                onValueChange={(value) => setPrivacySettings({
                  ...privacySettings,
                  profileVisibility: value
                })}
              >
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="public">Public</Select.Item>
                  <Select.Item value="friends">Friends Only</Select.Item>
                  <Select.Item value="private">Private</Select.Item>
                </Select.Content>
              </Select.Root>
              <Field.HelperText>Customize your profile visibility</Field.HelperText>
            </Field.Root>

            <Field.Root>
              <Field.Label>Default post privacy</Field.Label>
              <Select.Root
                value={privacySettings.postPrivacy}
                onValueChange={(value) => setPrivacySettings({
                  ...privacySettings,
                  postPrivacy: value
                })}
              >
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="public">Public</Select.Item>
                  <Select.Item value="friends">Friends Only</Select.Item>
                  <Select.Item value="private">Private</Select.Item>
                </Select.Content>
              </Select.Root>
              <Field.HelperText>Customize your post privacy</Field.HelperText>
            </Field.Root>
          </VStack>
        </Tabs.Content>

        <Tabs.Content value="account">
          <VStack spacing={6} align="stretch">
            <Field.Root display="flex" alignItems="center">
              <Field.Label mb={0}>Enable Two-Factor Authentication</Field.Label>
              <Switch.Root
                checked={twoFactorAuth}
                onCheckedChange={setTwoFactorAuth}
                colorPalette="blue"
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Label>Enable Two-Factor Authentication</Switch.Label>
              </Switch.Root>
            </Field.Root>

            <Button
              colorScheme="red"
              variant="outline"
              onClick={() => setIsOpen(true)}
            >
              Deactivate Account
            </Button>
          </VStack>
        </Tabs.Content>
      </Tabs.Root>

      
      <Dialog.Root role="alertdialog" open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Backdrop />
        <Dialog.Content initialFocusEl={cancelRef}>
          <Dialog.Header>
            <Dialog.Title fontSize="lg" fontWeight="bold">
              Confirm Account Deactivation
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            Are you sure you want to deactivate your account? This action cannot be undone.
          </Dialog.Body>
          <Dialog.Footer>
            <Button ref={cancelRef} onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={() => setIsOpen(false)} ml={3}>
              Confirm Deactivation
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}

export default SettingsPage; 