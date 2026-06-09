import React, { useContext } from 'react';
import { Stack } from 'expo-router';
import { RecipeProvider, RecipeContext } from '../context/RecipeContext';
import { ErrorBoundaryProps } from 'expo-router';
import { View, Text, Button } from 'react-native';

function StackLayout() {
  const { isDarkMode } = useContext(RecipeContext);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' },
        headerTintColor: isDarkMode ? '#fff' : '#000',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />


      <Stack.Screen
        name="recipe/[id]"
        options={{
          title: 'Recipe Detail',
          headerBackTitle: 'Back',
          headerTintColor: '#FF6347',
        }}
      />
    </Stack>
  );
}

export default function AppLayout() {
  return (
    <RecipeProvider>
      <StackLayout />
    </RecipeProvider>
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: 'red' }}>
        Oops! Bir şeyler ters gitti.
      </Text>
      <Text style={{ marginBottom: 20, textAlign: 'center' }}>{error.message}</Text>
      <Button title="Tekrar Dene" onPress={retry} />
    </View>
  );
}