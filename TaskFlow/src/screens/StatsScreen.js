import React, { useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext, TaskContext } from '../contexts';

export default function StatsScreen() {
  const { theme } = useContext(ThemeContext);
  const { tasks, categories } = useContext(TaskContext);

  // calculate all the stats we need
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // group by priority
    const highPriority = tasks.filter(t => t.priority === 'high').length;
    const mediumPriority = tasks.filter(t => t.priority === 'medium').length;
    const lowPriority = tasks.filter(t => t.priority === 'low').length;

    // tasks completed this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const completedThisWeek = tasks.filter(t =>
      t.completed && t.completedAt && new Date(t.completedAt) > weekAgo
    ).length;

    // tasks by category
    const categoryStats = categories.map(cat => ({
      ...cat,
      total: tasks.filter(t => t.categoryId === cat.id).length,
      completed: tasks.filter(t => t.categoryId === cat.id && t.completed).length,
    })).sort((a, b) => b.total - a.total);

    // streak calculation (consecutive days with completed tasks)
    // this is kinda simplified but works for demo purposes
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const nextDay = new Date(checkDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const hasCompletedTask = tasks.some(t => {
        if (!t.completedAt) return false;
        const completedDate = new Date(t.completedAt);
        return completedDate >= checkDate && completedDate < nextDay;
      });

      if (hasCompletedTask) {
        streak++;
      } else if (i > 0) {
        // allow today to be empty
        break;
      }
    }

    return {
      total,
      completed,
      pending,
      completionRate,
      highPriority,
      mediumPriority,
      lowPriority,
      completedThisWeek,
      categoryStats,
      streak,
    };
  }, [tasks, categories]);

  // component for stat cards
  const StatCard = ({ icon, label, value, color }) => (
    <View style={[styles.statCard, { backgroundColor: theme.card }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* main stats grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="checkmark-done"
          label="Completed"
          value={stats.completed}
          color={theme.success}
        />
        <StatCard
          icon="time"
          label="Pending"
          value={stats.pending}
          color={theme.warning}
        />
        <StatCard
          icon="flame"
          label="Day Streak"
          value={stats.streak}
          color={theme.danger}
        />
        <StatCard
          icon="trending-up"
          label="This Week"
          value={stats.completedThisWeek}
          color={theme.primary}
        />
      </View>

      {/* completion rate card */}
      <View style={[styles.rateCard, { backgroundColor: theme.card }]}>
        <View style={styles.rateHeader}>
          <Text style={[styles.rateTitle, { color: theme.text }]}>Completion Rate</Text>
          <Text style={[styles.ratePercent, { color: theme.primary }]}>{stats.completionRate}%</Text>
        </View>
        <View style={[styles.rateBar, { backgroundColor: theme.cardSecondary }]}>
          <View
            style={[styles.rateFill, { backgroundColor: theme.primary, width: `${stats.completionRate}%` }]}
          />
        </View>
        <Text style={[styles.rateSubtext, { color: theme.textSecondary }]}>
          {stats.completed} of {stats.total} tasks completed
        </Text>
      </View>

      {/* priority breakdown */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Priority Breakdown</Text>

        <View style={styles.priorityRow}>
          <View style={styles.priorityLabel}>
            <View style={[styles.priorityDot, { backgroundColor: theme.danger }]} />
            <Text style={{ color: theme.text }}>High</Text>
          </View>
          <View style={styles.priorityBarContainer}>
            <View style={[styles.priorityBar, { backgroundColor: theme.cardSecondary }]}>
              <View
                style={[
                  styles.priorityFill,
                  { backgroundColor: theme.danger, width: stats.total > 0 ? `${(stats.highPriority / stats.total) * 100}%` : '0%' }
                ]}
              />
            </View>
          </View>
          <Text style={[styles.priorityCount, { color: theme.textSecondary }]}>{stats.highPriority}</Text>
        </View>

        <View style={styles.priorityRow}>
          <View style={styles.priorityLabel}>
            <View style={[styles.priorityDot, { backgroundColor: theme.warning }]} />
            <Text style={{ color: theme.text }}>Medium</Text>
          </View>
          <View style={styles.priorityBarContainer}>
            <View style={[styles.priorityBar, { backgroundColor: theme.cardSecondary }]}>
              <View
                style={[
                  styles.priorityFill,
                  { backgroundColor: theme.warning, width: stats.total > 0 ? `${(stats.mediumPriority / stats.total) * 100}%` : '0%' }
                ]}
              />
            </View>
          </View>
          <Text style={[styles.priorityCount, { color: theme.textSecondary }]}>{stats.mediumPriority}</Text>
        </View>

        <View style={styles.priorityRow}>
          <View style={styles.priorityLabel}>
            <View style={[styles.priorityDot, { backgroundColor: theme.success }]} />
            <Text style={{ color: theme.text }}>Low</Text>
          </View>
          <View style={styles.priorityBarContainer}>
            <View style={[styles.priorityBar, { backgroundColor: theme.cardSecondary }]}>
              <View
                style={[
                  styles.priorityFill,
                  { backgroundColor: theme.success, width: stats.total > 0 ? `${(stats.lowPriority / stats.total) * 100}%` : '0%' }
                ]}
              />
            </View>
          </View>
          <Text style={[styles.priorityCount, { color: theme.textSecondary }]}>{stats.lowPriority}</Text>
        </View>
      </View>

      {/* category stats */}
      <View style={[styles.section, { backgroundColor: theme.card, marginBottom: 32 }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Tasks by Category</Text>

        {stats.categoryStats.length > 0 ? (
          stats.categoryStats.map((cat) => (
            <View key={cat.id} style={styles.categoryRow}>
              <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                <Ionicons name={cat.icon} size={18} color={cat.color} />
              </View>
              <Text style={[styles.categoryName, { color: theme.text }]}>{cat.name}</Text>
              <Text style={[styles.categoryCount, { color: theme.textSecondary }]}>
                {cat.completed}/{cat.total}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No categories yet
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  rateCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rateTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratePercent: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  rateBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  rateFill: {
    height: '100%',
    borderRadius: 4,
  },
  rateSubtext: {
    fontSize: 13,
    marginTop: 8,
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  priorityBarContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  priorityBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  priorityFill: {
    height: '100%',
    borderRadius: 4,
  },
  priorityCount: {
    width: 30,
    textAlign: 'right',
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 20,
  },
});
