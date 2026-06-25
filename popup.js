import { getIconSvg, createQuantityPillUI } from "./modules/ui.js";
import { testSchedule as defaultSchedule } from "./modules/testData.js";
import { initChat } from "./modules/chat.js";

// === Storage Helpers ===
function getStorage(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) resolve({});
      else resolve(result);
    });
  });
}

function setStorage(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve();
    });
  });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// === Toast System ===
function showToast(message, undoCallback = null, duration = 3000) {
  const container = document.getElementById("p-toast");
  const toast = document.createElement("div");
  toast.className = "p-toast";

  const msg = document.createElement("span");
  msg.textContent = message;
  toast.appendChild(msg);

  if (undoCallback) {
    const btn = document.createElement("button");
    btn.className = "p-undo";
    btn.textContent = "Undo";
    btn.addEventListener("click", () => { undoCallback(); toast.remove(); });
    toast.appendChild(btn);
  }

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.2s";
    setTimeout(() => toast.remove(), 200);
  }, duration);
}

// === Tab Switching ===
const tabButtons = document.querySelectorAll(".popup-tab");
const tabPanels = document.querySelectorAll(".ppanel");

function switchTab(tabName) {
  tabButtons.forEach(b => b.classList.remove("active"));
  tabPanels.forEach(p => p.classList.remove("active"));
  const btn = document.querySelector(`.popup-tab[data-tab="${tabName}"]`);
  const panel = document.getElementById(`panel-${tabName}`);
  if (btn) btn.classList.add("active");
  if (panel) panel.classList.add("active");
  setStorage({ popupLastTab: tabName }).catch(() => {});
}

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});
// Load open dashboard icon dynamically
async function loadOpenDashIcon() {
  const btn = document.getElementById("openDashboard");
  if (btn) {
    const svgText = await getIconSvg("external-link");
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");
    const svgElement = doc.documentElement;
    svgElement.setAttribute("width", "16");
    svgElement.setAttribute("height", "16");
    btn.appendChild(svgElement);
  }
}


// === Open Dashboard ===
document.getElementById("openDashboard").addEventListener("click", () => {
  const dashboardUrl = chrome.runtime.getURL("dashboard.html");
  chrome.tabs.query({}, (tabs) => {
    const existing = tabs.find(t => t.url === dashboardUrl);
    if (existing) {
      chrome.tabs.update(existing.id, { active: true });
      chrome.windows.update(existing.windowId, { focused: true });
    } else {
      chrome.tabs.create({ url: "dashboard.html" });
    }
    window.close();
  });
});

// === Toggle Popup Chat ===
const openChatBtn = document.getElementById("openPopupChat");
const chatOverlay = document.getElementById("popup-chat-overlay");
if (openChatBtn && chatOverlay) {
  openChatBtn.addEventListener("click", () => {
    if (chatOverlay.style.display === "none") {
      chatOverlay.style.display = "flex";
      openChatBtn.style.color = "var(--accent)";
      setStorage({ popupChatOpen: true }).catch(() => {});
    } else {
      chatOverlay.style.display = "none";
      openChatBtn.style.color = "var(--text-secondary)";
      setStorage({ popupChatOpen: false }).catch(() => {});
    }
  });
}

// === Countdown Tab ===
const TARGET_DATE = new Date("2027-01-15T00:00:00");
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

let quoteIndex = Math.floor(Math.random() * QUOTES.length);

function updateCountdown() {
  const now = new Date();
  const diff = TARGET_DATE - now;

  if (diff <= 0) {
    document.getElementById("cd-days").textContent = "0";
    document.getElementById("cd-hours").textContent = "00";
    document.getElementById("cd-mins").textContent = "00";
    document.getElementById("cd-secs").textContent = "00";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / 1000 / 60) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  document.getElementById("cd-days").textContent = days;
  document.getElementById("cd-hours").textContent = hours.toString().padStart(2, "0");
  document.getElementById("cd-mins").textContent = mins.toString().padStart(2, "0");
  document.getElementById("cd-secs").textContent = secs.toString().padStart(2, "0");
}

async function updatePopupUpcomingTest() {
  const alertEl = document.getElementById("popup-test-alert");
  if (!alertEl) return;
  
  const now = new Date();
  const upcomingTests = dynamicTestSchedule
    .map(t => ({ ...t, dateObj: new Date(t.date) }))
    .filter(t => t.dateObj.getTime() + 86400000 >= now.getTime())
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  
  if (upcomingTests.length > 0) {
    const nextTest = upcomingTests[0];
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const testDay = new Date(nextTest.dateObj.getFullYear(), nextTest.dateObj.getMonth(), nextTest.dateObj.getDate());
    
    const timeDiff = testDay.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    const dateStr = nextTest.dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    let daysText;
    if (daysLeft <= 0) daysText = "Today!";
    else if (daysLeft === 1) daysText = "Tomorrow";
    else daysText = `In ${daysLeft} Days`;

    const alertSvg = await getIconSvg('questions');
    alertEl.innerHTML = `
      <div class="popup-alert-icon">${alertSvg}</div>
      <div class="popup-alert-content">
        <div class="popup-alert-title">${nextTest.name}</div>
        <div class="popup-alert-date">${dateStr} · <span class="popup-accent-text">${daysText}</span></div>
      </div>
    `;
    alertEl.style.display = "flex";
    return;
  }
  
  alertEl.style.display = "none";
}

