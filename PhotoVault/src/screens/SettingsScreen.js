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
import { ThemeContext, PhotoContext } from '../contexts';

export default function SettingsScreen() {
  const { theme, isDark, setIsDark } = useContext(ThemeContext);
  const { photos, albums } = useContext(PhotoContext);

  // stats for the header
  const favoriteCount = photos.filter(p => p.isFavorite).length;

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Data',
      'This will reset everything. Demo photos will be regenerated. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Done', 'Restart the app to see changes.');
            } catch (e) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const SettingRow = ({ icon, label, value, onPress, hasSwitch, switchValue, onSwitch, iconColor }) => (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: theme.card }]}
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View style={[styles.iconWrap, { backgroundColor: (iconColor || theme.primary) + '20' }]}>
        <Ionicons name={icon} size={20} color={iconColor || theme.primary} />
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
      {/* app header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.appLogo}>
          <Ionicons name="images" size={40} color="#fff" />
        </View>
        <Text style={styles.appName}>PhotoVault</Text>
        <Text style={styles.appTagline}>Your memories, organized</Text>
      </View>

      {/* stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Ionicons name="images" size={22} color={theme.primary} />
          <Text style={[styles.statNumber, { color: theme.text }]}>{photos.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Photos</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Ionicons name="albums" size={22} color={theme.accent} />
          <Text style={[styles.statNumber, { color: theme.text }]}>{albums.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Albums</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Ionicons name="heart" size={22} color="#EC4899" />
          <Text style={[styles.statNumber, { color: theme.text }]}>{favoriteCount}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Favorites</Text>
        </View>
      </View>

      {/* appearance section */}
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

      {/* storage section */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>STORAGE</Text>
      <View style={styles.section}>
        <SettingRow
          icon="cloud-download"
          label="Export Photos"
          onPress={() => Alert.alert('Coming Soon', 'Export feature will be available soon!')}
        />
        <SettingRow
          icon="trash"
          label="Clear All Data"
          iconColor="#EF4444"
          onPress={handleClearAll}
        />
      </View>

      {/* about section */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ABOUT</Text>
      <View style={styles.section}>
        <SettingRow
          icon="information-circle"
          label="Version"
          value="1.0.0"
        />
        <SettingRow
          icon="logo-github"
          label="Source Code"
          onPress={() => Alert.alert('GitHub', 'Check out the source code on GitHub!')}
        />
        <SettingRow
          icon="mail"
          label="Contact"
          onPress={() => Alert.alert('Contact', 'support@photovault.app')}
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
  appTagline: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
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
  footer: {
    textAlign: 'center',
    padding: 32,
    fontSize: 13,
  },
});
