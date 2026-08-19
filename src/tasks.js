import { storage } from './storage.js';

// Elements
const allTasksContainer = document.getElementById('allTasksContainer');
const tasksPercentageText = document.getElementById('tasksPercentageText');
const tasksProgressBarInner = document.getElementById('tasksProgressBarInner');
const filterButtons = document.querySelectorAll('.filter-btn');

// Forms & Modals
const quickSqueezeForm = document.getElementById('quickSqueezeForm');
const quickTaskText = document.getElementById('quickTaskText');
const quickTaskCategory = document.getElementById('quickTaskCategory');

const sidebarNewTaskBtn = document.getElementById('sidebarNewTaskBtn');
const newTaskModal = document.getElementById('newTaskModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const newTaskForm = document.getElementById('newTaskForm');

const tasksQuoteDate = document.getElementById('tasksQuoteDate');

let activeFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  setupFilters();
  setupForms();

  window.addEventListener('storage', () => {
    renderTasks();
  });
});

// Render task list and compute progress percentage
function renderTasks() {
  // Update today's date label
  if (tasksQuoteDate) {
    const todayStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    }).toUpperCase();
    tasksQuoteDate.textContent = todayStr;
  }

  if (!allTasksContainer) return;
  allTasksContainer.innerHTML = '';

  const tasks = storage.getTasks();

  // 1. Calculate and update overall completion percentage
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (tasksPercentageText) tasksPercentageText.textContent = `${percentage}%`;
  if (tasksProgressBarInner) tasksProgressBarInner.style.width = `${percentage}%`;

  // 2. Filter tasks based on selected category pill
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'all') return true;
    return task.category === activeFilter;
  });

  if (filteredTasks.length === 0) {
    const emptyMsg = tasks.length === 0 
      ? "No tasks for today yet! Squeeze the day by adding one! 🍋"
      : "No tasks in this category. Squeeze details to create one! 🍋";
    allTasksContainer.innerHTML = `
      <div class="task-item" style="justify-content: center; font-style: italic; color: var(--text-muted); text-align: center; padding: 24px 16px;">
        ${emptyMsg}
      </div>`;
    return;
  }

  // Sort tasks: uncompleted on top, completed on bottom
  const sortedTasks = [
    ...filteredTasks.filter(t => !t.completed),
    ...filteredTasks.filter(t => t.completed)
  ];

  sortedTasks.forEach(task => {
    const item = document.createElement('div');
    item.className = `task-item ${task.completed ? 'completed' : ''}`;
    item.dataset.id = task.id;

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
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="tag ${tagClass}">${task.category}</span>
        <!-- Trash delete icon button -->
        <button class="icon-button delete-task-btn" aria-label="Delete task" style="width: 32px; height: 32px; color: #D1A4B2;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    `;

    // Toggle completed state
    const checkBtn = item.querySelector('.check-circle');
    checkBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      storage.toggleTask(task.id);
      renderTasks();
    });

    // Delete task
    const deleteBtn = item.querySelector('.delete-task-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      storage.deleteTask(task.id);
      renderTasks();
    });

    allTasksContainer.appendChild(item);
  });
}

// Setup category filters clicking layout
function setupFilters() {
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderTasks();
    });
  });
}

// Setup Form Handlers (Quick Squeeze & Modal)
function setupForms() {
  // Quick Squeeze form submit
  if (quickSqueezeForm) {
    quickSqueezeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = quickTaskText.value;
      const category = quickTaskCategory.value;
      if (!text.trim()) return;

      storage.addTask(text, category);
      quickTaskText.value = '';
      renderTasks();
    });
  }

  // Sidebar tasks modal triggers
  if (sidebarNewTaskBtn && newTaskModal && modalCloseBtn && newTaskForm) {
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
      renderTasks();
    });
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}
