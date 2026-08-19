import { storage } from './storage.js';

// Elements
const statTotalTasks = document.getElementById('statTotalTasks');
const statLongestStreak = document.getElementById('statLongestStreak');
const statHabitsMastered = document.getElementById('statHabitsMastered');
const statCurrentLevel = document.getElementById('statCurrentLevel');

const weeklyGoalList = document.getElementById('weeklyGoalList');
const weeklyGoalsCount = document.getElementById('weeklyGoalsCount');
const addWeeklyGoalForm = document.getElementById('addWeeklyGoalForm');
const newWeeklyGoalInput = document.getElementById('newWeeklyGoalInput');

// Badges Elements & Modal
const badgesPreviewGrid = document.getElementById('badgesPreviewGrid');
const badgesPreviewSubtitle = document.getElementById('badgesPreviewSubtitle');
const viewBadgesAnchor = document.getElementById('viewBadgesAnchor');
const allBadgesModal = document.getElementById('allBadgesModal');
const badgesModalCloseBtn = document.getElementById('badgesModalCloseBtn');
const badgesModalSubtitle = document.getElementById('badgesModalSubtitle');
const allBadgesGrid = document.getElementById('allBadgesGrid');
const badgeFilterBtns = document.querySelectorAll('.badge-filter-btn');

let activeBadgeFilter = 'all';

// Chart Switchers
const btnWeeklyChart = document.getElementById('btnWeeklyChart');
const btnMonthlyChart = document.getElementById('btnMonthlyChart');

// SVG Elements
const svgYellowCurve = document.getElementById('svgYellowCurve');
const svgPinkCurve = document.getElementById('svgPinkCurve');
const svgScatterPoints = document.getElementById('svgScatterPoints');

// Sidebar modals
const sidebarNewTaskBtn = document.getElementById('sidebarNewTaskBtn');
const newTaskModal = document.getElementById('newTaskModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const newTaskForm = document.getElementById('newTaskForm');

document.addEventListener('DOMContentLoaded', () => {
  renderStats();
  renderWeeklyGoals();
  renderBadgesCard();
  setupWeeklyGoalsListeners();
  setupBadgesModal();
  drawConsistencyChart('weekly');
  setupChartToggles();
  setupTaskModal();

  window.addEventListener('storage', () => {
    renderStats();
    renderWeeklyGoals();
    renderBadgesCard();
    if (allBadgesModal && allBadgesModal.classList.contains('active')) {
      renderAllBadgesModal(activeBadgeFilter);
    }
    drawConsistencyChart('weekly');
  });
});

// Render numeric statistics cards
function renderStats() {
  const stats = storage.getStats();
  
  if (statTotalTasks) statTotalTasks.textContent = stats.totalTasksCompleted;
  if (statLongestStreak) statLongestStreak.textContent = `${stats.longestStreak} Days`;
  if (statHabitsMastered) statHabitsMastered.textContent = stats.habitsMastered;
  if (statCurrentLevel) statCurrentLevel.textContent = `Lvl ${stats.currentLevel}`;
}

// Render Weekly Goals checklist with Sunday auto-reset
function renderWeeklyGoals() {
  if (!weeklyGoalList) return;
  weeklyGoalList.innerHTML = '';

  const goals = storage.getWeeklyGoals();
  const completedCount = goals.filter(g => g.completed).length;

  if (weeklyGoalsCount) {
    weeklyGoalsCount.textContent = `${completedCount} / ${goals.length} done`;
  }

  if (goals.length === 0) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'weekly-goal-empty';
    emptyEl.innerHTML = `
      <span>🍋</span>
      No goals yet for this week!<br>Add your top priorities above.
    `;
    weeklyGoalList.appendChild(emptyEl);
    return;
  }

  goals.forEach(goal => {
    const item = document.createElement('div');
    item.className = `weekly-goal-item ${goal.completed ? 'completed' : ''}`;
    item.dataset.id = goal.id;

    item.innerHTML = `
      <div class="weekly-goal-left" role="button" tabindex="0" title="Toggle goal completion">
        <div class="weekly-goal-checkbox" aria-label="Toggle goal status">
          <svg viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <span class="weekly-goal-name">${escapeHtml(goal.text)}</span>
      </div>
      <button class="weekly-goal-delete-btn" aria-label="Delete goal" title="Delete goal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    `;

    // Toggle completion on click or space/enter key
    const leftPart = item.querySelector('.weekly-goal-left');
    const toggleHandler = () => {
      storage.toggleWeeklyGoal(goal.id);
      renderWeeklyGoals();
    };

    leftPart.addEventListener('click', toggleHandler);
    leftPart.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleHandler();
      }
    });

    // Delete goal button
    const deleteBtn = item.querySelector('.weekly-goal-delete-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      storage.deleteWeeklyGoal(goal.id);
      renderWeeklyGoals();
    });

    weeklyGoalList.appendChild(item);
  });
}

