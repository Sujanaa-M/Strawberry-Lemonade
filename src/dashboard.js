import { storage } from './storage.js';

// Elements
const focusTaskList = document.getElementById('focusTaskList');
const habitMiniList = document.getElementById('habitMiniList');

const sidebarNewTaskBtn = document.getElementById('sidebarNewTaskBtn');
const newTaskModal = document.getElementById('newTaskModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const newTaskForm = document.getElementById('newTaskForm');

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  renderHabits();
  setupModal();
  
  // Custom storage listener to sync between pages
  window.addEventListener('storage', () => {
    renderTasks();
    renderHabits();
  });
});

// Render Tasks
function renderTasks() {
  if (!focusTaskList) return;
  focusTaskList.innerHTML = '';
  
  const tasks = storage.getTasks();
  // Filter for uncompleted focus tasks first to match standard mockup
  const uncompleted = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);
  
  // Combine, taking up to 5 items to avoid overflow
  const displayTasks = [...uncompleted, ...completed].slice(0, 5);

  if (displayTasks.length === 0) {
    focusTaskList.innerHTML = `
      <div class="task-item" style="justify-content: center; font-style: italic; color: var(--text-muted);">
        No tasks for today! Sweet days ahead. 🍋
      </div>`;
    return;
  }

  displayTasks.forEach(task => {
    const item = document.createElement('div');
    item.className = `task-item ${task.completed ? 'completed' : ''}`;
    item.dataset.id = task.id;
    
    // Category Tag color mapping
    let tagClass = 'tag-personal';
    if (task.category === 'work') tagClass = 'tag-work';
    else if (task.category === 'errands') tagClass = 'tag-errands';
    else if (task.category === 'health') tagClass = 'tag-health';
    else if (task.category === 'fun') tagClass = 'tag-fun';

    item.innerHTML = `
      <div class="task-left">
        <button class="check-circle" aria-label="Toggle completed state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
        <span class="task-text">${escapeHtml(task.text)}</span>
      </div>
      <span class="tag ${tagClass}">${task.category}</span>
    `;

    // Click handler for checklist toggle
    const checkBtn = item.querySelector('.check-circle');
    checkBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      storage.toggleTask(task.id);
      renderTasks();
    });

    focusTaskList.appendChild(item);
  });
}

// Render Habits Mini View
function renderHabits() {
  if (!habitMiniList) return;
  habitMiniList.innerHTML = '';

  const habits = storage.getHabits().slice(0, 3); // top 3 habits from mockup

  habits.forEach(habit => {
    const item = document.createElement('div');
    item.className = 'habit-mini-item';
    
    const percentage = Math.min(100, Math.round((habit.currentValue / habit.targetValue) * 100));
    
    // Circle math (Radius = 18, Circumference = 113.1)
    const radius = 18;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (percentage / 100) * circ;

    // Pick appropriate icon based on category/name
    let iconSvg = '';
    if (habit.name.toLowerCase().includes('water') || habit.name.toLowerCase().includes('hydration')) {
      // Water droplet icon
      iconSvg = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21.5c-4.14 0-7.5-3.36-7.5-7.5 0-3.37 3.33-7.5 7.5-12.75 4.17 5.25 7.5 9.38 7.5 12.75 0 4.14-3.36 7.5-7.5 7.5z"/></svg>`;
    } else if (habit.name.toLowerCase().includes('step') || habit.name.toLowerCase().includes('walk')) {
      // Walking hiker
      iconSvg = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5H9.5M10.5 8h4.5M12 2a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-2 18l1.5-6H14l1.5 6m-4-6V10M14 10v4" /></svg>`;
    } else if (habit.name.toLowerCase().includes('read') || habit.name.toLowerCase().includes('book')) {
      // Book icon
      iconSvg = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`;
    } else {
      // Sparkle habit icon
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3v1m0 16v1M21 12h-1M4 12H3" stroke-linecap="round"/></svg>`;
    }

    item.innerHTML = `
      <div class="progress-ring-container">
        <!-- SVG Radial Loading Ring -->
        <svg width="50" height="50" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="${radius}" fill="transparent" stroke="#FFF2F4" stroke-width="4.5"/>
          <circle class="progress-ring-circle" cx="25" cy="25" r="${radius}" fill="transparent" stroke="var(--accent-pink)" stroke-width="4.5"
            stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
        </svg>
        <div class="progress-ring-icon">
          ${iconSvg}
        </div>
      </div>
      <div class="habit-mini-details">
        <span class="habit-name-mini">${escapeHtml(habit.name)}</span>
        <span class="habit-progress-mini">${habit.currentValue.toLocaleString()} / ${habit.targetValue.toLocaleString()} ${habit.unit}</span>
      </div>
    `;

    habitMiniList.appendChild(item);
  });
}

// Modal Toggle Setup
function setupModal() {
  if (!sidebarNewTaskBtn || !newTaskModal || !modalCloseBtn || !newTaskForm) return;

  const openModal = () => {
    newTaskModal.classList.add('active');
    document.getElementById('taskText').focus();
  };

  const closeModal = () => {
    newTaskModal.classList.remove('active');
    newTaskForm.reset();
  };

  sidebarNewTaskBtn.addEventListener('click', openModal);
  modalCloseBtn.addEventListener('click', closeModal);
  
  // Close when outer backdrop is clicked
  newTaskModal.addEventListener('click', (e) => {
    if (e.target === newTaskModal) closeModal();
  });

  // Submit task
  newTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('taskText').value;
    const category = document.getElementById('taskCategory').value;
    
    storage.addTask(text, category);
    closeModal();
    renderTasks();
  });
}

// Utility mapper to prevent HTML injections
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}