async function loadStreak() {
  chrome.storage.local.get("timer", async (result) => {
    const timer = result.timer || { streak: 0 };
    const flameSvgText = await getIconSvg("flame");
    const parser = new DOMParser();
    const doc = parser.parseFromString(flameSvgText, "image/svg+xml");
    const svgElement = doc.documentElement;
    svgElement.setAttribute("width", "24");
    svgElement.setAttribute("height", "24");
    
    const streakEl = document.getElementById("streak");
    if (streakEl) {
      streakEl.innerHTML = "";
      streakEl.appendChild(svgElement);
      streakEl.appendChild(document.createTextNode(` ${timer.streak || 0} day streak`));
    }
  });
}

function rotateQuote() {
  const el = document.getElementById("cd-quote");
  el.style.opacity = "0";
  setTimeout(() => {
    quoteIndex = (quoteIndex + 1) % QUOTES.length;
    el.textContent = `"${QUOTES[quoteIndex]}"`;
    el.style.opacity = "1";
  }, 300);
}

// === Questions Tab ===
const CATEGORY_COLORS = {
  Topic: "#7c5cfc", Module: "#00b4d8", DIBY: "#f77f00",
  DPP: "#06d6a0", KPP: "#ef476f", Homework: "#ffd166", Class: "#118ab2"
};

let questions = [];

function getAllTags() {
  const tags = new Set();
  questions.forEach(q => q.tags.forEach(t => tags.add(t)));
  return [...tags];
}

function updateTagDatalist(datalistId) {
  const dl = document.getElementById(datalistId);
  if (!dl) return;
  dl.innerHTML = "";
  getAllTags().forEach(tag => {
    const opt = document.createElement("option");
    opt.value = tag;
    dl.appendChild(opt);
  });
}

function renderQuestions() {
  const list = document.getElementById("q-list");
  list.innerHTML = "";

  const sorted = [...questions].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

  if (sorted.length === 0) {
    list.innerHTML = '<div class="p-empty">No questions logged yet</div>';
    return;
  }

  sorted.forEach(q => {
    const item = document.createElement("div");
    item.className = "p-item";

    const header = document.createElement("div");
    header.className = "p-item-header";

    const badge = document.createElement("span");
    badge.className = "p-badge";
    badge.textContent = q.category;
    badge.style.background = (CATEGORY_COLORS[q.category] || "#7c5cfc") + "33";
    badge.style.color = CATEGORY_COLORS[q.category] || "#7c5cfc";
    header.appendChild(badge);

    const text = document.createElement("span");
    text.className = "p-item-text";
    let qText = q.questionNumber;
    if (q.chapterTopic) qText += ` • ${q.chapterTopic}`;
    if (q.category === "Class" && q.lectureNumber) qText += ` • Lec ${q.lectureNumber}`;
    text.textContent = qText;
    header.appendChild(text);

    const meta = document.createElement("span");
    meta.className = "p-item-meta";
    meta.textContent = new Date(q.addedAt).toLocaleDateString();
    header.appendChild(meta);

    const del = document.createElement("button");
    del.className = "p-item-delete";
    del.textContent = "\u00d7";
    del.addEventListener("click", () => deleteQuestion(q.id));
    header.appendChild(del);

    item.appendChild(header);

    if (q.tags && q.tags.length > 0) {
      const tagsRow = document.createElement("div");
      tagsRow.className = "p-item-tags";
      q.tags.forEach(tag => {
        const pill = document.createElement("span");
        pill.className = "p-tag";
        pill.textContent = tag;
        tagsRow.appendChild(pill);
      });
      item.appendChild(tagsRow);
    }

    if (q.images && q.images.length > 0) {
      const imgsRow = document.createElement("div");
      imgsRow.className = "mistake-images";
      imgsRow.style.marginTop = "8px";
      q.images.forEach(imgData => {
        const img = document.createElement("img");
        img.src = imgData;
        imgsRow.appendChild(img);
      });
      item.appendChild(imgsRow);
    } else if (q.imageUrl) {
      const imgsRow = document.createElement("div");
      imgsRow.className = "mistake-images";
      imgsRow.style.marginTop = "8px";
      const img = document.createElement("img");
      img.src = q.imageUrl;
      imgsRow.appendChild(img);
      item.appendChild(imgsRow);
    }

    list.appendChild(item);
  });
}

