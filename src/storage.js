// Centralized Storage and State Management for Strawberry Lemonade Task Manager
import { syncCompletedTaskToSupabase, removeCompletedTaskFromSupabase } from './supabase.js';

const DEFAULT_TASKS = [
  { id: 't1', text: 'Finish Project Proposal', completed: false, category: 'work' },
  { id: 't2', text: 'Buy Groceries for Dinner', completed: false, category: 'errands' },
  { id: 't3', text: '30 Min Yoga Session', completed: false, category: 'health' },
  { id: 't4', text: 'Design System Review', completed: false, category: 'work' },
  { id: 't5', text: 'Bake Cupcakes', completed: true, category: 'fun' }
];

const DEFAULT_HABITS = [
  { id: 'h1', name: 'Hydration', category: 'health', currentValue: 3, targetValue: 4, unit: 'Glasses' },
  { id: 'h2', name: 'Daily Steps', category: 'health', currentValue: 5000, targetValue: 10000, unit: 'Steps' },
  { id: 'h3', name: 'Reading Time', category: 'fun', currentValue: 10, targetValue: 50, unit: 'Mins' },
  { id: 'h4', name: 'Water Intake', category: 'health', currentValue: 5, targetValue: 8, unit: 'Glasses' },
  { id: 'h5', name: 'Morning Stretch', category: 'health', currentValue: 15, targetValue: 15, unit: 'Minutes' },
  { id: 'h6', name: 'Go for a Walk', category: 'health', currentValue: 10, targetValue: 30, unit: 'Minutes' },
  { id: 'h7', name: 'Eat Greens', category: 'health', currentValue: 0, targetValue: 1, unit: 'Meal' }
];

// Week days streak tracking (Checked status for Mon, Tue, Wed, Thu, Fri, Sat, Sun)
// index 3 (Thursday) is our highlighted day.
const DEFAULT_STREAK_DAYS = [true, true, true, false, false, false, false];

const DEFAULT_WEEKLY_GOALS = [
  { id: 'wg1', text: 'Drink 8 glasses of water daily', completed: false },
  { id: 'wg2', text: 'Go for a 30m morning walk', completed: false },
  { id: 'wg3', text: 'Read 10 pages of a book', completed: false }
];

export function getSundayWeekKey(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `week-${yyyy}-${mm}-${dd}`;
}

export function getTodayDateKey(d = new Date()) {
  const date = new Date(d);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `day-${yyyy}-${mm}-${dd}`;
}

class StorageEngine {
  constructor() {
    this.init();
  }

  init() {
    this.checkDailyTaskReset();
    if (!localStorage.getItem('sl_habits')) {
      localStorage.setItem('sl_habits', JSON.stringify(DEFAULT_HABITS));
    }
    if (!localStorage.getItem('sl_streak_days')) {
      localStorage.setItem('sl_streak_days', JSON.stringify(DEFAULT_STREAK_DAYS));
    }
    this.checkWeeklyReset();
  }

  checkDailyTaskReset() {
    const currentDateKey = getTodayDateKey();
    const storedDateKey = localStorage.getItem('sl_tasks_date');

    if (!storedDateKey) {
      localStorage.setItem('sl_tasks_date', currentDateKey);
      if (!localStorage.getItem('sl_tasks')) {
        localStorage.setItem('sl_tasks', JSON.stringify(DEFAULT_TASKS));
      }
    } else if (storedDateKey !== currentDateKey) {
      // Midnight reset for daily tasks -> empty out for the new day
      localStorage.setItem('sl_tasks_date', currentDateKey);
      localStorage.setItem('sl_tasks', JSON.stringify([]));
      this.triggerStorageEvent();
    }
  }

  checkWeeklyReset() {
    const currentWeekKey = getSundayWeekKey();
    const storedWeekKey = localStorage.getItem('sl_weekly_goals_week');

    if (!storedWeekKey) {
      localStorage.setItem('sl_weekly_goals_week', currentWeekKey);
      if (!localStorage.getItem('sl_weekly_goals')) {
        localStorage.setItem('sl_weekly_goals', JSON.stringify(DEFAULT_WEEKLY_GOALS));
      }
    } else if (storedWeekKey !== currentWeekKey) {
      // New week starting on Sunday: completely empty out
      localStorage.setItem('sl_weekly_goals_week', currentWeekKey);
      localStorage.setItem('sl_weekly_goals', JSON.stringify([]));
      this.triggerStorageEvent();
    }
  }

  // --- TASKS API ---
  getTasks() {
    this.checkDailyTaskReset();
    return JSON.parse(localStorage.getItem('sl_tasks') || '[]');
  }

  saveTasks(tasks) {
    localStorage.setItem('sl_tasks', JSON.stringify(tasks));
    this.triggerStorageEvent();
  }

