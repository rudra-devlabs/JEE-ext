import { getStorage, setStorage, generateId } from "./storage.js";
import { createQuantityOptionsRow, createQuantityPillUI } from "./ui.js";

let backlog = [];
let searchQuery = "";
let deletedItem = null;
let undoTimeout = null;

function showToast(message, undoCallback) {
  document.dispatchEvent(new CustomEvent("show-toast", {
    detail: { message, undoCallback }
  }));
}

function getFilteredBacklog() {
  if (!searchQuery) return [...backlog];
  const q = searchQuery.toLowerCase();
  return backlog.filter((item) => item.text.toLowerCase().includes(q));
}

function getPendingCount() {
  return backlog.filter((item) => !item.done).length;
}

function updateProgressBar(container) {
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

  const barFill = container.querySelector(".progress-fill");
  const barText = container.querySelector(".progress-bar-text");

  if (barFill) barFill.style.width = `${pct}%`;
  if (barText) barText.textContent = `${completedItems} of ${totalItems} complete (${pct}%)`;
}

async function syncBadge() {
  const pendingCount = getPendingCount();
  try {
    chrome.runtime.sendMessage({ action: "updateBadge", count: pendingCount });
  } catch (e) {
    // background script may not be available
  }
}

function renderList(container) {
  const listEl = container.querySelector(".card-list");
  if (!listEl) return;
  listEl.innerHTML = "";

  const filtered = getFilteredBacklog().sort(
    (a, b) => new Date(b.addedAt) - new Date(a.addedAt)
  );

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = searchQuery ? "No matching items found." : "No backlog items yet. Add your first one above!";
    listEl.appendChild(empty);
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card backlog-card";
    card.dataset.id = item.id;

    const row = document.createElement("div");
    row.className = "backlog-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "custom-checkbox";
    checkbox.checked = item.done;
    checkbox.addEventListener("change", () => toggleItem(item.id, container));
    row.appendChild(checkbox);

    const label = document.createElement("span");
    label.className = "backlog-label" + (item.done ? " done" : "");
    label.textContent = item.text;
    label.style.flex = "1";
    row.appendChild(label);

    if (item.hasQuantity) {
      const decFn = async () => {
        if (item.completedQuantity > 0) {
          item.completedQuantity--;
          if (item.done && item.completedQuantity < item.targetQuantity) {
            item.done = false;
          }
          await setStorage({ backlog });
          renderList(container);
          updateProgressBar(container);
          syncBadge();
        }
      };

      const incFn = async () => {
        if (item.completedQuantity < item.targetQuantity) {
          item.completedQuantity++;
          if (item.completedQuantity === item.targetQuantity) {
            item.done = true;
            showToast("Sub-tasks completed!");
          }
          await setStorage({ backlog });
          renderList(container);
          updateProgressBar(container);
          syncBadge();
        }
      };

      const qtyContainer = createQuantityPillUI(item, decFn, incFn, false);
      row.appendChild(qtyContainer);
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "\u00d7";
    deleteBtn.title = "Delete";
    deleteBtn.addEventListener("click", () => deleteItem(item.id, container));
    row.appendChild(deleteBtn);

    card.appendChild(row);
    listEl.appendChild(card);
  });
}

async function addItem(container) {
  const input = container.querySelector(".backlog-input");
  const trackCb = container.querySelector("#backlog-track-qty");
  const targetIn = container.querySelector(".backlog-target-input");

  const text = input.value.trim();
  if (!text) {
    input.focus();
    return;
  }

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

  const newItem = {
    id: generateId(),
    text,
    done: false,
    addedAt: new Date().toISOString()
  };

  if (hasQuantity) {
    newItem.hasQuantity = true;
    newItem.targetQuantity = targetQuantity;
    newItem.completedQuantity = 0;
  }

  backlog.push(newItem);
  await setStorage({ backlog });
  
  input.value = "";
  if (trackCb) trackCb.checked = false;
  if (targetIn) {
    targetIn.value = "";
    targetIn.style.display = "none";
  }
  input.focus();

  renderList(container);
  updateProgressBar(container);
  syncBadge();
  showToast("Backlog item added!");
}

async function toggleItem(id, container) {
  const item = backlog.find((b) => b.id === id);
  if (!item) return;
  item.done = !item.done;
  
  if (item.hasQuantity) {
    if (item.done) {
      item.completedQuantity = item.targetQuantity;
    } else {
      item.completedQuantity = 0;
    }
  }
  
  await setStorage({ backlog });
  renderList(container);
  updateProgressBar(container);
  syncBadge();
}

async function deleteItem(id, container) {
  const index = backlog.findIndex((b) => b.id === id);
  if (index === -1) return;

  deletedItem = backlog[index];
  backlog.splice(index, 1);
  await setStorage({ backlog });
  renderList(container);
  updateProgressBar(container);
  syncBadge();

  if (undoTimeout) clearTimeout(undoTimeout);
  showToast("Item deleted.", () => {
    backlog.push(deletedItem);
    setStorage({ backlog });
    renderList(container);
    updateProgressBar(container);
    syncBadge();
    deletedItem = null;
  });

  undoTimeout = setTimeout(() => {
    deletedItem = null;
  }, 3000);
}

export async function initBacklog(container) {
  const data = await getStorage(["backlog"]);
  backlog = data.backlog || [];

  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "backlog-wrapper";

  const title = document.createElement("h2");
  title.textContent = "Backlog";
  wrapper.appendChild(title);

  const inputRow = document.createElement("div");
  inputRow.className = "input-row";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "backlog-input input-field";
  input.placeholder = "e.g., Ch.5 Thermodynamics - Lecture 3";
  inputRow.appendChild(input);

  const addBtn = document.createElement("button");
  addBtn.className = "btn btn-primary";
  addBtn.textContent = "Add";
  addBtn.addEventListener("click", () => addItem(container));
  inputRow.appendChild(addBtn);

  wrapper.appendChild(inputRow);

  const { row: optionsRow } = createQuantityOptionsRow("backlog");
  wrapper.appendChild(optionsRow);

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.className = "search-bar input-field";
  searchInput.placeholder = "Search backlog...";
  wrapper.appendChild(searchInput);

  const progressSection = document.createElement("div");
  progressSection.className = "progress-section";

  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";
  const progressFill = document.createElement("div");
  progressFill.className = "progress-fill";
  progressBar.appendChild(progressFill);
  progressSection.appendChild(progressBar);

  const progressText = document.createElement("div");
  progressText.className = "progress-bar-text";
  progressSection.appendChild(progressText);

  wrapper.appendChild(progressSection);

  const listEl = document.createElement("div");
  listEl.className = "card-list";
  wrapper.appendChild(listEl);

  container.appendChild(wrapper);

  renderList(container);
  updateProgressBar(container);
  syncBadge();

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem(container);
    }
  });

  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value.trim();
    renderList(container);
  });
}
