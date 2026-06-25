import { getStorage, setStorage, generateId } from "./storage.js";
import { createCustomDropdown } from "./ui.js";

const SUBJECTS = ["Physics", "Chemistry", "Mathematics", "Other"];

const SUBJECT_COLORS = {
  Physics: "#7c5cfc",
  Chemistry: "#06d6a0",
  Mathematics: "#ef476f",
  Other: "#ffd166"
};

let mistakes = [];
let searchQuery = "";
let deletedItem = null;
let undoTimeout = null;

function showToast(message, undoCallback) {
  document.dispatchEvent(new CustomEvent("show-toast", {
    detail: { message, undoCallback }
  }));
}

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function incrementMistakeCount() {
  const data = await getStorage(["mistakeHistory"]);
  const history = data.mistakeHistory || [];
  const today = getTodayString();
  const entry = history.find((h) => h.date === today);
  if (entry) {
    entry.count++;
  } else {
    history.push({ date: today, count: 1 });
  }
  await setStorage({ mistakeHistory: history });
}

function getAllTags() {
  const tagSet = new Set();
  mistakes.forEach((m) => {
    m.tags.forEach((t) => tagSet.add(t));
  });
  return [...tagSet];
}

function getFilteredMistakes() {
  if (!searchQuery) return [...mistakes];
  const q = searchQuery.toLowerCase();
  if (q.startsWith("#")) {
    const tag = q.slice(1);
    return mistakes.filter((item) =>
      item.tags.some((t) => t.toLowerCase().includes(tag))
    );
  }
  return mistakes.filter((item) =>
    item.text.toLowerCase().includes(q) ||
    item.subject.toLowerCase().includes(q) ||
    item.tags.some((t) => t.toLowerCase().includes(q))
  );
}

async function processReview(id, score, container) {
  const index = mistakes.findIndex((m) => m.id === id);
  if (index === -1) return;
  const item = mistakes[index];

  if (score === 1) { // Forgot
    item.interval = 1;
    item.easeFactor = Math.max(1.3, item.easeFactor - 0.2);
  } else if (score === 3) { // Struggled
    item.interval = Math.max(1, Math.round(item.interval * 1.2));
    item.easeFactor = Math.max(1.3, item.easeFactor - 0.15);
  } else if (score === 5) { // Got It
    if (item.reviews === 0) item.interval = 1;
    else if (item.reviews === 1) item.interval = 6;
    else item.interval = Math.round(item.interval * item.easeFactor);
    item.easeFactor += 0.1;
  }

  item.reviews = (item.reviews || 0) + 1;
  const d = new Date();
  d.setDate(d.getDate() + item.interval);
  item.nextReviewDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  await setStorage({ mistakes });
  renderList(container);
}

