import React, { useState, useContext } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Text, IconButton, TextInput, Button } from 'react-native-paper';
import { RecipeContext } from '../../context/RecipeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

export default function SecretRecipes() {
  const {
    recipes,
    deleteRecipe,
    isUnlocked,
    setIsUnlocked,
    toggleSecretStatus,
    isDarkMode,
    hasSavedPin,
    setHasSavedPin,
  } = useContext(RecipeContext);
  const [password, setPassword] = useState('');

  const secretRecipes = recipes.filter((r: any) => r.isSecret);

  const handleAuth = async () => {
    if (!hasSavedPin) {
      if (password.length < 4) {
        Alert.alert('Error', 'PIN must be at least 4 characters.');
        return;
      }
      await SecureStore.setItemAsync('vault_pin', password);
      setHasSavedPin(true);
      setIsUnlocked(true);
      setPassword('');
      Alert.alert('Success', 'New PIN saved securely!');
    } else {
      const savedPin = await SecureStore.getItemAsync('vault_pin');
      if (password === savedPin) {
        setIsUnlocked(true);
        setPassword('');
      } else {
        Alert.alert('Error', 'Incorrect PIN!');
      }
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card
      style={[styles.card, isDarkMode && styles.darkCard]}
      onPress={() => router.push(`/recipe/${item.id}` as any)}
    >

      {item.image && <Card.Cover source={{ uri: item.image }} />}
      <Card.Title
        title={item.title}
        titleVariant="titleLarge"
        titleStyle={isDarkMode && styles.darkText}
        right={(props) => (
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              {...props}
              icon="lock-open-outline"
              iconColor="#4CAF50"
              onPress={() => toggleSecretStatus(item.id)}
            />
            <IconButton
              {...props}
              icon="delete"
              iconColor="#FF6347"
              onPress={() => deleteRecipe(item.id)}
            />
          </View>
        )}
      />
      <Card.Content>
        <Text
          variant="bodyMedium"
          style={[styles.ingredients, isDarkMode && styles.darkText]}
          numberOfLines={2}
        >
          {item.ingredients}
        </Text>
        <View style={styles.timeContainer}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={20}
            color={isDarkMode ? '#aaa' : '#666'}
          />
          <Text variant="bodyMedium" style={[styles.timeText, isDarkMode && styles.darkSubText]}>
            {item.cookTime} minutes
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (!isUnlocked) {
    return (
      <View style={[styles.authContainer, isDarkMode && styles.darkContainer]}>
        <MaterialCommunityIcons name="lock" size={64} color="#FF6347" style={styles.icon} />
        <Text variant="titleLarge" style={[styles.title, isDarkMode && styles.darkText]}>
          {hasSavedPin ? 'Enter Vault PIN' : 'Create Vault PIN'}
        </Text>
        <TextInput
          label="PIN Code"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          keyboardType="numeric"
          style={[styles.input, isDarkMode && styles.darkInput]}
          textColor={isDarkMode ? '#fff' : '#000'}
          activeOutlineColor="#FF6347"
        />
        <Button mode="contained" onPress={handleAuth} buttonColor="#FF6347" style={styles.button}>
          {hasSavedPin ? 'Unlock' : 'Save PIN & Unlock'}
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text variant="titleLarge" style={styles.headerTitle}>
          Secret Vault
        </Text>
        <Button mode="text" onPress={handleLock} textColor="#FF6347">
          Lock
        </Button>
      </View>
      {secretRecipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="lock-open" size={64} color={isDarkMode ? '#444' : '#ccc'} />
          <Text variant="titleMedium" style={isDarkMode ? styles.darkSubText : styles.emptyText}>
            No secret recipes yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={secretRecipes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  darkContainer: { backgroundColor: '#121212' },
  authContainer: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  icon: { alignSelf: 'center', marginBottom: 10 },
  title: { textAlign: 'center', marginBottom: 20, fontWeight: 'bold' },
  input: { marginBottom: 20, backgroundColor: '#fff' },
  darkInput: { backgroundColor: '#1e1e1e' },
  button: { paddingVertical: 5 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    elevation: 2,
  },
  darkHeader: { backgroundColor: '#1e1e1e', borderBottomWidth: 1, borderBottomColor: '#333' },
  headerTitle: { fontWeight: 'bold', color: '#FF6347' },
  darkText: { color: '#ffffff' },
  darkSubText: { color: '#aaaaaa' },
  list: { padding: 15 },
  card: { marginBottom: 15, backgroundColor: '#fff' },
  darkCard: { backgroundColor: '#1e1e1e' },
  ingredients: { marginBottom: 15, color: '#444' },
  timeContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  timeText: { marginLeft: 5, color: '#666', fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 10, color: '#888' },
});
