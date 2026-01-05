import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  FlatList,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext, PhotoContext } from '../contexts';

const { width, height } = Dimensions.get('window');

export default function PhotoViewerScreen({ route, navigation }) {
  const { photoId } = route.params;
  const { theme } = useContext(ThemeContext);
  const { photos, albums, toggleFavorite, deletePhoto, addToAlbum } = useContext(PhotoContext);

  const [showControls, setShowControls] = useState(true);
  const [showAlbumPicker, setShowAlbumPicker] = useState(false);

  const photo = photos.find(p => p.id === photoId);

  if (!photo) {
    navigation.goBack();
    return null;
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePhoto(photoId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleAddToAlbum = (albumId) => {
    addToAlbum(photoId, albumId);
    setShowAlbumPicker(false);
  };

  // format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* tap to toggle controls */}
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => setShowControls(!showControls)}
        activeOpacity={1}
      >
        <Image
          source={{ uri: photo.uri }}
          style={styles.fullImage}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* top controls - close button */}
      {showControls && (
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.topRight}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => toggleFavorite(photoId)}
            >
              <Ionicons
                name={photo.isFavorite ? 'heart' : 'heart-outline'}
                size={26}
                color={photo.isFavorite ? '#EC4899' : '#fff'}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* bottom controls */}
      {showControls && (
        <View style={styles.bottomBar}>
          <Text style={styles.dateText}>{formatDate(photo.createdAt)}</Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setShowAlbumPicker(true)}
            >
              <Ionicons name="albums-outline" size={24} color="#fff" />
              <Text style={styles.actionText}>Album</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => Alert.alert('Share', 'Share feature coming soon!')}
            >
              <Ionicons name="share-outline" size={24} color="#fff" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={24} color="#fff" />
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* album picker modal */}
      <Modal
        visible={showAlbumPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAlbumPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Add to Album</Text>
              <TouchableOpacity onPress={() => setShowAlbumPicker(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={albums}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.albumOption,
                    { borderBottomColor: theme.border }
                  ]}
                  onPress={() => handleAddToAlbum(item.id)}
                >
                  <Image source={{ uri: item.cover }} style={styles.albumThumb} />
                  <Text style={[styles.albumName, { color: theme.text }]}>{item.name}</Text>
                  {photo.albumId === item.id && (
                    <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={[styles.noAlbums, { color: theme.textSecondary }]}>
                  No albums yet. Create one first!
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: height,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    // gradient would be nice here but keeping it simple
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  closeBtn: {
    padding: 8,
  },
  topRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dateText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionBtn: {
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  albumOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  albumThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 14,
  },
  albumName: {
    flex: 1,
    fontSize: 16,
  },
  noAlbums: {
    padding: 30,
    textAlign: 'center',
  },
});
