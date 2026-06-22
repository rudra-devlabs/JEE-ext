import { getStorage } from "./storage.js";

function getThemeColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    accent: style.getPropertyValue("--accent").trim() || "#7c5cfc",
    textPrimary: style.getPropertyValue("--text-primary").trim() || "#e0e0e0",
    textSecondary: style.getPropertyValue("--text-secondary").trim() || "#a0a0b0",
    bgPrimary: style.getPropertyValue("--bg-primary").trim() || "#2a2a3d",
    bgSecondary: style.getPropertyValue("--bg-secondary").trim() || "#1e1e2e",
    gridLine: style.getPropertyValue("--bg-primary").trim() || "#2a2a3d"
  };
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const dayName = d.toLocaleDateString("en", { weekday: "short" });
    days.push({ date: dateStr, label: dayName });
  }
  return days;
}

function getLast4Weeks() {
  const weeks = [];
  const now = new Date();
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    weeks.push({
      label: `W${4 - i}`,
      start: weekStart,
      end: weekEnd
    });
  }
  return weeks;
}

function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const width = 400;
  const height = 200;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  return { ctx, width, height };
}

function drawBarChart(canvas, labels, values, title, colors) {
  const { ctx, width, height } = setupCanvas(canvas);

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = colors.textPrimary;
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title, width / 2, 18);

  const padding = { top: 35, right: 20, bottom: 35, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...values, 1);
  const gridLines = 4;

  ctx.strokeStyle = colors.gridLine;
  ctx.lineWidth = 0.5;
  ctx.fillStyle = colors.textSecondary;
  ctx.font = "10px sans-serif";
  ctx.textAlign = "right";

  for (let i = 0; i <= gridLines; i++) {
    const y = padding.top + (chartH / gridLines) * i;
    const val = Math.round(maxVal - (maxVal / gridLines) * i);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    ctx.fillText(val.toString(), padding.left - 5, y + 3);
  }

  const barCount = labels.length;
  const barGap = 8;
  const barWidth = (chartW - barGap * (barCount + 1)) / barCount;

  ctx.textAlign = "center";
  ctx.font = "10px sans-serif";

  labels.forEach((label, i) => {
    const x = padding.left + barGap + i * (barWidth + barGap);
    const barH = (values[i] / maxVal) * chartH;
    const y = padding.top + chartH - barH;

    const radius = Math.min(4, barWidth / 2);
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.arcTo(x + barWidth, y, x + barWidth, y + radius, radius);
    ctx.lineTo(x + barWidth, padding.top + chartH);
    ctx.lineTo(x, padding.top + chartH);
    ctx.closePath();
    ctx.fill();

    if (values[i] > 0) {
      ctx.fillStyle = colors.textPrimary;
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(values[i].toString(), x + barWidth / 2, y - 5);
    }

    ctx.fillStyle = colors.textSecondary;
    ctx.font = "10px sans-serif";
    ctx.fillText(label, x + barWidth / 2, height - padding.bottom + 15);
  });
}

function drawDonutChart(canvas, done, pending, title, colors) {
  const { ctx, width, height } = setupCanvas(canvas);

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = colors.textPrimary;
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title, width / 2, 18);

  const cx = width / 2;
  const cy = height / 2 + 10;
  const radius = 60;
  const lineWidth = 20;
  const total = done + pending;
  const pct = total === 0 ? 0 : done / total;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = colors.bgPrimary;
  ctx.lineWidth = lineWidth;
  ctx.stroke();

  if (total > 0) {
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + 2 * Math.PI * pct;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  ctx.fillStyle = colors.textPrimary;
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${Math.round(pct * 100)}%`, cx, cy - 5);

  ctx.fillStyle = colors.textSecondary;
  ctx.font = "11px sans-serif";
  ctx.fillText("complete", cx, cy + 15);

  ctx.textBaseline = "alphabetic";
}

async function drawAllCharts(container) {
  const colors = getThemeColors();

  const qData = await getStorage(["questionHistory"]);
  const mData = await getStorage(["mistakeHistory"]);
  const bData = await getStorage(["backlog"]);
  const sData = await getStorage(["sessionHistory"]);

  const questionHistory = qData.questionHistory || [];
  const mistakeHistory = mData.mistakeHistory || [];
  const backlog = bData.backlog || [];
  const sessionHistory = sData.sessionHistory || [];

  const qCanvas = container.querySelector("#chart-questions");
  const mCanvas = container.querySelector("#chart-mistakes");
  const bCanvas = container.querySelector("#chart-backlog");
  const sCanvas = container.querySelector("#chart-sessions");

  if (qCanvas) {
    const days = getLast7Days();
    const values = days.map((d) => {
      const entry = questionHistory.find((h) => h.date === d.date);
      return entry ? entry.count : 0;
    });
    drawBarChart(qCanvas, days.map((d) => d.label), values, "Questions Added (Last 7 Days)", colors);
  }

  if (mCanvas) {
    const weeks = getLast4Weeks();
    const values = weeks.map((w) => {
      return mistakeHistory
        .filter((h) => {
          const d = new Date(h.date);
          return d >= w.start && d <= w.end;
        })
        .reduce((sum, h) => sum + h.count, 0);
    });
    drawBarChart(mCanvas, weeks.map((w) => w.label), values, "Mistakes Logged (Last 4 Weeks)", colors);
  }

  if (bCanvas) {
    const done = backlog.filter((b) => b.done).length;
    const pending = backlog.filter((b) => !b.done).length;
    drawDonutChart(bCanvas, done, pending, "Backlog Completion", colors);
  }

  if (sCanvas) {
    const weeks = getLast4Weeks();
    const values = weeks.map((w) => {
      return sessionHistory
        .filter((h) => {
          const d = new Date(h.date);
          return d >= w.start && d <= w.end;
        })
        .reduce((sum, h) => sum + h.count, 0);
    });
    drawBarChart(sCanvas, weeks.map((w) => w.label), values, "Study Sessions (Last 4 Weeks)", colors);
  }
}

export async function initAnalytics(container) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "analytics-wrapper";

  const title = document.createElement("h2");
  title.textContent = "Analytics";
  wrapper.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "chart-grid";

  const charts = [
    { id: "chart-questions" },
    { id: "chart-mistakes" },
    { id: "chart-backlog" },
    { id: "chart-sessions" }
  ];

  charts.forEach((chart) => {
    const card = document.createElement("div");
    card.className = "chart-card";
    const canvas = document.createElement("canvas");
    canvas.id = chart.id;
    card.appendChild(canvas);
    grid.appendChild(card);
  });

  wrapper.appendChild(grid);
  container.appendChild(wrapper);

  await drawAllCharts(container);
}

export async function refreshAnalytics(container) {
  await drawAllCharts(container);
}
