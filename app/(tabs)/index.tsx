import React, { useContext, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Card, Text, FAB, Button, ActivityIndicator } from 'react-native-paper';
import { RecipeContext } from '../../context/RecipeContext';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RecipeCard from '../../components/RecipeCard'; // YENİ BİLEŞEN
import { theme } from '../../constants/theme'; // TEMA DOSYASI

export default function Home() {
  const { 
    recipes, addRecipe, deleteRecipe, toggleSecretStatus, isDarkMode,
    dailyRecipe, isLoadingDaily, dailyError, isOffline, fetchDailyRecipe 
  } = useContext(RecipeContext);

  const publicRecipes = recipes.filter((r: any) => !r.isSecret);

  const handleSaveDaily = async (saveAsSecret: boolean) => {
    if (!dailyRecipe) return;
    
    const newRecipeToSave = {
      ...dailyRecipe,
      id: Date.now().toString(),
      isSecret: saveAsSecret
    };

    await addRecipe(newRecipeToSave);
    Alert.alert(
      "Recipe Saved!", 
      `${dailyRecipe.title} has been added to your ${saveAsSecret ? 'Secret Vault 🔒' : 'Cookbook 📖'}.`
    );
  };

  const renderDailyRecipe = () => (
    <View style={styles.dailySection}>
      <View style={styles.dailyHeader}>
        <Text variant="titleLarge" style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          Recipe of the Day
        </Text>
        
        {isOffline && (
          <View style={styles.offlineBadge}>
            <MaterialCommunityIcons name="wifi-off" size={14} color="#fff" />
            <Text style={styles.offlineText}>Offline Mode</Text>
          </View>
        )}
      </View>

      <View style={styles.dynamicBox}>
        {isLoadingDaily ? (
          <View style={styles.centerBox}>
            <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
            <Text style={{ marginTop: 15, color: isDarkMode ? theme.colors.subTextDark : theme.colors.subTextLight }}>Fetching fresh recipe...</Text>
          </View>
        ) : dailyError && !dailyRecipe ? (
          <View style={styles.centerBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={40} color={theme.colors.primary} />
            <Text style={{ marginTop: 10, marginBottom: 15, color: theme.colors.primary, textAlign: 'center' }}>{dailyError}</Text>
            <Button mode="outlined" onPress={fetchDailyRecipe} textColor={theme.colors.primary} style={{ borderColor: theme.colors.primary }}>Try Again</Button>
          </View>
        ) : dailyRecipe ? (
          <Card 
            style={[styles.dailyCard, isDarkMode && styles.darkCard]} 
            onPress={() => router.push(`/recipe/${dailyRecipe.id}` as any)}
          >
            {dailyRecipe.image && <Card.Cover source={{ uri: dailyRecipe.image }} style={styles.dailyImage} />}
            <Card.Content style={styles.dailyContent}>
              <Text variant="titleMedium" style={isDarkMode && styles.darkText} numberOfLines={1}>{dailyRecipe.title}</Text>
              <View style={styles.timeContainer}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.primary} />
                <Text variant="bodySmall" style={[styles.timeText, isDarkMode && styles.darkSubText]}>
                  Prep: {dailyRecipe.prepTime}m | Cook: {dailyRecipe.cookTime}m
                </Text>
              </View>
            </Card.Content>
            
            <Card.Actions style={styles.dailyActions}>
              <Button icon="bookmark-outline" textColor={theme.colors.primary} onPress={() => handleSaveDaily(false)}>
                Save
              </Button>
              <Button icon="lock-outline" textColor={isDarkMode ? theme.colors.borderLight : theme.colors.subTextLight} onPress={() => handleSaveDaily(true)}>
                Vault
              </Button>
            </Card.Actions>
          </Card>
        ) : null}
      </View>
      
      <Text variant="titleLarge" style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginTop: 25 }]}>
        My Cookbook
      </Text>
    </View>
  );

  // Kriter 9: useCallback ile gereksiz re-render önlendi
  const handleCardPress = useCallback((id: string) => {
    router.push(`/recipe/${id}` as any);
  }, []);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <RecipeCard 
      item={item} 
      isDarkMode={isDarkMode} 
      onPress={() => handleCardPress(item.id)} 
      onToggleSecret={toggleSecretStatus} 
      onDelete={deleteRecipe} 
    />
  ), [isDarkMode, handleCardPress, toggleSecretStatus, deleteRecipe]);

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <FlatList
        data={publicRecipes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderDailyRecipe}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoadingDaily} onRefresh={fetchDailyRecipe} colors={[theme.colors.primary]} />}
        ListEmptyComponent={
          !isLoadingDaily ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="silverware-clean" size={64} color={isDarkMode ? theme.colors.borderDark : '#ccc'} />
              <Text variant="titleMedium" style={isDarkMode ? styles.darkSubText : styles.emptyText}>
                No recipes available. Add some!
              </Text>
            </View>
          ) : null
        }
      />
      <FAB icon="plus" style={styles.fab} color="#fff" onPress={() => router.push('/add')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundLight },
  darkContainer: { backgroundColor: theme.colors.backgroundDark },
  list: { padding: 15, paddingBottom: 80 },
  darkText: { color: theme.colors.textDark },
  darkSubText: { color: theme.colors.subTextDark },
  timeContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  timeText: { marginLeft: 5, color: theme.colors.subTextLight, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 10, color: theme.colors.subTextLight },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: theme.colors.primary },
  
  dailySection: { marginBottom: 10 },
  dailyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 5 },
  sectionTitle: { fontWeight: 'bold', color: theme.colors.textLight },
  offlineBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  offlineText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  
  dynamicBox: { minHeight: 240, justifyContent: 'center' },
  centerBox: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.cardLight, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.borderLight },
  
  dailyCard: { backgroundColor: theme.colors.cardLight, borderWidth: 2, borderColor: theme.colors.primary },
  darkCard: { backgroundColor: theme.colors.cardDark },
  dailyImage: { height: 160 },
  dailyContent: { paddingTop: 10 },
  dailyActions: { paddingTop: 0, paddingBottom: 5, paddingRight: 5 }
});