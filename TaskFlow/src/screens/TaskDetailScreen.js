import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext, TaskContext } from '../contexts';

export default function TaskDetailScreen({ route, navigation }) {
  const { taskId } = route.params;
  const { theme } = useContext(ThemeContext);
  const { tasks, categories, updateTask, deleteTask, toggleTask } = useContext(TaskContext);

  // find the task we're editing
  const task = tasks.find(t => t.id === taskId);

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [isEditing, setIsEditing] = useState(false);

  // if task was deleted, go back
  useEffect(() => {
    if (!task) {
      navigation.goBack();
    }
  }, [task]);

  if (!task) return null;

  const category = categories.find(c => c.id === task.categoryId);

  const handleSave = () => {
    updateTask(taskId, {
      title: title.trim(),
      description: description.trim(),
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTask(taskId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return theme.danger;
      case 'medium': return theme.warning;
      default: return theme.success;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* status header */}
      <View style={[styles.statusCard, { backgroundColor: task.completed ? theme.success : theme.primary }]}>
        <TouchableOpacity
          style={styles.statusBtn}
          onPress={() => toggleTask(taskId)}
        >
          <Ionicons
            name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={32}
            color="#fff"
          />
          <Text style={styles.statusText}>
            {task.completed ? 'Completed!' : 'Mark as Complete'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* main content */}
      <View style={[styles.contentCard, { backgroundColor: theme.card }]}>
        {isEditing ? (
          <>
            <TextInput
              style={[styles.titleInput, { color: theme.text, borderColor: theme.border }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Task title"
              placeholderTextColor={theme.textSecondary}
            />
            <TextInput
              style={[styles.descInput, { color: theme.text, borderColor: theme.border }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add a description..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={[styles.editBtn, { backgroundColor: theme.cardSecondary }]}
                onPress={() => {
                  setTitle(task.title);
                  setDescription(task.description || '');
                  setIsEditing(false);
                }}
              >
                <Text style={{ color: theme.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editBtn, { backgroundColor: theme.primary }]}
                onPress={handleSave}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: theme.text }]}>{task.title}</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Ionicons name="pencil" size={20} color={theme.primary} />
              </TouchableOpacity>
            </View>
            {task.description ? (
              <Text style={[styles.description, { color: theme.textSecondary }]}>
                {task.description}
              </Text>
            ) : (
              <Text style={[styles.noDesc, { color: theme.textSecondary }]}>
                No description added
              </Text>
            )}
          </>
        )}
      </View>

      {/* details section */}
      <View style={[styles.detailsCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Details</Text>

        <View style={styles.detailRow}>
          <View style={styles.detailLabel}>
            <Ionicons name="flag" size={18} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.textSecondary }]}>Priority</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Text>
          </View>
        </View>

        {category && (
          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <Ionicons name="folder" size={18} color={theme.textSecondary} />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>Category</Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: category.color + '20' }]}>
              <Ionicons name={category.icon} size={14} color={category.color} />
              <Text style={[styles.categoryText, { color: category.color }]}>{category.name}</Text>
            </View>
          </View>
        )}

        <View style={styles.detailRow}>
          <View style={styles.detailLabel}>
            <Ionicons name="calendar" size={18} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.textSecondary }]}>Due Date</Text>
          </View>
          <Text style={{ color: theme.text }}>{formatDate(task.dueDate)}</Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailLabel}>
            <Ionicons name="time" size={18} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.textSecondary }]}>Created</Text>
          </View>
          <Text style={{ color: theme.text }}>{formatDate(task.createdAt)}</Text>
        </View>

        {task.completedAt && (
          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <Ionicons name="checkmark-circle" size={18} color={theme.success} />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>Completed</Text>
            </View>
            <Text style={{ color: theme.success }}>{formatDate(task.completedAt)}</Text>
          </View>
        )}
      </View>

      {/* delete button */}
      <TouchableOpacity
        style={[styles.deleteBtn, { backgroundColor: theme.danger + '20' }]}
        onPress={handleDelete}
      >
        <Ionicons name="trash" size={20} color={theme.danger} />
        <Text style={[styles.deleteBtnText, { color: theme.danger }]}>Delete Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusCard: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  statusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  contentCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  noDesc: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 12,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  descInput: {
    fontSize: 15,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    height: 100,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  editBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsCard: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 15,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  deleteBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
