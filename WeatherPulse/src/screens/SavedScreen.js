import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext, WeatherContext } from '../contexts';

// icons for weather conditions
const getWeatherIcon = (condition) => {
  const icons = {
    'Sunny': 'sunny',
    'Partly Cloudy': 'partly-sunny',
    'Cloudy': 'cloudy',
    'Rainy': 'rainy',
    'Thunderstorm': 'thunderstorm',
    'Snowy': 'snow',
    'Foggy': 'cloud',
    'Windy': 'flag',
  };
  return icons[condition] || 'partly-sunny';
};

export default function SavedScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const { savedCities, removeCity, setCurrentCity, getWeather, formatTemp, currentCity } = useContext(WeatherContext);

  const handleSelectCity = (city) => {
    setCurrentCity(city);
    navigation.navigate('Home');
  };

  const handleRemoveCity = (city) => {
    Alert.alert(
      'Remove Location',
      `Remove ${city.name} from saved locations?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeCity(city.id) },
      ]
    );
  };

  const renderCity = ({ item }) => {
    const weather = getWeather(item.name);
    const isCurrentCity = currentCity.id === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.cityCard,
          { backgroundColor: theme.card },
          isCurrentCity && { borderColor: theme.primary, borderWidth: 2 }
        ]}
        onPress={() => handleSelectCity(item)}
        onLongPress={() => handleRemoveCity(item)}
      >
        <View style={styles.cityHeader}>
          <View>
            <Text style={[styles.cityName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.countryName, { color: theme.textSecondary }]}>{item.country}</Text>
          </View>
          <Text style={[styles.tempText, { color: theme.text }]}>
            {formatTemp(weather.current.temp)}
          </Text>
        </View>

        <View style={styles.weatherRow}>
          <View style={styles.conditionInfo}>
            <Ionicons
              name={getWeatherIcon(weather.current.condition)}
              size={28}
              color={theme.primary}
            />
            <Text style={[styles.conditionText, { color: theme.textSecondary }]}>
              {weather.current.condition}
            </Text>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detail}>
              <Ionicons name="water-outline" size={14} color={theme.textSecondary} />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                {weather.current.humidity}%
              </Text>
            </View>
            <View style={styles.detail}>
              <Ionicons name="speedometer-outline" size={14} color={theme.textSecondary} />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                {weather.current.windSpeed} km/h
              </Text>
            </View>
          </View>
        </View>

        {isCurrentCity && (
          <View style={[styles.currentBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.currentText}>Current</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {savedCities.length} Saved Location{savedCities.length !== 1 ? 's' : ''}
        </Text>
        <Text style={[styles.headerHint, { color: theme.textSecondary }]}>
          Long press to remove
        </Text>
      </View>

      {savedCities.length > 0 ? (
        <FlatList
          data={savedCities}
          renderItem={renderCity}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Saved Locations</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Search for cities and save them here for quick access
          </Text>
          <TouchableOpacity
            style={[styles.searchBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Search')}
          >
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.searchBtnText}>Search Cities</Text>
          </TouchableOpacity>
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
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  headerHint: {
    fontSize: 12,
    marginTop: 4,
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  cityCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  cityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cityName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  countryName: {
    fontSize: 13,
    marginTop: 2,
  },
  tempText: {
    fontSize: 32,
    fontWeight: '200',
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  conditionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conditionText: {
    fontSize: 14,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
  },
  currentBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  currentText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
    gap: 8,
  },
  searchBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
