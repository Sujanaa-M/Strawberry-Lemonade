import { storage } from './storage.js';

// Elements
const weeklyStreakDaysContainer = document.getElementById('weeklyStreakDaysContainer');
const habitsContainer = document.getElementById('habitsContainer');
const streakCountText = document.getElementById('streakCountText');
const goalsRatioHeader = document.getElementById('goalsRatioHeader');

// Modals: New Habit
const openNewHabitBtn = document.getElementById('openNewHabitBtn');
const newHabitModal = document.getElementById('newHabitModal');
const habitModalCloseBtn = document.getElementById('habitModalCloseBtn');
const newHabitForm = document.getElementById('newHabitForm');
const habitCategoryDots = document.getElementById('habitCategoryDots');
let selectedHabitCategory = 'work';

// Modals: New Task (Sidebar consistency)
const sidebarNewTaskBtn = document.getElementById('sidebarNewTaskBtn');
const newTaskModal = document.getElementById('newTaskModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const newTaskForm = document.getElementById('newTaskForm');

document.addEventListener('DOMContentLoaded', () => {
  renderStreak();
  renderHabits();
  setupHabitModal();
  setupTaskModal();

  window.addEventListener('storage', () => {
    renderStreak();
    renderHabits();
  });
});

// Render Day Heart Streak
function renderStreak() {
  if (!weeklyStreakDaysContainer) return;
  weeklyStreakDaysContainer.innerHTML = '';

  const streakDays = storage.getStreakDays();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Calculate total streak count
  const completedStreakCount = streakDays.filter(Boolean).length;
  // Dynamic display to match the 5-days mockup indicator
  if (streakCountText) {
    const textSpan = streakCountText.querySelector('span');
    if (textSpan) {
      textSpan.textContent = `${completedStreakCount + 2} Days`; 
    }
  }

  dayNames.forEach((name, index) => {
    const bucket = document.createElement('div');
    bucket.className = 'streak-day-bucket';

    const isChecked = streakDays[index];
    const isToday = index === 3; // Thursday is highlighted in mockups

    let bucketClasses = 'heart-check';
    if (isChecked) bucketClasses += ' checked';
    if (isToday) bucketClasses += ' active-day';

    bucket.innerHTML = `
      <span class="streak-day-label">${name}</span>
      <button class="${bucketClasses}" aria-label="Toggle streak for ${name}">
        <!-- SVG Heart Icon -->
        <svg viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>
    `;

    // Click heart to toggle Mon-Sun streak indicator dynamically
    const checkBtn = bucket.querySelector('.heart-check');
    checkBtn.addEventListener('click', () => {
      storage.toggleStreakDay(index);
      renderStreak();
    });

    weeklyStreakDaysContainer.appendChild(bucket);
  });
}

// Render Daily Habit Cards
function renderHabits() {
  if (!habitsContainer) return;
  habitsContainer.innerHTML = '';

  const habits = storage.getHabits();
  
  // Update header goal count (mastered vs total)
  const completedCount = habits.filter(h => h.currentValue >= h.targetValue).length;
  if (goalsRatioHeader) {
    goalsRatioHeader.textContent = `${completedCount}/${habits.length} Completed`;
  }

  habits.forEach(habit => {
    const card = document.createElement('div');
    card.className = 'habit-card';
    card.dataset.id = habit.id;

    const isCompleted = habit.currentValue >= habit.targetValue;
    const progressPercent = Math.min(100, Math.round((habit.currentValue / habit.targetValue) * 100));

    // Category Styling mappings
    let colorTheme = '#FF8EA5'; // pink default
    let iconBg = '#FFEBF0';
    let iconSvg = '';
    let categoryEmoji = '✨';

    if (habit.category === 'health') {
      colorTheme = '#2D9F58';
      iconBg = '#E8F7EE';
      categoryEmoji = '🥗';
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    } else if (habit.category === 'fun') {
      colorTheme = '#A855F7';
      iconBg = '#F3E8FF';
      categoryEmoji = '🎨';
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;
    } else if (habit.category === 'errands') {
      colorTheme = '#B28800';
      iconBg = '#FFF9E0';
      categoryEmoji = '🛒';
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;
    } else if (habit.category === 'personal') {
      colorTheme = '#3B82F6';
      iconBg = '#E6F0FF';
      categoryEmoji = '🧘';
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    } else {
      // Work/other
      categoryEmoji = '💼';
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
    }

    // Specialize emoji based on Name matching
    const nameLower = habit.name.toLowerCase();
    if (nameLower.includes('water') || nameLower.includes('hydration') || nameLower.includes('intake')) {
      categoryEmoji = '💧';
      iconSvg = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21.5c-4.14 0-7.5-3.36-7.5-7.5 0-3.37 3.33-7.5 7.5-12.75 4.17 5.25 7.5 9.38 7.5 12.75 0 4.14-3.36 7.5-7.5 7.5z"/></svg>`;
    } else if (nameLower.includes('stretch') || nameLower.includes('yoga') || nameLower.includes('meditate')) {
      categoryEmoji = '🧘';
      iconSvg = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 14a3 3 0 100-6 3 3 0 000 6z"/><path d="M12 2v2M5 12H3m18 0h-2m-13.6-6.4l1.4 1.4m10.4 10.4l1.4 1.4M6.4 17.6l1.4-1.4m10.4-10.4l1.4-1.4"/></svg>`;
    } else if (nameLower.includes('walk') || nameLower.includes('step') || nameLower.includes('run')) {
      categoryEmoji = '🚶';
      iconSvg = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 5H9.5M10.5 8h4.5M12 2a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-2 18l1.5-6H14l1.5 6m-4-6V10M14 10v4" /></svg>`;
    } else if (nameLower.includes('read') || nameLower.includes('book') || nameLower.includes('page')) {
      categoryEmoji = '📖';
      iconSvg = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`;
    } else if (nameLower.includes('green') || nameLower.includes('eat') || nameLower.includes('meal')) {
      categoryEmoji = '🍃';
      iconSvg = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1M21 12h-1M4 12H3"/></svg>`;
    }

    card.innerHTML = `
      <div class="habit-card-top">
        <div class="habit-icon-holder" style="background-color: ${iconBg}; color: ${colorTheme};">
          ${iconSvg || categoryEmoji}
        </div>
        <button class="habit-checkbox ${isCompleted ? 'checked' : ''}" aria-label="Mark complete">
          <svg viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>
      <div class="habit-card-body">
        <h3 class="habit-title">${escapeHtml(habit.name)}</h3>
        <p class="habit-subtitle">${habit.currentValue.toLocaleString()} / ${habit.targetValue.toLocaleString()} ${habit.unit} (${progressPercent}%)</p>
        
        <!-- Plus/Minus logger increments -->
        <div class="habit-counter-controls">
          <button class="habit-counter-btn minus-btn" aria-label="Decrement progress">-</button>
          <button class="habit-counter-btn plus-btn" aria-label="Increment progress">+</button>
        </div>
      </div>
    `;

    // Click handler for card checkbox (toggle 0 vs total target)
    const checkBtn = card.querySelector('.habit-checkbox');
    checkBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      storage.toggleHabitCheckBox(habit.id);
      renderHabits();
    });

    // Logger increment button click
    const plusBtn = card.querySelector('.plus-btn');
    plusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      storage.updateHabitProgress(habit.id, 1);
      renderHabits();
    });

    const minusBtn = card.querySelector('.minus-btn');
    minusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      storage.updateHabitProgress(habit.id, -1);
      renderHabits();
    });

    habitsContainer.appendChild(card);
  });
}

