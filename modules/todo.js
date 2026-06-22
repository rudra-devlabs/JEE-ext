import { getStorage, setStorage } from './storage.js';

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMondayOfCurrentWeek() {
  const d = new Date();
  const day = d.getDay();
  // If Sunday (0), we go back 6 days. Otherwise, go back day - 1 days.
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function parseDateString(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const date = new Date(y, parseInt(m) - 1, d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function generateId() {
  return crypto.randomUUID();
}

function showToast(message) {
  document.dispatchEvent(new CustomEvent("show-toast", {
    detail: { message }
  }));
}

export async function initTodo(container) {
  const data = await getStorage(["todos"]);
  let todos = data.todos || [];

  // Cleanup old tasks before current week's Monday
  const monday = getMondayOfCurrentWeek();
  const originalLength = todos.length;
  
  todos = todos.filter(t => {
    if (!t.date) return false;
    const taskDate = parseDateString(t.date);
    return taskDate.getTime() >= monday.getTime();
  });

  if (todos.length !== originalLength) {
    await setStorage({ todos });
  }

  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "todo-wrapper";

  const header = document.createElement("div");
  header.className = "todo-header";
  const title = document.createElement("h2");
  title.textContent = "Daily Todo List";
  header.appendChild(title);
  wrapper.appendChild(header);

  // Input area for Today
  const inputContainer = document.createElement("div");
  inputContainer.className = "todo-input-container";
  
  const todoInput = document.createElement("input");
  todoInput.type = "text";
  todoInput.className = "input-field";
  todoInput.placeholder = "What do you need to study today? (Press Enter to add)";
  
  const addBtn = document.createElement("button");
  addBtn.className = "btn btn-primary";
  addBtn.textContent = "Add";

  inputContainer.appendChild(todoInput);
  inputContainer.appendChild(addBtn);
  wrapper.appendChild(inputContainer);

  const listsContainer = document.createElement("div");
  listsContainer.className = "todo-lists-container";
  wrapper.appendChild(listsContainer);

  const renderTodos = () => {
    listsContainer.innerHTML = "";
    
    // Group by date
    const grouped = {};
    todos.forEach(t => {
      if (!grouped[t.date]) grouped[t.date] = [];
      grouped[t.date].push(t);
    });

    const todayStr = getTodayString();
    
    // Sort dates descending so today is at the top
    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
    
    // If today has no tasks, we still want to show a "Today" section if there are others, or maybe just render it
    if (!sortedDates.includes(todayStr)) {
      sortedDates.unshift(todayStr);
      grouped[todayStr] = [];
    }

    sortedDates.forEach(dateStr => {
      const isToday = dateStr === todayStr;
      const tasks = grouped[dateStr];
      
      const daySection = document.createElement("div");
      daySection.className = "todo-day-section";
      
      const dayTitle = document.createElement("h3");
      dayTitle.className = "todo-day-title";
      
      if (isToday) {
        dayTitle.textContent = "Today";
      } else {
        const dObj = parseDateString(dateStr);
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        dayTitle.textContent = dObj.toLocaleDateString(undefined, options);
        daySection.classList.add("past-day");
      }
      
      daySection.appendChild(dayTitle);
      
      const ul = document.createElement("ul");
      ul.className = "todo-list";
      
      if (tasks.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "todo-empty";
        emptyItem.textContent = isToday ? "No tasks for today. Add one above!" : "No tasks recorded.";
        ul.appendChild(emptyItem);
      } else {
        tasks.forEach(task => {
          const li = document.createElement("li");
          li.className = "todo-item" + (task.done ? " done" : "");
          if (!isToday && !task.done) li.classList.add("expired");

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.className = "todo-checkbox";
          checkbox.checked = task.done;
          
          if (!isToday) checkbox.disabled = true;

          const span = document.createElement("span");
          span.className = "todo-text";
          span.textContent = task.text;

          const rightActions = document.createElement("div");
          rightActions.className = "todo-actions";

          const delBtn = document.createElement("button");
          delBtn.className = "icon-btn delete-btn";
          delBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
          
          delBtn.onclick = async () => {
            todos = todos.filter(t => t.id !== task.id);
            await setStorage({ todos });
            renderTodos();
            showToast("Task deleted");
          };

          checkbox.onchange = async () => {
            task.done = checkbox.checked;
            await setStorage({ todos });
            renderTodos();
          };

          span.onclick = () => {
            if (isToday) {
              checkbox.checked = !checkbox.checked;
              checkbox.dispatchEvent(new Event('change'));
            }
          };

          if (!isToday && !task.done) {
            const badge = document.createElement("span");
            badge.className = "todo-badge expired-badge";
            badge.textContent = "Missed";
            rightActions.appendChild(badge);
          } else if (!isToday && task.done) {
            const badge = document.createElement("span");
            badge.className = "todo-badge completed-badge";
            badge.textContent = "Done";
            rightActions.appendChild(badge);
          }

          rightActions.appendChild(delBtn);

          li.appendChild(checkbox);
          li.appendChild(span);
          li.appendChild(rightActions);
          ul.appendChild(li);
        });
      }
      
      daySection.appendChild(ul);
      listsContainer.appendChild(daySection);
    });
  };

  const addTask = async () => {
    const text = todoInput.value.trim();
    if (!text) return;

    const newTask = {
      id: generateId(),
      text,
      done: false,
      date: getTodayString()
    };

    todos.push(newTask);
    await setStorage({ todos });
    todoInput.value = "";
    renderTodos();
    showToast("Task added");
  };

  addBtn.addEventListener("click", addTask);
  todoInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
  });

  renderTodos();
  container.appendChild(wrapper);
}
