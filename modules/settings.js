import { getStorage, setStorage } from "./storage.js";
import { MODELS } from "./chat.js";

function showToast(message, undoCallback) {
  document.dispatchEvent(new CustomEvent("show-toast", {
    detail: { message, undoCallback }
  }));
}

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

  const themeSection = document.createElement("div");
  themeSection.className = "settings-section";

  const themeRow = document.createElement("div");
  themeRow.className = "setting-row";

  const themeLabel = document.createElement("span");
  themeLabel.className = "settings-label";
  themeLabel.textContent = settings.theme === "dark" ? "Dark Mode" : "Light Mode";
  themeRow.appendChild(themeLabel);

  const toggleSwitch = document.createElement("div");
  toggleSwitch.className = "toggle-switch" + (settings.theme === "dark" ? " active" : "");

  const toggleKnob = document.createElement("div");
  toggleKnob.className = "toggle-knob";
  toggleSwitch.appendChild(toggleKnob);

  toggleSwitch.addEventListener("click", async () => {
    const isDark = toggleSwitch.classList.contains("active");
    if (isDark) {
      toggleSwitch.classList.remove("active");
      document.body.classList.remove("dark-theme");
      document.body.classList.add("light-theme");
      themeLabel.textContent = "Light Mode";
      settings.theme = "light";
    } else {
      toggleSwitch.classList.add("active");
      document.body.classList.remove("light-theme");
      document.body.classList.add("dark-theme");
      themeLabel.textContent = "Dark Mode";
      settings.theme = "dark";
    }
    await setStorage({ settings });
  });

  themeRow.appendChild(toggleSwitch);
  themeSection.appendChild(themeRow);
  wrapper.appendChild(themeSection);

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
  const puter = createApiKeyInput("Puter Auth Token", "Enter Puter Auth Token...", "puterApiKey");
  puter.wrapper.style.marginBottom = "0";

  const mistralInput = mistral.input;
  const alibabaInput = alibaba.input;
  const groqInput = groq.input;
  const openRouterInput = openRouter.input;
  const geminiInput = gemini.input;
  const cerebrasInput = cerebras.input;
  const puterInput = puter.input;

  const puterHelp = document.createElement("p");
  puterHelp.style.fontSize = "12px";
  puterHelp.style.color = "var(--text-secondary)";
  puterHelp.style.margin = "4px 0 12px 0";
  puterHelp.innerHTML = `To use Puter models, log into <a href="https://puter.com" target="_blank" style="color:var(--accent-primary);">Puter.com</a>, open Developer Tools (F12) -> Application -> Local Storage -> <b>authToken</b> and paste it here.`;

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
    chatSettings.puterApiKey = puterInput.value.trim().replace(/^["']|["']$/g, '');
    await setStorage({ chatSettings });
    showToast("API Keys saved successfully!");
  });

  apiSection.appendChild(mistral.wrapper);
  apiSection.appendChild(alibaba.wrapper);
  apiSection.appendChild(groq.wrapper);
  apiSection.appendChild(openRouter.wrapper);
  apiSection.appendChild(gemini.wrapper);
  apiSection.appendChild(cerebras.wrapper);
  apiSection.appendChild(puter.wrapper);
  apiSection.appendChild(puterHelp);
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
  versionEl.textContent = "JEE Study Dashboard v1.0.0";
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
    usageEl.textContent = `Storage used: ${kb} KB of 10 MB`;
  } catch (e) {
    usageEl.textContent = "Storage used: Unable to calculate";
  }
}
