import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext, TaskContext } from '../contexts';

export default function AddTaskScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const { categories, addTask } = useContext(TaskContext);

  // form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || null);
  const [dueDate, setDueDate] = useState(null);

  // quick date options - makes it easier than a full date picker
  const dueDateOptions = [
    { label: 'Today', value: new Date() },
    { label: 'Tomorrow', value: new Date(Date.now() + 86400000) },
    { label: 'Next Week', value: new Date(Date.now() + 604800000) },
    { label: 'No Date', value: null },
  ];

  const handleSave = () => {
    if (!title.trim()) {
      // could show an alert here but lets just return
      return;
    }

    addTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      categoryId,
      dueDate: dueDate?.toISOString() || null,
      completed: false,
    });

    navigation.goBack();
  };

  const priorities = [
    { id: 'low', label: 'Low', color: theme.success },
    { id: 'medium', label: 'Medium', color: theme.warning },
    { id: 'high', label: 'High', color: theme.danger },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* title input */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Task Title</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
          placeholder="What needs to be done?"
          placeholderTextColor={theme.textSecondary}
          value={title}
          onChangeText={setTitle}
          autoFocus
        />
      </View>

      {/* description */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text }]}
          placeholder="Add some details..."
          placeholderTextColor={theme.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* priority selection */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Priority</Text>
        <View style={styles.optionsRow}>
          {priorities.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.optionBtn,
                { backgroundColor: theme.card },
                priority === p.id && { backgroundColor: p.color + '30', borderColor: p.color, borderWidth: 2 }
              ]}
              onPress={() => setPriority(p.id)}
            >
              <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
              <Text style={[
                styles.optionText,
                { color: priority === p.id ? p.color : theme.text }
              ]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* category selection */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.optionsRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryBtn,
                  { backgroundColor: theme.card },
                  categoryId === cat.id && { backgroundColor: cat.color + '30', borderColor: cat.color, borderWidth: 2 }
                ]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Ionicons
                  name={cat.icon}
                  size={18}
                  color={categoryId === cat.id ? cat.color : theme.textSecondary}
                />
                <Text style={[
                  styles.categoryText,
                  { color: categoryId === cat.id ? cat.color : theme.text }
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* due date quick picks */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Due Date</Text>
        <View style={styles.optionsRow}>
          {dueDateOptions.map((opt, idx) => {
            const isSelected = opt.value === null
              ? dueDate === null
              : dueDate?.toDateString() === opt.value?.toDateString();

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dateBtn,
                  { backgroundColor: theme.card },
                  isSelected && { backgroundColor: theme.primary + '30', borderColor: theme.primary, borderWidth: 2 }
                ]}
                onPress={() => setDueDate(opt.value)}
              >
                <Text style={[
                  styles.dateText,
                  { color: isSelected ? theme.primary : theme.text }
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* save button */}
      <TouchableOpacity
        style={[
          styles.saveBtn,
          { backgroundColor: title.trim() ? theme.primary : theme.cardSecondary }
        ]}
        onPress={handleSave}
        disabled={!title.trim()}
      >
        <Ionicons name="checkmark" size={24} color="#fff" />
        <Text style={styles.saveBtnText}>Create Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 32,
    gap: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