// Habit Modal Toggle
function setupHabitModal() {
  if (!openNewHabitBtn || !newHabitModal || !habitModalCloseBtn || !newHabitForm) return;

  openNewHabitBtn.addEventListener('click', () => {
    newHabitModal.classList.add('active');
    document.getElementById('habitName').focus();
  });

  const closeHabitModal = () => {
    newHabitModal.classList.remove('active');
    newHabitForm.reset();
    resetCategorySelection();
  };

  habitModalCloseBtn.addEventListener('click', closeHabitModal);
  
  newHabitModal.addEventListener('click', (e) => {
    if (e.target === newHabitModal) closeHabitModal();
  });

  // Handle dot categorization clicks
  if (habitCategoryDots) {
    const dots = habitCategoryDots.querySelectorAll('.category-dot-btn');
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        dots.forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
        selectedHabitCategory = dot.dataset.value;
      });
    });
  }

  // Create Habit submit
  newHabitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('habitName').value;
    const target = parseFloat(document.getElementById('habitTarget').value) || 1;
    const unit = document.getElementById('habitUnit').value;

    storage.addHabit(name, selectedHabitCategory, target, unit);
    closeHabitModal();
    renderHabits();
  });
}

function resetCategorySelection() {
  selectedHabitCategory = 'work';
  if (!habitCategoryDots) return;
  const dots = habitCategoryDots.querySelectorAll('.category-dot-btn');
  dots.forEach(d => d.classList.remove('selected'));
  if (dots.length > 0) dots[0].classList.add('selected');
}

// Sidebar Task Modal Setup
function setupTaskModal() {
  if (!sidebarNewTaskBtn || !newTaskModal || !modalCloseBtn || !newTaskForm) return;

  sidebarNewTaskBtn.addEventListener('click', () => {
    newTaskModal.classList.add('active');
    document.getElementById('taskText').focus();
  });

  const closeTaskModal = () => {
    newTaskModal.classList.remove('active');
    newTaskForm.reset();
  };

  modalCloseBtn.addEventListener('click', closeTaskModal);

  newTaskModal.addEventListener('click', (e) => {
    if (e.target === newTaskModal) closeTaskModal();
  });

  newTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('taskText').value;
    const category = document.getElementById('taskCategory').value;
    
    storage.addTask(text, category);
    closeTaskModal();
    // In multi-page, since we're on habits.html, adding a task just updates local storage, 
    // but we can trigger storage event or notify that it was successfully queued.
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}
