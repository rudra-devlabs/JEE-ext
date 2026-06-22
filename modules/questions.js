import { getStorage, setStorage, generateId } from "./storage.js";
import { createCustomDropdown } from "./ui.js";

const CATEGORIES = ["Class", "Topic", "Module", "DIBY", "DPP", "KPP", "Homework"];

const CATEGORY_COLORS = {
  Topic: "#7c5cfc",
  Module: "#00b4d8",
  DIBY: "#f77f00",
  DPP: "#06d6a0",
  KPP: "#ef476f",
  Homework: "#ffd166",
  Class: "#118ab2"
};

let questions = [];
let searchQuery = "";
let deletedItem = null;
let undoTimeout = null;
let stagedQuestionImages = [];

function showToast(message, undoCallback) {
  document.dispatchEvent(new CustomEvent("show-toast", {
    detail: { message, undoCallback }
  }));
}

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function incrementQuestionCount() {
  const data = await getStorage(["questionHistory"]);
  const history = data.questionHistory || [];
  const today = getTodayString();
  const entry = history.find((h) => h.date === today);
  if (entry) {
    entry.count++;
  } else {
    history.push({ date: today, count: 1 });
  }
  await setStorage({ questionHistory: history });
}

function getAllTags() {
  const tagSet = new Set();
  questions.forEach((q) => {
    q.tags.forEach((t) => tagSet.add(t));
  });
  return [...tagSet];
}

function getFilteredQuestions() {
  if (!searchQuery) return [...questions];
  const q = searchQuery.toLowerCase();
  if (q.startsWith("#")) {
    const tag = q.slice(1);
    return questions.filter((item) =>
      item.tags.some((t) => t.toLowerCase().includes(tag))
    );
  }
  return questions.filter((item) =>
    item.questionNumber.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q) ||
    item.tags.some((t) => t.toLowerCase().includes(q))
  );
}

function renderList(container) {
  const listEl = container.querySelector(".card-list");
  if (!listEl) return;
  listEl.innerHTML = "";

  const filtered = getFilteredQuestions().sort(
    (a, b) => new Date(b.addedAt) - new Date(a.addedAt)
  );

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = searchQuery ? "No matching questions found." : "No questions logged yet. Add your first one above!";
    listEl.appendChild(empty);
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = item.id;

    const header = document.createElement("div");
    header.className = "card-header";

    const badge = document.createElement("span");
    badge.className = "category-badge";
    badge.textContent = item.category;
    badge.style.backgroundColor = CATEGORY_COLORS[item.category] || "#7c5cfc";
    badge.style.color = "#fff";
    header.appendChild(badge);

    const qNum = document.createElement("span");
    qNum.className = "question-number";
    let qText = item.questionNumber;
    if (item.chapterTopic) qText += ` • ${item.chapterTopic}`;
    if (item.category === "Class" && item.lectureNumber) qText += ` • Lec ${item.lectureNumber}`;
    qNum.textContent = qText;
    header.appendChild(qNum);

    const time = document.createElement("span");
    time.className = "card-time";
    const d = new Date(item.addedAt);
    time.textContent = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    header.appendChild(time);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "\u00d7";
    deleteBtn.title = "Delete";
    deleteBtn.addEventListener("click", () => deleteQuestion(item.id, container));
    header.appendChild(deleteBtn);

    card.appendChild(header);

    if (item.images && item.images.length > 0) {
      const imgsRow = document.createElement("div");
      imgsRow.className = "mistake-images";
      item.images.forEach(imgData => {
        const img = document.createElement("img");
        img.src = imgData;
        img.className = "question-card-image";
        img.style.maxHeight = "150px";
        img.style.cursor = "pointer";
        img.addEventListener("click", () => {
          const overlay = document.createElement("div");
          overlay.className = "lightbox-overlay";
          const lgImg = document.createElement("img");
          lgImg.src = imgData;
          lgImg.className = "lightbox-img";
          overlay.appendChild(lgImg);
          overlay.addEventListener("click", () => overlay.remove());
          document.body.appendChild(overlay);
        });
        imgsRow.appendChild(img);
      });
      card.appendChild(imgsRow);
    } else if (item.imageUrl) {
      const img = document.createElement("img");
      img.src = item.imageUrl;
      img.className = "question-card-image";
      img.style.maxHeight = "150px";
      img.style.cursor = "pointer";
      img.addEventListener("click", () => {
        const overlay = document.createElement("div");
        overlay.className = "lightbox-overlay";
        const lgImg = document.createElement("img");
        lgImg.src = item.imageUrl;
        lgImg.className = "lightbox-img";
        overlay.appendChild(lgImg);
        overlay.addEventListener("click", () => overlay.remove());
        document.body.appendChild(overlay);
      });
      card.appendChild(img);
    }

    if (item.tags.length > 0) {
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

    listEl.appendChild(card);
  });
}