function createCard(item, container, isDue) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.id = item.id;

  const header = document.createElement("div");
  header.className = "card-header";

  const badge = document.createElement("span");
  badge.className = "category-badge";
  badge.textContent = item.subject;
  badge.style.backgroundColor = SUBJECT_COLORS[item.subject] || "#7c5cfc";
  badge.style.color = "#fff";
  header.appendChild(badge);

  const time = document.createElement("span");
  time.className = "card-time";
  const d = new Date(item.loggedAt);
  time.textContent = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  header.appendChild(time);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "\u00d7";
  deleteBtn.title = "Delete";
  deleteBtn.addEventListener("click", () => deleteMistake(item.id, container));
  header.appendChild(deleteBtn);

  card.appendChild(header);

  const textEl = document.createElement("div");
  textEl.className = "mistake-text";
  textEl.textContent = item.text;
  card.appendChild(textEl);

  if (item.tags && item.tags.length > 0) {
    const tagsRow = document.createElement("div");
    tagsRow.className = "tags-row";
    item.tags.forEach((tag) => {
      const pill = document.createElement("span");
      pill.className = "tag";
      pill.textContent = tag;
      tagsRow.appendChild(pill);
    });
    card.appendChild(tagsRow);
  }

  if (item.images && item.images.length > 0) {
    const imgsRow = document.createElement("div");
    imgsRow.className = "mistake-images";
    item.images.forEach(imgData => {
      const img = document.createElement("img");
      img.src = imgData;
      imgsRow.appendChild(img);
    });
    card.appendChild(imgsRow);
  }

  if (isDue) {
    const reviewRow = document.createElement("div");
    reviewRow.className = "review-row";
    reviewRow.style.marginTop = "12px";
    reviewRow.style.display = "flex";
    reviewRow.style.gap = "8px";
    
    const label = document.createElement("span");
    label.textContent = "How well did you remember this?";
    label.style.fontSize = "12px";
    label.style.color = "var(--text-secondary)";
    label.style.flex = "1";
    label.style.alignSelf = "center";
    reviewRow.appendChild(label);

    const btnForgot = document.createElement("button");
    btnForgot.className = "btn";
    btnForgot.style.backgroundColor = "#ef476f";
    btnForgot.style.color = "#fff";
    btnForgot.style.padding = "4px 8px";
    btnForgot.textContent = "Forgot";
    btnForgot.addEventListener("click", () => processReview(item.id, 1, container));
    
    const btnStruggled = document.createElement("button");
    btnStruggled.className = "btn";
    btnStruggled.style.backgroundColor = "#ffd166";
    btnStruggled.style.color = "#000";
    btnStruggled.style.padding = "4px 8px";
    btnStruggled.textContent = "Struggled";
    btnStruggled.addEventListener("click", () => processReview(item.id, 3, container));
    
    const btnGotIt = document.createElement("button");
    btnGotIt.className = "btn";
    btnGotIt.style.backgroundColor = "#06d6a0";
    btnGotIt.style.color = "#000";
    btnGotIt.style.padding = "4px 8px";
    btnGotIt.textContent = "Got It";
    btnGotIt.addEventListener("click", () => processReview(item.id, 5, container));

    reviewRow.appendChild(btnForgot);
    reviewRow.appendChild(btnStruggled);
    reviewRow.appendChild(btnGotIt);
    
    card.appendChild(reviewRow);
  }

  return card;
}

function renderList(container) {
  const listEl = container.querySelector(".card-list");
  if (!listEl) return;
  listEl.innerHTML = "";

  const filtered = getFilteredMistakes().sort(
    (a, b) => new Date(b.loggedAt) - new Date(a.loggedAt)
  );

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = searchQuery ? "No matching mistakes found." : "No mistakes logged yet. Log your first one above!";
    listEl.appendChild(empty);
    
    chrome.runtime.sendMessage({ action: "updateBadge", count: 0 }).catch(() => {});
    return;
  }

  const todayStr = getTodayString();
  const dueItems = filtered.filter(m => m.nextReviewDate <= todayStr);
  const otherItems = filtered.filter(m => m.nextReviewDate > todayStr || !m.nextReviewDate);

  chrome.runtime.sendMessage({ action: "updateBadge", count: dueItems.length }).catch(() => {});

  if (!searchQuery && dueItems.length > 0) {
    const dueHeader = document.createElement("h3");
    dueHeader.textContent = `Due for Review (${dueItems.length})`;
    dueHeader.style.marginBottom = "12px";
    dueHeader.style.color = "#ef476f";
    listEl.appendChild(dueHeader);

    dueItems.forEach(item => {
      listEl.appendChild(createCard(item, container, true));
    });

    const otherHeader = document.createElement("h3");
    otherHeader.textContent = "All Mistakes";
    otherHeader.style.marginTop = "24px";
    otherHeader.style.marginBottom = "12px";
    listEl.appendChild(otherHeader);
    
    otherItems.forEach(item => {
      listEl.appendChild(createCard(item, container, false));
    });
  } else {
    filtered.forEach(item => {
      listEl.appendChild(createCard(item, container, false));
    });
  }
}

function updateDatalist(container) {
  const datalist = container.querySelector("#mistake-tags-list");
  if (!datalist) return;
  datalist.innerHTML = "";
  const allTags = getAllTags();
  allTags.forEach((tag) => {
    const opt = document.createElement("option");
    opt.value = tag;
    datalist.appendChild(opt);
  });
}

async function addMistake(container, mImages = []) {
  const subjectSelect = container.querySelector(".m-subject");
  const textArea = container.querySelector(".m-text");
  const tagsInput = container.querySelector(".m-tags");

  const subject = subjectSelect.value;
  const text = textArea.value.trim();
  const tagsString = tagsInput.value.trim();

  if (!text) {
    textArea.focus();
    return;
  }

  const d = new Date();
  d.setDate(d.getDate() + 1);
  const nextRev = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const newItem = {
    id: generateId(),
    subject,
    text,
    tags: tagsString.split(",").map((t) => t.trim()).filter(Boolean),
    images: [...mImages],
    loggedAt: new Date().toISOString(),
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: nextRev,
    reviews: 0
  };

  mistakes.push(newItem);
  await setStorage({ mistakes });
  await incrementMistakeCount();

  textArea.value = "";
  tagsInput.value = "";
  textArea.focus();

  updateDatalist(container);
  renderList(container);
  showToast("Mistake logged!");
}

