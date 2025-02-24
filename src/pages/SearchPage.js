import React, { useState, useEffect } from 'react';
import {
  Box,
  Input,
  VStack,
  Text,
  SimpleGrid,
  Flex,
  Tabs,
  Avatar,
  Button
} from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  // Mantenha o estado local para o input
  const [localQuery, setLocalQuery] = useState(query);

  // Atualize a busca quando o query param mudar
  useEffect(() => {
    setLocalQuery(query);
    // Aqui você pode adicionar lógica para buscar os resultados
  }, [query]);

  const handleSearchChange = (e) => {
    setLocalQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: localQuery });
  };

  // Mock data
  const results = {
    people: [
      { id: 1, name: 'John Doe', username: '@johndoe' },
    ],
    posts: [
      { id: 1, content: 'Check out this amazing view!', author: 'traveler123' },
    ],
    groups: [
      { id: 1, name: 'React Developers', members: '1.2k members' },
    ]
  };

  return (
    <Box maxW="container.lg" mx="auto" p={4}>
      <Box as="form" onSubmit={handleSearchSubmit} mb={6}>
        <Flex gap={2}>
          <Input
            placeholder="Search users, posts, or hashtags..."
            size="lg"
            value={localQuery}
            onChange={handleSearchChange}
          />
          <Button type="submit" colorScheme="blue">
            Search
          </Button>
        </Flex>
      </Box>

      <Tabs.Root defaultValue="all">
        <Tabs.List mb={6}>
          <Tabs.Trigger value="all">All</Tabs.Trigger>
          <Tabs.Trigger value="people">People</Tabs.Trigger>
          <Tabs.Trigger value="posts">Posts</Tabs.Trigger>
          <Tabs.Trigger value="groups">Groups</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>

        {query ? (
          <SimpleGrid columns={[1, 2, 3]} spacing={4}>
            <Tabs.Content value="all">
              {/* Todos os resultados */}
            </Tabs.Content>
            <Tabs.Content value="people">
              {results.people.map((person) => (
                <Flex key={person.id} align="center" p={3} bg="gray.50" borderRadius="md" divideX="1px" divideColor="gray.200">
                  <Avatar.Root mr={3}>
                    <Avatar.Fallback>{person.name[0]}</Avatar.Fallback>
                    <Avatar.Image src="" alt={person.name} />
                  </Avatar.Root>
                  <Box>
                    <Text fontWeight="bold">{person.name}</Text>
                    <Text fontSize="sm" color="gray.500">{person.username}</Text>
                  </Box>
                </Flex>
              ))}
            </Tabs.Content>
            <Tabs.Content value="posts">
              {/* Resultados de posts */}
            </Tabs.Content>
            <Tabs.Content value="groups">
              {/* Resultados de grupos */}
            </Tabs.Content>
          </SimpleGrid>
        ) : (
          <Text textAlign="center" color="gray.500" py={8}>
            Try searching for people, posts, or groups
          </Text>
        )}

        {query && results.people.length === 0 && (
          <Text textAlign="center" color="gray.500" py={8}>
            No results found for ‘{query}’
          </Text>
        )}
      </Tabs.Root>
    </Box>
  );
}

export default SearchPage; 