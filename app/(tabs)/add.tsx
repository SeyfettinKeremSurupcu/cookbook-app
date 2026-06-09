import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { TextInput, Button, Switch, Text } from 'react-native-paper';
import { RecipeContext } from '../../context/RecipeContext';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { validateRecipeInput } from '../../utils/validation';

export default function AddRecipe() {
  const { addRecipe, isDarkMode } = useContext(RecipeContext);
  
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [prepTime, setPrepTime] = useState(''); 
  const [cookTime, setCookTime] = useState('');   
  const [steps, setSteps] = useState('');
  const [isSecret, setIsSecret] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const validationError = validateRecipeInput(title, ingredients, prepTime, cookTime);
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    let permanentImageUri = image;
    if (image) {
      try {
        const fileName = image.split('/').pop() || 'recipe_image.jpg';
        // @ts-ignore
        const newPath = FileSystem.documentDirectory + fileName;
        await FileSystem.copyAsync({ from: image, to: newPath } as any);
        permanentImageUri = newPath;
      } catch (error) {
        console.error("Error saving image: ", error);
      }
    }

    const stepsArray = steps.split('\n').filter(step => step.trim() !== '');

    const newRecipe = {
      id: Date.now().toString(),
      title: title.trim(),
      ingredients: ingredients.trim(),
      steps: stepsArray,
      prepTime: parseInt(prepTime),
      cookTime: parseInt(cookTime),
      isSecret,
      image: permanentImageUri,
    };

    await addRecipe(newRecipe);
    
    setTitle('');
    setIngredients('');
    setSteps('');
    setPrepTime('');
    setCookTime('');
    setIsSecret(false);
    setImage(null);

    Alert.alert('Success', 'Recipe saved successfully!');
    
    if (isSecret) {
      router.push('/secret');
    } else {
      router.push('/');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, isDarkMode && styles.darkContainer]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <Button mode="outlined" icon="camera" onPress={pickImage} style={styles.imageButton} textColor="#FF6347">
          {image ? 'Change Photo' : 'Add Recipe Photo'}
        </Button>

        {image && <Image source={{ uri: image }} style={styles.previewImage} />}

        <TextInput 
          label="Recipe Title" 
          value={title} 
          onChangeText={setTitle} 
          mode="outlined" 
          style={[styles.input, isDarkMode && styles.darkInput]} 
          textColor={isDarkMode ? '#fff' : '#000'} 
          activeOutlineColor="#FF6347" 
        />

        <TextInput 
          label="Ingredients (comma separated)" 
          value={ingredients} 
          onChangeText={setIngredients} 
          mode="outlined" 
          multiline 
          contentStyle={styles.invisibleBarrier}
          style={[styles.input, isDarkMode && styles.darkInput]} 
          textColor={isDarkMode ? '#fff' : '#000'} 
          activeOutlineColor="#FF6347" 
        />

        <TextInput 
          label="Cooking Steps (Press Enter for new step)" 
          value={steps} 
          onChangeText={setSteps} 
          mode="outlined" 
          multiline 
          contentStyle={styles.invisibleBarrier}
          style={[styles.input, isDarkMode && styles.darkInput]} 
          textColor={isDarkMode ? '#fff' : '#000'} 
          activeOutlineColor="#FF6347" 
        />

        <TextInput 
          label="Prep Time (minutes)" 
          value={prepTime} 
          onChangeText={setPrepTime} 
          mode="outlined" 
          keyboardType="numeric" 
          style={[styles.input, isDarkMode && styles.darkInput]} 
          textColor={isDarkMode ? '#fff' : '#000'} 
          activeOutlineColor="#FF6347" 
        />

        <TextInput 
          label="Cook Time (minutes)" 
          value={cookTime} 
          onChangeText={setCookTime} 
          mode="outlined" 
          keyboardType="numeric" 
          style={[styles.input, isDarkMode && styles.darkInput]} 
          textColor={isDarkMode ? '#fff' : '#000'} 
          activeOutlineColor="#FF6347" 
        />

        <View style={styles.switchContainer}>
          <Text variant="titleMedium" style={isDarkMode && styles.darkText}>Save as Secret Recipe</Text>
          <Switch value={isSecret} onValueChange={setIsSecret} color="#FF6347" />
        </View>

        <Button mode="contained" onPress={handleSave} style={styles.button} buttonColor="#FF6347">
          Save Recipe
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  darkContainer: { backgroundColor: '#121212' },
  scroll: { padding: 20, flexGrow: 1, paddingBottom: 40 },
  input: { marginBottom: 15, backgroundColor: '#fff' },
  darkInput: { backgroundColor: '#1e1e1e' },
  invisibleBarrier: { paddingTop: 25, paddingBottom: 15, minHeight: 100 },
  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
  darkText: { color: '#fff' },
  button: { marginTop: 10, paddingVertical: 5, marginBottom: 30 },
  imageButton: { marginBottom: 15, borderColor: '#FF6347' },
  previewImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 15 },
});