async function addQuestion() {
  const catEl = document.getElementById("q-cat");
  const numEl = document.getElementById("q-num");
  const chapEl = document.getElementById("q-chap");
  const lecEl = document.getElementById("q-lec");
  const tagsEl = document.getElementById("q-tags");

  const questionNumber = numEl.value.trim();
  if (!questionNumber) { numEl.focus(); return; }

  const newItem = {
    id: generateId(),
    category: catEl.value,
    questionNumber,
    chapterTopic: chapEl.value.trim(),
    lectureNumber: catEl.value === "Class" ? lecEl.value.trim() : "",
    tags: tagsEl.value.trim().split(",").map(t => t.trim()).filter(Boolean),
    addedAt: new Date().toISOString(),
    images: [...currentQImages]
  };

  questions.push(newItem);
  await setStorage({ questions });

  const qHist = await getStorage(["questionHistory"]);
  const history = qHist.questionHistory || [];
  const today = new Date().toISOString().slice(0, 10);
  const entry = history.find(h => h.date === today);
  if (entry) entry.count++; else history.push({ date: today, count: 1 });
  await setStorage({ questionHistory: history });

  numEl.value = "";
  chapEl.value = "";
  lecEl.value = "";
  tagsEl.value = "";
  clearQImages();
  numEl.focus();

  updateTagDatalist("q-tag-list");
  updateTagDatalist("m-tag-list");
  renderQuestions();
  showToast("Question added!");
}

async function deleteQuestion(id) {
  const idx = questions.findIndex(q => q.id === id);
  if (idx === -1) return;
  const deleted = questions[idx];
  questions.splice(idx, 1);
  await setStorage({ questions });
  renderQuestions();
  showToast("Question deleted.", () => {
    questions.push(deleted);
    setStorage({ questions });
    renderQuestions();
  });
}

document.getElementById("q-add").addEventListener("click", addQuestion);
const handleQSubmit = e => { if (e.key === "Enter" && e.ctrlKey) addQuestion(); };
document.getElementById("q-num").addEventListener("keydown", handleQSubmit);
document.getElementById("q-chap").addEventListener("keydown", handleQSubmit);
document.getElementById("q-lec").addEventListener("keydown", handleQSubmit);
document.getElementById("q-tags").addEventListener("keydown", handleQSubmit);

let currentQImages = [];
const qImgUpload = document.getElementById("q-img-upload");
const qImgPreviewWrap = document.getElementById("q-img-preview");

function renderQImages() {
  if (!qImgPreviewWrap) return;
  qImgPreviewWrap.innerHTML = "";
  if (currentQImages.length === 0) {
    qImgPreviewWrap.style.display = "none";
    return;
  }
  qImgPreviewWrap.style.display = "flex";
  currentQImages.forEach((dataUrl, idx) => {
    const thumb = document.createElement("div");
    thumb.className = "multi-img-thumb";
    thumb.innerHTML = `<img src="${dataUrl}"> <button data-idx="${idx}">&times;</button>`;
    thumb.querySelector("button").addEventListener("click", () => {
      currentQImages.splice(idx, 1);
      renderQImages();
    });
    qImgPreviewWrap.appendChild(thumb);
  });
}

function clearQImages() {
  currentQImages = [];
  renderQImages();
  if (qImgUpload) qImgUpload.value = "";
}

if (qImgUpload) {
  qImgUpload.addEventListener("change", (e) => {
    const files = e.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          currentQImages.push(ev.target.result);
          renderQImages();
        };
        reader.readAsDataURL(file);
      }
    }
  });
}

const qScreenshotBtn = document.getElementById("q-screenshot-btn");
if (qScreenshotBtn) {
  qScreenshotBtn.addEventListener("click", () => {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, function (dataUrl) {
      if (chrome.runtime.lastError) {
        showToast("Error capturing tab. Make sure you are on a valid webpage.");
      } else if (dataUrl) {
        currentQImages.push(dataUrl);
        renderQImages();
      }
    });
  });
}

function setupDragAndDrop(panel, targetArray, renderFunc) {
  if (!panel) return;
  panel.style.position = "relative";
  const dndOverlay = document.createElement("div");
  dndOverlay.className = "dnd-overlay";
  dndOverlay.innerHTML = "Drop image here";
  panel.appendChild(dndOverlay);

  panel.addEventListener("dragover", (e) => {
    e.preventDefault();
    panel.classList.add("drag-over");
  });

  panel.addEventListener("dragleave", (e) => {
    e.preventDefault();
    panel.classList.remove("drag-over");
  });

  panel.addEventListener("drop", (e) => {
    e.preventDefault();
    panel.classList.remove("drag-over");
    if (e.dataTransfer && e.dataTransfer.files) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (file && file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            targetArray.push(ev.target.result);
            renderFunc();
          };
          reader.readAsDataURL(file);
        }
      }
    }
  });
}