function updateDatalist(container) {
  const datalist = container.querySelector("#question-tags-list");
  if (!datalist) return;
  datalist.innerHTML = "";
  const allTags = getAllTags();
  allTags.forEach((tag) => {
    const opt = document.createElement("option");
    opt.value = tag;
    datalist.appendChild(opt);
  });
}

async function addQuestion(container) {
  const catSelect = container.querySelector(".q-category");
  const qInput = container.querySelector(".q-number");
  const chapInput = container.querySelector(".q-chapter");
  const lecInput = container.querySelector(".q-lecture");
  const tagsInput = container.querySelector(".q-tags");

  const category = catSelect.value;
  const questionNumber = qInput.value.trim();
  const chapterTopic = chapInput.value.trim();
  const lectureNumber = lecInput.value.trim();
  const tagsString = tagsInput.value.trim();

  if (!questionNumber) {
    qInput.focus();
    return;
  }

  const newItem = {
    id: generateId(),
    category,
    questionNumber,
    chapterTopic,
    lectureNumber: category === "Class" ? lectureNumber : "",
    tags: tagsString.split(",").map((t) => t.trim()).filter(Boolean),
    addedAt: new Date().toISOString(),
    images: [...stagedQuestionImages]
  };

  questions.push(newItem);
  await setStorage({ questions });
  await incrementQuestionCount();

  qInput.value = "";
  chapInput.value = "";
  lecInput.value = "";
  tagsInput.value = "";
  stagedQuestionImages = [];
  updateDatalist(container);
  renderList(container);
  showToast("Question added!");
}

async function deleteQuestion(id, container) {
  const index = questions.findIndex((q) => q.id === id);
  if (index === -1) return;

  deletedItem = questions[index];
  questions.splice(index, 1);
  await setStorage({ questions });
  renderList(container);

  if (undoTimeout) clearTimeout(undoTimeout);
  showToast("Question deleted.", () => {
    questions.push(deletedItem);
    setStorage({ questions });
    renderList(container);
    deletedItem = null;
  });

  undoTimeout = setTimeout(() => {
    deletedItem = null;
  }, 3000);
}

