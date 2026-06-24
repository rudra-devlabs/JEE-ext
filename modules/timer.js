import { getStorage, setStorage } from "./storage.js";
import { getIconSvg } from "./ui.js";

let timerInterval = null;
let currentMode = "focus";
let focusDuration = 25;
let breakDuration = 5;
let endTime = null;
let isRunning = false;

function showToast(message, undoCallback) {
  document.dispatchEvent(new CustomEvent("show-toast", {
    detail: { message, undoCallback }
  }));
}

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isYesterday(dateStr) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
  return dateStr === yStr;
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 440;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
    setTimeout(() => ctx.close(), 300);
  } catch (e) {
    // AudioContext not available
  }
}

async function recordSession() {
  const data = await getStorage(["timer"]);
  const timer = data.timer || {
    sessionsToday: 0,
    lastSessionDate: "",
    streak: 0,
    totalSessions: 0,
    endTime: null,
    isRunning: false,
    mode: "focus",
    focusDuration: 25,
    breakDuration: 5
  };

  const today = getTodayString();

  if (timer.lastSessionDate === today) {
    timer.sessionsToday++;
  } else if (isYesterday(timer.lastSessionDate)) {
    timer.streak++;
    timer.sessionsToday = 1;
    timer.lastSessionDate = today;
  } else {
    timer.streak = 1;
    timer.sessionsToday = 1;
    timer.lastSessionDate = today;
  }

  timer.totalSessions++;

  const sessionData = await getStorage(["sessionHistory"]);
  const history = sessionData.sessionHistory || [];
  const entry = history.find((h) => h.date === today);
  if (entry) {
    entry.count++;
  } else {
    history.push({ date: today, count: 1 });
  }

  await setStorage({ timer, sessionHistory: history });
  return timer;
}