const panelQuestions = document.getElementById("panel-questions");
if (panelQuestions) {
  panelQuestions.addEventListener("paste", (e) => {
    const items = e.clipboardData.items;
    let pasted = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (ev) => {
          currentQImages.push(ev.target.result);
          renderQImages();
        };
        reader.readAsDataURL(blob);
        pasted = true;
      }
    }
    if (pasted) e.preventDefault();
  });
}

let mImages = [];
const mImgPreview = document.getElementById("m-img-preview");

function renderMImages() {
  if (!mImgPreview) return;
  mImgPreview.innerHTML = "";
  if (mImages.length === 0) {
    mImgPreview.style.display = "none";
    return;
  }
  mImgPreview.style.display = "flex";
  mImages.forEach((dataUrl, idx) => {
    const thumb = document.createElement("div");
    thumb.className = "multi-img-thumb";
    thumb.innerHTML = `<img src="${dataUrl}"> <button data-idx="${idx}">&times;</button>`;
    thumb.querySelector("button").addEventListener("click", () => {
      mImages.splice(idx, 1);
      renderMImages();
    });
    mImgPreview.appendChild(thumb);
  });
}

const panelMistakes = document.getElementById("panel-mistakes");
if (panelMistakes) {
  panelMistakes.addEventListener("paste", (e) => {
    const items = e.clipboardData.items;
    let pasted = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (ev) => {
          mImages.push(ev.target.result);
          renderMImages();
        };
        reader.readAsDataURL(blob);
        pasted = true;
      }
    }
    if (pasted) e.preventDefault();
  });
}

// Initialize lecture input visibility
const qLec = document.getElementById("q-lec");
const qCat = document.getElementById("q-cat");
if (qCat && qLec) {
  qLec.style.display = qCat.value === "Class" ? "block" : "none";
  qCat.addEventListener("change", e => {
    if (e.target.value === "Class") {
      qLec.style.display = "block";
    } else {
      qLec.style.display = "none";
      qLec.value = "";
    }
  });
}

// === Mistakes Tab ===
const SUBJECT_COLORS = {
  Physics: "#7c5cfc", Chemistry: "#06d6a0", Mathematics: "#ef476f", Other: "#ffd166"
};

let mistakes = [];

function renderMistakes() {
  const list = document.getElementById("m-list");
  list.innerHTML = "";

  const sorted = [...mistakes].sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));

  if (sorted.length === 0) {
    list.innerHTML = '<div class="p-empty">No mistakes logged yet</div>';
    return;
  }

  sorted.forEach(m => {
    const item = document.createElement("div");
    item.className = "p-item";

    const header = document.createElement("div");
    header.className = "p-item-header";

    const badge = document.createElement("span");
    badge.className = "p-badge";
    badge.textContent = m.subject;
    badge.style.background = (SUBJECT_COLORS[m.subject] || "#7c5cfc") + "33";
    badge.style.color = SUBJECT_COLORS[m.subject] || "#7c5cfc";
    header.appendChild(badge);

    const meta = document.createElement("span");
    meta.className = "p-item-meta";
    meta.textContent = new Date(m.loggedAt).toLocaleDateString();
    header.appendChild(meta);

    const del = document.createElement("button");
    del.className = "p-item-delete";
    del.textContent = "\u00d7";
    del.addEventListener("click", () => deleteMistake(m.id));
    header.appendChild(del);

    item.appendChild(header);

    const textEl = document.createElement("div");
    textEl.className = "p-item-text";
    textEl.style.marginBottom = "4px";
    textEl.textContent = m.text;
    item.appendChild(textEl);

    if (m.tags && m.tags.length > 0) {
      const tagsRow = document.createElement("div");
      tagsRow.className = "p-item-tags";
      m.tags.forEach(tag => {
        const pill = document.createElement("span");
        pill.className = "p-tag";
        pill.textContent = tag;
        tagsRow.appendChild(pill);
      });
      item.appendChild(tagsRow);
    }

    if (m.images && m.images.length > 0) {
      const imgsRow = document.createElement("div");
      imgsRow.className = "mistake-images";
      imgsRow.style.marginTop = "8px";
      m.images.forEach(imgData => {
        const img = document.createElement("img");
        img.src = imgData;
        imgsRow.appendChild(img);
      });
      item.appendChild(imgsRow);
    }

    list.appendChild(item);
  });
}

async function addMistake() {
  const subjEl = document.getElementById("m-subject");
  const textEl = document.getElementById("m-text");
  const tagsEl = document.getElementById("m-tags");

  const text = textEl.value.trim();
  if (!text) { textEl.focus(); return; }

  const newItem = {
    id: generateId(),
    subject: subjEl.value,
    text,
    tags: tagsEl.value.trim().split(",").map(t => t.trim()).filter(Boolean),
    images: [...mImages],
    loggedAt: new Date().toISOString()
  };

  mistakes.push(newItem);
  await setStorage({ mistakes });

  const mHist = await getStorage(["mistakeHistory"]);
  const history = mHist.mistakeHistory || [];
  const today = new Date().toISOString().slice(0, 10);
  const entry = history.find(h => h.date === today);
  if (entry) entry.count++; else history.push({ date: today, count: 1 });
  await setStorage({ mistakeHistory: history });

  textEl.value = "";
  tagsEl.value = "";
  mImages = [];
  renderMImages();
  textEl.focus();

  updateTagDatalist("m-tag-list");
  updateTagDatalist("q-tag-list");
  renderMistakes();
  showToast("Mistake logged!");
}

