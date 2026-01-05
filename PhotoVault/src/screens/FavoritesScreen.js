import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext, PhotoContext } from '../contexts';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GAP = 2;
const PHOTO_SIZE = (width - GAP * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

export default function FavoritesScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const { photos, toggleFavorite } = useContext(PhotoContext);

  // only show favorited photos
  const favorites = photos.filter(p => p.isFavorite);

  const renderPhoto = ({ item }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => navigation.navigate('PhotoViewer', { photoId: item.id })}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.gridImage} />
      {/* remove from favorites button */}
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => toggleFavorite(item.id)}
      >
        <Ionicons name="heart-dislike" size={14} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Ionicons name="heart" size={24} color={theme.accent} />
        <Text style={[styles.headerText, { color: theme.text }]}>
          {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={80} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Favorites</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Tap the heart icon on photos to add them here
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  gridContainer: {
    padding: GAP,
  },
  gridItem: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    margin: GAP / 2,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