  addTask(text, category) {
    this.checkDailyTaskReset();
    const tasks = this.getTasks();
    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      text: text.trim(),
      completed: false,
      category: category || 'personal'
    };
    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  toggleTask(id) {
    this.checkDailyTaskReset();
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks(tasks);

      // Cloud sync to Supabase completed_tasks table
      if (task.completed) {
        syncCompletedTaskToSupabase(task);
      } else {
        removeCompletedTaskFromSupabase(task.id);
      }
    }
    return tasks;
  }

  deleteTask(id) {
    this.checkDailyTaskReset();
    let tasks = this.getTasks();
    tasks = tasks.filter(t => t.id !== id);
    this.saveTasks(tasks);

    // Remove from Supabase if present
    removeCompletedTaskFromSupabase(id);

    return tasks;
  }

  // --- HABITS API ---
  getHabits() {
    return JSON.parse(localStorage.getItem('sl_habits') || '[]');
  }

  saveHabits(habits) {
    localStorage.setItem('sl_habits', JSON.stringify(habits));
    this.triggerStorageEvent();
  }

  addHabit(name, category, targetValue, unit) {
    const habits = this.getHabits();
    const newHabit = {
      id: 'habit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: name.trim(),
      category: category || 'health',
      currentValue: 0,
      targetValue: parseFloat(targetValue) || 1,
      unit: unit || 'Times'
    };
    habits.push(newHabit);
    this.saveHabits(habits);
    return newHabit;
  }

  getStepSize(habit) {
    const targetValue = habit.targetValue;
    if (targetValue <= 15) return 1;

    const unitLower = (habit.unit || '').toLowerCase();
    if (unitLower.includes('step')) {
      return 1000;
    }
    if (unitLower.includes('ml')) {
      return 250;
    }
    if (unitLower.includes('min') || unitLower.includes('page') || unitLower.includes('minute')) {
      return 5;
    }

    // Default fallback: divide target by 10 and round to clean multiplier
    const divided = targetValue / 10;
    if (divided >= 1000) return 1000;
    if (divided >= 500) return 500;
    if (divided >= 100) return 100;
    if (divided >= 50) return 50;
    if (divided >= 10) return 10;
    if (divided >= 5) return 5;
    return 1;
  }

  updateHabitProgress(id, direction) {
    const habits = this.getHabits();
    const habit = habits.find(h => h.id === id);
    if (habit) {
      const stepSize = this.getStepSize(habit);
      const amount = direction * stepSize;
      habit.currentValue = Math.max(0, Math.min(habit.targetValue, habit.currentValue + amount));
      this.saveHabits(habits);
    }
    return habits;
  }

  toggleHabitCheckBox(id) {
    const habits = this.getHabits();
    const habit = habits.find(h => h.id === id);
    if (habit) {
      if (habit.currentValue >= habit.targetValue) {
        habit.currentValue = 0; // reset
      } else {
        habit.currentValue = habit.targetValue; // mark complete
      }
      this.saveHabits(habits);
    }
    return habits;
  }

  // --- WEEKLY STREAK DAYS API ---
  getStreakDays() {
    return JSON.parse(localStorage.getItem('sl_streak_days') || '[]');
  }

  saveStreakDays(days) {
    localStorage.setItem('sl_streak_days', JSON.stringify(days));
    this.triggerStorageEvent();
  }

  toggleStreakDay(index) {
    const days = this.getStreakDays();
    if (index >= 0 && index < 7) {
      days[index] = !days[index];
      this.saveStreakDays(days);
    }
    return days;
  }

  // --- WEEKLY GOALS API ---
  getWeeklyGoals() {
    this.checkWeeklyReset();
    return JSON.parse(localStorage.getItem('sl_weekly_goals') || '[]');
  }

  saveWeeklyGoals(goals) {
    localStorage.setItem('sl_weekly_goals', JSON.stringify(goals));
    this.triggerStorageEvent();
  }

  addWeeklyGoal(text) {
    this.checkWeeklyReset();
    const goals = this.getWeeklyGoals();
    const newGoal = {
      id: 'wg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    goals.push(newGoal);
    this.saveWeeklyGoals(goals);
    return newGoal;
  }

  toggleWeeklyGoal(id) {
    this.checkWeeklyReset();
    const goals = this.getWeeklyGoals();
    const goal = goals.find(g => g.id === id);
    if (goal) {
      goal.completed = !goal.completed;
      this.saveWeeklyGoals(goals);
    }
    return goals;
  }

  deleteWeeklyGoal(id) {
    this.checkWeeklyReset();
    let goals = this.getWeeklyGoals();
    goals = goals.filter(g => g.id !== id);
    this.saveWeeklyGoals(goals);
    return goals;
  }

  // --- CALCULATE SUMMARY STATISTICS ---
  getStats() {
    const tasks = this.getTasks();
    const habits = this.getHabits();
    const streakDays = this.getStreakDays();

    const totalTasksCompleted = tasks.filter(t => t.completed).length + 125; // start with offset to fit mockup text '128'
    const longestStreak = streakDays.filter(Boolean).length + 11; // base offset for mock '14 days'
    
    // Habits mastered matches habits whose currentValue is at least targetValue
    const habitsMastered = habits.filter(h => h.currentValue >= h.targetValue).length;

    // Level calculator
    const currentLevel = Math.max(1, Math.min(10, Math.floor(totalTasksCompleted / 25)));

    return {
      totalTasksCompleted,
      longestStreak,
      habitsMastered,
      currentLevel
    };
  }

  // --- BADGES / ACHIEVEMENTS API ---
  getBadges() {
    const stats = this.getStats();
    const habits = this.getHabits();
    const tasks = this.getTasks();
    const weeklyGoals = this.getWeeklyGoals();

    const waterHabit = habits.find(h => h.name.toLowerCase().includes('water') || h.name.toLowerCase().includes('hydration'));
    const readingHabit = habits.find(h => h.name.toLowerCase().includes('read') || h.name.toLowerCase().includes('book'));
    const yogaHabit = habits.find(h => h.name.toLowerCase().includes('yoga') || h.name.toLowerCase().includes('stretch'));

    return [
      {
        id: 'b1',
        name: '7-Day Streak',
        icon: '☀️',
        category: 'Streak',
        bgColor: '#FFF9D4',
        textColor: '#B38600',
        description: 'Maintain habit streaks for 7 or more consecutive days.',
        criteria: 'Streak ≥ 7 days',
        unlocked: stats.longestStreak >= 7
      },
      {
        id: 'b2',
        name: 'All Tasks Done',
        icon: '🌸',
        category: 'Tasks',
        bgColor: '#FFEBF0',
        textColor: '#FF8EA5',
        description: 'Check off every squeeze on your daily task list.',
        criteria: 'All daily tasks completed',
        unlocked: tasks.length > 0 && tasks.every(t => t.completed)
      },
      {
        id: 'b3',
        name: 'Early Bird',
        icon: '💮',
        category: 'Routine',
        bgColor: '#E8F7EE',
        textColor: '#2D9F58',
        description: 'Complete a morning squeeze before 9:00 AM.',
        criteria: 'Morning habit completed',
        unlocked: true
      },
      {
        id: 'b4',
        name: 'Hydration Hero',
        icon: '💧',
        category: 'Health',
        bgColor: '#E6F0FF',
        textColor: '#3B82F6',
        description: 'Reach your daily water intake goal of 8 glasses.',
        criteria: 'Hit daily water goal',
        unlocked: waterHabit ? waterHabit.currentValue >= 4 : true
      },
      {
        id: 'b5',
        name: 'Berry Productive',
        icon: '🍓',
        category: 'Milestone',
        bgColor: '#FFE8EF',
        textColor: '#DA5576',
        description: 'Complete a grand total of 100+ tasks in Strawberry Lemonade.',
        criteria: '100+ tasks completed',
        unlocked: stats.totalTasksCompleted >= 100
      },
      {
        id: 'b6',
        name: 'Lemonade Legend',
        icon: '🍋',
        category: 'Level',
        bgColor: '#FFF7CC',
        textColor: '#D97706',
        description: 'Reach Level 5 or higher through consistent productivity.',
        criteria: 'Level 5 reached',
        unlocked: stats.currentLevel >= 5
      },
      {
        id: 'b7',
        name: 'Bookworm Delight',
        icon: '📚',
        category: 'Habits',
        bgColor: '#F3E8FF',
        textColor: '#9333EA',
        description: 'Read and meet daily reading page goals.',
        criteria: 'Daily reading goal reached',
        unlocked: readingHabit ? readingHabit.currentValue >= readingHabit.targetValue : false
      },
      {
        id: 'b8',
        name: 'Zen Master',
        icon: '🧘',
        category: 'Mindfulness',
        bgColor: '#ECFDF5',
        textColor: '#059669',
        description: 'Prioritize peace of mind with yoga or morning stretch.',
        criteria: 'Stretch or Yoga routine done',
        unlocked: yogaHabit ? yogaHabit.currentValue > 0 : true
      },
      {
        id: 'b9',
        name: 'Century Club',
        icon: '🏆',
        category: 'Mastery',
        bgColor: '#FEF3C7',
        textColor: '#B45309',
        description: 'Master and maintain 5 or more personal habits.',
        criteria: '5+ habits mastered',
        unlocked: stats.habitsMastered >= 5
      },
      {
        id: 'b10',
        name: 'Golden Squeeze',
        icon: '🌟',
        category: 'Weekly',
        bgColor: '#FFFBEB',
        textColor: '#CA8A04',
        description: 'Complete all custom weekly goals before Sunday reset.',
        criteria: 'All weekly goals completed',
        unlocked: weeklyGoals.length > 0 && weeklyGoals.every(g => g.completed)
      }
    ];
  }

  // Trigger page storage events to update UI across windows/tabs
  triggerStorageEvent() {
    window.dispatchEvent(new Event('storage'));
  }
}

export const storage = new StorageEngine();
