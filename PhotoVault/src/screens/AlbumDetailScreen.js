import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext, PhotoContext } from '../contexts';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GAP = 2;
const PHOTO_SIZE = (width - GAP * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

export default function AlbumDetailScreen({ route, navigation }) {
  const { albumId, albumName } = route.params;
  const { theme } = useContext(ThemeContext);
  const { photos, removeFromAlbum } = useContext(PhotoContext);

  // get photos in this album
  const albumPhotos = photos.filter(p => p.albumId === albumId);

  const handleRemoveFromAlbum = (photoId) => {
    Alert.alert(
      'Remove from Album',
      'Remove this photo from the album?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => removeFromAlbum(photoId) },
      ]
    );
  };

  const renderPhoto = ({ item }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => navigation.navigate('PhotoViewer', { photoId: item.id })}
      onLongPress={() => handleRemoveFromAlbum(item.id)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.gridImage} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* info header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View style={[styles.albumIcon, { backgroundColor: theme.primary + '20' }]}>
          <Ionicons name="albums" size={24} color={theme.primary} />
        </View>
        <View style={styles.albumInfo}>
          <Text style={[styles.albumName, { color: theme.text }]}>{albumName}</Text>
          <Text style={[styles.photoCount, { color: theme.textSecondary }]}>
            {albumPhotos.length} photo{albumPhotos.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* hint text */}
      {albumPhotos.length > 0 && (
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Long press a photo to remove it from this album
        </Text>
      )}

      {/* photos grid */}
      {albumPhotos.length > 0 ? (
        <FlatList
          data={albumPhotos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Album is Empty</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Add photos from the gallery by tapping the album button
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
    marginBottom: 4,
  },
  albumIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumInfo: {
    marginLeft: 14,
  },
  albumName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  photoCount: {
    fontSize: 14,
    marginTop: 2,
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
