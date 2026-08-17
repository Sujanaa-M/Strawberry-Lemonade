import { storage } from './storage.js';

// Elements
const statTotalTasks = document.getElementById('statTotalTasks');
const statLongestStreak = document.getElementById('statLongestStreak');
const statHabitsMastered = document.getElementById('statHabitsMastered');
const statCurrentLevel = document.getElementById('statCurrentLevel');

const weeklyGoalList = document.getElementById('weeklyGoalList');

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
  drawConsistencyChart('weekly');
  setupChartToggles();
  setupTaskModal();

  window.addEventListener('storage', () => {
    renderStats();
    renderWeeklyGoals();
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

// Render Weekly Goals checklist matching mockup ratios
function renderWeeklyGoals() {
  if (!weeklyGoalList) return;
  weeklyGoalList.innerHTML = '';

  const habits = storage.getHabits();
  
  // Custom mapping goals. If no habits exist, default mockup items.
  const morningWater = habits.find(h => h.name.toLowerCase().includes('water') || h.name.toLowerCase().includes('hydration'));
  const walkHabit = habits.find(h => h.name.toLowerCase().includes('walk'));
  const readHabit = habits.find(h => h.name.toLowerCase().includes('read'));

  // Define goals list
  const goals = [
    {
      name: 'Morning Lemon Water',
      current: morningWater ? morningWater.currentValue : 5,
      target: morningWater ? morningWater.targetValue : 7
    },
    {
      name: '30m Walk',
      current: walkHabit ? walkHabit.currentValue : 3,
      target: walkHabit ? walkHabit.targetValue : 5
    },
    {
      name: 'Read 10 Pages',
      current: readHabit ? Math.min(4, Math.floor(readHabit.currentValue / 10) || 1) : 1,
      target: 4
    }
  ];

  goals.forEach(goal => {
    const item = document.createElement('div');
    item.className = 'weekly-goal-item';
    item.innerHTML = `
      <span class="weekly-goal-name">${escapeHtml(goal.name)}</span>
      <span class="weekly-goal-progress">${goal.current} / ${goal.target}</span>
    `;
    weeklyGoalList.appendChild(item);
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

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}