function formatTime(seconds) {
  const isNegative = seconds < 0;
  const absSecs = Math.abs(seconds);
  const h = Math.floor(absSecs / 3600);
  const m = Math.floor((absSecs % 3600) / 60);
  const s = Math.floor(absSecs % 60);
  const sign = isNegative ? "-" : "";
  if (h > 0) {
    return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${sign}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export async function initTimer(container) {
  if (timerInterval) clearInterval(timerInterval);

  const data = await getStorage(["timer"]);
  const timer = data.timer || {
    sessionsToday: 0,
    lastSessionDate: "",
    streak: 0,
    totalSessions: 0,
    endTime: null,
    isRunning: false,
    mode: "focus",
    focusDuration: 25,
    breakDuration: 5
  };

  currentMode = timer.mode || "focus";
  focusDuration = timer.focusDuration || 25;
  breakDuration = timer.breakDuration || 5;
  endTime = timer.endTime || null;
  isRunning = timer.isRunning || false;

  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "timer-wrapper";

  const title = document.createElement("h2");
  title.textContent = "Focus Timer";
  wrapper.appendChild(title);

  const presets = document.createElement("div");
  presets.className = "timer-presets";

  const btn25 = document.createElement("button");
  btn25.className = "btn preset-btn";
  btn25.textContent = "25 min";
  btn25.addEventListener("click", () => setPreset(25, 5, container));
  presets.appendChild(btn25);

  const btn50 = document.createElement("button");
  btn50.className = "btn preset-btn";
  btn50.textContent = "50 min";
  btn50.addEventListener("click", () => setPreset(50, 10, container));
  presets.appendChild(btn50);

  const customWrap = document.createElement("div");
  customWrap.className = "custom-preset-wrap";
  customWrap.style.display = "flex";
  customWrap.style.flexDirection = "column";

  const customBtn = document.createElement("button");
  customBtn.className = "btn preset-btn";
  customBtn.textContent = "Custom";

  const customInputs = document.createElement("div");
  customInputs.style.display = "none";
  customInputs.style.gap = "4px";
  customInputs.style.alignItems = "center";
  customInputs.style.marginTop = "6px";
  
  customInputs.innerHTML = `
    <input type="number" id="c-hr" class="input-field" placeholder="HH" min="0" style="width:46px; padding:4px; text-align:center;">:
    <input type="number" id="c-min" class="input-field" placeholder="MM" min="0" max="59" style="width:46px; padding:4px; text-align:center;">:
    <input type="number" id="c-sec" class="input-field" placeholder="SS" min="0" max="59" style="width:46px; padding:4px; text-align:center;">
    <button class="btn btn-primary" id="c-set" style="padding:4px 10px; margin-left:4px;">Set</button>
  `;

  customBtn.addEventListener("click", () => {
    customInputs.style.display = customInputs.style.display === "none" ? "flex" : "none";
  });
  
  customWrap.appendChild(customBtn);
  customWrap.appendChild(customInputs);

  const btnSet = customInputs.querySelector("#c-set");
  btnSet.addEventListener("click", () => {
    const hr = parseInt(customInputs.querySelector("#c-hr").value) || 0;
    const min = parseInt(customInputs.querySelector("#c-min").value) || 0;
    const sec = parseInt(customInputs.querySelector("#c-sec").value) || 0;
    
    const totalMins = (hr * 60) + min + (sec / 60);
    if (totalMins > 0) {
      const brk = Math.max(1, Math.round(totalMins / 5));
      setPreset(totalMins, brk, container);
    }
  });

  presets.appendChild(customWrap);
  wrapper.appendChild(presets);

  const display = document.createElement("div");
  display.className = "timer-display";

  const svgSize = 200;
  const strokeWidth = 12;
  const radius = (svgSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", svgSize);
  svg.setAttribute("height", svgSize);
  svg.setAttribute("viewBox", `0 0 ${svgSize} ${svgSize}`);
  svg.setAttribute("class", "timer-ring");

  const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  bgCircle.setAttribute("cx", svgSize / 2);
  bgCircle.setAttribute("cy", svgSize / 2);
  bgCircle.setAttribute("r", radius);
  bgCircle.setAttribute("fill", "none");
  bgCircle.setAttribute("stroke", "var(--bg-primary, #2a2a3d)");
  bgCircle.setAttribute("stroke-width", strokeWidth);
  svg.appendChild(bgCircle);

  const progressCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  progressCircle.setAttribute("cx", svgSize / 2);
  progressCircle.setAttribute("cy", svgSize / 2);
  progressCircle.setAttribute("r", radius);
  progressCircle.setAttribute("fill", "none");
  progressCircle.setAttribute("stroke", "var(--accent, #7c5cfc)");
  progressCircle.setAttribute("stroke-width", strokeWidth);
  progressCircle.setAttribute("stroke-linecap", "round");
  progressCircle.setAttribute("stroke-dasharray", circumference);
  progressCircle.setAttribute("stroke-dashoffset", "0");
  progressCircle.setAttribute("transform", `rotate(-90 ${svgSize / 2} ${svgSize / 2})`);
  svg.appendChild(progressCircle);

  const timeText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  timeText.setAttribute("x", svgSize / 2);
  timeText.setAttribute("y", svgSize / 2);
  timeText.setAttribute("text-anchor", "middle");
  timeText.setAttribute("dominant-baseline", "central");
  timeText.setAttribute("fill", "var(--text-primary, #e0e0e0)");
  timeText.setAttribute("font-size", "42");
  timeText.setAttribute("font-weight", "700");
  timeText.setAttribute("font-family", "monospace");
  
  function updateTimeText(str) {
    timeText.textContent = str;
    if (str.length > 5) {
      timeText.setAttribute("font-size", "34");
    } else {
      timeText.setAttribute("font-size", "42");
    }
  }

  updateTimeText(formatTime(focusDuration * 60));
  svg.appendChild(timeText);

  display.appendChild(svg);

  const modeLabel = document.createElement("div");
  modeLabel.className = "timer-mode";
  modeLabel.textContent = currentMode === "focus" ? "Focus" : "Break";
  display.appendChild(modeLabel);

  wrapper.appendChild(display);

  const controls = document.createElement("div");
  controls.className = "timer-controls";

  const startPauseBtn = document.createElement("button");
  startPauseBtn.className = "btn btn-primary";
  startPauseBtn.textContent = isRunning ? "Pause" : "Start";
  startPauseBtn.addEventListener("click", () => toggleTimer(container));
  controls.appendChild(startPauseBtn);

  const resetBtn = document.createElement("button");
  resetBtn.className = "btn btn-secondary";
  resetBtn.textContent = "Reset";
  resetBtn.addEventListener("click", () => resetTimer(container));
  controls.appendChild(resetBtn);

  wrapper.appendChild(controls);

  const sessionInfo = document.createElement("div");
  sessionInfo.className = "session-info";
  const flameSvgText = await getIconSvg('flame');
  const parser = new DOMParser();
  const doc = parser.parseFromString(flameSvgText, 'image/svg+xml');
  const flameSvg = doc.documentElement;
  flameSvg.setAttribute('width', '16');
  flameSvg.setAttribute('height', '16');
  flameSvg.style.verticalAlign = 'text-bottom';

  sessionInfo.innerHTML = `<span>Today: <strong>${timer.sessionsToday || 0}</strong> sessions</span><span>Streak: <strong>${timer.streak || 0}</strong> days </span>`;
  sessionInfo.querySelector('span:last-child').appendChild(flameSvg);
  wrapper.appendChild(sessionInfo);

  container.appendChild(wrapper);

  function updateDisplay() {
    if (!isRunning || !endTime) return;

    const now = Date.now();
    const remaining = Math.ceil((endTime - now) / 1000);
    const totalSeconds = (currentMode === "focus" ? focusDuration : breakDuration) * 60;
    const elapsed = totalSeconds - remaining;
    const pct = totalSeconds > 0 ? Math.min(1, Math.max(0, elapsed / totalSeconds)) : 0;
    const offset = circumference * (1 - pct);

    progressCircle.setAttribute("stroke-dashoffset", offset);
    updateTimeText(formatTime(remaining));

    if (remaining <= 0 && remaining >= -60) {
      progressCircle.setAttribute("stroke", "#ff4444");
      timeText.setAttribute("fill", "#ff4444");
      playBeep();
    } else {
      progressCircle.setAttribute("stroke", "var(--accent, #7c5cfc)");
      timeText.setAttribute("fill", "var(--text-primary, #e0e0e0)");
    }

    if (remaining < -60) {
      clearInterval(timerInterval);
      timerInterval = null;
      isRunning = false;

      if (currentMode === "focus") {
        recordSession().then(async (updatedTimer) => {
          const flameSvgText = await getIconSvg('flame');
          const parser = new DOMParser();
          const doc = parser.parseFromString(flameSvgText, 'image/svg+xml');
          const flameSvg = doc.documentElement;
          flameSvg.setAttribute('width', '16');
          flameSvg.setAttribute('height', '16');
          flameSvg.style.verticalAlign = 'text-bottom';

          sessionInfo.innerHTML = `<span>Today: <strong>${updatedTimer.sessionsToday || 0}</strong> sessions</span><span>Streak: <strong>${updatedTimer.streak || 0}</strong> days </span>`;
          sessionInfo.querySelector('span:last-child').appendChild(flameSvg);
          showToast("Focus session complete!");
        });
        currentMode = "break";
        modeLabel.textContent = "Break";
        startBreak(container);
      } else {
        currentMode = "focus";
        modeLabel.textContent = "Focus";
        endTime = null;
        saveTimerState();
        timeText.textContent = formatTime(focusDuration * 60);
        progressCircle.setAttribute("stroke-dashoffset", "0");
        startPauseBtn.textContent = "Start";
        showToast("Break complete! Ready for next session?");
      }
    }
  }

  function startBreak() {
    const breakSeconds = breakDuration * 60;
    endTime = Date.now() + breakSeconds * 1000;
    isRunning = true;
    saveTimerState();
    startPauseBtn.textContent = "Pause";
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateDisplay, 1000);
    updateDisplay();
  }

  function toggleTimer() {
    if (isRunning) {
      clearInterval(timerInterval);
      timerInterval = null;
      isRunning = false;
      startPauseBtn.textContent = "Start";
      
      const remaining = endTime ? Math.ceil((endTime - Date.now()) / 1000) : 0;
      if (remaining <= 0) {
        if (currentMode === "focus") {
          recordSession().then(async (updatedTimer) => {
            const flameSvgText = await getIconSvg('flame');
            const parser = new DOMParser();
            const doc = parser.parseFromString(flameSvgText, 'image/svg+xml');
            const flameSvg = doc.documentElement;
            flameSvg.setAttribute('width', '16');
            flameSvg.setAttribute('height', '16');
            flameSvg.style.verticalAlign = 'text-bottom';
            sessionInfo.innerHTML = `<span>Today: <strong>${updatedTimer.sessionsToday || 0}</strong> sessions</span><span>Streak: <strong>${updatedTimer.streak || 0}</strong> days </span>`;
            sessionInfo.querySelector('span:last-child').appendChild(flameSvg);
            showToast("Focus session complete!");
          });
          currentMode = "break";
          modeLabel.textContent = "Break";
          endTime = null;
          saveTimerState();
          updateTimeText(formatTime(breakDuration * 60));
          progressCircle.setAttribute("stroke-dashoffset", "0");
          progressCircle.setAttribute("stroke", "var(--accent, #7c5cfc)");
          timeText.setAttribute("fill", "var(--text-primary, #e0e0e0)");
          startPauseBtn.textContent = "Start";
        } else {
          currentMode = "focus";
          modeLabel.textContent = "Focus";
          endTime = null;
          saveTimerState();
          updateTimeText(formatTime(focusDuration * 60));
          progressCircle.setAttribute("stroke-dashoffset", "0");
          progressCircle.setAttribute("stroke", "var(--accent, #7c5cfc)");
          timeText.setAttribute("fill", "var(--text-primary, #e0e0e0)");
          startPauseBtn.textContent = "Start";
          showToast("Break complete! Ready for next session?");
        }
        return;
      }
      
      saveTimerState();
      try {
        chrome.runtime.sendMessage({ action: "stopTimer" });
      } catch (e) {}
    } else {
      const remaining = endTime ? Math.ceil((endTime - Date.now()) / 1000) : (currentMode === "focus" ? focusDuration : breakDuration) * 60;
      endTime = Date.now() + remaining * 1000;
      isRunning = true;
      startPauseBtn.textContent = "Pause";
      saveTimerState();
      try {
        chrome.runtime.sendMessage({ action: "startTimer", duration: Math.ceil(remaining / 60) });
      } catch (e) {}
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(updateDisplay, 1000);
      updateDisplay();
    }
  }

  function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    endTime = null;
    currentMode = "focus";
    modeLabel.textContent = "Focus";
    startPauseBtn.textContent = "Start";
    updateTimeText(formatTime(focusDuration * 60));
    progressCircle.setAttribute("stroke-dashoffset", "0");
    progressCircle.setAttribute("stroke", "var(--accent, #7c5cfc)");
    timeText.setAttribute("fill", "var(--text-primary, #e0e0e0)");
    saveTimerState();
    try {
      chrome.runtime.sendMessage({ action: "stopTimer" });
    } catch (e) {}
  }

  function setPreset(focus, brk) {
    focusDuration = focus;
    breakDuration = brk;
    if (!isRunning) {
      endTime = null;
      currentMode = "focus";
      modeLabel.textContent = "Focus";
      updateTimeText(formatTime(focusDuration * 60));
      progressCircle.setAttribute("stroke-dashoffset", "0");
      startPauseBtn.textContent = "Start";
    }
    saveTimerState();
  }

  async function saveTimerState() {
    const data = await getStorage(["timer"]);
    const timer = data.timer || {};
    timer.endTime = endTime;
    timer.isRunning = isRunning;
    timer.mode = currentMode;
    timer.focusDuration = focusDuration;
    timer.breakDuration = breakDuration;
    await setStorage({ timer });
  }

  if (isRunning && endTime) {
    timerInterval = setInterval(updateDisplay, 1000);
    updateDisplay();
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "playClassBeep") {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.value = 523.25; // High C for class alarm
      oscillator.type = "sine";
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.6);
      setTimeout(() => ctx.close(), 700);
    } catch (e) {}
  }
});
