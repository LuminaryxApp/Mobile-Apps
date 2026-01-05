import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext, WeatherContext } from '../contexts';

const { width } = Dimensions.get('window');

// same icon mapping as home screen
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

export default function CityDetailScreen({ route, navigation }) {
  const { cityName, cityCountry } = route.params;
  const { theme } = useContext(ThemeContext);
  const { getWeather, formatTemp, saveCity, savedCities, setCurrentCity } = useContext(WeatherContext);

  const weather = getWeather(cityName);
  const isSaved = savedCities.some(c => c.name === cityName);

  const handleSetAsCurrent = () => {
    const city = savedCities.find(c => c.name === cityName) || {
      id: Date.now().toString(),
      name: cityName,
      country: cityCountry || 'Unknown'
    };
    setCurrentCity(city);
    navigation.navigate('Home');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* main weather display */}
      <View style={[styles.mainCard, { backgroundColor: theme.primary }]}>
        <Text style={styles.cityTitle}>{cityName}</Text>

        <View style={styles.mainWeather}>
          <Ionicons name={getWeatherIcon(weather.current.condition)} size={80} color="#fff" />
          <Text style={styles.mainTemp}>{formatTemp(weather.current.temp)}</Text>
        </View>

        <Text style={styles.conditionText}>{weather.current.condition}</Text>

        <View style={styles.rangeRow}>
          <Text style={styles.rangeText}>
            H: {formatTemp(weather.daily[0].high)} · L: {formatTemp(weather.daily[0].low)}
          </Text>
        </View>
      </View>

      {/* action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.card }]}
          onPress={handleSetAsCurrent}
        >
          <Ionicons name="home" size={22} color={theme.primary} />
          <Text style={[styles.actionText, { color: theme.text }]}>Set as Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.card }]}
          onPress={() => {
            if (!isSaved) {
              saveCity({
                id: Date.now().toString(),
                name: cityName,
                country: cityCountry || 'Unknown'
              });
            }
          }}
          disabled={isSaved}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={isSaved ? theme.primary : theme.textSecondary}
          />
          <Text style={[styles.actionText, { color: theme.text }]}>
            {isSaved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* details grid */}
      <View style={styles.detailsGrid}>
        <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
          <Ionicons name="thermometer" size={24} color={theme.primary} />
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {formatTemp(weather.current.feelsLike)}
          </Text>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Feels Like</Text>
        </View>

        <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
          <Ionicons name="water" size={24} color={theme.primary} />
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {weather.current.humidity}%
          </Text>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Humidity</Text>
        </View>

        <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
          <Ionicons name="speedometer" size={24} color={theme.primary} />
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {weather.current.windSpeed} km/h
          </Text>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Wind</Text>
        </View>

        <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
          <Ionicons name="sunny" size={24} color={theme.accent} />
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {weather.current.uvIndex}
          </Text>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>UV Index</Text>
        </View>

        <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
          <Ionicons name="eye" size={24} color={theme.primary} />
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {weather.current.visibility} km
          </Text>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Visibility</Text>
        </View>

        <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
          <Ionicons name="analytics" size={24} color={theme.primary} />
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {weather.current.pressure} hPa
          </Text>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Pressure</Text>
        </View>
      </View>

      {/* 7-day forecast */}
      <View style={[styles.forecastCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.forecastTitle, { color: theme.text }]}>7-Day Forecast</Text>

        {weather.daily.map((day, idx) => (
          <View key={idx} style={[styles.forecastRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.dayName, { color: theme.text }]}>{day.dayName}</Text>
            <Ionicons name={getWeatherIcon(day.condition)} size={22} color={theme.primary} />
            <Text style={[styles.dayCondition, { color: theme.textSecondary }]}>{day.condition}</Text>
            <View style={styles.dayTemps}>
              <Text style={[styles.dayHigh, { color: theme.text }]}>{formatTemp(day.high)}</Text>
              <Text style={[styles.dayLow, { color: theme.textSecondary }]}>{formatTemp(day.low)}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainCard: {
    margin: 16,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  cityTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  mainWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 20,
  },
  mainTemp: {
    color: '#fff',
    fontSize: 72,
    fontWeight: '200',
  },
  conditionText: {
    color: '#fff',
    fontSize: 22,
    marginTop: 12,
  },
  rangeRow: {
    marginTop: 12,
  },
  rangeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  detailCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  forecastCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dayName: {
    width: 60,
    fontSize: 15,
  },
  dayCondition: {
    flex: 1,
    fontSize: 13,
    marginLeft: 10,
  },
  dayTemps: {
    flexDirection: 'row',
    gap: 14,
  },
  dayHigh: {
    fontSize: 15,
    fontWeight: '600',
    width: 42,
    textAlign: 'right',
  },
  dayLow: {
    fontSize: 15,
    width: 42,
    textAlign: 'right',
  },
});
