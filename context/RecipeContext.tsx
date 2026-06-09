import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Network from 'expo-network';

export const RecipeContext = createContext<any>(null);

export const RecipeProvider = ({ children }: { children: React.ReactNode }) => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasSavedPin, setHasSavedPin] = useState(false);

  const [userProfile, setUserProfile] = useState({
    name: 'Chef User',
    email: 'chef@cookbook.com',
    image: null as string | null,
  });

  const [dailyRecipe, setDailyRecipe] = useState<any>(null);
  const [isLoadingDaily, setIsLoadingDaily] = useState(false);
  const [dailyError, setDailyError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedRecipes = await AsyncStorage.getItem('recipes');
        if (savedRecipes) setRecipes(JSON.parse(savedRecipes));

        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme === 'dark') setIsDarkMode(true);

        const savedPin = await SecureStore.getItemAsync('vault_pin');
        if (savedPin) setHasSavedPin(true);

        const savedProfile = await AsyncStorage.getItem('user_profile');
        if (savedProfile) setUserProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Failed to load data', error);
      }
    };

    loadData();
    fetchDailyRecipe();
  }, []);

  const fetchDailyRecipe = async () => {
    setIsLoadingDaily(true);
    setDailyError(null);

    try {
      const apiUrl = "https://www.themealdb.com/api/json/v1/1/random.php";
      const response = await fetch(apiUrl);

      if (!response.ok) throw new Error('Server response was not ok');
      const data = await response.json();
      const meal = data.meals[0];


      const ingredientsArray = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        if (ingredient && ingredient.trim() !== '') {
          ingredientsArray.push(ingredient.trim());
        }
      }

  
      const stepsArray = meal.strInstructions
        .split(/(?:\r\n|\n|\. )/)
        .filter((step: string) => step.trim() !== '')
        .map((step: string) => step.trim() + (step.endsWith('.') ? '' : '.'));

      const mappedRecipe = {
        id: `daily_${meal.idMeal}`,
        title: meal.strMeal,
        ingredients: ingredientsArray.join(', '),
        steps: stepsArray,
        prepTime: 15, 
        cookTime: 25,
        image: meal.strMealThumb,
        isSecret: false,
      };

      setDailyRecipe(mappedRecipe);
      setIsOffline(false);
      await AsyncStorage.setItem('cached_daily_recipe', JSON.stringify(mappedRecipe));
    } catch (error) {
      console.log('Fetch failed, checking real network status...');

      let isActuallyOffline = true;
      try {
        const netInfo = await Network.getNetworkStateAsync();
        isActuallyOffline = !netInfo.isConnected;
      } catch (e) {
        // Fallback
      }

      setIsOffline(isActuallyOffline);
      const cached = await AsyncStorage.getItem('cached_daily_recipe');

      if (cached) {
        setDailyRecipe(JSON.parse(cached));
        setDailyError(null);
      } else {
        setDailyError(
          isActuallyOffline
            ? 'No internet connection and no offline data available.'
            : 'Failed to connect to the recipe server.',
        );
      }
    } finally {
      setIsLoadingDaily(false);
    }
  };

  const addRecipe = async (newRecipe: any) => {
    const updatedRecipes = [...recipes, newRecipe];
    setRecipes(updatedRecipes);
    await AsyncStorage.setItem('recipes', JSON.stringify(updatedRecipes));
  };

  const deleteRecipe = async (id: string) => {
    const updatedRecipes = recipes.filter((recipe) => recipe.id !== id);
    setRecipes(updatedRecipes);
    await AsyncStorage.setItem('recipes', JSON.stringify(updatedRecipes));
  };

  const toggleSecretStatus = async (id: string) => {
    const updatedRecipes = recipes.map((recipe) => {
      if (recipe.id === id) return { ...recipe, isSecret: !recipe.isSecret };
      return recipe;
    });
    setRecipes(updatedRecipes);
    await AsyncStorage.setItem('recipes', JSON.stringify(updatedRecipes));
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const resetPin = async () => {
    await SecureStore.deleteItemAsync('vault_pin');
    setIsUnlocked(false);
    setHasSavedPin(false);
  };

  const updateProfile = async (newProfile: any) => {
    setUserProfile(newProfile);
    await AsyncStorage.setItem('user_profile', JSON.stringify(newProfile));
  };

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        addRecipe,
        deleteRecipe,
        toggleSecretStatus,
        isUnlocked,
        setIsUnlocked,
        isDarkMode,
        toggleTheme,
        resetPin,
        hasSavedPin,
        setHasSavedPin,
        userProfile,
        updateProfile,
        dailyRecipe,
        isLoadingDaily,
        dailyError,
        isOffline,
        fetchDailyRecipe,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
};
