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
