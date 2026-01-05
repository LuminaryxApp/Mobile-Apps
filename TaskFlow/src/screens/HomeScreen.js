import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext, TaskContext } from '../contexts';

// main home screen - shows all tasks with filtering
export default function HomeScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const { tasks, categories, toggleTask, deleteTask } = useContext(TaskContext);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [searchQuery, setSearchQuery] = useState('');

  // filter tasks based on current selection and search
  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' ||
      (filter === 'active' && !task.completed) ||
      (filter === 'completed' && task.completed);

    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    // put incomplete tasks first, then sort by date
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // get the category info for a task
  const getCategoryForTask = (categoryId) => {
    return categories.find(cat => cat.id === categoryId);
  };

  // figure out priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return theme.danger;
      case 'medium': return theme.warning;
      default: return theme.success;
    }
  };

  // count tasks for the header stats
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const renderTask = ({ item }) => {
    const category = getCategoryForTask(item.categoryId);

    return (
      <TouchableOpacity
        style={[styles.taskCard, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
        activeOpacity={0.7}
      >
        <TouchableOpacity
          style={[
            styles.checkbox,
            { borderColor: item.completed ? theme.success : theme.textSecondary },
            item.completed && { backgroundColor: theme.success }
          ]}
          onPress={() => toggleTask(item.id)}
        >
          {item.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
        </TouchableOpacity>

        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            <Text
              style={[
                styles.taskTitle,
                { color: theme.text },
                item.completed && styles.completedText
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                {item.priority}
              </Text>
            </View>
          </View>

          {item.description ? (
            <Text style={[styles.taskDesc, { color: theme.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          <View style={styles.taskFooter}>
            {category && (
              <View style={[styles.categoryTag, { backgroundColor: category.color + '20' }]}>
                <Ionicons name={category.icon} size={12} color={category.color} />
                <Text style={[styles.categoryText, { color: category.color }]}>{category.name}</Text>
              </View>
            )}
            {item.dueDate && (
              <View style={styles.dueDateContainer}>
                <Ionicons name="calendar-outline" size={12} color={theme.textSecondary} />
                <Text style={[styles.dueDate, { color: theme.textSecondary }]}>
                  {new Date(item.dueDate).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => deleteTask(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color={theme.danger} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* progress header section */}
      <View style={[styles.progressCard, { backgroundColor: theme.primary }]}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressTitle}>Today's Progress</Text>
          <Text style={styles.progressCount}>{completedCount} of {totalCount} tasks done</Text>
        </View>
        <View style={styles.progressCircle}>
          <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
        </View>
      </View>

      {/* search bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <Ionicons name="search-outline" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search tasks..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* filter tabs */}
      <View style={styles.filterContainer}>
        {['all', 'active', 'completed'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterTab,
              { backgroundColor: filter === f ? theme.primary : theme.card }
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={[
              styles.filterText,
              { color: filter === f ? '#fff' : theme.textSecondary }
            ]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* tasks list */}
      {filteredTasks.length > 0 ? (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="checkbox-outline" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {searchQuery ? 'No tasks match your search' : 'No tasks yet. Add one!'}
          </Text>
        </View>
      )}

      {/* floating add button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('AddTask')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  progressCount: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  taskDesc: {
    fontSize: 13,
    marginTop: 4,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDate: {
    fontSize: 11,
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
