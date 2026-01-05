import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext, PhotoContext } from '../contexts';

const { width } = Dimensions.get('window');
const ALBUM_SIZE = (width - 48) / 2;

export default function AlbumsScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const { albums, photos, createAlbum, deleteAlbum } = useContext(PhotoContext);
  const [showModal, setShowModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');

  // count photos in each album
  const getAlbumPhotoCount = (albumId) => {
    return photos.filter(p => p.albumId === albumId).length;
  };

  // get cover photo for album (first photo or default)
  const getAlbumCover = (album) => {
    const albumPhotos = photos.filter(p => p.albumId === album.id);
    if (albumPhotos.length > 0) {
      return albumPhotos[0].thumbnail;
    }
    return album.cover;
  };

  const handleCreateAlbum = () => {
    if (newAlbumName.trim()) {
      createAlbum(newAlbumName.trim());
      setNewAlbumName('');
      setShowModal(false);
    }
  };

  const handleDeleteAlbum = (album) => {
    Alert.alert(
      'Delete Album',
      `Delete "${album.name}"? Photos will be moved out of this album.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAlbum(album.id),
        },
      ]
    );
  };

  const renderAlbum = ({ item }) => {
    const photoCount = getAlbumPhotoCount(item.id);
    const coverUri = getAlbumCover(item);

    return (
      <TouchableOpacity
        style={styles.albumCard}
        onPress={() => navigation.navigate('AlbumDetail', {
          albumId: item.id,
          albumName: item.name,
        })}
        onLongPress={() => handleDeleteAlbum(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: coverUri }}
          style={[styles.albumCover, { backgroundColor: theme.cardSecondary }]}
        />
        <View style={[styles.albumOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
          <Text style={styles.albumName}>{item.name}</Text>
          <Text style={styles.albumCount}>{photoCount} photos</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* header with count */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {albums.length} Albums
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Long press to delete
        </Text>
      </View>

      {/* albums grid */}
      {albums.length > 0 ? (
        <FlatList
          data={albums}
          renderItem={renderAlbum}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="albums-outline" size={80} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Albums</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Create albums to organize your photos
          </Text>
        </View>
      )}

      {/* fab to add new album */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* new album modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>New Album</Text>

            <TextInput
              style={[styles.input, { backgroundColor: theme.cardSecondary, color: theme.text }]}
              placeholder="Album name"
              placeholderTextColor={theme.textSecondary}
              value={newAlbumName}
              onChangeText={setNewAlbumName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.cardSecondary }]}
                onPress={() => {
                  setNewAlbumName('');
                  setShowModal(false);
                }}
              >
                <Text style={{ color: theme.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                onPress={handleCreateAlbum}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  gridContainer: {
    padding: 16,
    paddingTop: 8,
  },
  albumCard: {
    width: ALBUM_SIZE,
    height: ALBUM_SIZE,
    marginRight: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  albumCover: {
    width: '100%',
    height: '100%',
  },
  albumOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 14,
  },
  albumName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  albumCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 4,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    padding: 24,
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
});
