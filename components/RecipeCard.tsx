import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface RecipeCardProps {
  item: any;
  isDarkMode: boolean;
  onPress: () => void;
  onToggleSecret: (id: string) => void;
  onDelete: (id: string) => void;
}

const RecipeCard = ({ item, isDarkMode, onPress, onToggleSecret, onDelete }: RecipeCardProps) => {
  return (
    <Card 
      style={[styles.card, isDarkMode && styles.darkCard]} 
      onPress={onPress}
    >
      {item.image && <Card.Cover source={{ uri: item.image }} />}
      <Card.Title 
        title={item.title} 
        titleVariant="titleLarge"
        titleStyle={isDarkMode && styles.darkText}
        right={(props) => (
          <View style={styles.iconContainer}>
            <IconButton 
              {...props} 
              icon={item.isSecret ? "lock" : "lock-outline"} 
              iconColor={isDarkMode ? theme.colors.subTextDark : theme.colors.subTextLight}
              onPress={() => onToggleSecret(item.id)} 
            />
            <IconButton 
              {...props} 
              icon="delete" 
              iconColor={theme.colors.primary}
              onPress={() => onDelete(item.id)} 
            />
          </View>
        )}
      />
      <Card.Content>
        <Text variant="bodyMedium" style={[styles.ingredients, isDarkMode && styles.darkSubText]} numberOfLines={2}>
          {item.ingredients}
        </Text>
        <View style={styles.timeContainer}>
          <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.primary} />
          <Text variant="bodyMedium" style={[styles.timeText, isDarkMode && styles.darkSubText]}>
            Prep Time: {item.prepTime || 0} mins
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 15, backgroundColor: theme.colors.cardLight, elevation: 2 },
  darkCard: { backgroundColor: theme.colors.cardDark },
  darkText: { color: theme.colors.textDark },
  darkSubText: { color: theme.colors.subTextDark },
  ingredients: { color: theme.colors.subTextLight, marginTop: 5 },
  timeContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  timeText: { marginLeft: 5, color: theme.colors.subTextLight, fontWeight: 'bold' },
  iconContainer: { flexDirection: 'row' },
});


export default React.memo(RecipeCard);