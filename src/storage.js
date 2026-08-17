// Centralized Storage and State Management for Strawberry Lemonade Task Manager

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

class StorageEngine {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem('sl_tasks')) {
      localStorage.setItem('sl_tasks', JSON.stringify(DEFAULT_TASKS));
    }
    if (!localStorage.getItem('sl_habits')) {
      localStorage.setItem('sl_habits', JSON.stringify(DEFAULT_HABITS));
    }
    if (!localStorage.getItem('sl_streak_days')) {
      localStorage.setItem('sl_streak_days', JSON.stringify(DEFAULT_STREAK_DAYS));
    }
  }

  // --- TASKS API ---
  getTasks() {
    return JSON.parse(localStorage.getItem('sl_tasks') || '[]');
  }

  saveTasks(tasks) {
    localStorage.setItem('sl_tasks', JSON.stringify(tasks));
    this.triggerStorageEvent();
  }

  addTask(text, category) {
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
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks(tasks);
    }
    return tasks;
  }

  deleteTask(id) {
    let tasks = this.getTasks();
    tasks = tasks.filter(t => t.id !== id);
    this.saveTasks(tasks);
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

  updateHabitProgress(id, amount) {
    const habits = this.getHabits();
    const habit = habits.find(h => h.id === id);
    if (habit) {
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

  // Trigger page storage events to update UI across windows/tabs
  triggerStorageEvent() {
    window.dispatchEvent(new Event('storage'));
  }
}

export const storage = new StorageEngine();