// Setup form and goal submission listeners
function setupWeeklyGoalsListeners() {
  if (!addWeeklyGoalForm || !newWeeklyGoalInput) return;

  addWeeklyGoalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = newWeeklyGoalInput.value.trim();
    if (!text) return;

    storage.addWeeklyGoal(text);
    newWeeklyGoalInput.value = '';
    renderWeeklyGoals();
  });
}

// Draw custom smooth SVG curve Consistency Chart
function drawConsistencyChart(period) {
  if (!svgYellowCurve || !svgPinkCurve || !svgScatterPoints) return;
  
  svgScatterPoints.innerHTML = ''; // Clear dots

  // Define Coordinates based on data points
  // Mid X offsets matching the Mon-Sun text positions in SVG:
  // Mon: 50, Tue: 133, Wed: 216, Thu: 299, Fri: 382, Sat: 465, Sun: 548
  let yellowPoints = [];
  let pinkPoints = [];

  if (period === 'weekly') {
    // Matches the wave curve in the progress page mockup
    yellowPoints = [
      { x: 50, y: 165 },
      { x: 133, y: 145 },
      { x: 216, y: 130 },
      { x: 299, y: 105 },
      { x: 382, y: 85 },
      { x: 465, y: 92 },
      { x: 548, y: 108 }
    ];

    pinkPoints = [
      { x: 50, y: 145 },
      { x: 133, y: 135 },
      { x: 216, y: 155 },
      { x: 299, y: 135 },
      { x: 382, y: 125 },
      { x: 465, y: 110 },
      { x: 548, y: 65 }
    ];
    
    // Set viewbox width to match 7 days
    document.getElementById('consistencySvg').setAttribute('viewBox', '0 0 600 240');
  } else {
    // Monthly View: denser mock coordinates (15 points spanning 600 width)
    const pointsCount = 15;
    const interval = 500 / (pointsCount - 1);
    
    for (let i = 0; i < pointsCount; i++) {
      const x = 50 + i * interval;
      // Fluctuate curves
      const yYellow = 90 + Math.sin(i * 0.8) * 35 + Math.cos(i * 0.4) * 15;
      const yPink = 120 + Math.cos(i * 0.8) * 45 + Math.sin(i * 0.3) * 10;
      
      yellowPoints.push({ x, y: yYellow });
      pinkPoints.push({ x, y: yPink });
    }
  }

  // Draw curvey bezier paths
  svgYellowCurve.setAttribute('d', getBezierPath(yellowPoints));
  svgPinkCurve.setAttribute('d', getBezierPath(pinkPoints));

  // Add individual scatter points matching mockup
  // SVG points: yellow circles, pink circles
  yellowPoints.forEach(pt => {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', pt.x);
    dot.setAttribute('cy', pt.y);
    dot.setAttribute('r', 5);
    dot.setAttribute('fill', '#FFE066');
    dot.setAttribute('stroke', '#FFFFFF');
    dot.setAttribute('stroke-width', 1.5);
    svgScatterPoints.appendChild(dot);
  });

  pinkPoints.forEach(pt => {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', pt.x);
    dot.setAttribute('cy', pt.y);
    dot.setAttribute('r', 5);
    dot.setAttribute('fill', '#FF8EA5');
    dot.setAttribute('stroke', '#FFFFFF');
    dot.setAttribute('stroke-width', 1.5);
    svgScatterPoints.appendChild(dot);
  });
}

// Smooth Bezier Curve generator
// Generates cubic bezier values between points for aesthetic curvature
function getBezierPath(points) {
  if (points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    
    // Control points fraction (1/3 of the delta)
    const cpX1 = p0.x + (p1.x - p0.x) / 3;
    const cpY1 = p0.y;
    const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
    const cpY2 = p1.y;
    
    d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }
  return d;
}

