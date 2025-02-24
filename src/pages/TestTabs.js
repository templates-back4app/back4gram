import React from 'react'
import { Tabs } from '@chakra-ui/react'

export default function TestTabs() {
  return (
    <Tabs.Root defaultValue="first">
      <Tabs.List>
        <Tabs.Trigger value="first">First</Tabs.Trigger>
        <Tabs.Trigger value="second">Second</Tabs.Trigger>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Content value="first">Content A</Tabs.Content>
      <Tabs.Content value="second">Content B</Tabs.Content>
    </Tabs.Root>
  )
}