import { getStorage, setStorage } from "./storage.js";
import { MODELS } from "./chat.js";
import { createScrollTimePicker } from "./ui.js";

function showToast(message, undoCallback) {
  document.dispatchEvent(new CustomEvent("show-toast", {
    detail: { message, undoCallback }
  }));
}

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function generateReminderId() {
  return "cls_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

async function getStorageUsage() {
  return new Promise((resolve) => {
    chrome.storage.local.getBytesInUse(null, (bytes) => {
      resolve(bytes);
    });
  });
}

export async function initSettings(container) {
  const data = await getStorage(["settings"]);
  const settings = data.settings || { theme: "dark" };

  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "settings-wrapper";

  const title = document.createElement("h2");
  title.textContent = "Settings";
  wrapper.appendChild(title);



  const apiSection = document.createElement("div");
  apiSection.className = "settings-section";

  const apiTitle = document.createElement("h3");
  apiTitle.textContent = "AI Chat Configuration";
  apiSection.appendChild(apiTitle);

  const chatData = await getStorage(["chatSettings"]);
  const chatSettings = chatData.chatSettings || {};
  
  if (chatSettings.apiKey && !chatSettings.mistralApiKey) {
    chatSettings.mistralApiKey = chatSettings.apiKey;
    delete chatSettings.apiKey;
    await setStorage({ chatSettings });
  }

  function createApiKeyInput(labelText, placeholder, keyName) {
    const wrapperDiv = document.createElement("div");
    wrapperDiv.style.marginBottom = "12px";

    const label = document.createElement("label");
    label.textContent = labelText;
    label.style.display = "block";
    label.style.fontSize = "13px";
    label.style.color = "var(--text-secondary)";
    label.style.marginBottom = "4px";
    wrapperDiv.appendChild(label);

    const row = document.createElement("div");
    row.className = "input-row";
    row.style.margin = "0";
    row.style.display = "flex";
    row.style.gap = "8px";

    const input = document.createElement("input");
    input.type = "password";
    input.className = "input-field";
    input.style.flex = "1";
    input.placeholder = placeholder;
    input.value = chatSettings[keyName] || "";

    const unlinkBtn = document.createElement("button");
    unlinkBtn.className = "btn";
    unlinkBtn.style.padding = "0 12px";
    unlinkBtn.style.backgroundColor = "var(--bg-card)";
    unlinkBtn.style.border = "1px solid var(--border-color)";
    unlinkBtn.style.color = "var(--text-secondary)";
    unlinkBtn.textContent = "Unlink";
    unlinkBtn.title = "Remove this key";
    
    unlinkBtn.addEventListener("click", async () => {
      input.value = "";
      chatSettings[keyName] = "";
      await setStorage({ chatSettings });
      showToast("Provider unlinked successfully!");
    });

    row.appendChild(input);
    row.appendChild(unlinkBtn);
    wrapperDiv.appendChild(row);
    return { wrapper: wrapperDiv, row, input };
  }

  const mistral = createApiKeyInput("Mistral AI", "Enter Mistral API Key...", "mistralApiKey");
  const alibaba = createApiKeyInput("Alibaba (DashScope)", "Enter Alibaba (DashScope) API Key...", "alibabaApiKey");
  const groq = createApiKeyInput("Groq", "Enter Groq API Key...", "groqApiKey");
  const openRouter = createApiKeyInput("OpenRouter", "Enter OpenRouter API Key...", "openRouterApiKey");
  const gemini = createApiKeyInput("Google AI Studio (Gemini)", "Enter Google AI Studio (Gemini) API Key...", "geminiApiKey");
  const cerebras = createApiKeyInput("Cerebras", "Enter Cerebras API Key...", "cerebrasApiKey");

  const mistralInput = mistral.input;
  const alibabaInput = alibaba.input;
  const groqInput = groq.input;
  const openRouterInput = openRouter.input;
  const geminiInput = gemini.input;
  const cerebrasInput = cerebras.input;

  const saveKeysBtn = document.createElement("button");
  saveKeysBtn.className = "btn btn-primary";
  saveKeysBtn.style.width = "100%";
  saveKeysBtn.textContent = "Save API Keys";
  saveKeysBtn.addEventListener("click", async () => {
    chatSettings.mistralApiKey = mistralInput.value.trim();
    chatSettings.alibabaApiKey = alibabaInput.value.trim();
    chatSettings.groqApiKey = groqInput.value.trim();
    chatSettings.openRouterApiKey = openRouterInput.value.trim();
    chatSettings.geminiApiKey = geminiInput.value.trim();
    chatSettings.cerebrasApiKey = cerebrasInput.value.trim();
    await setStorage({ chatSettings });
    showToast("API Keys saved successfully!");
  });

  apiSection.appendChild(mistral.wrapper);
  apiSection.appendChild(alibaba.wrapper);
  apiSection.appendChild(groq.wrapper);
  apiSection.appendChild(openRouter.wrapper);
  apiSection.appendChild(gemini.wrapper);
  apiSection.appendChild(cerebras.wrapper);
  apiSection.appendChild(saveKeysBtn);
  wrapper.appendChild(apiSection);

  const modelVisSection = document.createElement("div");
  modelVisSection.className = "settings-section";

  const modelVisTitle = document.createElement("h3");
  modelVisTitle.textContent = "Model Visibility";
  modelVisTitle.style.marginBottom = "8px";
  modelVisSection.appendChild(modelVisTitle);

  const modelVisDesc = document.createElement("p");
  modelVisDesc.textContent = "Check the providers and models you want to see in the chat dropdown.";
  modelVisDesc.style.fontSize = "12px";
  modelVisDesc.style.color = "var(--text-secondary)";
  modelVisDesc.style.marginBottom = "16px";
  modelVisSection.appendChild(modelVisDesc);

  const hiddenModels = chatSettings.hiddenModels || [];
  const hiddenGroups = chatSettings.hiddenGroups || [];

  const groups = {};
  MODELS.forEach((m) => {
    if (!groups[m.group]) groups[m.group] = [];
    groups[m.group].push(m);
  });

  const visContainer = document.createElement("div");
  visContainer.style.display = "flex";
  visContainer.style.flexDirection = "column";
  visContainer.style.gap = "16px";
  visContainer.style.maxHeight = "300px";
  visContainer.style.overflowY = "auto";
  visContainer.style.padding = "12px";
  visContainer.style.background = "var(--bg-secondary)";
  visContainer.style.borderRadius = "8px";
  visContainer.style.border = "1px solid var(--border-color)";

  Object.keys(groups).forEach(group => {
    const groupDiv = document.createElement("div");
    
    const groupLabel = document.createElement("label");
    groupLabel.style.display = "flex";
    groupLabel.style.alignItems = "center";
    groupLabel.style.fontWeight = "600";
    groupLabel.style.marginBottom = "8px";
    groupLabel.style.cursor = "pointer";
    
    const groupCheck = document.createElement("input");
    groupCheck.type = "checkbox";
    groupCheck.checked = !hiddenGroups.includes(group);
    groupCheck.style.marginRight = "8px";
    
    const groupText = document.createElement("span");
    groupText.textContent = group;
    
    groupLabel.appendChild(groupCheck);
    groupLabel.appendChild(groupText);
    groupDiv.appendChild(groupLabel);

    const modelsDiv = document.createElement("div");
    modelsDiv.style.marginLeft = "24px";
    modelsDiv.style.display = "flex";
    modelsDiv.style.flexDirection = "column";
    modelsDiv.style.gap = "6px";
    
    const modelChecks = [];
    
    groups[group].forEach(m => {
      const mLabel = document.createElement("label");
      mLabel.style.display = "flex";
      mLabel.style.alignItems = "center";
      mLabel.style.fontSize = "13px";
      mLabel.style.cursor = "pointer";
      
      const mCheck = document.createElement("input");
      mCheck.type = "checkbox";
      mCheck.checked = !hiddenModels.includes(m.id) && groupCheck.checked;
      mCheck.dataset.id = m.id;
      mCheck.style.marginRight = "8px";
      modelChecks.push(mCheck);
      
      const mText = document.createElement("span");
      mText.textContent = m.label + (m.params ? ` (${m.params})` : "");
      
      mLabel.appendChild(mCheck);
      mLabel.appendChild(mText);
      modelsDiv.appendChild(mLabel);

      mCheck.addEventListener("change", () => {
        if (!mCheck.checked) {
          groupCheck.checked = false;
        } else if (modelChecks.every(c => c.checked)) {
          groupCheck.checked = true;
        }
      });
    });

    if (hiddenGroups.includes(group)) {
      groupCheck.checked = false;
      modelChecks.forEach(c => c.checked = false);
    } else if (modelChecks.some(c => !c.checked)) {
      groupCheck.checked = false;
    }

    groupCheck.addEventListener("change", () => {
      const isChecked = groupCheck.checked;
      modelChecks.forEach(c => c.checked = isChecked);
    });

    groupDiv.appendChild(modelsDiv);
    visContainer.appendChild(groupDiv);
  });

  modelVisSection.appendChild(visContainer);

  const saveVisBtn = document.createElement("button");
  saveVisBtn.className = "btn btn-primary";
  saveVisBtn.style.width = "100%";
  saveVisBtn.style.marginTop = "12px";
  saveVisBtn.textContent = "Save Visibility Options";
  saveVisBtn.addEventListener("click", async () => {
    const newHiddenGroups = [];
    const newHiddenModels = [];
    
    Array.from(visContainer.children).forEach(gDiv => {
      const groupName = gDiv.querySelector("label > span").textContent;
      const mChecks = Array.from(gDiv.querySelectorAll("div > label > input[type='checkbox']"));
      const allUnchecked = mChecks.every(c => !c.checked);
      
      if (allUnchecked) {
        newHiddenGroups.push(groupName);
      } else {
        mChecks.forEach(c => {
          if (!c.checked) newHiddenModels.push(c.dataset.id);
        });
      }
    });

    const data = await getStorage(["chatSettings"]);
    const settings = data.chatSettings || {};
    settings.hiddenGroups = newHiddenGroups;
    settings.hiddenModels = newHiddenModels;
    await setStorage({ chatSettings: settings });
    showToast("Model visibility saved!");
  });

  modelVisSection.appendChild(saveVisBtn);
  wrapper.appendChild(modelVisSection);

  const classReminderSection = document.createElement("div");
  classReminderSection.className = "settings-section";

  const classReminderTitle = document.createElement("h3");
  classReminderTitle.textContent = "Class Reminders";
  classReminderSection.appendChild(classReminderTitle);

  const classReminderDesc = document.createElement("p");
  classReminderDesc.textContent = "Set your daily classes. You will get two notifications for each class: 10 minutes before and at start time.";
  classReminderDesc.style.fontSize = "12px";
  classReminderDesc.style.color = "var(--text-secondary)";
  classReminderDesc.style.marginBottom = "12px";
  classReminderSection.appendChild(classReminderDesc);

  const reminderData = await getStorage(["settings"]);
  const reminderSettings = reminderData.settings || {};
  let classSchedules = Array.isArray(reminderSettings.classSchedules) ? [...reminderSettings.classSchedules] : [];

  const classInputRow = document.createElement("div");
  classInputRow.className = "input-row";
  classInputRow.style.display = "grid";
  classInputRow.style.gridTemplateColumns = "minmax(140px, 1fr) minmax(120px, auto) auto";
  classInputRow.style.gap = "8px";
  classInputRow.style.marginBottom = "12px";

  const classNameInput = document.createElement("input");
  classNameInput.type = "text";
  classNameInput.className = "input-field";
  classNameInput.placeholder = "Class name (e.g. Physics)";

  const classTimePicker = createScrollTimePicker("");

  const addClassBtn = document.createElement("button");
  addClassBtn.className = "btn btn-secondary";
  addClassBtn.textContent = "Add Class";

  classInputRow.appendChild(classNameInput);
  classInputRow.appendChild(classTimePicker);
  classInputRow.appendChild(addClassBtn);
  classReminderSection.appendChild(classInputRow);

  const classList = document.createElement("div");
  classList.style.display = "flex";
  classList.style.flexDirection = "column";
  classList.style.gap = "8px";
  classList.style.marginBottom = "12px";
  classReminderSection.appendChild(classList);

  function renderClassRows() {
    classList.innerHTML = "";
    if (classSchedules.length === 0) {
      const empty = document.createElement("div");
      empty.style.fontSize = "13px";
      empty.style.color = "var(--text-secondary)";
      empty.textContent = "No class reminders added yet.";
      classList.appendChild(empty);
      return;
    }

    classSchedules
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
      .forEach((schedule) => {
        const row = document.createElement("div");
        row.style.display = "grid";
        row.style.gridTemplateColumns = "1fr auto auto";
        row.style.gap = "8px";
        row.style.alignItems = "center";
        row.style.padding = "8px 10px";
        row.style.background = "var(--bg-secondary)";
        row.style.border = "1px solid var(--border-color)";
        row.style.borderRadius = "8px";

        const label = document.createElement("div");
        label.textContent = `${schedule.name} • ${schedule.time}`;
        label.style.fontSize = "13px";
        label.style.color = "var(--text-primary)";

        const editBtn = document.createElement("button");
        editBtn.className = "btn";
        editBtn.style.padding = "6px 10px";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => {
          classNameInput.value = schedule.name || "";
          classTimePicker.value = schedule.time || "";
          classSchedules = classSchedules.filter((item) => item.id !== schedule.id);
          renderClassRows();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-danger";
        deleteBtn.style.padding = "6px 10px";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => {
          classSchedules = classSchedules.filter((item) => item.id !== schedule.id);
          renderClassRows();
        });

        row.appendChild(label);
        row.appendChild(editBtn);
        row.appendChild(deleteBtn);
        classList.appendChild(row);
      });
  }

  addClassBtn.addEventListener("click", () => {
    const name = classNameInput.value.trim();
    const time = classTimePicker.value;

    if (!name) {
      showToast("Please enter a class name.");
      return;
    }

    classSchedules.push({
      id: generateReminderId(),
      name,
      time
    });
    classNameInput.value = "";
    classTimePicker.value = "09:00";
    renderClassRows();
  });

  const saveClassBtn = document.createElement("button");
  saveClassBtn.className = "btn btn-primary";
  saveClassBtn.style.width = "100%";
  saveClassBtn.style.transition = "transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)";
  saveClassBtn.textContent = "Save Class Reminders";
  saveClassBtn.addEventListener("click", async () => {
    saveClassBtn.style.transform = "scale(0.95)";
    setTimeout(() => saveClassBtn.style.transform = "scale(1)", 150);

    const data = await getStorage(["settings"]);
    const nextSettings = data.settings || {};
    nextSettings.classSchedules = classSchedules;
    await setStorage({ settings: nextSettings });

    showToast("Class reminders saved!");

    try {
      chrome.runtime.sendMessage({
        action: "syncClassReminders",
        schedules: classSchedules
      }).catch(() => {});
    } catch (e) {
      // Background may be unavailable during extension reload.
    }
  });

  classReminderSection.appendChild(saveClassBtn);

  const testNotifBtn = document.createElement("button");
  testNotifBtn.className = "btn btn-secondary";
  testNotifBtn.style.width = "100%";
  testNotifBtn.style.marginTop = "8px";
  testNotifBtn.textContent = "🔔 Test Notification";
  testNotifBtn.addEventListener("click", () => {
    try {
      chrome.runtime.sendMessage({ action: "testNotification" }, (response) => {
        if (chrome.runtime.lastError) {
          showToast("Error: " + chrome.runtime.lastError.message);
        } else if (response && response.status === "error") {
          showToast("API Error: " + response.message);
        } else {
          showToast("Test notification sent!");
        }
      });
    } catch (e) {
      showToast("Background script unavailable.");
    }
  });
  classReminderSection.appendChild(testNotifBtn);

  wrapper.appendChild(classReminderSection);
  renderClassRows();

  const exportSection = document.createElement("div");
  exportSection.className = "settings-section";

  const exportBtn = document.createElement("button");
  exportBtn.className = "btn btn-primary";
  exportBtn.textContent = "Export All Data";
  exportBtn.addEventListener("click", async () => {
    const allData = await getStorage(null);
    const json = JSON.stringify(allData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jee-dashboard-backup-${getTodayString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Data exported!");
  });
  exportSection.appendChild(exportBtn);
  wrapper.appendChild(exportSection);

  const importSection = document.createElement("div");
  importSection.className = "settings-section";

  const importLabel = document.createElement("label");
  importLabel.className = "btn btn-secondary";
  importLabel.textContent = "Import Data";

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";
  fileInput.style.display = "none";
  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const confirmed = confirm("This will replace all current data. Continue?");
    if (!confirmed) {
      fileInput.value = "";
      return;
    }

    const text = await file.text();
    try {
      const imported = JSON.parse(text);
      if (typeof imported !== "object" || imported === null || Array.isArray(imported)) {
        showToast("Invalid backup file format.");
        fileInput.value = "";
        return;
      }
      await setStorage(imported);
      showToast("Data imported! Reloading...");
      setTimeout(() => location.reload(), 1000);
    } catch (err) {
      showToast("Failed to parse backup file.");
    }
    fileInput.value = "";
  });

  importLabel.appendChild(fileInput);
  importSection.appendChild(importLabel);
  wrapper.appendChild(importSection);

  const resetSection = document.createElement("div");
  resetSection.className = "settings-section";

  const resetBtn = document.createElement("button");
  resetBtn.className = "btn btn-danger";
  resetBtn.textContent = "Reset All Data";
  resetBtn.addEventListener("click", () => {
    const confirmed = confirm("Are you sure? This will delete ALL your data permanently.");
    if (!confirmed) return;
    chrome.storage.local.clear(() => {
      showToast("All data cleared. Reloading...");
      setTimeout(() => location.reload(), 1000);
    });
  });
  resetSection.appendChild(resetBtn);
  wrapper.appendChild(resetSection);

  const aboutSection = document.createElement("div");
  aboutSection.className = "settings-section about-section";

  const aboutTitle = document.createElement("h3");
  aboutTitle.textContent = "About";
  aboutSection.appendChild(aboutTitle);

  const versionEl = document.createElement("p");
  versionEl.className = "about-text";
  versionEl.textContent = "JEE Study Dashboard v0.1.1";
  aboutSection.appendChild(versionEl);

  const usageEl = document.createElement("p");
  usageEl.className = "about-text";
  usageEl.textContent = "Calculating storage usage...";
  aboutSection.appendChild(usageEl);

  wrapper.appendChild(aboutSection);
  container.appendChild(wrapper);

  try {
    const bytes = await getStorageUsage();
    const kb = (bytes / 1024).toFixed(1);
    usageEl.textContent = `Storage used: ${kb} KB`;
  } catch (e) {
    usageEl.textContent = "Storage used: Unable to calculate";
  }
}
