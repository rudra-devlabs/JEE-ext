import { getStorage } from "./storage.js";

let currentHeatmapDate = new Date();
currentHeatmapDate.setDate(1);

function getThemeColors() {
  const style = getComputedStyle(document.body);
  return {
    accent: style.getPropertyValue("--accent").trim() || "#7c5cfc",
    textPrimary: style.getPropertyValue("--text-primary").trim() || "#e0e0e0",
    textSecondary: style.getPropertyValue("--text-secondary").trim() || "#a0a0b0",
    bgPrimary: style.getPropertyValue("--bg-primary").trim() || "#2a2a3d",
    bgSecondary: style.getPropertyValue("--bg-secondary").trim() || "#1e1e2e",
    gridLine: style.getPropertyValue("--border-color").trim() || "#333333"
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
  ctx.strokeStyle = colors.gridLine;
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

async function drawTodoHeatmap(container) {
  let heatmapCard = container.querySelector("#todo-heatmap-card");
  let isNew = false;

  if (!heatmapCard) {
    isNew = true;
    heatmapCard = document.createElement("div");
    heatmapCard.id = "todo-heatmap-card";
    heatmapCard.className = "chart-card";
    heatmapCard.style.marginBottom = "16px";
    
    const wrapper = container.querySelector(".analytics-wrapper");
    const grid = wrapper.querySelector(".chart-grid");
    wrapper.insertBefore(heatmapCard, grid);

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.marginBottom = "16px";

    const prevBtn = document.createElement("button");
    prevBtn.innerHTML = "&lt;";
    prevBtn.style.padding = "2px 8px";
    prevBtn.style.backgroundColor = "transparent";
    prevBtn.style.border = "1px solid var(--text-primary)";
    prevBtn.style.color = "var(--text-primary)";
    prevBtn.style.borderRadius = "4px";
    prevBtn.style.cursor = "pointer";
    prevBtn.style.fontWeight = "bold";
    prevBtn.style.transition = "opacity 0.2s";
    prevBtn.onmouseover = () => prevBtn.style.opacity = "0.7";
    prevBtn.onmouseout = () => prevBtn.style.opacity = "1";
    prevBtn.onclick = () => {
      currentHeatmapDate.setMonth(currentHeatmapDate.getMonth() - 1);
      drawTodoHeatmap(container);
    };

    const nextBtn = document.createElement("button");
    nextBtn.innerHTML = "&gt;";
    nextBtn.style.padding = "2px 8px";
    nextBtn.style.backgroundColor = "transparent";
    nextBtn.style.border = "1px solid var(--text-primary)";
    nextBtn.style.color = "var(--text-primary)";
    nextBtn.style.borderRadius = "4px";
    nextBtn.style.cursor = "pointer";
    nextBtn.style.fontWeight = "bold";
    nextBtn.style.transition = "opacity 0.2s";
    nextBtn.onmouseover = () => nextBtn.style.opacity = "0.7";
    nextBtn.onmouseout = () => nextBtn.style.opacity = "1";
    nextBtn.onclick = () => {
      currentHeatmapDate.setMonth(currentHeatmapDate.getMonth() + 1);
      drawTodoHeatmap(container);
    };

    const title = document.createElement("div");
    title.id = "todo-heatmap-title";
    title.style.fontWeight = "bold";
    title.style.fontSize = "14px";
    
    header.appendChild(prevBtn);
    header.appendChild(title);
    header.appendChild(nextBtn);
    heatmapCard.appendChild(header);

    const gridWrapper = document.createElement("div");
    gridWrapper.id = "todo-heatmap-grid-wrapper";
    gridWrapper.style.transition = "opacity 0.2s ease-in-out";
    heatmapCard.appendChild(gridWrapper);
  }

  const title = heatmapCard.querySelector("#todo-heatmap-title");
  const colors = getThemeColors();
  title.style.color = colors.textPrimary;
  
  const options = { month: 'long', year: 'numeric' };
  title.textContent = "Todo Heatmap - " + currentHeatmapDate.toLocaleDateString(undefined, options);

  const gridWrapper = heatmapCard.querySelector("#todo-heatmap-grid-wrapper");
  gridWrapper.style.opacity = "0.5";

  const data = await getStorage(["todoHistory"]);
  const todoHistory = data.todoHistory || {};

  gridWrapper.innerHTML = "";

  const gridContainer = document.createElement("div");
  gridContainer.style.display = "flex";
  gridContainer.style.justifyContent = "center";
  gridContainer.style.padding = "10px 0";

  const gridDiv = document.createElement("div");
  gridDiv.style.display = "grid";
  gridDiv.style.gridTemplateColumns = "repeat(7, 16px)";
  gridDiv.style.gridAutoRows = "16px";
  gridDiv.style.gap = "6px";

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
  daysOfWeek.forEach(d => {
    const dLabel = document.createElement("div");
    dLabel.textContent = d;
    dLabel.style.textAlign = "center";
    dLabel.style.fontSize = "10px";
    dLabel.style.lineHeight = "16px";
    dLabel.style.color = colors.textSecondary;
    gridDiv.appendChild(dLabel);
  });

  const year = currentHeatmapDate.getFullYear();
  const month = currentHeatmapDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    gridDiv.appendChild(empty);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const cell = document.createElement("div");
    cell.style.borderRadius = "3px";

    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    const dayData = todoHistory[dateStr];

    if (dayData && dayData.total > 0) {
      const pct = dayData.completed / dayData.total;
      if (pct === 1) {
        cell.style.backgroundColor = colors.textPrimary;
        cell.style.color = colors.bgPrimary;
      } else if (pct >= 0.5) {
        cell.style.backgroundColor = colors.textSecondary;
        cell.style.color = colors.bgPrimary;
      } else {
        cell.style.backgroundColor = colors.bgSecondary;
        cell.style.border = `1px solid ${colors.textPrimary}`;
        cell.style.color = colors.textPrimary;
        cell.style.boxSizing = "border-box";
      }
      cell.title = `${dayData.completed} / ${dayData.total} tasks completed`;
    } else {
      cell.style.backgroundColor = colors.bgPrimary;
      cell.style.color = colors.textSecondary;
      cell.style.opacity = "0.5";
    }

    gridDiv.appendChild(cell);
  }

  gridContainer.appendChild(gridDiv);
  gridWrapper.appendChild(gridContainer);
  
  // Trigger reflow and fade in
  void gridWrapper.offsetWidth;
  gridWrapper.style.opacity = "1";
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
  await drawTodoHeatmap(container);
}

export async function refreshAnalytics(container) {
  await drawAllCharts(container);
  await drawTodoHeatmap(container);
}
