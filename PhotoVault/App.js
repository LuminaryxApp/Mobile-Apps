import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import { ThemeContext, PhotoContext } from './src/contexts';
import GalleryScreen from './src/screens/GalleryScreen';
import AlbumsScreen from './src/screens/AlbumsScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PhotoViewerScreen from './src/screens/PhotoViewerScreen';
import AlbumDetailScreen from './src/screens/AlbumDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// theme definitions
const darkTheme = {
  background: '#0A0A0F',
  card: '#16161F',
  cardSecondary: '#1E1E2D',
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  accent: '#EC4899',
  border: '#2D2D3D',
};

const lightTheme = {
  background: '#F8F9FA',
  card: '#FFFFFF',
  cardSecondary: '#F1F3F5',
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  accent: '#EC4899',
  border: '#E5E7EB',
};

// generate some demo photos using picsum
// these are placeholder images that work great for demos
const generateDemoPhotos = () => {
  const photos = [];
  for (let i = 1; i <= 30; i++) {
    photos.push({
      id: `photo-${i}`,
      uri: `https://picsum.photos/seed/${i}/800/800`,
      thumbnail: `https://picsum.photos/seed/${i}/300/300`,
      width: 800,
      height: 800,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      isFavorite: false,
      albumId: null,
    });
  }
  return photos;
};

function MainTabs() {
  const { theme } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Gallery') {
            iconName = focused ? 'images' : 'images-outline';
          } else if (route.name === 'Albums') {
            iconName = focused ? 'albums' : 'albums-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: theme.card,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Gallery" component={GalleryScreen} options={{ title: 'Photos' }} />
      <Tab.Screen name="Albums" component={AlbumsScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([
    { id: 'album-1', name: 'Vacation', cover: 'https://picsum.photos/seed/vacation/400/400', count: 0 },
    { id: 'album-2', name: 'Family', cover: 'https://picsum.photos/seed/family/400/400', count: 0 },
    { id: 'album-3', name: 'Nature', cover: 'https://picsum.photos/seed/nature/400/400', count: 0 },
  ]);

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (photos.length > 0) {
      saveData();
    }
  }, [photos, albums, isDark]);

  const loadData = async () => {
    try {
      const storedPhotos = await AsyncStorage.getItem('photos');
      const storedAlbums = await AsyncStorage.getItem('albums');
      const storedTheme = await AsyncStorage.getItem('photovault_isDark');

      if (storedPhotos) {
        setPhotos(JSON.parse(storedPhotos));
      } else {
        // first time? generate demo photos
        setPhotos(generateDemoPhotos());
      }

      if (storedAlbums) setAlbums(JSON.parse(storedAlbums));
      if (storedTheme !== null) setIsDark(JSON.parse(storedTheme));
    } catch (err) {
      console.log('Failed to load data:', err);
      setPhotos(generateDemoPhotos());
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('photos', JSON.stringify(photos));
      await AsyncStorage.setItem('albums', JSON.stringify(albums));
      await AsyncStorage.setItem('photovault_isDark', JSON.stringify(isDark));
    } catch (err) {
      console.log('Failed to save:', err);
    }
  };

  // photo operations
  const toggleFavorite = (photoId) => {
    setPhotos(photos.map(p =>
      p.id === photoId ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  const deletePhoto = (photoId) => {
    setPhotos(photos.filter(p => p.id !== photoId));
  };

  const addToAlbum = (photoId, albumId) => {
    setPhotos(photos.map(p =>
      p.id === photoId ? { ...p, albumId } : p
    ));
    // update album count
    updateAlbumCounts();
  };

  const removeFromAlbum = (photoId) => {
    setPhotos(photos.map(p =>
      p.id === photoId ? { ...p, albumId: null } : p
    ));
    updateAlbumCounts();
  };

  const updateAlbumCounts = () => {
    setAlbums(albums.map(album => ({
      ...album,
      count: photos.filter(p => p.albumId === album.id).length,
    })));
  };

  // album operations
  const createAlbum = (name) => {
    const newAlbum = {
      id: `album-${Date.now()}`,
      name,
      cover: `https://picsum.photos/seed/${Date.now()}/400/400`,
      count: 0,
    };
    setAlbums([...albums, newAlbum]);
  };

  const deleteAlbum = (albumId) => {
    // remove photos from album first
    setPhotos(photos.map(p =>
      p.albumId === albumId ? { ...p, albumId: null } : p
    ));
    setAlbums(albums.filter(a => a.id !== albumId));
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setIsDark }}>
      <PhotoContext.Provider value={{
        photos,
        albums,
        toggleFavorite,
        deletePhoto,
        addToAlbum,
        removeFromAlbum,
        createAlbum,
        deleteAlbum,
      }}>
        <NavigationContainer
          theme={{
            dark: isDark,
            colors: {
              primary: theme.primary,
              background: theme.background,
              card: theme.card,
              text: theme.text,
              border: theme.border,
              notification: theme.primary,
            },
            fonts: {
              regular: { fontFamily: 'System', fontWeight: '400' },
              medium: { fontFamily: 'System', fontWeight: '500' },
              bold: { fontFamily: 'System', fontWeight: '700' },
              heavy: { fontFamily: 'System', fontWeight: '800' },
            },
          }}
        >
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: theme.card },
              headerTintColor: theme.text,
              cardStyle: { backgroundColor: theme.background },
            }}
          >
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PhotoViewer"
              component={PhotoViewerScreen}
              options={{
                headerShown: false,
                presentation: 'modal',
                cardStyleInterpolator: ({ current }) => ({
                  cardStyle: { opacity: current.progress },
                }),
              }}
            />
            <Stack.Screen
              name="AlbumDetail"
              component={AlbumDetailScreen}
              options={({ route }) => ({ title: route.params?.albumName || 'Album' })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PhotoContext.Provider>
    </ThemeContext.Provider>
  );
}
