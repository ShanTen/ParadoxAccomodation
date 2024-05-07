import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIconFA(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -10}} {...props} />;
}

function TabBarIconMC(props: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
}) {
  return <MaterialCommunityIcons size={28} style={{ marginBottom: -10}} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(true,false),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <TabBarIconFA name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="QRScanner"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <TabBarIconMC name="qrcode-scan" color={color} />,
        }}
      />
      <Tabs.Screen
        name="AccommodatorSettings"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <TabBarIconFA name="user-circle-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="TestScreen"
        options={{
          title: '',
          href: null,
          tabBarIcon: ({ color }) => <TabBarIconFA name="cogs" color={color} />,
        }}
      />
    </Tabs>
  );
}