async function deleteMistake(id) {
  const idx = mistakes.findIndex(m => m.id === id);
  if (idx === -1) return;
  const deleted = mistakes[idx];
  mistakes.splice(idx, 1);
  await setStorage({ mistakes });
  renderMistakes();
  showToast("Mistake deleted.", () => {
    mistakes.push(deleted);
    setStorage({ mistakes });
    renderMistakes();
  });
}

document.getElementById("m-add").addEventListener("click", addMistake);
document.getElementById("m-text").addEventListener("keydown", e => {
  if (e.key === "Enter" && e.ctrlKey) addMistake();
});
document.getElementById("m-tags").addEventListener("keydown", e => { if (e.key === "Enter") addMistake(); });

// === Backlog Tab ===
let backlog = [];

function renderBacklog() {
  const list = document.getElementById("b-list");
  list.innerHTML = "";

  const sorted = [...backlog].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

  if (sorted.length === 0) {
    list.innerHTML = '<div class="p-empty">No backlog items yet</div>';
    updateBacklogProgress();
    return;
  }

  sorted.forEach(b => {
    const item = document.createElement("div");
    item.className = "b-item";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.className = "b-checkbox";
    cb.checked = b.done;
    cb.addEventListener("change", () => toggleBacklog(b.id));
    item.appendChild(cb);

    const label = document.createElement("span");
    label.className = "b-label" + (b.done ? " done" : "");
    label.textContent = b.text;
    label.style.flex = "1";
    item.appendChild(label);

    if (b.hasQuantity) {
      const decFn = async () => {
        if (b.completedQuantity > 0) {
          b.completedQuantity--;
          if (b.done && b.completedQuantity < b.targetQuantity) b.done = false;
          await setStorage({ backlog });
          renderBacklog();
          syncBadge();
        }
      };

      const incFn = async () => {
        if (b.completedQuantity < b.targetQuantity) {
          b.completedQuantity++;
          if (b.completedQuantity === b.targetQuantity) {
            b.done = true;
            showToast("Sub-tasks completed!");
          }
          await setStorage({ backlog });
          renderBacklog();
          syncBadge();
        }
      };

      const qtyContainer = createQuantityPillUI(b, decFn, incFn, true);
      item.appendChild(qtyContainer);
    }

    const del = document.createElement("button");
    del.className = "p-item-delete";
    del.textContent = "\u00d7";
    del.addEventListener("click", () => deleteBacklog(b.id));
    item.appendChild(del);

    list.appendChild(item);
  });

  updateBacklogProgress();
}

function updateBacklogProgress() {
  const totalItems = backlog.length;
  let completedItems = 0;
  let totalScore = 0;
  
  backlog.forEach(item => {
    if (item.done) completedItems++;
    if (item.hasQuantity && item.targetQuantity > 0) {
      totalScore += (item.completedQuantity / item.targetQuantity);
    } else {
      totalScore += item.done ? 1 : 0;
    }
  });

  const pct = totalItems === 0 ? 0 : Math.round((totalScore / totalItems) * 100);
  document.getElementById("b-fill").style.width = pct + "%";
  document.getElementById("b-text").textContent = `${completedItems} of ${totalItems} complete (${pct}%)`;
}

async function syncBadge() {
  const pending = backlog.filter(b => !b.done).length;
  try { chrome.runtime.sendMessage({ action: "updateBadge", count: pending }); } catch(e) {}
}

async function addBacklog() {
  const input = document.getElementById("b-input");
  const trackCb = document.getElementById("b-track-qty");
  const targetIn = document.getElementById("b-target");
  const text = input.value.trim();
  if (!text) { input.focus(); return; }

  const hasQuantity = trackCb ? trackCb.checked : false;
  let targetQuantity = 0;
  if (hasQuantity) {
    targetQuantity = parseInt(targetIn.value, 10);
    if (isNaN(targetQuantity) || targetQuantity <= 0) {
      showToast("Please enter a valid target quantity.");
      targetIn.focus();
      return;
    }
  }

  const newItem = { id: generateId(), text, done: false, addedAt: new Date().toISOString() };
  if (hasQuantity) {
    newItem.hasQuantity = true;
    newItem.targetQuantity = targetQuantity;
    newItem.completedQuantity = 0;
  }

  backlog.push(newItem);
  await setStorage({ backlog });
  input.value = "";
  if (trackCb) trackCb.checked = false;
  if (targetIn) { targetIn.value = ""; targetIn.style.display = "none"; }
  input.focus();
  renderBacklog();
  syncBadge();
  showToast("Backlog item added!");
}

