import { initCountdown } from './modules/countdown.js';
import { initQuestions } from './modules/questions.js';
import { initMistakes } from './modules/mistakes.js';
import { initBacklog } from './modules/backlog.js';
import { initTimer } from './modules/timer.js';
import { initNotes } from './modules/notes.js';
import { initTests } from './modules/tests.js';
import { initTodo } from './modules/todo.js';
import { initAnalytics, refreshAnalytics } from './modules/analytics.js';
import { initChat } from './modules/chat.js';
import { initSettings } from './modules/settings.js';
import { getStorage, setStorage } from './modules/storage.js';
import { getIconSvg } from './modules/ui.js';

const moduleInits = {
  countdown: initCountdown,
  questions: initQuestions,
  mistakes: initMistakes,
  backlog: initBacklog,
  timer: initTimer,
  notes: initNotes,
  tests: initTests,
  todo: initTodo,
  analytics: initAnalytics,
  chat: initChat,
  settings: initSettings
};

const initializedModules = new Set();

const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

function switchTab(tabName) {
  tabButtons.forEach(btn => btn.classList.remove('active'));
  tabPanels.forEach(panel => panel.classList.remove('active'));

  const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
  const targetPanel = document.getElementById(`tab-${tabName}`);

  if (!targetBtn || !targetPanel) return;

  targetBtn.classList.add('active');
  targetPanel.classList.add('active');

  if (!initializedModules.has(tabName)) {
    const initFn = moduleInits[tabName];
    if (initFn) {
      const instance = initFn(targetPanel);
      initializedModules.add(tabName);
    }
  } else {
    if (tabName === 'analytics') {
      const panel = document.getElementById('tab-analytics');
      if (panel) refreshAnalytics(panel);
    }
  }
}

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.getAttribute('data-tab');
    switchTab(tabName);
  });
});

document.addEventListener('keydown', (e) => {
  if (e.altKey && e.key >= '1' && e.key <= '9') {
    e.preventDefault();
    const index = parseInt(e.key, 10) - 1;
    const btn = tabButtons[index];
    if (btn) {
      const tabName = btn.getAttribute('data-tab');
      switchTab(tabName);
    }
    return;
  }

  if (e.key === '/' && !isInInput()) {
    e.preventDefault();
    const searchInput = document.querySelector('.tab-panel.active .search-bar');
    if (searchInput) {
      searchInput.focus();
    }
  }
});

function isInInput() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
}

async function loadTheme() {
  const data = await getStorage(['settings']);
  const settings = data.settings || {};
  const theme = settings.theme || 'dark';

  const sunIcon = await getIconSvg('sun');
  const moonIcon = await getIconSvg('moon');

  const btn = document.getElementById('theme-toggle-btn');
  if (theme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    btn.innerHTML = sunIcon;
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    btn.innerHTML = moonIcon;
  }
}

document.getElementById('theme-toggle-btn').addEventListener('click', async () => {
  const isLight = document.body.classList.contains('light-theme');

  const sunIcon = await getIconSvg('sun');
  const moonIcon = await getIconSvg('moon');

  if (isLight) {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    document.getElementById('theme-toggle-btn').innerHTML = moonIcon;
  } else {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    document.getElementById('theme-toggle-btn').innerHTML = sunIcon;
  }

  const data = await getStorage(['settings']);
  const settings = data.settings || {};
  settings.theme = isLight ? 'dark' : 'light';
  await setStorage({ settings });
});

async function loadStreak() {
  const data = await getStorage(['timer']);
  const timerData = data.timer || {};
  const streak = timerData.streak || 0;
  const flameSvg = await getIconSvg('flame');
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(flameSvg, 'image/svg+xml');
  const svgElement = doc.documentElement;
  svgElement.setAttribute('width', '16');
  svgElement.setAttribute('height', '16');
  
  const container = document.getElementById('global-streak');
  container.innerHTML = '';
  container.appendChild(svgElement);
  container.appendChild(document.createTextNode(' ' + streak));
}

async function loadTabIcons() {
  const tabs = ['countdown', 'questions', 'mistakes', 'backlog', 'todo', 'timer', 'notes', 'tests', 'analytics', 'chat', 'settings'];
  for (const tab of tabs) {
    const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
    if (btn) {
      const iconSvg = await getIconSvg(tab);
      const text = btn.textContent.trim();
      btn.innerHTML = '';
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(iconSvg, 'image/svg+xml');
      const svgElement = doc.documentElement;
      svgElement.setAttribute('width', '16');
      svgElement.setAttribute('height', '16');
      
      btn.appendChild(svgElement);
      btn.appendChild(document.createTextNode(' ' + text));
    }
  }
}

export function showToast(message, duration = 3000, undoCallback = null) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';

  const msgSpan = document.createElement('span');
  msgSpan.textContent = message;
  toast.appendChild(msgSpan);

  if (undoCallback) {
    const undoBtn = document.createElement('button');
    undoBtn.className = 'undo-btn';
    undoBtn.textContent = 'Undo';
    undoBtn.addEventListener('click', () => {
      undoCallback();
      toast.remove();
    });
    toast.appendChild(undoBtn);
  }

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

document.addEventListener('show-toast', (e) => {
  const { message, undoCallback } = e.detail;
  showToast(message, 3000, undoCallback);
});

document.addEventListener('DOMContentLoaded', async () => {
  await loadTabIcons();
  await loadTheme();
  await loadStreak();
  switchTab('countdown');
});

async function updateGlobalUpcomingTest() {
  const { getStorage } = await import('./modules/storage.js');
  const { testSchedule: defaultSchedule } = await import('./modules/testData.js');
  
  const data = await getStorage(['testSchedule']);
  let schedule = data.testSchedule ? data.testSchedule : defaultSchedule.map(t => ({
    name: t.name,
    date: t.date.toISOString(),
    id: Date.now().toString() + Math.random().toString(36).substring(2, 5)
  }));
  
  const alertContainer = document.getElementById("global-test-alert");
  if (!alertContainer) return;

  const now = new Date();
  const upcomingTests = schedule
    .map(t => ({ ...t, dateObj: new Date(t.date) }))
    .filter(t => t.dateObj.getTime() + 86400000 >= now.getTime())
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  
  if (upcomingTests.length > 0) {
    const nextTest = upcomingTests[0];
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const testDay = new Date(nextTest.dateObj.getFullYear(), nextTest.dateObj.getMonth(), nextTest.dateObj.getDate());
    
    const timeDiff = testDay.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    let daysText;
    if (daysLeft <= 0) daysText = "Today!";
    else if (daysLeft === 1) daysText = "Tomorrow";
    else daysText = `In ${daysLeft} Days`;
    
    alertContainer.innerHTML = `
      <div class="test-alert-icon warning-animated">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
      </div>
      <div class="test-alert-content">
        <div class="test-alert-title">${nextTest.name} &middot; <span class="accent-text">${daysText}</span></div>
      </div>
    `;
    alertContainer.style.display = "flex";
  } else {
    alertContainer.style.display = "none";
  }
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.testSchedule) {
    updateGlobalUpcomingTest();
  }
});

updateGlobalUpcomingTest();
