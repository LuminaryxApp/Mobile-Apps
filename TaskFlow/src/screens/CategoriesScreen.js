import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext, TaskContext } from '../contexts';

// icons you can pick from when making a new category
const availableIcons = [
  'briefcase', 'person', 'cart', 'fitness', 'book', 'airplane',
  'home', 'musical-notes', 'game-controller', 'code-slash', 'camera', 'heart'
];

// some nice colors to choose from
const availableColors = [
  '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'
];

export default function CategoriesScreen() {
  const { theme } = useContext(ThemeContext);
  const { categories, tasks, addCategory, deleteCategory } = useContext(TaskContext);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('briefcase');
  const [selectedColor, setSelectedColor] = useState('#6366F1');

  // count how many tasks belong to each category
  const getTaskCount = (categoryId) => {
    return tasks.filter(t => t.categoryId === categoryId).length;
  };

  // also count completed ones for the progress display
  const getCompletedCount = (categoryId) => {
    return tasks.filter(t => t.categoryId === categoryId && t.completed).length;
  };

  const handleAddCategory = () => {
    if (newName.trim()) {
      addCategory({
        name: newName.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
      // reset the form
      setNewName('');
      setSelectedIcon('briefcase');
      setSelectedColor('#6366F1');
      setShowModal(false);
    }
  };

  const renderCategory = ({ item }) => {
    const taskCount = getTaskCount(item.id);
    const completedCount = getCompletedCount(item.id);
    const progress = taskCount > 0 ? (completedCount / taskCount) * 100 : 0;

    return (
      <View style={[styles.categoryCard, { backgroundColor: theme.card }]}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon} size={28} color={item.color} />
        </View>

        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.taskCount, { color: theme.textSecondary }]}>
            {taskCount} tasks · {completedCount} done
          </Text>

          {/* little progress bar */}
          <View style={[styles.progressBar, { backgroundColor: theme.cardSecondary }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: item.color, width: `${progress}%` }
              ]}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => deleteCategory(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={theme.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No categories yet
            </Text>
          </View>
        }
      />

      {/* add button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* modal for adding new category */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>New Category</Text>

            <TextInput
              style={[styles.input, { backgroundColor: theme.cardSecondary, color: theme.text }]}
              placeholder="Category name"
              placeholderTextColor={theme.textSecondary}
              value={newName}
              onChangeText={setNewName}
            />

            {/* icon picker */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Pick an icon</Text>
            <View style={styles.iconGrid}>
              {availableIcons.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    { backgroundColor: theme.cardSecondary },
                    selectedIcon === icon && { borderColor: theme.primary, borderWidth: 2 }
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Ionicons name={icon} size={24} color={selectedIcon === icon ? theme.primary : theme.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>

            {/* color picker */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Pick a color</Text>
            <View style={styles.colorGrid}>
              {availableColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorSelected
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.cardSecondary }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={{ color: theme.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                onPress={handleAddCategory}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 16,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
  },
  taskCount: {
    fontSize: 13,
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  deleteBtn: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
});
