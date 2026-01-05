import React, { useContext, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext, PhotoContext } from '../contexts';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GAP = 2;
const PHOTO_SIZE = (width - GAP * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

export default function GalleryScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const { photos, toggleFavorite } = useContext(PhotoContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [loadingImages, setLoadingImages] = useState({});

  // group photos by date for headers
  const groupedPhotos = useMemo(() => {
    // just sort by date for now, grouping would complicate the flatlist
    return [...photos].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [photos]);

  // track which images are loading
  const handleImageLoad = (id) => {
    setLoadingImages(prev => ({ ...prev, [id]: false }));
  };

  const handleImageLoadStart = (id) => {
    setLoadingImages(prev => ({ ...prev, [id]: true }));
  };

  const renderPhoto = ({ item, index }) => {
    const isLoading = loadingImages[item.id];

    if (viewMode === 'grid') {
      return (
        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => navigation.navigate('PhotoViewer', { photoId: item.id })}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: item.thumbnail }}
            style={styles.gridImage}
            onLoadStart={() => handleImageLoadStart(item.id)}
            onLoad={() => handleImageLoad(item.id)}
          />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={theme.primary} />
            </View>
          )}
          {item.isFavorite && (
            <View style={styles.favoriteIndicator}>
              <Ionicons name="heart" size={14} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      );
    }

    // list view
    return (
      <TouchableOpacity
        style={[styles.listItem, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate('PhotoViewer', { photoId: item.id })}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.thumbnail }} style={styles.listImage} />
        <View style={styles.listInfo}>
          <Text style={[styles.listDate, { color: theme.text }]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <Text style={[styles.listTime, { color: theme.textSecondary }]}>
            {new Date(item.createdAt).toLocaleTimeString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.listFavoriteBtn}
          onPress={() => toggleFavorite(item.id)}
        >
          <Ionicons
            name={item.isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={item.isFavorite ? theme.accent : theme.textSecondary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* header with search and view toggle */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View style={[styles.searchBox, { backgroundColor: theme.cardSecondary }]}>
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search photos..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.viewBtn,
              viewMode === 'grid' && { backgroundColor: theme.primary }
            ]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons
              name="grid"
              size={18}
              color={viewMode === 'grid' ? '#fff' : theme.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewBtn,
              viewMode === 'list' && { backgroundColor: theme.primary }
            ]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons
              name="list"
              size={18}
              color={viewMode === 'list' ? '#fff' : theme.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* photo count */}
      <View style={styles.countBar}>
        <Text style={[styles.countText, { color: theme.textSecondary }]}>
          {photos.length} photos
        </Text>
      </View>

      {/* photo grid/list */}
      {photos.length > 0 ? (
        <FlatList
          data={groupedPhotos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? COLUMN_COUNT : 1}
          key={viewMode} // force re-render when changing view mode
          contentContainerStyle={viewMode === 'list' ? styles.listContainer : styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={80} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Photos Yet</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Your photos will appear here
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
    padding: 12,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 4,
  },
  viewBtn: {
    padding: 10,
    borderRadius: 8,
  },
  countBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 13,
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 4,
  },
  listContainer: {
    padding: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  listImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  listInfo: {
    flex: 1,
    marginLeft: 14,
  },
  listDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  listTime: {
    fontSize: 13,
    marginTop: 4,
  },
  listFavoriteBtn: {
    padding: 8,
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
  },
});
