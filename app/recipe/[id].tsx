import React, { useContext, useState } from 'react';
import { Alert, View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Divider, Button, Card } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { RecipeContext } from '../../context/RecipeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }) as any,
});

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();

  const { recipes, dailyRecipe, isDarkMode } = useContext(RecipeContext);
  const [isCooking, setIsCooking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const recipe =
    recipes.find((r: any) => r.id === id) ||
    (dailyRecipe && dailyRecipe.id === id ? dailyRecipe : null);

  if (!recipe) {
    return (
      <View style={[styles.center, isDarkMode && styles.darkContainer]}>
        <Text variant="titleLarge" style={isDarkMode && styles.darkText}>
          Recipe not found!
        </Text>
      </View>
    );
  }

  const stepsList = recipe.steps || [];

  const nextStep = () => {
    if (currentStep < stepsList.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(stepsList.length);
    }
  };

  const startCookTimer = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please enable notifications to use the timer.');
      setIsCooking(false);
      setCurrentStep(0);
      return;
    }

    Alert.alert(
      'Timer Started',
      `Timer started for ${recipe.title} (${recipe.cookTime} mins cook time)! Notification in 5 seconds.`,
    );

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Cooking Finished!',
        body: `Your delicious ${recipe.title} is perfectly cooked and ready!`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });

    setIsCooking(false);
    setCurrentStep(0);
  };

  const finishSteps = () => {
    setIsCooking(false);
    setCurrentStep(0);
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      {recipe.image && <Image source={{ uri: recipe.image }} style={styles.image} />}
      <View style={styles.content}>
        <Text variant="headlineMedium" style={[styles.title, isDarkMode && styles.darkText]}>
          {recipe.title}
        </Text>

        {/* Top Section: Clear separation of times */}
        <View style={styles.timeWrapper}>
          <View style={styles.timeContainer}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#FF6347" />
            <Text variant="bodyMedium" style={[styles.timeText, isDarkMode && styles.darkSubText]}>
              Prep: {recipe.prepTime || 0} mins
            </Text>
          </View>
          <View style={[styles.timeContainer, { marginLeft: 20 }]}>
            <MaterialCommunityIcons name="fire" size={20} color="#FF6347" />
            <Text variant="bodyMedium" style={[styles.timeText, isDarkMode && styles.darkSubText]}>
              Cook: {recipe.cookTime || 0} mins
            </Text>
          </View>
        </View>

        <Divider style={[styles.divider, isDarkMode && styles.darkDivider]} />

        <Text variant="titleLarge" style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          Ingredients
        </Text>
        <Text variant="bodyLarge" style={[styles.ingredients, isDarkMode && styles.darkSubText]}>
          {recipe.ingredients}
        </Text>

        {stepsList.length > 0 && (
          <View style={styles.cookingSection}>
            <Divider style={[styles.divider, isDarkMode && styles.darkDivider]} />
            <Text variant="titleLarge" style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
              Cooking Mode
            </Text>

            {!isCooking ? (
              <Button
                mode="contained"
                onPress={() => setIsCooking(true)}
                buttonColor="#4CAF50"
                style={styles.actionButton}
              >
                Start Preparation Steps
              </Button>
            ) : currentStep < stepsList.length ? (
              <View style={[styles.stepCard, isDarkMode && styles.darkStepCard]}>
                <Text variant="titleMedium" style={styles.stepCounter}>
                  Step {currentStep + 1} of {stepsList.length}
                </Text>
                <Text variant="bodyLarge" style={[styles.stepText, isDarkMode && styles.darkText]}>
                  {stepsList[currentStep]}
                </Text>
                <Button
                  mode="contained"
                  onPress={nextStep}
                  buttonColor="#FF6347"
                  style={styles.actionButton}
                >
                  Next Step
                </Button>
              </View>
            ) : (
              <Card style={[styles.finishCard, isDarkMode && styles.darkFinishCard]}>
                <Card.Content style={styles.finishContent}>
                  <MaterialCommunityIcons name="clock-check" size={64} color="#4CAF50" />
                  <Text
                    variant="headlineSmall"
                    style={[styles.finishTitle, isDarkMode && styles.darkText]}
                  >
                    Preparation Done! 
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={[styles.finishSubTitle, isDarkMode && styles.darkSubText]}
                  >
                    All preparation steps are completed. Now it's time to cook!
                  </Text>
                  <Text variant="titleMedium" style={styles.finishCookTime}>
                    Required Cook Time: {recipe.cookTime} mins.
                  </Text>

                  <Button
                    mode="contained"
                    icon="clock-outline"
                    onPress={startCookTimer}
                    buttonColor="#4CAF50"
                    style={styles.finalActionButton}
                  >
                    Start Cook Timer
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={finishSteps}
                    textColor={isDarkMode ? '#ccc' : '#666'}
                    style={styles.finalActionButton}
                  >
                    Finish Without Timer
                  </Button>
                </Card.Content>
              </Card>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  darkContainer: { backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 250 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontWeight: 'bold', color: '#333', marginBottom: 15 },
  darkText: { color: '#ffffff' },
  darkSubText: { color: '#aaaaaa' },
  timeWrapper: { flexDirection: 'row', alignItems: 'center' },
  timeContainer: { flexDirection: 'row', alignItems: 'center' },
  timeText: { marginLeft: 5, fontWeight: 'bold', color: '#666' },
  divider: { marginVertical: 15 },
  darkDivider: { backgroundColor: '#333' },
  sectionTitle: { fontWeight: 'bold', marginBottom: 10, color: '#444' },
  ingredients: { lineHeight: 24, color: '#666' },
  cookingSection: { marginTop: 10 },
  actionButton: { marginTop: 15, paddingVertical: 5 },
  stepCard: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  darkStepCard: { backgroundColor: '#1e1e1e', borderColor: '#333' },
  stepCounter: { color: '#FF6347', marginBottom: 10, fontWeight: 'bold' },
  stepText: { lineHeight: 24, color: '#444', marginBottom: 20 },
  finishCard: { marginTop: 10, backgroundColor: '#FFFEE0', borderWidth: 1, borderColor: '#FFEB3B' },
  darkFinishCard: { backgroundColor: '#2e2e2e', borderColor: '#444' },
  finishContent: { alignItems: 'center', padding: 10 },
  finishTitle: { marginTop: 15, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  finishSubTitle: { color: '#666', marginTop: 5, textAlign: 'center', marginBottom: 10 },
  finishCookTime: { marginTop: 5, color: '#FF6347', fontWeight: 'bold' },
  finalActionButton: { marginTop: 15, width: '100%', paddingVertical: 5 },
});