async function toggleBacklog(id) {
  const item = backlog.find(b => b.id === id);
  if (!item) return;
  item.done = !item.done;
  if (item.hasQuantity) {
    if (item.done) item.completedQuantity = item.targetQuantity;
    else item.completedQuantity = 0;
  }
  await setStorage({ backlog });
  renderBacklog();
  syncBadge();
}

async function deleteBacklog(id) {
  const idx = backlog.findIndex(b => b.id === id);
  if (idx === -1) return;
  const deleted = backlog[idx];
  backlog.splice(idx, 1);
  await setStorage({ backlog });
  renderBacklog();
  syncBadge();
  showToast("Item deleted.", () => {
    backlog.push(deleted);
    setStorage({ backlog });
    renderBacklog();
    syncBadge();
  });
}

document.getElementById("b-add").addEventListener("click", addBacklog);
document.getElementById("b-input").addEventListener("keydown", e => { if (e.key === "Enter") addBacklog(); });

const bTrackQty = document.getElementById("b-track-qty");
const bTarget = document.getElementById("b-target");
if (bTrackQty && bTarget) {
  bTrackQty.addEventListener("change", () => {
    bTarget.style.display = bTrackQty.checked ? "block" : "none";
  });
}

// === Timer Tab ===
let timerInterval = null;
let tMode = "focus";
let tFocusDur = 25;
let tBreakDur = 5;
let tEndTime = null;
let tRunning = false;
let tSessionsToday = 0;
let tStreak = 0;

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 440;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
    setTimeout(() => ctx.close(), 300);
  } catch(e) {}
}

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function isYesterday(dateStr) {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return dateStr === `${y.getFullYear()}-${String(y.getMonth()+1).padStart(2,"0")}-${String(y.getDate()).padStart(2,"0")}`;
}

function updateTimerDisplay() {
  if (!tRunning || !tEndTime) return;

  const now = Date.now();
  const remaining = Math.max(0, Math.ceil((tEndTime - now) / 1000));
  const totalSecs = (tMode === "focus" ? tFocusDur : tBreakDur) * 60;
  const elapsed = totalSecs - remaining;
  const pct = totalSecs > 0 ? elapsed / totalSecs : 0;

  document.getElementById("t-display").textContent = formatTime(remaining);

  if (remaining <= 0) {
    clearInterval(timerInterval);
    timerInterval = null;
    tRunning = false;
    playBeep();

    if (tMode === "focus") {
      recordSession();
      tMode = "break";
      document.getElementById("t-mode").textContent = "Break";
      document.getElementById("t-start").textContent = "Start";
      startBreak();
    } else {
      tMode = "focus";
      document.getElementById("t-mode").textContent = "Focus";
      tEndTime = null;
      saveTimerState();
      document.getElementById("t-display").textContent = formatTime(tFocusDur * 60);
      document.getElementById("t-start").textContent = "Start";
      showToast("Break complete! Ready for next session?");
    }
  }
}

async function recordSession() {
  const data = await getStorage(["timer", "sessionHistory"]);
  const timer = data.timer || {};
  const today = getTodayStr();

  if (timer.lastSessionDate === today) {
    timer.sessionsToday = (timer.sessionsToday || 0) + 1;
  } else if (isYesterday(timer.lastSessionDate)) {
    timer.streak = (timer.streak || 0) + 1;
    timer.sessionsToday = 1;
    timer.lastSessionDate = today;
  } else {
    timer.streak = 1;
    timer.sessionsToday = 1;
    timer.lastSessionDate = today;
  }
  timer.totalSessions = (timer.totalSessions || 0) + 1;

  const history = data.sessionHistory || [];
  const entry = history.find(h => h.date === today);
  if (entry) entry.count++; else history.push({ date: today, count: 1 });

  await setStorage({ timer, sessionHistory: history });
  showToast("Focus session complete!");

  tSessionsToday = timer.sessionsToday;
  tStreak = timer.streak;
  await updateTimerStats(tSessionsToday, tStreak);
}

async function updateTimerStats(sessions, streak) {
  const flameSvgText = await getIconSvg("flame");
  const parser = new DOMParser();
  const doc = parser.parseFromString(flameSvgText, "image/svg+xml");
  const svgElement = doc.documentElement;
  svgElement.setAttribute("width", "16");
  svgElement.setAttribute("height", "16");
  svgElement.style.verticalAlign = "text-bottom";
  
  const statsEl = document.getElementById("t-stats");
  if (statsEl) {
    statsEl.innerHTML = `Today: ${sessions} sessions &middot; Streak: ${streak} `;
    statsEl.appendChild(svgElement);
  }
}

