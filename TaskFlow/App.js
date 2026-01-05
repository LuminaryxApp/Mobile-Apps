import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import { ThemeContext, TaskContext } from './src/contexts';
import HomeScreen from './src/screens/HomeScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const darkTheme = {
  background: '#0F0F1A',
  card: '#1A1A2E',
  cardSecondary: '#252540',
  primary: '#6366F1',
  primaryLight: '#818CF8',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  border: '#2D2D44',
};

const lightTheme = {
  background: '#F3F4F6',
  card: '#FFFFFF',
  cardSecondary: '#E5E7EB',
  primary: '#6366F1',
  primaryLight: '#818CF8',
  text: '#1F2937',
  textSecondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  border: '#D1D5DB',
};

function HomeTabs() {
  const { theme } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Categories') {
            iconName = focused ? 'folder' : 'folder-outline';
          } else if (route.name === 'Stats') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
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
        },
        headerTintColor: theme.text,
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'My Tasks' }} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ title: 'Statistics' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([
    { id: '1', name: 'Work', color: '#6366F1', icon: 'briefcase' },
    { id: '2', name: 'Personal', color: '#10B981', icon: 'person' },
    { id: '3', name: 'Shopping', color: '#F59E0B', icon: 'cart' },
    { id: '4', name: 'Health', color: '#EF4444', icon: 'fitness' },
  ]);

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [tasks, categories, isDark]);

  const loadData = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      const storedCategories = await AsyncStorage.getItem('categories');
      const storedTheme = await AsyncStorage.getItem('isDark');

      if (storedTasks) setTasks(JSON.parse(storedTasks));
      if (storedCategories) setCategories(JSON.parse(storedCategories));
      if (storedTheme !== null) setIsDark(JSON.parse(storedTheme));
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      await AsyncStorage.setItem('categories', JSON.stringify(categories));
      await AsyncStorage.setItem('isDark', JSON.stringify(isDark));
    } catch (error) {
      console.log('Error saving data:', error);
    }
  };

  const addTask = (task) => {
    setTasks([...tasks, { ...task, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
  };

  const updateTask = (id, updates) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, ...updates } : task));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date().toISOString() : null } : task
    ));
  };

  const addCategory = (category) => {
    setCategories([...categories, { ...category, id: Date.now().toString() }]);
  };

  const deleteCategory = (id) => {
    setCategories(categories.filter(cat => cat.id !== id));
    setTasks(tasks.filter(task => task.categoryId !== id));
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setIsDark }}>
      <TaskContext.Provider value={{
        tasks,
        categories,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        addCategory,
        deleteCategory
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
              headerStyle: {
                backgroundColor: theme.card,
              },
              headerTintColor: theme.text,
              contentStyle: { backgroundColor: theme.background },
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen
              name="Main"
              component={HomeTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddTask"
              component={AddTaskScreen}
              options={{ title: 'New Task', presentation: 'modal' }}
            />
            <Stack.Screen
              name="TaskDetail"
              component={TaskDetailScreen}
              options={{ title: 'Task Details' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </TaskContext.Provider>
    </ThemeContext.Provider>
  );
}
