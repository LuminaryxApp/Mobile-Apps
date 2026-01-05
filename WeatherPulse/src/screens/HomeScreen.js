import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext, WeatherContext } from '../contexts';

const { width } = Dimensions.get('window');

// map conditions to icons - pretty straightforward
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

// get nice gradient colors based on weather
const getWeatherColors = (condition, isDark) => {
  const colors = {
    'Sunny': isDark ? ['#0369A1', '#0EA5E9'] : ['#38BDF8', '#7DD3FC'],
    'Partly Cloudy': isDark ? ['#334155', '#475569'] : ['#94A3B8', '#CBD5E1'],
    'Cloudy': isDark ? ['#1E293B', '#334155'] : ['#64748B', '#94A3B8'],
    'Rainy': isDark ? ['#1E3A5F', '#0F172A'] : ['#3B82F6', '#60A5FA'],
    'Thunderstorm': isDark ? ['#1F2937', '#111827'] : ['#4B5563', '#6B7280'],
    'Snowy': isDark ? ['#1E3A5F', '#0F172A'] : ['#E0F2FE', '#BAE6FD'],
    'Foggy': isDark ? ['#374151', '#1F2937'] : ['#9CA3AF', '#D1D5DB'],
    'Windy': isDark ? ['#0369A1', '#0C4A6E'] : ['#0EA5E9', '#38BDF8'],
  };
  return colors[condition] || colors['Sunny'];
};

export default function HomeScreen({ navigation }) {
  const { theme, isDark } = useContext(ThemeContext);
  const { currentCity, getWeather, refreshWeather, formatTemp } = useContext(WeatherContext);
  const [weather, setWeather] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWeather();
  }, [currentCity]);

  const loadWeather = () => {
    const data = getWeather(currentCity.name);
    setWeather(data);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    const data = refreshWeather();
    setWeather(data);
    setTimeout(() => setRefreshing(false), 500);
  };

  if (!weather) return null;

  const bgColors = getWeatherColors(weather.current.condition, isDark);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* main weather card - the hero section */}
      <View style={[styles.heroCard, { backgroundColor: bgColors[0] }]}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={18} color="#fff" />
          <Text style={styles.locationText}>{currentCity.name}, {currentCity.country}</Text>
        </View>

        <View style={styles.mainTemp}>
          <Ionicons name={getWeatherIcon(weather.current.condition)} size={72} color="#fff" />
          <Text style={styles.tempText}>{formatTemp(weather.current.temp)}</Text>
        </View>

        <Text style={styles.conditionText}>{weather.current.condition}</Text>
        <Text style={styles.feelsLike}>Feels like {formatTemp(weather.current.feelsLike)}</Text>

        {/* high/low for today */}
        <View style={styles.highLowRow}>
          <View style={styles.highLow}>
            <Ionicons name="arrow-up" size={16} color="#fff" />
            <Text style={styles.highLowText}>{formatTemp(weather.daily[0].high)}</Text>
          </View>
          <View style={styles.highLow}>
            <Ionicons name="arrow-down" size={16} color="#fff" />
            <Text style={styles.highLowText}>{formatTemp(weather.daily[0].low)}</Text>
          </View>
        </View>
      </View>

      {/* quick stats grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Ionicons name="water" size={24} color={theme.primary} />
          <Text style={[styles.statValue, { color: theme.text }]}>{weather.current.humidity}%</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Humidity</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Ionicons name="speedometer" size={24} color={theme.primary} />
          <Text style={[styles.statValue, { color: theme.text }]}>{weather.current.windSpeed} km/h</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Wind</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Ionicons name="sunny" size={24} color={theme.accent} />
          <Text style={[styles.statValue, { color: theme.text }]}>{weather.current.uvIndex}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>UV Index</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Ionicons name="eye" size={24} color={theme.primary} />
          <Text style={[styles.statValue, { color: theme.text }]}>{weather.current.visibility} km</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Visibility</Text>
        </View>
      </View>

      {/* hourly forecast */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Hourly Forecast</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.hourlyRow}>
            {weather.hourly.slice(0, 12).map((hour, idx) => {
              const time = new Date(hour.time);
              const hourStr = idx === 0 ? 'Now' : time.getHours().toString().padStart(2, '0') + ':00';
              return (
                <View key={idx} style={styles.hourlyItem}>
                  <Text style={[styles.hourlyTime, { color: theme.textSecondary }]}>{hourStr}</Text>
                  <Ionicons name={getWeatherIcon(hour.condition)} size={26} color={theme.primary} />
                  <Text style={[styles.hourlyTemp, { color: theme.text }]}>{formatTemp(hour.temp)}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* 7 day forecast */}
      <View style={[styles.section, { backgroundColor: theme.card, marginBottom: 32 }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>7-Day Forecast</Text>
        {weather.daily.map((day, idx) => (
          <View key={idx} style={[styles.dailyRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.dayName, { color: theme.text }]}>{day.dayName}</Text>
            <Ionicons name={getWeatherIcon(day.condition)} size={24} color={theme.primary} />
            <View style={styles.dailyTemps}>
              <Text style={[styles.dailyHigh, { color: theme.text }]}>{formatTemp(day.high)}</Text>
              <Text style={[styles.dailyLow, { color: theme.textSecondary }]}>{formatTemp(day.low)}</Text>
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
  heroCard: {
    margin: 16,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  mainTemp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 16,
  },
  tempText: {
    color: '#fff',
    fontSize: 64,
    fontWeight: '200',
  },
  conditionText: {
    color: '#fff',
    fontSize: 22,
    marginTop: 8,
  },
  feelsLike: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  highLowRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 24,
  },
  highLow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  highLowText: {
    color: '#fff',
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  statCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  hourlyRow: {
    flexDirection: 'row',
    gap: 20,
  },
  hourlyItem: {
    alignItems: 'center',
    gap: 8,
  },
  hourlyTime: {
    fontSize: 13,
  },
  hourlyTemp: {
    fontSize: 15,
    fontWeight: '600',
  },
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dayName: {
    flex: 1,
    fontSize: 16,
  },
  dailyTemps: {
    flexDirection: 'row',
    gap: 16,
    marginLeft: 16,
  },
  dailyHigh: {
    fontSize: 16,
    fontWeight: '600',
    width: 45,
    textAlign: 'right',
  },
  dailyLow: {
    fontSize: 16,
    width: 45,
    textAlign: 'right',
  },
});