async function deleteMistake(id, container) {
  const index = mistakes.findIndex((m) => m.id === id);
  if (index === -1) return;

  deletedItem = mistakes[index];
  mistakes.splice(index, 1);
  await setStorage({ mistakes });
  renderList(container);

  if (undoTimeout) clearTimeout(undoTimeout);
  showToast("Mistake deleted.", () => {
    mistakes.push(deletedItem);
    setStorage({ mistakes });
    renderList(container);
    deletedItem = null;
  });

  undoTimeout = setTimeout(() => {
    deletedItem = null;
  }, 3000);
}

export async function initMistakes(container) {
  const data = await getStorage(["mistakes"]);
  mistakes = data.mistakes || [];

  let migrated = false;
  mistakes.forEach(m => {
    if (m.reviews === undefined) {
      m.interval = 1;
      m.easeFactor = 2.5;
      m.nextReviewDate = getTodayString(); // Old ones due today
      m.reviews = 0;
      migrated = true;
    }
  });
  if (migrated) await setStorage({ mistakes });

  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "mistakes-wrapper";

  const title = document.createElement("h2");
  title.textContent = "Mistakes Log";
  wrapper.appendChild(title);

  const inputSection = document.createElement("div");
  inputSection.className = "input-section";

  const subjectSelect = createCustomDropdown(SUBJECTS, "m-subject", SUBJECTS[0]);
  inputSection.appendChild(subjectSelect);

  const textArea = document.createElement("textarea");
  textArea.className = "m-text input-field";
  textArea.placeholder = "What went wrong? What's the correct concept?";
  textArea.rows = 3;
  inputSection.appendChild(textArea);

  let mImages = [];
  const imgPreviewContainer = document.createElement("div");
  imgPreviewContainer.className = "multi-img-preview";
  imgPreviewContainer.style.display = "none";
  inputSection.appendChild(imgPreviewContainer);

  function renderMImages() {
    imgPreviewContainer.innerHTML = "";
    if (mImages.length === 0) {
      imgPreviewContainer.style.display = "none";
      return;
    }
    imgPreviewContainer.style.display = "flex";
    mImages.forEach((dataUrl, idx) => {
      const thumb = document.createElement("div");
      thumb.className = "multi-img-thumb";
      thumb.innerHTML = `<img src="${dataUrl}"> <button data-idx="${idx}">&times;</button>`;
      thumb.querySelector("button").addEventListener("click", () => {
        mImages.splice(idx, 1);
        renderMImages();
      });
      imgPreviewContainer.appendChild(thumb);
    });
  }

  inputSection.addEventListener("paste", (e) => {
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

  const tagsRow = document.createElement("div");
  tagsRow.className = "input-row";

  const tagsInput = document.createElement("input");
  tagsInput.type = "text";
  tagsInput.className = "m-tags input-field";
  tagsInput.placeholder = "Tags (comma-separated)";
  tagsInput.setAttribute("list", "mistake-tags-list");
  tagsRow.appendChild(tagsInput);

  const datalist = document.createElement("datalist");
  datalist.id = "mistake-tags-list";
  tagsRow.appendChild(datalist);

  const addBtn = document.createElement("button");
  addBtn.className = "btn btn-primary";
  addBtn.textContent = "Log Mistake";
  addBtn.addEventListener("click", () => {
    addMistake(container, mImages);
    mImages = [];
    renderMImages();
  });
  tagsRow.appendChild(addBtn);

  inputSection.appendChild(tagsRow);
  wrapper.appendChild(inputSection);

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.className = "search-bar input-field";
  searchInput.placeholder = "Search mistakes or #tag...";
  wrapper.appendChild(searchInput);

  const listEl = document.createElement("div");
  listEl.className = "card-list";
  wrapper.appendChild(listEl);

  container.appendChild(wrapper);

  updateDatalist(container);
  renderList(container);

  wrapper.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      addMistake(container, mImages);
      mImages = [];
      renderMImages();
    }
  });

  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value.trim();
    renderList(container);
  });
}