// Chart Toggles
function setupChartToggles() {
  if (!btnWeeklyChart || !btnMonthlyChart) return;

  btnWeeklyChart.addEventListener('click', () => {
    btnWeeklyChart.classList.add('active');
    btnMonthlyChart.classList.remove('active');
    drawConsistencyChart('weekly');
  });

  btnMonthlyChart.addEventListener('click', () => {
    btnMonthlyChart.classList.add('active');
    btnWeeklyChart.classList.remove('active');
    drawConsistencyChart('monthly');
  });
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
    renderStats(); // Update metrics counter instantly
  });
}

// Render top preview badges on the progress card
function renderBadgesCard() {
  if (!badgesPreviewGrid) return;
  badgesPreviewGrid.innerHTML = '';

  const badges = storage.getBadges();
  const unlockedCount = badges.filter(b => b.unlocked).length;

  if (badgesPreviewSubtitle) {
    badgesPreviewSubtitle.textContent = `${unlockedCount} of ${badges.length} unlocked`;
  }

  // Display top 4 badges
  badges.slice(0, 4).forEach(badge => {
    const badgeEl = document.createElement('div');
    badgeEl.className = `badge-item ${badge.unlocked ? '' : 'locked'}`;
    badgeEl.title = badge.unlocked ? `Unlocked: ${badge.name}` : `Locked: ${badge.criteria}`;
    badgeEl.innerHTML = `
      <div class="badge-icon-holder" style="background-color: ${badge.bgColor}; color: ${badge.textColor};">
        ${badge.icon}
      </div>
      <span class="badge-label">${escapeHtml(badge.name)}</span>
    `;
    badgesPreviewGrid.appendChild(badgeEl);
  });
}

// Setup Badges Modal Trigger & Events
function setupBadgesModal() {
  if (!allBadgesModal || !viewBadgesAnchor || !badgesModalCloseBtn) return;

  const openModal = () => {
    allBadgesModal.classList.add('active');
    renderAllBadgesModal(activeBadgeFilter);
  };

  const closeModal = () => {
    allBadgesModal.classList.remove('active');
  };

  viewBadgesAnchor.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });

  badgesModalCloseBtn.addEventListener('click', closeModal);

  allBadgesModal.addEventListener('click', (e) => {
    if (e.target === allBadgesModal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && allBadgesModal.classList.contains('active')) {
      closeModal();
    }
  });

  // Filter Buttons
  badgeFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      badgeFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeBadgeFilter = btn.dataset.badgeFilter || 'all';
      renderAllBadgesModal(activeBadgeFilter);
    });
  });
}

// Render All Badges inside the modal grid
function renderAllBadgesModal(filter = 'all') {
  if (!allBadgesGrid) return;
  allBadgesGrid.innerHTML = '';

  const badges = storage.getBadges();
  const unlockedCount = badges.filter(b => b.unlocked).length;

  if (badgesModalSubtitle) {
    const pct = Math.round((unlockedCount / badges.length) * 100);
    badgesModalSubtitle.textContent = `${unlockedCount} of ${badges.length} Badges Unlocked (${pct}% Complete)`;
  }

  const filteredBadges = badges.filter(b => {
    if (filter === 'unlocked') return b.unlocked;
    if (filter === 'locked') return !b.unlocked;
    return true;
  });

  if (filteredBadges.length === 0) {
    allBadgesGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 36px 12px; color: var(--text-muted); font-style: italic;">
        No badges found in this category. Keep squeezing your goals! 🍋
      </div>
    `;
    return;
  }

  filteredBadges.forEach(badge => {
    const card = document.createElement('div');
    card.className = `badge-detail-card ${badge.unlocked ? 'unlocked' : 'locked'}`;
    
    card.innerHTML = `
      <div class="badge-detail-icon" style="background-color: ${badge.bgColor}; color: ${badge.textColor};" title="${escapeHtml(badge.name)}">
        ${badge.icon}
      </div>
      <div class="badge-detail-info">
        <div class="badge-detail-title-row">
          <span class="badge-detail-name">${escapeHtml(badge.name)}</span>
          <span class="badge-status-pill ${badge.unlocked ? 'unlocked' : 'locked'}">
            ${badge.unlocked ? '✓ Unlocked' : '🔒 In Progress'}
          </span>
        </div>
        <p class="badge-detail-desc">${escapeHtml(badge.description)}</p>
        <span class="badge-detail-criteria">Target: ${escapeHtml(badge.criteria)}</span>
      </div>
    `;

    allBadgesGrid.appendChild(card);
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}
