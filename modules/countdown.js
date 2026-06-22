const TARGET_DATE = new Date("2027-01-15T00:00:00");
const START_DATE = new Date("2026-06-21T00:00:00");
import { testSchedule as defaultSchedule } from "./testData.js";
import { getStorage } from "./storage.js";

let dynamicTestSchedule = [];

const QUOTES = [
  "Every problem you solve brings you closer to IIT.",
  "Consistency beats intensity. Show up every day.",
  "The pain of discipline is far less than the pain of regret.",
  "Your future self is watching. Make them proud.",
  "JEE is not just an exam, it's a transformation.",
  "Small daily improvements lead to stunning results.",
  "Don't watch the clock; do what it does — keep going.",
  "The only bad study session is the one you didn't do.",
  "Master the fundamentals, and the complex becomes simple.",
  "Rank is earned in the hours nobody sees.",
  "Struggle today, shine tomorrow.",
  "Focus on progress, not perfection.",
  "Every topper was once a beginner who refused to quit.",
  "Doubt kills more dreams than failure ever will.",
  "You don't have to be great to start, but you have to start to be great."
];

let intervalId = null;
let quoteIntervalId = null;


export async function initCountdown(container) {
  if (intervalId) clearInterval(intervalId);
  if (quoteIntervalId) clearInterval(quoteIntervalId);

  const data = await getStorage(['testSchedule']);
  dynamicTestSchedule = data.testSchedule ? data.testSchedule : defaultSchedule.map(t => ({
    name: t.name,
    date: t.date.toISOString(),
    id: Date.now().toString() + Math.random().toString(36).substring(2, 5)
  }));

  // Listen for storage changes so the countdown updates if we add/delete a test
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.testSchedule) {
      dynamicTestSchedule = changes.testSchedule.newValue || [];
      updateUpcomingTest();
    }
  });

  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "countdown-wrapper";

  const title = document.createElement("h2");
  title.textContent = "JEE Mains Countdown";
  wrapper.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "countdown-grid";

  const units = ["Days", "Hours", "Minutes", "Seconds"];
  const boxes = {};
  units.forEach((unit) => {
    const box = document.createElement("div");
    box.className = "countdown-box";
    const num = document.createElement("span");
    num.className = "countdown-num";
    num.textContent = "00";
    const label = document.createElement("span");
    label.className = "countdown-label";
    label.textContent = unit;
    box.appendChild(num);
    box.appendChild(label);
    grid.appendChild(box);
    boxes[unit] = num;
  });
  wrapper.appendChild(grid);

  const ringContainer = document.createElement("div");
  ringContainer.className = "progress-ring-container";
  const svgSize = 160;
  const strokeWidth = 10;
  const radius = (svgSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", svgSize);
  svg.setAttribute("height", svgSize);
  svg.setAttribute("viewBox", `0 0 ${svgSize} ${svgSize}`);

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
  progressCircle.setAttribute("stroke-dashoffset", circumference);
  progressCircle.setAttribute("transform", `rotate(-90 ${svgSize / 2} ${svgSize / 2})`);
  svg.appendChild(progressCircle);

  const pctText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  pctText.setAttribute("x", svgSize / 2);
  pctText.setAttribute("y", svgSize / 2);
  pctText.setAttribute("text-anchor", "middle");
  pctText.setAttribute("dominant-baseline", "central");
  pctText.setAttribute("fill", "var(--text-primary, #e0e0e0)");
  pctText.setAttribute("font-size", "22");
  pctText.setAttribute("font-weight", "700");
  pctText.textContent = "0%";
  svg.appendChild(pctText);

  ringContainer.appendChild(svg);
  const ringLabel = document.createElement("div");
  ringLabel.className = "ring-label";
  ringLabel.textContent = "Time Elapsed";
  ringContainer.appendChild(ringLabel);
  wrapper.appendChild(ringContainer);

  const alertContainer = document.createElement("div");
  alertContainer.className = "upcoming-test-alert";
  alertContainer.style.display = "none";
  wrapper.appendChild(alertContainer);
  
  function updateUpcomingTest() {
    const now = new Date();
    // Find next test (allow up to 24h after test start date)
    const upcomingTests = dynamicTestSchedule
      .map(t => ({ ...t, dateObj: new Date(t.date) }))
      .filter(t => t.dateObj.getTime() + 86400000 >= now.getTime())
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    
    if (upcomingTests.length > 0) {
      const nextTest = upcomingTests[0];
      // Normalize today to start of day for accurate day calculation
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const testDay = new Date(nextTest.dateObj.getFullYear(), nextTest.dateObj.getMonth(), nextTest.dateObj.getDate());
      
      const timeDiff = testDay.getTime() - today.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 7 && daysLeft >= 0) {
        const dateStr = nextTest.dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        let daysText;
        if (daysLeft === 0) daysText = "Today!";
        else if (daysLeft === 1) daysText = "Tomorrow";
        else daysText = `In ${daysLeft} Days`;
        
        alertContainer.innerHTML = `
          <div class="test-alert-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <div class="test-alert-content">
            <div class="test-alert-title">${nextTest.name} &middot; <span class="accent-text">${daysText}</span></div>
            <div class="test-alert-date">${dateStr}</div>
          </div>
        `;
        alertContainer.style.display = "flex";
      } else {
        alertContainer.style.display = "none";
      }
    } else {
      alertContainer.style.display = "none";
    }
  }

  const quoteEl = document.createElement("div");
  quoteEl.className = "motivational-quote";
  let quoteIndex = Math.floor(Math.random() * QUOTES.length);
  quoteEl.textContent = `"${QUOTES[quoteIndex]}"`;
  wrapper.appendChild(quoteEl);

  container.appendChild(wrapper);

  function updateCountdown() {
    const now = new Date();
    const diff = TARGET_DATE - now;

    if (diff <= 0) {
      boxes["Days"].textContent = "0";
      boxes["Hours"].textContent = "0";
      boxes["Minutes"].textContent = "0";
      boxes["Seconds"].textContent = "0";
      progressCircle.setAttribute("stroke-dashoffset", "0");
      pctText.textContent = "100%";
      clearInterval(intervalId);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    boxes["Days"].textContent = days;
    boxes["Hours"].textContent = String(hours).padStart(2, "0");
    boxes["Minutes"].textContent = String(minutes).padStart(2, "0");
    boxes["Seconds"].textContent = String(seconds).padStart(2, "0");

    const totalDuration = TARGET_DATE - START_DATE;
    const elapsed = now - START_DATE;
    const pct = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    const offset = circumference - (pct / 100) * circumference;
    progressCircle.setAttribute("stroke-dashoffset", offset);
    pctText.textContent = `${Math.round(pct)}%`;
    
    updateUpcomingTest();
  }

  updateCountdown();
  intervalId = setInterval(updateCountdown, 1000);

  quoteIntervalId = setInterval(() => {
    quoteIndex = (quoteIndex + 1) % QUOTES.length;
    quoteEl.style.opacity = "0";
    setTimeout(() => {
      quoteEl.textContent = `"${QUOTES[quoteIndex]}"`;
      quoteEl.style.opacity = "1";
    }, 300);
  }, 30000);
}