async function saveTimerState() {
  const data = await getStorage(["timer"]);
  const timer = data.timer || {};
  timer.endTime = tEndTime;
  timer.isRunning = tRunning;
  timer.mode = tMode;
  timer.focusDuration = tFocusDur;
  timer.breakDuration = tBreakDur;
  timer.sessionsToday = tSessionsToday;
  timer.streak = tStreak;
  await setStorage({ timer });
}

function startBreak() {
  tEndTime = Date.now() + tBreakDur * 60 * 1000;
  tRunning = true;
  saveTimerState();
  document.getElementById("t-start").textContent = "Pause";
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimerDisplay, 1000);
  updateTimerDisplay();
}

function toggleTimer() {
  if (tRunning) {
    clearInterval(timerInterval);
    timerInterval = null;
    tRunning = false;
    document.getElementById("t-start").textContent = "Start";
    saveTimerState();
    try { chrome.runtime.sendMessage({ action: "stopTimer" }); } catch(e) {}
  } else {
    const remaining = tEndTime
      ? Math.max(0, Math.ceil((tEndTime - Date.now()) / 1000))
      : (tMode === "focus" ? tFocusDur : tBreakDur) * 60;
    tEndTime = Date.now() + remaining * 1000;
    tRunning = true;
    document.getElementById("t-start").textContent = "Pause";
    saveTimerState();
    try { chrome.runtime.sendMessage({ action: "startTimer", duration: Math.ceil(remaining / 60) }); } catch(e) {}
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimerDisplay, 1000);
    updateTimerDisplay();
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  tRunning = false;
  tEndTime = null;
  tMode = "focus";
  document.getElementById("t-mode").textContent = "Focus";
  document.getElementById("t-start").textContent = "Start";
  document.getElementById("t-display").textContent = formatTime(tFocusDur * 60);
  saveTimerState();
  try { chrome.runtime.sendMessage({ action: "stopTimer" }); } catch(e) {}
}

document.getElementById("t-start").addEventListener("click", toggleTimer);
document.getElementById("t-reset").addEventListener("click", resetTimer);

document.querySelectorAll(".tp-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tp-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const focus = btn.dataset.focus;
    if (focus === "custom") {
      document.getElementById("custom-timer-wrap").style.display = "flex";
      return;
    }

    document.getElementById("custom-timer-wrap").style.display = "none";
    tFocusDur = parseInt(focus);
    tBreakDur = parseInt(btn.dataset.break);

    if (!tRunning) {
      tEndTime = null;
      tMode = "focus";
      document.getElementById("t-mode").textContent = "Focus";
      document.getElementById("t-display").textContent = formatTime(tFocusDur * 60);
      document.getElementById("t-start").textContent = "Start";
    }
    saveTimerState();
  });
});

document.getElementById("t-custom-focus").addEventListener("change", () => {
  tFocusDur = parseInt(document.getElementById("t-custom-focus").value) || 30;
  tBreakDur = parseInt(document.getElementById("t-custom-break").value) || 5;
  if (!tRunning) {
    tEndTime = null;
    tMode = "focus";
    document.getElementById("t-mode").textContent = "Focus";
    document.getElementById("t-display").textContent = formatTime(tFocusDur * 60);
    document.getElementById("t-start").textContent = "Start";
  }
  saveTimerState();
});

document.getElementById("t-custom-break").addEventListener("change", () => {
  tBreakDur = parseInt(document.getElementById("t-custom-break").value) || 5;
  saveTimerState();
});

// === Notes Tab ===
let notesSaveTimeout = null;
let popupNotesData = { Physics: [], Chemistry: [], Math: [] };

function renderPopupNotes() {
  const container = document.getElementById("p-notes-container");
  if (!container) return;
  container.innerHTML = "";
  
  ["Physics", "Chemistry", "Math"].forEach(subject => {
    const section = document.createElement("div");
    section.className = "p-note-section";
    section.style.marginBottom = "16px";
    
    const header = document.createElement("div");
    header.className = "p-note-header";
    header.style.marginBottom = "6px";
    header.style.fontWeight = "600";
    header.style.color = "#ddd";
    header.textContent = subject;
    section.appendChild(header);
    
    if (!popupNotesData[subject]) popupNotesData[subject] = [];
    if (popupNotesData[subject].length === 0) {
      popupNotesData[subject].push({ id: Date.now().toString(), text: "" });
    }
    
    popupNotesData[subject].forEach((note, idx) => {
      const noteWrap = document.createElement("div");
      noteWrap.style.position = "relative";
      noteWrap.style.marginBottom = "6px";

      const ta = document.createElement("textarea");
      ta.className = "p-textarea";
      ta.value = note.text;
      ta.rows = 3;
      ta.placeholder = `Add ${subject} note...`;
      ta.style.paddingRight = "24px";
      ta.addEventListener("input", (e) => {
        popupNotesData[subject][idx].text = e.target.value;
        debouncedNotesSave();
      });
      noteWrap.appendChild(ta);

      const delBtn = document.createElement("button");
      delBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      delBtn.style.position = "absolute";
      delBtn.style.top = "6px";
      delBtn.style.right = "6px";
      delBtn.style.background = "transparent";
      delBtn.style.border = "none";
      delBtn.style.color = "#888";
      delBtn.style.cursor = "pointer";
      delBtn.addEventListener("click", () => {
        popupNotesData[subject].splice(idx, 1);
        debouncedNotesSave();
        renderPopupNotes();
      });
      noteWrap.appendChild(delBtn);

      section.appendChild(noteWrap);
    });
    
    const addBtn = document.createElement("button");
    addBtn.className = "p-btn p-btn-ghost";
    addBtn.textContent = "+ Add Note";
    addBtn.style.padding = "4px 8px";
    addBtn.style.fontSize = "0.7rem";
    addBtn.addEventListener("click", () => {
      popupNotesData[subject].push({ id: Date.now().toString() + Math.random().toString(36).substr(2, 5), text: "" });
      renderPopupNotes();
      debouncedNotesSave();
    });
    section.appendChild(addBtn);
    
    container.appendChild(section);
  });
}

