import React, { useContext } from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RecipeContext } from '../../context/RecipeContext';

export default function TabLayout() {
  const { isDarkMode } = useContext(RecipeContext);

  const themeBackgroundColor = isDarkMode ? '#121212' : '#ffffff';
  const themeTextColor = isDarkMode ? '#ffffff' : '#000000';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF6347',
        tabBarStyle: {
          backgroundColor: themeBackgroundColor,
          borderTopColor: isDarkMode ? '#333' : '#eee',
        },
        headerStyle: { backgroundColor: themeBackgroundColor },
        headerTintColor: themeTextColor,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="silverware-fork-knife" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add Recipe',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="plus-box" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="secret"
        options={{
          title: 'Secret',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="lock" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="cog" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