export async function initQuestions(container) {
  const data = await getStorage(["questions"]);
  questions = data.questions || [];

  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "questions-wrapper";

  const title = document.createElement("h2");
  title.textContent = "Questions Log";
  wrapper.appendChild(title);

  const inputRow = document.createElement("div");
  inputRow.className = "input-row";

  const catSelect = createCustomDropdown(CATEGORIES, "q-category", CATEGORIES[0]);
  inputRow.appendChild(catSelect);

  const qInput = document.createElement("input");
  qInput.type = "text";
  qInput.className = "q-number input-field";
  qInput.placeholder = "Question (e.g., Q.42)";
  inputRow.appendChild(qInput);

  const chapInput = document.createElement("input");
  chapInput.type = "text";
  chapInput.className = "q-chapter input-field";
  chapInput.placeholder = "Chapter / Topic";
  inputRow.appendChild(chapInput);

  const lecInput = document.createElement("input");
  lecInput.type = "text";
  lecInput.className = "q-lecture input-field";
  lecInput.placeholder = "Lecture Number";
  inputRow.appendChild(lecInput);

  catSelect.addEventListener("change", (e) => {
    if (e.target.value === "Class") {
      lecInput.style.display = "block";
    } else {
      lecInput.style.display = "none";
      lecInput.value = "";
    }
  });

  const tagsInput = document.createElement("input");
  tagsInput.type = "text";
  tagsInput.className = "q-tags input-field";
  tagsInput.placeholder = "Tags (comma-separated)";
  tagsInput.setAttribute("list", "question-tags-list");

  const datalist = document.createElement("datalist");
  datalist.id = "question-tags-list";
  inputRow.appendChild(tagsInput);
  inputRow.appendChild(datalist);

  const attachBtn = document.createElement("button");
  attachBtn.className = "btn btn-secondary";
  attachBtn.title = "Attach Image";
  attachBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>`;
  inputRow.appendChild(attachBtn);

  const addBtn = document.createElement("button");
  addBtn.className = "btn btn-primary q-add-btn";
  addBtn.textContent = "Add";
  addBtn.title = "Press Ctrl+Enter to Add";
  addBtn.addEventListener("click", () => addQuestion(container));
  inputRow.appendChild(addBtn);

  wrapper.appendChild(inputRow);

  const previewContainer = document.createElement("div");
  previewContainer.className = "multi-img-preview";
  previewContainer.style.display = "none";
  wrapper.appendChild(previewContainer);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.multiple = true;
  fileInput.style.display = "none";
  wrapper.appendChild(fileInput);

  function updatePreview() {
    previewContainer.innerHTML = "";
    if (stagedQuestionImages.length === 0) {
      previewContainer.style.display = "none";
      return;
    }
    previewContainer.style.display = "flex";
    stagedQuestionImages.forEach((dataUrl, idx) => {
      const thumb = document.createElement("div");
      thumb.className = "multi-img-thumb";
      thumb.innerHTML = `<img src="${dataUrl}"> <button data-idx="${idx}">&times;</button>`;
      thumb.querySelector("button").addEventListener("click", () => {
        stagedQuestionImages.splice(idx, 1);
        updatePreview();
      });
      previewContainer.appendChild(thumb);
    });
  }

  function handleFiles(files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          stagedQuestionImages.push(e.target.result);
          updatePreview();
        };
        reader.readAsDataURL(file);
      }
    }
  }

  attachBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    handleFiles(e.target.files);
    e.target.value = "";
  });

  wrapper.addEventListener("paste", (e) => {
    if (e.clipboardData && e.clipboardData.files.length > 0) {
      e.preventDefault();
      handleFiles(e.clipboardData.files);
    }
  });

  wrapper.addEventListener("dragover", (e) => {
    e.preventDefault();
    wrapper.classList.add("drag-over");
  });

  wrapper.addEventListener("dragleave", (e) => {
    e.preventDefault();
    wrapper.classList.remove("drag-over");
  });

  wrapper.addEventListener("drop", (e) => {
    e.preventDefault();
    wrapper.classList.remove("drag-over");
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  });

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.className = "search-bar input-field";
  searchInput.placeholder = "Search questions or #tag...";
  wrapper.appendChild(searchInput);

  const listEl = document.createElement("div");
  listEl.className = "card-list";
  wrapper.appendChild(listEl);

  container.appendChild(wrapper);

  updateDatalist(container);
  renderList(container);

  function handleSubmit(e) {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      addQuestion(container);
    }
  }

  qInput.addEventListener("keydown", handleSubmit);
  chapInput.addEventListener("keydown", handleSubmit);
  lecInput.addEventListener("keydown", handleSubmit);
  tagsInput.addEventListener("keydown", handleSubmit);

  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value.trim();
    renderList(container);
  });
}