function debouncedNotesSave() {
  if (notesSaveTimeout) clearTimeout(notesSaveTimeout);
  notesSaveTimeout = setTimeout(async () => {
    await setStorage({ subjectNotes: popupNotesData });
  }, 500);
}

// === Keyboard Shortcuts ===
document.addEventListener("keydown", e => {
  if (e.altKey && e.key >= "1" && e.key <= "6") {
    e.preventDefault();
    const tabs = ["countdown", "questions", "mistakes", "backlog", "timer", "notes"];
    const idx = parseInt(e.key) - 1;
    if (tabs[idx]) switchTab(tabs[idx]);
  }
});



// === Init ===
async function initPopup() {
  let data = await getStorage(['testSchedule', 'popupLastTab', 'popupChatOpen', 'questions', 'mistakes', 'backlog', 'subjectNotes', 'timer', 'notes']);
  
  if (data.popupLastTab) {
    switchTab(data.popupLastTab);
  }
  
  if (data.popupChatOpen) {
    const chatOverlay = document.getElementById("popup-chat-overlay");
    const openChatBtn = document.getElementById("openPopupChat");
    if (chatOverlay && openChatBtn) {
      chatOverlay.style.display = "flex";
      openChatBtn.style.color = "var(--accent)";
    }
  }
  dynamicTestSchedule = data.testSchedule ? data.testSchedule : defaultSchedule.map(t => ({
    name: t.name,
    date: t.date.toISOString(),
    id: Date.now().toString() + Math.random().toString(36).substring(2, 5)
  }));
  
  updatePopupUpcomingTest();
  
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.testSchedule) {
      dynamicTestSchedule = changes.testSchedule.newValue || [];
      updatePopupUpcomingTest();
    }
  });

  await loadOpenDashIcon();
  updateCountdown();
  setInterval(updateCountdown, 1000);
  setInterval(rotateQuote, 30000);
  document.getElementById("cd-quote").textContent = `"${QUOTES[quoteIndex]}"`;

  await loadStreak();

  questions = data.questions || [];
  renderQuestions();
  updateTagDatalist("q-tag-list");

  mistakes = data.mistakes || [];
  renderMistakes();
  updateTagDatalist("m-tag-list");

  backlog = data.backlog || [];
  renderBacklog();
  syncBadge();

  const timer = data.timer || {};
  tSessionsToday = timer.sessionsToday || 0;
  tStreak = timer.streak || 0;
  tFocusDur = timer.focusDuration || 25;
  tBreakDur = timer.breakDuration || 5;
  tMode = timer.mode || "focus";
  tEndTime = timer.endTime || null;
  tRunning = timer.isRunning || false;

  document.getElementById("t-display").textContent = formatTime(tFocusDur * 60);
  document.getElementById("t-mode").textContent = tMode === "focus" ? "Focus" : "Break";
  document.getElementById("t-start").textContent = tRunning ? "Pause" : "Start";
  await updateTimerStats(tSessionsToday, tStreak);

  if (tRunning && tEndTime) {
    timerInterval = setInterval(updateTimerDisplay, 1000);
    updateTimerDisplay();
  }

  if (data.subjectNotes) {
    popupNotesData = data.subjectNotes;
  } else if (data.notes && typeof data.notes === "string") {
    popupNotesData.Physics.push({ id: Date.now().toString(), text: data.notes });
  }
  renderPopupNotes();

  const chatContainer = document.getElementById("p-chat-container");
  if (chatContainer) {
    initChat(chatContainer);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPopup);
} else {
  initPopup();
}

setupDragAndDrop(panelQuestions, currentQImages, renderQImages);
setupDragAndDrop(document.getElementById("panel-mistakes"), mImages, renderMImages);
