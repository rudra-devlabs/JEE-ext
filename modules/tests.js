import { getStorage, setStorage } from './storage.js';
import { getIconSvg } from './ui.js';
import { testSchedule as defaultSchedule } from './testData.js';

let testSchedule = [];

export async function initTests(container) {
  const data = await getStorage(['testSchedule']);
  
  if (data.testSchedule) {
    testSchedule = data.testSchedule;
  } else {
    // Seed with the default schedule
    testSchedule = defaultSchedule.map(t => ({
      name: t.name,
      date: t.date.toISOString(),
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5)
    }));
    await setStorage({ testSchedule });
  }

  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "tests-wrapper";

  const header = document.createElement("div");
  header.className = "tests-header";
  header.style.marginBottom = "24px";
  const title = document.createElement("h2");
  title.textContent = "Test Planner";
  title.style.margin = "0";
  header.appendChild(title);
  wrapper.appendChild(header);

  // Input Row
  const inputRow = document.createElement("div");
  inputRow.className = "tests-input-row";
  inputRow.style.display = "flex";
  inputRow.style.gap = "12px";
  inputRow.style.marginBottom = "24px";
  inputRow.style.alignItems = "center";
  inputRow.style.flexWrap = "wrap";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.className = "input-field";
  nameInput.placeholder = "Test Name (e.g. Mock Test 1)";
  nameInput.style.flex = "2";
  nameInput.style.marginRight = "12px";

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.className = "input-field";
  dateInput.style.flex = "1";
  dateInput.style.marginRight = "12px";
  
  // Disable past dates
  const todayDateStr = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', todayDateStr);

  const addBtn = document.createElement("button");
  addBtn.className = "btn btn-primary";
  addBtn.textContent = "Add Test";

  inputRow.appendChild(nameInput);
  inputRow.appendChild(dateInput);
  inputRow.appendChild(addBtn);
  wrapper.appendChild(inputRow);

  // Error container
  const errorEl = document.createElement("div");
  errorEl.style.color = "var(--error, #ff5555)";
  errorEl.style.fontSize = "0.9rem";
  errorEl.style.marginBottom = "16px";
  errorEl.style.display = "none";
  wrapper.appendChild(errorEl);

  const listEl = document.createElement("div");
  listEl.className = "tests-list";
  listEl.style.display = "flex";
  listEl.style.flexDirection = "column";
  listEl.style.gap = "12px";
  wrapper.appendChild(listEl);

    wrapper.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof addBtn !== 'undefined' && addBtn) {
        addBtn.click();
      }
    }
  });
  container.appendChild(wrapper);

  async function renderList() {
    listEl.innerHTML = "";
    
    // Sort array by date chronologically
    testSchedule.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Always save the sorted list
    await setStorage({ testSchedule });

    if (testSchedule.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "No upcoming tests. Add your first one above!";
      listEl.appendChild(empty);
      return;
    }

    const trashIconMarkup = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    testSchedule.forEach(test => {
      const card = document.createElement("div");
      card.className = "test-card";
      card.style.display = "flex";
      card.style.justifyContent = "space-between";
      card.style.alignItems = "center";
      card.style.padding = "16px";
      card.style.background = "var(--bg-card)";
      card.style.border = "1px solid var(--border-color)";
      card.style.borderRadius = "8px";
      
      const infoDiv = document.createElement("div");
      infoDiv.style.display = "flex";
      infoDiv.style.flexDirection = "column";
      infoDiv.style.gap = "4px";

      const titleEl = document.createElement("strong");
      titleEl.textContent = test.name;
      titleEl.style.fontSize = "1.05rem";
      titleEl.style.color = "var(--text-primary)";
      
      const dateEl = document.createElement("span");
      dateEl.textContent = new Date(test.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
      dateEl.style.fontSize = "0.9rem";
      dateEl.style.color = "var(--text-secondary)";
      
      infoDiv.appendChild(titleEl);
      infoDiv.appendChild(dateEl);

      const delBtn = document.createElement("button");
      delBtn.className = "icon-btn";
      delBtn.innerHTML = trashIconMarkup;
      delBtn.style.color = "var(--text-secondary)";
      
      delBtn.addEventListener("click", async () => {
        if (confirm(`Remove "${test.name}" from your planner?`)) {
          testSchedule = testSchedule.filter(t => t.id !== test.id);
          renderList();
        }
      });

      card.appendChild(infoDiv);
      card.appendChild(delBtn);
      listEl.appendChild(card);
    });
  }

  addBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const dateStr = dateInput.value;

    errorEl.style.display = "none";

    if (!name || !dateStr) {
      errorEl.textContent = "Please provide both a test name and a date.";
      errorEl.style.display = "block";
      return;
    }

    const testDate = new Date(dateStr);
    
    // Normalize today to start of day
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (testDate.getTime() < today.getTime()) {
      errorEl.textContent = "You cannot add tests in the past.";
      errorEl.style.display = "block";
      return;
    }

    const newTest = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      name: name,
      date: testDate.toISOString()
    };

    testSchedule.push(newTest);
    nameInput.value = "";
    dateInput.value = "";
    
    // Force a re-render which triggers the sort and save
    await renderList();
  });

  renderList();
}

