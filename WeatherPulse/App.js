import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import { ThemeContext, WeatherContext } from './src/contexts';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import SavedScreen from './src/screens/SavedScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CityDetailScreen from './src/screens/CityDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// theme colors
const darkTheme = {
  background: '#0B1426',
  card: '#162137',
  cardSecondary: '#1E2D47',
  primary: '#0EA5E9',
  primaryLight: '#38BDF8',
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  accent: '#F59E0B',
  border: '#1E3A5F',
};

const lightTheme = {
  background: '#F0F9FF',
  card: '#FFFFFF',
  cardSecondary: '#E0F2FE',
  primary: '#0EA5E9',
  primaryLight: '#38BDF8',
  text: '#0F172A',
  textSecondary: '#64748B',
  accent: '#F59E0B',
  border: '#BAE6FD',
};

// mock weather data generator - feels pretty realistic
const generateWeatherData = (cityName) => {
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Thunderstorm', 'Snowy', 'Foggy', 'Windy'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

  // temp varies by condition to make it believable
  let baseTemp = 20;
  if (randomCondition === 'Snowy') baseTemp = -5;
  else if (randomCondition === 'Rainy' || randomCondition === 'Thunderstorm') baseTemp = 15;
  else if (randomCondition === 'Sunny') baseTemp = 28;

  const currentTemp = baseTemp + Math.floor(Math.random() * 10) - 5;

  // hourly forecast for the next 24 hours
  const hourly = [];
  for (let i = 0; i < 24; i++) {
    const hour = new Date();
    hour.setHours(hour.getHours() + i);
    hourly.push({
      time: hour.toISOString(),
      temp: currentTemp + Math.floor(Math.random() * 6) - 3,
      condition: i < 6 ? randomCondition : conditions[Math.floor(Math.random() * conditions.length)],
    });
  }

  // 7-day forecast
  const daily = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    daily.push({
      date: date.toISOString(),
      dayName: i === 0 ? 'Today' : dayNames[date.getDay()],
      high: currentTemp + Math.floor(Math.random() * 8),
      low: currentTemp - Math.floor(Math.random() * 8) - 2,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
    });
  }

  return {
    city: cityName,
    current: {
      temp: currentTemp,
      feelsLike: currentTemp - 2,
      condition: randomCondition,
      humidity: 40 + Math.floor(Math.random() * 40),
      windSpeed: 5 + Math.floor(Math.random() * 25),
      uvIndex: Math.floor(Math.random() * 11),
      visibility: 8 + Math.floor(Math.random() * 7),
      pressure: 1000 + Math.floor(Math.random() * 30),
    },
    hourly,
    daily,
    lastUpdated: new Date().toISOString(),
  };
};

// some default cities to start with
const defaultCities = [
  { id: '1', name: 'New York', country: 'USA' },
  { id: '2', name: 'London', country: 'UK' },
  { id: '3', name: 'Tokyo', country: 'Japan' },
  { id: '4', name: 'Paris', country: 'France' },
  { id: '5', name: 'Sydney', country: 'Australia' },
];

function MainTabs() {
  const { theme } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'partly-sunny' : 'partly-sunny-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Saved') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
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
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Weather' }} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} options={{ title: 'Locations' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [currentCity, setCurrentCity] = useState(defaultCities[0]);
  const [savedCities, setSavedCities] = useState(defaultCities.slice(0, 3));
  const [weatherCache, setWeatherCache] = useState({});
  const [useCelsius, setUseCelsius] = useState(true);

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    saveSettings();
  }, [isDark, savedCities, currentCity, useCelsius]);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('weatherpulse_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        if (settings.isDark !== undefined) setIsDark(settings.isDark);
        if (settings.savedCities) setSavedCities(settings.savedCities);
        if (settings.currentCity) setCurrentCity(settings.currentCity);
        if (settings.useCelsius !== undefined) setUseCelsius(settings.useCelsius);
      }
    } catch (err) {
      console.log('Failed to load settings:', err);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('weatherpulse_settings', JSON.stringify({
        isDark,
        savedCities,
        currentCity,
        useCelsius,
      }));
    } catch (err) {
      console.log('Failed to save settings:', err);
    }
  };

  // get weather data for a city (cached or fresh)
  const getWeather = (cityName) => {
    // check cache first - refresh if older than 30 mins
    const cached = weatherCache[cityName];
    if (cached) {
      const age = Date.now() - new Date(cached.lastUpdated).getTime();
      if (age < 30 * 60 * 1000) return cached;
    }

    // generate new data
    const newData = generateWeatherData(cityName);
    setWeatherCache(prev => ({ ...prev, [cityName]: newData }));
    return newData;
  };

  // refresh weather for current city
  const refreshWeather = () => {
    const newData = generateWeatherData(currentCity.name);
    setWeatherCache(prev => ({ ...prev, [currentCity.name]: newData }));
    return newData;
  };

  // save a city to favorites
  const saveCity = (city) => {
    if (!savedCities.find(c => c.id === city.id)) {
      setSavedCities([...savedCities, city]);
    }
  };

  // remove a city from favorites
  const removeCity = (cityId) => {
    setSavedCities(savedCities.filter(c => c.id !== cityId));
  };

  // convert temp if needed
  const formatTemp = (celsius) => {
    if (useCelsius) return `${Math.round(celsius)}°C`;
    return `${Math.round(celsius * 9/5 + 32)}°F`;
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setIsDark }}>
      <WeatherContext.Provider value={{
        currentCity,
        setCurrentCity,
        savedCities,
        saveCity,
        removeCity,
        getWeather,
        refreshWeather,
        useCelsius,
        setUseCelsius,
        formatTemp,
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
              name="CityDetail"
              component={CityDetailScreen}
              options={({ route }) => ({ title: route.params?.cityName || 'City' })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </WeatherContext.Provider>
    </ThemeContext.Provider>
  );
}
