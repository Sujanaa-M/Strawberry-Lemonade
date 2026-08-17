# 🍓 Strawberry Lemonade - Task & Habit Manager 🍋

A premium-design, warm pastel-colored personal dashboard built with Vanilla HTML, CSS, and JS using Vite. It offers a structured approach to managing your daily focus tasks, logging repetitive habits, and visualizing your weekly progress streaks with sweet rewards.

---

## ✨ Features

### 1. 📋 Good Morning Sunshine Dashboard
* **Dynamic Greetings**: Welcoming sunshine banner header.
* **Daily Quote Block**: Features inspiring phrases with a light custard-yellow card layout.
* **Today's Focus**: Visual checkbox lists for prioritizing key tasks, grouped by work, personal, fun, and health categories.
* **Habits Mini-View**: Circular SVG dials reflecting partial steps/glasses logged for the day.

### 2. 💖 Your Habits Tracker
* **Weekly Streak Row**: A Mon-Sun grid mapping consecutive checked hearts. Dynamically highlights the current active day (Thursday) with a pulsating glow.
* **Daily Goal Cards**: Tracks progress counters for walks, hydration, reading, and stretches. Integrates instant checkbox completion triggers and manual numeric plus/minus logging increment keys.

### 3. ✍️ To-Do List Checklist
* **Completed Progress Bar**: Top header progress bar indicating the exact percentage of tasks completed today with a sliding star indicator.
* **Filter Pills**: Group and display lists instantly by sub-types like *Main Squeeze (Work)*, *Zesty Life (Personal)*, and *Sweet Treats (Fun)*.
* **Inline Task Creator**: "Quick Squeeze" right side-form for adding items on the fly.
* **Task Card Actions**: Interactive check actions and hover deletion garbage icons.

### 4. 📈 Sweet Progress Analytics
* **Summary Scorecards**: Displays total completed tasks, streaks, habits mastered, and levels.
* **Consistency Wave Chart**: A fluid custom-drawn dual SVG Bezier graph indicating habits (yellow path) and tasks (pink path) completed over the week, switchable between Weekly and Monthly scatter plots.
* **Weekly Goal Ratios**: Checks target fractions at a glance.
* **Earned Badge Grid**: Displays achieved reward tokens such as *7-Day Streak* or *Hydration Hero*.

---

## 🎨 Color Palette & Typography

* **Background (Custard Cream)**: `#FCF9F2`
* **Sidebar Layout (Pastel Pink)**: `#FFE4E8`
* **Strawberry Pink Accent**: `#FF8EA5`
* **Deep Cranberry Crimson Accent**: `#9C3353`
* **Fresh Lemon Yellow Accent**: `#FEDC63`
* **Primary Fonts**: `Fredoka` & `Quicksand` (rounded Sans-Serif Google typography)

---

## 🛠️ Stack & Directory Architecture

* **Core**: Modern Vanilla ESM JavaScript, CSS custom properties, and Semantic HTML5.
* **Compiler**: Vite.
* **Central Sync State**: `src/storage.js` coordinates browser `localStorage` variables synchronously across multiple tabs.

```
├── index.html            # Dashboard Home
├── habits.html           # Habit Tracker Layout
├── tasks.html            # Tasks Checklist
├── progress.html         # Progress Analytics
├── vite.config.js        # Multi-page Rollup compilation definitions
├── src/
│   ├── style.css         # Styled themes and responsive cards
│   ├── storage.js        # Sync engine storing lists & streaks in localStorage
│   ├── dashboard.js      # Controller script for index.html
│   ├── habits.js         # Controller script for habits.html
│   ├── tasks.js          # Controller script for tasks.html
│   └── progress.js       # Controller script for progress.html
```

---

## 🚀 Getting Started

### Local Setup & Launch
1. Ensure you have Node.js installed.
2. Clone the repository and navigate into the workspace.
3. Install development assets:
   ```bash
   npm install
   ```
4. Spin up the developer preview link:
   ```bash
   npm run dev
   ```
5. Open your local browser to the output port (default: `http://localhost:5173/`).

### Production Compilation
Generate minimized assets inside the `/dist` directory for static host deployments (e.g. GitHub Pages):
```bash
npm run build
```
