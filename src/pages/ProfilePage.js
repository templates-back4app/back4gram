import React, { useState } from 'react';
import {
  Box,
  Flex,
  Avatar,
  Heading,
  Text,
  Button,
  VStack,
} from '@chakra-ui/react';
import { Tabs } from '@chakra-ui/react';

function ProfilePage() {
  const [isOwnProfile] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const username = 'john_doe';
  const bio = 'This is a sample bio.';

  const handleFollowToggle = () => setIsFollowing(!isFollowing);

  return (
    <Box maxW="container.lg" mx="auto" p={4}>
      {/* Profile Header */}
      <Flex align="center" mb={6}>
        <Avatar.Root size="xl" mr={6}>
          <Avatar.Fallback>{username[0]}</Avatar.Fallback>
          <Avatar.Image src="" alt={username} />
        </Avatar.Root>
        
        <Box>
          <Heading size="lg" mb={2}>
            {username}
          </Heading>
          <Text color="gray.600">
            {bio || `${username} hasn't added a bio yet.`}
          </Text>
          <Flex mt={4}>
            {isOwnProfile ? (
              <Button colorScheme="blue" size="sm" mr={2}>
                Edit Profile
              </Button>
            ) : (
              <Button
                colorScheme="blue"
                size="sm"
                mr={2}
                onClick={handleFollowToggle}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
            {!isOwnProfile && (
              <Button variant="outline" size="sm">
                Message
              </Button>
            )}
          </Flex>
        </Box>
      </Flex>

      {/* Tabs Section - ARK-based */}
      <Tabs.Root defaultValue="posts">
        <Tabs.List mb={6}>
          <Tabs.Trigger value="about">About</Tabs.Trigger>
          <Tabs.Trigger value="friends">Friends</Tabs.Trigger>
          <Tabs.Trigger value="photos">Photos</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>

        <Tabs.Content value="posts">
          <Text>No posts yet.</Text>
        </Tabs.Content>

        <Tabs.Content value="about">
          <VStack align="start" spacing={4}>
            <Text>
              Welcome to my Back4gram profile!
            </Text>
            <Text><strong>Location:</strong> New York, USA</Text>
            <Text><strong>Joined:</strong> January 2022</Text>
            <Text>
              <strong>Website:</strong>{' '}
              <a href="https://example.com" style={{ color: 'blue' }}>example.com</a>
            </Text>
          </VStack>
        </Tabs.Content>

        <Tabs.Content value="friends">
          <Text>Friends list goes here.</Text>
        </Tabs.Content>

        <Tabs.Content value="photos">
          <Text>Photos gallery goes here.</Text>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}

export default ProfilePage;
