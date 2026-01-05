import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext, WeatherContext } from '../contexts';

export default function SettingsScreen() {
  const { theme, isDark, setIsDark } = useContext(ThemeContext);
  const { useCelsius, setUseCelsius, savedCities, currentCity } = useContext(WeatherContext);

  const handleClearData = () => {
    Alert.alert(
      'Reset App',
      'This will clear all saved locations and settings. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('weatherpulse_settings');
              Alert.alert('Done', 'Restart the app to see changes.');
            } catch (e) {
              console.log('Error clearing data:', e);
            }
          },
        },
      ]
    );
  };

  const SettingRow = ({ icon, label, value, onPress, hasSwitch, switchValue, onSwitch, iconBg }) => (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: theme.card }]}
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBg || theme.primary + '20' }]}>
        <Ionicons name={icon} size={20} color={iconBg ? '#fff' : theme.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitch}
          trackColor={{ false: theme.cardSecondary, true: theme.primary }}
          thumbColor="#fff"
        />
      ) : (
        <View style={styles.rowRight}>
          {value && <Text style={[styles.rowValue, { color: theme.textSecondary }]}>{value}</Text>}
          <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* app header card */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.appLogo}>
          <Ionicons name="partly-sunny" size={40} color="#fff" />
        </View>
        <Text style={styles.appName}>WeatherPulse</Text>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
      </View>

      {/* current location info */}
      <View style={[styles.currentCard, { backgroundColor: theme.card }]}>
        <View style={[styles.currentIcon, { backgroundColor: theme.primary + '20' }]}>
          <Ionicons name="location" size={24} color={theme.primary} />
        </View>
        <View style={styles.currentInfo}>
          <Text style={[styles.currentLabel, { color: theme.textSecondary }]}>Current Location</Text>
          <Text style={[styles.currentCity, { color: theme.text }]}>
            {currentCity.name}, {currentCity.country}
          </Text>
        </View>
      </View>

      {/* units section */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>UNITS</Text>
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.unitRow, { backgroundColor: theme.card }]}
          onPress={() => setUseCelsius(true)}
        >
          <Text style={[styles.unitLabel, { color: theme.text }]}>Celsius (°C)</Text>
          {useCelsius && <Ionicons name="checkmark-circle" size={22} color={theme.primary} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.unitRow, { backgroundColor: theme.card }]}
          onPress={() => setUseCelsius(false)}
        >
          <Text style={[styles.unitLabel, { color: theme.text }]}>Fahrenheit (°F)</Text>
          {!useCelsius && <Ionicons name="checkmark-circle" size={22} color={theme.primary} />}
        </TouchableOpacity>
      </View>

      {/* appearance */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>APPEARANCE</Text>
      <View style={styles.section}>
        <SettingRow
          icon="moon"
          label="Dark Mode"
          hasSwitch
          switchValue={isDark}
          onSwitch={() => setIsDark(!isDark)}
        />
      </View>

      {/* data section */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>DATA</Text>
      <View style={styles.section}>
        <SettingRow
          icon="bookmark"
          label="Saved Locations"
          value={`${savedCities.length}`}
        />
        <SettingRow
          icon="refresh"
          label="Refresh Weather"
          onPress={() => Alert.alert('Refreshed', 'Weather data updated!')}
        />
        <SettingRow
          icon="trash"
          label="Reset App"
          iconBg="#EF4444"
          onPress={handleClearData}
        />
      </View>

      {/* about */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ABOUT</Text>
      <View style={styles.section}>
        <SettingRow
          icon="information-circle"
          label="About"
          onPress={() => Alert.alert(
            'WeatherPulse',
            'A beautiful weather app built with React Native and Expo.\n\nDesigned for a smooth, modern experience with real-time weather data.'
          )}
        />
        <SettingRow
          icon="star"
          label="Rate App"
          onPress={() => Alert.alert('Thanks!', 'Rating feature coming soon!')}
        />
        <SettingRow
          icon="mail"
          label="Feedback"
          onPress={() => Alert.alert('Contact', 'feedback@weatherpulse.app')}
        />
      </View>

      <Text style={[styles.footer, { color: theme.textSecondary }]}>
        Built with React Native & Expo
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 32,
    alignItems: 'center',
  },
  appLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 12,
  },
  appVersion: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  currentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 14,
  },
  currentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentInfo: {
    marginLeft: 14,
  },
  currentLabel: {
    fontSize: 12,
  },
  currentCity: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    marginLeft: 12,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: 14,
    marginRight: 6,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  unitLabel: {
    fontSize: 15,
  },
  footer: {
    textAlign: 'center',
    padding: 32,
    fontSize: 13,
  },
});
