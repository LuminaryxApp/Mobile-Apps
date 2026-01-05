import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext, WeatherContext } from '../contexts';

// some cities to search from - in a real app this would come from an API
const allCities = [
  { id: '1', name: 'New York', country: 'USA' },
  { id: '2', name: 'London', country: 'UK' },
  { id: '3', name: 'Tokyo', country: 'Japan' },
  { id: '4', name: 'Paris', country: 'France' },
  { id: '5', name: 'Sydney', country: 'Australia' },
  { id: '6', name: 'Dubai', country: 'UAE' },
  { id: '7', name: 'Singapore', country: 'Singapore' },
  { id: '8', name: 'Los Angeles', country: 'USA' },
  { id: '9', name: 'Toronto', country: 'Canada' },
  { id: '10', name: 'Berlin', country: 'Germany' },
  { id: '11', name: 'Mumbai', country: 'India' },
  { id: '12', name: 'Shanghai', country: 'China' },
  { id: '13', name: 'Rome', country: 'Italy' },
  { id: '14', name: 'Barcelona', country: 'Spain' },
  { id: '15', name: 'Amsterdam', country: 'Netherlands' },
  { id: '16', name: 'Seoul', country: 'South Korea' },
  { id: '17', name: 'Bangkok', country: 'Thailand' },
  { id: '18', name: 'Moscow', country: 'Russia' },
  { id: '19', name: 'Cairo', country: 'Egypt' },
  { id: '20', name: 'Mexico City', country: 'Mexico' },
];

export default function SearchScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const { setCurrentCity, saveCity, savedCities } = useContext(WeatherContext);
  const [query, setQuery] = useState('');

  // filter cities based on search
  const filteredCities = query.length > 0
    ? allCities.filter(city =>
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.country.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelectCity = (city) => {
    setCurrentCity(city);
    navigation.navigate('Home');
  };

  const handleSaveCity = (city) => {
    saveCity(city);
  };

  const isSaved = (cityId) => {
    return savedCities.some(c => c.id === cityId);
  };

  const renderCity = ({ item }) => (
    <TouchableOpacity
      style={[styles.cityCard, { backgroundColor: theme.card }]}
      onPress={() => handleSelectCity(item)}
    >
      <View style={styles.cityInfo}>
        <Text style={[styles.cityName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.countryName, { color: theme.textSecondary }]}>{item.country}</Text>
      </View>

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={() => handleSaveCity(item)}
        disabled={isSaved(item.id)}
      >
        <Ionicons
          name={isSaved(item.id) ? 'bookmark' : 'bookmark-outline'}
          size={22}
          color={isSaved(item.id) ? theme.primary : theme.textSecondary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* search input */}
      <View style={[styles.searchBox, { backgroundColor: theme.card }]}>
        <Ionicons name="search" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search for a city..."
          placeholderTextColor={theme.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* results */}
      {query.length > 0 ? (
        filteredCities.length > 0 ? (
          <FlatList
            data={filteredCities}
            renderItem={renderCity}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
        ) : (
          <View style={styles.noResults}>
            <Ionicons name="search" size={48} color={theme.textSecondary} />
            <Text style={[styles.noResultsText, { color: theme.textSecondary }]}>
              No cities found for "{query}"
            </Text>
          </View>
        )
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="globe-outline" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Search Cities</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Type a city name to see weather information
          </Text>

          {/* popular cities suggestion */}
          <Text style={[styles.popularTitle, { color: theme.text }]}>Popular Cities</Text>
          <View style={styles.popularGrid}>
            {allCities.slice(0, 6).map((city) => (
              <TouchableOpacity
                key={city.id}
                style={[styles.popularChip, { backgroundColor: theme.card }]}
                onPress={() => handleSelectCity(city)}
              >
                <Text style={[styles.popularText, { color: theme.text }]}>{city.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 17,
    fontWeight: '600',
  },
  countryName: {
    fontSize: 13,
    marginTop: 2,
  },
  saveBtn: {
    padding: 8,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  noResultsText: {
    fontSize: 15,
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
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
  popularTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 40,
    marginBottom: 16,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  popularChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  popularText: {
    fontSize: 14,
  },
});
