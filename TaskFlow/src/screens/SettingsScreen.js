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
import { ThemeContext, TaskContext } from '../contexts';

export default function SettingsScreen() {
  const { theme, isDark, setIsDark } = useContext(ThemeContext);
  const { tasks, categories } = useContext(TaskContext);

  // clear all data - with confirmation obviously
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your tasks and categories. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Done', 'All data has been cleared. Restart the app to see changes.');
            } catch (err) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  // a reusable row component
  const SettingRow = ({ icon, label, value, onPress, isSwitch, switchValue, onSwitch }) => (
    <TouchableOpacity
      style={[styles.settingRow, { backgroundColor: theme.card }]}
      onPress={onPress}
      disabled={isSwitch}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
        <Ionicons name={icon} size={20} color={theme.primary} />
      </View>
      <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitch}
          trackColor={{ false: theme.cardSecondary, true: theme.primary }}
          thumbColor="#fff"
        />
      ) : (
        <View style={styles.settingRight}>
          {value && <Text style={[styles.settingValue, { color: theme.textSecondary }]}>{value}</Text>}
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* App info header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.appIcon}>
          <Ionicons name="checkbox" size={40} color="#fff" />
        </View>
        <Text style={styles.appName}>TaskFlow</Text>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
      </View>

      {/* quick stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: theme.card }]}>
          <Text style={[styles.statNumber, { color: theme.primary }]}>{tasks.length}</Text>
          <Text style={[styles.statText, { color: theme.textSecondary }]}>Tasks</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.card }]}>
          <Text style={[styles.statNumber, { color: theme.success }]}>
            {tasks.filter(t => t.completed).length}
          </Text>
          <Text style={[styles.statText, { color: theme.textSecondary }]}>Done</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.card }]}>
          <Text style={[styles.statNumber, { color: theme.warning }]}>{categories.length}</Text>
          <Text style={[styles.statText, { color: theme.textSecondary }]}>Categories</Text>
        </View>
      </View>

      {/* settings sections */}
      <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>APPEARANCE</Text>
      <View style={styles.section}>
        <SettingRow
          icon="moon"
          label="Dark Mode"
          isSwitch
          switchValue={isDark}
          onSwitch={() => setIsDark(!isDark)}
        />
      </View>

      <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>DATA</Text>
      <View style={styles.section}>
        <SettingRow
          icon="cloud-download"
          label="Export Data"
          onPress={() => Alert.alert('Export', 'Export feature coming soon!')}
        />
        <SettingRow
          icon="cloud-upload"
          label="Import Data"
          onPress={() => Alert.alert('Import', 'Import feature coming soon!')}
        />
        <SettingRow
          icon="trash"
          label="Clear All Data"
          onPress={handleClearData}
        />
      </View>

      <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>ABOUT</Text>
      <View style={styles.section}>
        <SettingRow
          icon="information-circle"
          label="About TaskFlow"
          onPress={() => Alert.alert(
            'About TaskFlow',
            'A simple yet powerful task management app built with React Native and Expo.\n\nDesigned for productivity and ease of use.'
          )}
        />
        <SettingRow
          icon="star"
          label="Rate This App"
          onPress={() => Alert.alert('Thanks!', 'Rating feature coming soon!')}
        />
        <SettingRow
          icon="mail"
          label="Contact Support"
          onPress={() => Alert.alert('Contact', 'support@taskflow.app')}
        />
      </View>

      {/* footer */}
      <Text style={[styles.footer, { color: theme.textSecondary }]}>
        Made with love using React Native
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
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  appVersion: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statText: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    marginRight: 8,
  },
  footer: {
    textAlign: 'center',
    padding: 32,
    fontSize: 13,
  },
});
