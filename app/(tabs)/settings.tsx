import React, { useContext, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Switch, Button, Divider, Avatar, TextInput } from 'react-native-paper';
import { RecipeContext } from '../../context/RecipeContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

export default function Settings() {
  const { isDarkMode, toggleTheme, resetPin, userProfile, updateProfile } =
    useContext(RecipeContext);

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name);
  const [tempEmail, setTempEmail] = useState(userProfile.email);

  const pickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      try {
        const fileName = `profile_${Date.now()}.jpg`;
        // @ts-ignore
        const newPath = FileSystem.documentDirectory + fileName;
        await FileSystem.copyAsync({ from: imageUri, to: newPath } as any);
        updateProfile({ ...userProfile, image: newPath });
        Alert.alert('Success', 'Profile picture updated!');
      } catch (error) {
        updateProfile({ ...userProfile, image: imageUri });
        Alert.alert('Success', 'Profile picture updated (Cached).');
      }
    }
  };

  const saveInfo = () => {
    updateProfile({ ...userProfile, name: tempName, email: tempEmail });
    setIsEditing(false);
    Alert.alert('Success', 'Profile info saved!');
  };

  const handleResetPin = () => {
    Alert.alert('Reset PIN', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          resetPin();
          Alert.alert('Success', 'PIN reset.');
        },
      },
    ]);
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={pickProfileImage}>
          {userProfile.image ? (
            <Image source={{ uri: userProfile.image }} style={styles.profileImg} />
          ) : (
            <Avatar.Icon size={100} icon="account-edit" style={styles.avatar} />
          )}
        </TouchableOpacity>

        {!isEditing ? (
          <>
            <Text variant="headlineSmall" style={[styles.name, isDarkMode && styles.darkText]}>
              {userProfile.name}
            </Text>
            <Text variant="bodyMedium" style={styles.email}>
              {userProfile.email}
            </Text>
            <Button mode="text" textColor="#FF6347" onPress={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          </>
        ) : (
          <View style={styles.editForm}>
            <TextInput
              label="Name"
              value={tempName}
              onChangeText={setTempName}
              mode="outlined"
              style={[styles.input, isDarkMode && styles.darkInput]}
              textColor={isDarkMode ? '#fff' : '#000'}
              activeOutlineColor="#FF6347"
            />
            <TextInput
              label="Email"
              value={tempEmail}
              onChangeText={setTempEmail}
              mode="outlined"
              style={[styles.input, isDarkMode && styles.darkInput]}
              textColor={isDarkMode ? '#fff' : '#000'}
              activeOutlineColor="#FF6347"
            />
            <View style={styles.editButtons}>
              <Button
                mode="contained"
                onPress={saveInfo}
                buttonColor="#FF6347"
                style={{ flex: 1, marginRight: 5 }}
              >
                Save
              </Button>
              <Button
                mode="outlined"
                onPress={() => setIsEditing(false)}
                textColor={isDarkMode ? '#ccc' : '#666'}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
            </View>
          </View>
        )}
      </View>

      <Divider style={[styles.divider, isDarkMode && styles.darkDivider]} />

      <View style={styles.settingRow}>
        <Text variant="titleMedium" style={isDarkMode && styles.darkText}>
          Dark Mode
        </Text>
        <Switch value={isDarkMode} onValueChange={toggleTheme} color="#FF6347" />
      </View>

      <View style={styles.settingRow}>
        <Text variant="titleMedium" style={isDarkMode && styles.darkText}>
          Vault PIN
        </Text>
        <Button mode="outlined" textColor="#FF6347" onPress={handleResetPin}>
          Reset PIN
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  darkContainer: { backgroundColor: '#121212' },
  profileSection: { alignItems: 'center', padding: 30 },
  profileImg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#FF6347',
  },
  avatar: { backgroundColor: '#FF6347', marginBottom: 15 },
  name: { fontWeight: 'bold', color: '#333' },
  darkText: { color: '#fff' },
  email: { color: '#666', marginBottom: 5 },
  // Form üstüne ekstra boşluk eklendi ki yazılar sıkışıp kesilmesin
  editForm: { width: '100%', marginTop: 20 },
  input: { marginBottom: 15, backgroundColor: '#fff' },
  darkInput: { backgroundColor: '#1e1e1e' },
  editButtons: { flexDirection: 'row', marginTop: 10 },
  divider: { marginHorizontal: 20, marginVertical: 10 },
  darkDivider: { backgroundColor: '#333' },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
});
