import { getStorage, setStorage } from "./storage.js";

let saveTimeout = null;
let currentData = null;

export async function initNotes(container) {
  const data = await getStorage(["notes", "subjectNotes"]);
  
  if (data.subjectNotes) {
    currentData = data.subjectNotes;
  } else {
    currentData = {
      Physics: [],
      Chemistry: [],
      Math: []
    };
    if (typeof data.notes === 'string' && data.notes.trim() !== '') {
      currentData.Physics.push({ id: Date.now().toString(), text: data.notes });
    }
  }

  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "notes-wrapper";

  const headerRow = document.createElement("div");
  headerRow.className = "notes-header-row";
  
  const title = document.createElement("h2");
  title.textContent = "Subject Notes";
  title.style.marginBottom = "0";
  headerRow.appendChild(title);

  const savedIndicator = document.createElement("span");
  savedIndicator.className = "saved-indicator";
  savedIndicator.textContent = "";
  headerRow.appendChild(savedIndicator);

  wrapper.appendChild(headerRow);

  const grid = document.createElement("div");
  grid.className = "notes-grid";

  const subjects = ["Physics", "Chemistry", "Math"];

  subjects.forEach(subject => {
    const col = document.createElement("div");
    col.className = "note-col";

    const colHeader = document.createElement("div");
    colHeader.className = "note-col-header";
    
    const colTitle = document.createElement("div");
    colTitle.className = "note-col-title";
    colTitle.textContent = subject;
    colHeader.appendChild(colTitle);

    const addBtn = document.createElement("button");
    addBtn.className = "btn-secondary";
    addBtn.style.padding = "4px 12px";
    addBtn.style.fontSize = "0.85rem";
    addBtn.innerHTML = `+ Add Note`;
    
    colHeader.appendChild(addBtn);
    col.appendChild(colHeader);

    const cardsContainer = document.createElement("div");
    cardsContainer.className = "note-cards-container";
    
    const renderCards = () => {
      cardsContainer.innerHTML = "";
      currentData[subject].forEach(note => {
        const card = createNoteCard(subject, note, cardsContainer);
        cardsContainer.appendChild(card);
      });
    };

    renderCards();
    col.appendChild(cardsContainer);

    addBtn.addEventListener("click", () => {
      const newNote = { id: Date.now().toString() + Math.random().toString(36).substr(2, 5), text: "" };
      currentData[subject].push(newNote);
      debouncedSave();
      const card = createNoteCard(subject, newNote, cardsContainer);
      cardsContainer.appendChild(card);
      card.querySelector('textarea').focus();
    });

    grid.appendChild(col);
  });

  wrapper.appendChild(grid);
  container.appendChild(wrapper);

  function createNoteCard(subject, note, containerEl) {
    const card = document.createElement("div");
    card.className = "note-card";
    
    const textarea = document.createElement("textarea");
    textarea.className = "note-textarea";
    textarea.placeholder = "Type note here...";
    textarea.value = note.text;
    
    textarea.addEventListener("input", (e) => {
      note.text = e.target.value;
      debouncedSave();
      
      // Auto-resize textarea height
      textarea.style.height = "auto";
      textarea.style.height = (textarea.scrollHeight) + "px";
    });

    // Initial resize
    setTimeout(() => {
      textarea.style.height = "auto";
      textarea.style.height = (textarea.scrollHeight) + "px";
    }, 0);

    card.appendChild(textarea);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.title = "Delete note";
    deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    deleteBtn.addEventListener("click", () => {
      currentData[subject] = currentData[subject].filter(n => n.id !== note.id);
      debouncedSave();
      card.remove();
    });

    card.appendChild(deleteBtn);
    return card;
  }

  function showSaved() {
    savedIndicator.textContent = "Saved \u2713";
    savedIndicator.style.opacity = "1";
    setTimeout(() => {
      savedIndicator.style.opacity = "0";
    }, 1000);
  }

  function debouncedSave() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      await setStorage({ subjectNotes: currentData });
      showSaved();
    }, 500);
  }
}
