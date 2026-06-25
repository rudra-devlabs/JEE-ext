import { getStorage, setStorage } from "./storage.js";
import { getAvailableModels } from "./chat.js";
import { createScrollTimePicker, createQuantityOptionsRow } from "./ui.js";

function showToast(message, undoCallback) {
  document.dispatchEvent(new CustomEvent("show-toast", {
    detail: { message, undoCallback }
  }));
}

function showRenameModal(currentLabel, onSave) {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.5)";
  overlay.style.zIndex = "99999";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";

  const modal = document.createElement("div");
  modal.style.background = "var(--bg-primary)";
  modal.style.padding = "20px";
  modal.style.borderRadius = "8px";
  modal.style.width = "300px";
  modal.style.border = "1px solid var(--border-color)";

  const title = document.createElement("h4");
  title.textContent = "Rename Model";
  title.style.margin = "0 0 16px 0";

  const input = document.createElement("input");
  input.type = "text";
  input.value = currentLabel;
  input.className = "input-field";
  input.style.width = "100%";
  input.style.marginBottom = "16px";

  const btns = document.createElement("div");
  btns.style.display = "flex";
  btns.style.justifyContent = "flex-end";
  btns.style.gap = "8px";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "btn btn-secondary";
  cancelBtn.textContent = "Cancel";
  cancelBtn.onclick = () => document.body.removeChild(overlay);

  const saveBtn = document.createElement("button");
  saveBtn.className = "btn btn-primary";
  saveBtn.textContent = "Save";
  saveBtn.onclick = () => {
    const val = input.value.trim();
    if (val) onSave(val);
    document.body.removeChild(overlay);
  };

  btns.appendChild(cancelBtn);
  btns.appendChild(saveBtn);
  modal.appendChild(title);
  modal.appendChild(input);
  modal.appendChild(btns);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  input.focus();
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
    unlinkBtn.style.padding = "6px 12px";
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

    const copyBtn = document.createElement("button");
    copyBtn.className = "btn";
    copyBtn.style.padding = "6px 8px";
    copyBtn.style.backgroundColor = "var(--bg-card)";
    copyBtn.style.border = "1px solid var(--border-color)";
    copyBtn.style.color = "var(--text-secondary)";
    copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    copyBtn.title = "Copy API Key";
    
    copyBtn.addEventListener("click", () => {
      const keyVal = input.value;
      if (keyVal) {
        navigator.clipboard.writeText(keyVal).then(() => {
          showToast("API Key copied!");
        }).catch(() => {
          showToast("Failed to copy API key.");
        });
      }
    });

    row.appendChild(input);
    row.appendChild(copyBtn);
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

  const compressionSection = document.createElement("div");
  compressionSection.className = "settings-section";
  const compTitle = document.createElement("h3");
  compTitle.textContent = "Chat Compression Model";
  compTitle.style.marginBottom = "8px";
  compressionSection.appendChild(compTitle);
  const compDesc = document.createElement("p");
  compDesc.textContent = "Select the model used when you click 'Compress Chat' to summarize history.";
  compDesc.style.fontSize = "12px";
  compDesc.style.color = "var(--text-secondary)";
  compDesc.style.marginBottom = "16px";
  compressionSection.appendChild(compDesc);
  const compDropdownContainer = document.createElement("div");
  compDropdownContainer.style.width = "100%";
  compressionSection.appendChild(compDropdownContainer);
  wrapper.appendChild(compressionSection);

  const modelVisSection = document.createElement("div");
  modelVisSection.className = "settings-section";

  const modelVisTitle = document.createElement("h3");
  modelVisTitle.textContent = "Model Visibility & Custom Models";
  modelVisTitle.style.marginBottom = "8px";
  modelVisSection.appendChild(modelVisTitle);

  const modelVisDesc = document.createElement("p");
  modelVisDesc.textContent = "Check the providers and models you want to see in the chat dropdown. You can also add custom models and edit existing names.";
  modelVisDesc.style.fontSize = "12px";
  modelVisDesc.style.color = "var(--text-secondary)";
  modelVisDesc.style.marginBottom = "16px";
  modelVisSection.appendChild(modelVisDesc);

  const addModelContainer = document.createElement("div");
  addModelContainer.style.marginBottom = "16px";
  addModelContainer.style.display = "flex";
  addModelContainer.style.flexDirection = "column";
  addModelContainer.style.gap = "8px";
  addModelContainer.style.padding = "12px";
  addModelContainer.style.background = "var(--bg-secondary)";
  addModelContainer.style.borderRadius = "8px";
  addModelContainer.style.border = "1px solid var(--border-color)";

  const addModelTitle = document.createElement("h4");
  addModelTitle.textContent = "Add Custom Model";
  addModelTitle.style.fontSize = "13px";
  addModelContainer.appendChild(addModelTitle);

  const providerSelectContainer = document.createElement("div");
  providerSelectContainer.style.width = "100%";
  let currentProvider = "";
  
  const idInput = document.createElement("input");
  idInput.type = "text";
  idInput.className = "input-field";
  idInput.placeholder = "Model ID (e.g. openai/o1-mini)";

  const labelInput = document.createElement("input");
  labelInput.type = "text";
  labelInput.className = "input-field";
  labelInput.placeholder = "Display Name (e.g. O1 Mini (Fast))";
  
  const visionLabel = document.createElement("label");
  visionLabel.style.display = "flex";
  visionLabel.style.alignItems = "center";
  visionLabel.style.fontSize = "13px";
  visionLabel.style.cursor = "pointer";
  const visionCheck = document.createElement("input");
  visionCheck.type = "checkbox";
  visionCheck.style.marginRight = "8px";
  visionLabel.appendChild(visionCheck);
  visionLabel.appendChild(document.createTextNode("Vision Supported"));

  const addModelBtn = document.createElement("button");
  addModelBtn.className = "btn btn-secondary";
  addModelBtn.textContent = "Add Model";
  
  addModelContainer.appendChild(providerSelectContainer);
  addModelContainer.appendChild(idInput);
  addModelContainer.appendChild(labelInput);
  addModelContainer.appendChild(visionLabel);
  addModelContainer.appendChild(addModelBtn);

  modelVisSection.appendChild(addModelContainer);

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
  modelVisSection.appendChild(visContainer);

  const saveVisBtn = document.createElement("button");
  saveVisBtn.className = "btn btn-primary";
  saveVisBtn.style.width = "100%";
  saveVisBtn.style.marginTop = "12px";
  saveVisBtn.textContent = "Save Visibility Options";
  modelVisSection.appendChild(saveVisBtn);
  wrapper.appendChild(modelVisSection);

  async function renderVisibilityUI() {
    visContainer.innerHTML = "";
    providerSelectContainer.innerHTML = "";
    
    const allModels = await getAvailableModels();
    const providers = [...new Set(allModels.map(m => m.provider))];
    if (providers.length > 0 && !currentProvider) currentProvider = providers[0];
    if (!providers.includes(currentProvider)) currentProvider = providers[0] || "";

    providerSelectContainer.innerHTML = `
      <div class="custom-dropdown" style="width: 100%; border-color: var(--border-color); background: var(--bg-primary);">
        <div class="custom-dropdown-header" style="background: var(--bg-primary); padding: 8px 12px;">
          <div class="custom-dropdown-value" style="font-size: 13px;">${currentProvider}</div>
          <svg class="custom-dropdown-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div class="custom-dropdown-options" style="background: var(--bg-primary);"></div>
      </div>
    `;

    const dropdown = providerSelectContainer.querySelector(".custom-dropdown");
    const header = providerSelectContainer.querySelector(".custom-dropdown-header");
    const valueEl = providerSelectContainer.querySelector(".custom-dropdown-value");
    const optionsContainer = providerSelectContainer.querySelector(".custom-dropdown-options");

    providers.forEach(p => {
      const option = document.createElement("div");
      option.className = "custom-dropdown-option" + (p === currentProvider ? " selected" : "");
      option.textContent = p;
      option.style.padding = "8px 12px";
      option.style.fontSize = "13px";
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        currentProvider = p;
        valueEl.textContent = p;
        Array.from(optionsContainer.children).forEach(c => c.classList.remove("selected"));
        option.classList.add("selected");
        dropdown.classList.remove("open");
      });
      optionsContainer.appendChild(option);
    });

    header.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("open");
    });

    document.addEventListener("click", function closeDropdown(e) {
      if (!document.body.contains(dropdown)) {
        document.removeEventListener("click", closeDropdown);
        return;
      }
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("open");
      }
    });

    // Fetch settings to avoid undefined error
    const db = await getStorage(["chatSettings"]);
    const currentSettings = db.chatSettings || {};

    // Populate compression model dropdown
    compDropdownContainer.innerHTML = "";
    let currentCompModelId = currentSettings.compressionModel || allModels[0].id;
    let currentCompLabel = allModels.find(m => m.id === currentCompModelId)?.label || allModels[0].label;
    const override = currentSettings.modelOverrides?.[currentCompModelId]?.label;
    if (override) currentCompLabel = override;

    compDropdownContainer.innerHTML = `
      <div class="custom-dropdown" style="width: 100%; border-color: var(--border-color); background: var(--bg-primary);">
        <div class="custom-dropdown-header" style="background: var(--bg-primary); padding: 8px 12px;">
          <div class="custom-dropdown-value" style="font-size: 13px;">${currentCompLabel}</div>
          <svg class="custom-dropdown-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div class="custom-dropdown-options" style="background: var(--bg-primary);"></div>
      </div>
    `;

    const compDropdown = compDropdownContainer.querySelector(".custom-dropdown");
    const compHeader = compDropdownContainer.querySelector(".custom-dropdown-header");
    const compValueEl = compDropdownContainer.querySelector(".custom-dropdown-value");
    const compOptionsContainer = compDropdownContainer.querySelector(".custom-dropdown-options");

    const compGroups = {};
    allModels.forEach(m => {
      const g = m.group || "Other";
      if (!compGroups[g]) compGroups[g] = [];
      compGroups[g].push(m);
    });

    Object.keys(compGroups).forEach(group => {
      const groupLabel = document.createElement("div");
      groupLabel.className = "custom-dropdown-group-label";
      groupLabel.textContent = group;
      compOptionsContainer.appendChild(groupLabel);

      compGroups[group].forEach(m => {
        const mLabel = currentSettings.modelOverrides?.[m.id]?.label || m.label;
        const option = document.createElement("div");
        option.className = "custom-dropdown-option" + (m.id === currentCompModelId ? " selected" : "");
        
        let providerTag = "";
        if (m.provider === "gemini") providerTag = `<span class="model-tag" style="background: rgba(66, 133, 244, 0.2); color: #8ab4f8; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">Gemini</span>`;
        else if (m.provider === "alibaba") providerTag = `<span class="model-tag" style="background: rgba(255, 106, 0, 0.2); color: #ff8c00; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">Alibaba</span>`;
        else if (m.provider === "openrouter") providerTag = `<span class="model-tag" style="background: rgba(212, 175, 55, 0.2); color: #ffd700; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">OpenRouter</span>`;
        else if (m.provider === "groq") providerTag = `<span class="model-tag" style="background: rgba(245, 80, 54, 0.2); color: #ff7f50; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">Groq</span>`;
        else if (m.provider === "cerebras") providerTag = `<span class="model-tag" style="background: rgba(255, 182, 193, 0.2); color: #ff69b4; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">Cerebras</span>`;
        else providerTag = `<span class="model-tag" style="background: rgba(245, 124, 0, 0.2); color: #ffb74d; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">Mistral</span>`;

        option.innerHTML = `<span style="font-size: 13px;">${mLabel}</span>${providerTag}`;
        option.style.padding = "8px 12px";
        option.style.display = "flex";
        option.style.alignItems = "center";
        
        option.addEventListener("click", async (e) => {
          e.stopPropagation();
          compValueEl.innerHTML = `<span style="font-size: 13px;">${mLabel}</span>${providerTag}`;
          Array.from(compOptionsContainer.children).forEach(c => c.classList.remove("selected"));
          option.classList.add("selected");
          compDropdown.classList.remove("open");
          currentSettings.compressionModel = m.id;
          await setStorage({ chatSettings: currentSettings });
          showToast("Compression model updated!");
        });
        compOptionsContainer.appendChild(option);
      });
    });

    compHeader.addEventListener("click", (e) => {
      e.stopPropagation();
      compDropdown.classList.toggle("open");
    });

    document.addEventListener("click", function closeCompDropdown(e) {
      if (!document.body.contains(compDropdown)) {
        document.removeEventListener("click", closeCompDropdown);
        return;
      }
      if (!compDropdown.contains(e.target)) {
        compDropdown.classList.remove("open");
      }
    });

    const hiddenModels = currentSettings.hiddenModels || [];
    const hiddenGroups = currentSettings.hiddenGroups || [];

    const groups = {};
    allModels.forEach((m) => {
      if (!groups[m.group]) groups[m.group] = [];
      groups[m.group].push(m);
    });

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
        mText.style.flex = "1";
        
        const mEditBtn = document.createElement("button");
        mEditBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;
        mEditBtn.style.background = "none";
        mEditBtn.style.border = "none";
        mEditBtn.style.cursor = "pointer";
        mEditBtn.style.marginLeft = "8px";
        mEditBtn.style.fontSize = "12px";

        const mDeleteBtn = document.createElement("button");
        mDeleteBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
        mDeleteBtn.style.background = "none";
        mDeleteBtn.style.border = "none";
        mDeleteBtn.style.cursor = "pointer";
        mDeleteBtn.style.marginLeft = "4px";
        mDeleteBtn.style.fontSize = "12px";
        mDeleteBtn.style.color = "var(--error-color, #ff4444)";
        
        mEditBtn.addEventListener("click", (e) => {
          e.preventDefault();
          showRenameModal(m.label, async (newLabel) => {
            const currentDb = await getStorage(["chatSettings"]);
            const currentSettings = currentDb.chatSettings || {};
            currentSettings.modelOverrides = currentSettings.modelOverrides || {};
            currentSettings.modelOverrides[m.id] = { label: newLabel };
            await setStorage({ chatSettings: currentSettings });
            showToast("Model name updated!");
            renderVisibilityUI(); // Refresh UI
          });
        });

        mDeleteBtn.addEventListener("click", async (e) => {
          e.preventDefault();
          const currentDb = await getStorage(["chatSettings"]);
          const currentSettings = currentDb.chatSettings || {};
          
          if (m.group === "Custom") {
             currentSettings.customModels = (currentSettings.customModels || []).filter(cm => cm.id !== m.id);
          } else {
             currentSettings.deletedModels = currentSettings.deletedModels || [];
             if (!currentSettings.deletedModels.includes(m.id)) {
                 currentSettings.deletedModels.push(m.id);
             }
          }
          await setStorage({ chatSettings: currentSettings });
          showToast("Model deleted!");
          renderVisibilityUI(); // Refresh UI
        });
        
        mLabel.appendChild(mCheck);
        mLabel.appendChild(mText);
        mLabel.appendChild(mEditBtn);
        mLabel.appendChild(mDeleteBtn);
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
  }

  addModelBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const provider = currentProvider;
    const id = idInput.value.trim();
    const label = labelInput.value.trim();
    const vision = visionCheck.checked;
    
    if (!id || !label) {
      showToast("Please provide both Model ID and Display Name");
      return;
    }
    
    const db = await getStorage(["chatSettings"]);
    const settings = db.chatSettings || {};
    if (!Array.isArray(settings.customModels)) {
      settings.customModels = Object.values(settings.customModels || {});
    }
    
    const allModels = await getAvailableModels();
    if (allModels.find(m => m.id === id)) {
      showToast("Model already exists!");
      return;
    }
    
    // Check if the model is in deletedModels and remove it
    if (settings.deletedModels) {
      settings.deletedModels = settings.deletedModels.filter(d => d !== id);
    }

    let targetGroup = "Custom Models";
    const defaultForProvider = allModels.find(m => m.provider === provider && m.group && !m.group.includes("Custom"));
    if (defaultForProvider) {
      targetGroup = defaultForProvider.group;
    }

    settings.customModels.push({ id, label, provider, vision, group: targetGroup });
    await setStorage({ chatSettings: settings });
    showToast("Custom model added!");
    idInput.value = "";
    labelInput.value = "";
    visionCheck.checked = false;
    renderVisibilityUI();
  });

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

    const db = await getStorage(["chatSettings"]);
    const settings = db.chatSettings || {};
    settings.hiddenGroups = newHiddenGroups;
    settings.hiddenModels = newHiddenModels;
    await setStorage({ chatSettings: settings });
    showToast("Model visibility saved!");
  });

  renderVisibilityUI();

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

  const recurringTodoSection = document.createElement("div");
  recurringTodoSection.className = "settings-section";

  const recurringTitle = document.createElement("h3");
  recurringTitle.textContent = "Daily Recurring Todos";
  recurringTodoSection.appendChild(recurringTitle);

  const recurringDesc = document.createElement("p");
  recurringDesc.textContent = "Set up tasks that will automatically be added to your Todo list every day.";
  recurringDesc.style.fontSize = "12px";
  recurringDesc.style.color = "var(--text-secondary)";
  recurringDesc.style.marginBottom = "12px";
  recurringTodoSection.appendChild(recurringDesc);

  let recurringTodos = Array.isArray(reminderSettings.recurringTodos) ? [...reminderSettings.recurringTodos] : [];

  const recurringInputRow = document.createElement("div");
  recurringInputRow.className = "input-row";
  recurringInputRow.style.display = "flex";
  recurringInputRow.style.flexDirection = "column";
  recurringInputRow.style.gap = "8px";
  recurringInputRow.style.marginBottom = "12px";

  const recTopRow = document.createElement("div");
  recTopRow.style.display = "flex";
  recTopRow.style.gap = "8px";

  const recurringNameInput = document.createElement("input");
  recurringNameInput.type = "text";
  recurringNameInput.className = "input-field";
  recurringNameInput.placeholder = "Task name (e.g. Solve 20 Math MCQs)";
  recurringNameInput.style.flex = "1";

  const addRecurringBtn = document.createElement("button");
  addRecurringBtn.className = "btn btn-secondary";
  addRecurringBtn.textContent = "Add Task";

  recTopRow.appendChild(recurringNameInput);
  recTopRow.appendChild(addRecurringBtn);
  recurringInputRow.appendChild(recTopRow);

  const { row: optionsRowRec, checkbox: trackCbRec, input: targetInRec } = createQuantityOptionsRow("rec-todo");
  recurringInputRow.appendChild(optionsRowRec);

  recurringTodoSection.appendChild(recurringInputRow);

  const recurringList = document.createElement("div");
  recurringList.style.display = "flex";
  recurringList.style.flexDirection = "column";
  recurringList.style.gap = "8px";
  recurringList.style.marginBottom = "12px";
  recurringTodoSection.appendChild(recurringList);

  function renderRecurringRows() {
    recurringList.innerHTML = "";
    if (recurringTodos.length === 0) {
      const empty = document.createElement("div");
      empty.style.fontSize = "13px";
      empty.style.color = "var(--text-secondary)";
      empty.textContent = "No recurring tasks added yet.";
      recurringList.appendChild(empty);
      return;
    }

    recurringTodos.forEach((task) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.gap = "8px";
      row.style.alignItems = "center";
      row.style.padding = "8px 10px";
      row.style.background = "var(--bg-secondary)";
      row.style.border = "1px solid var(--border-color)";
      row.style.borderRadius = "8px";

      const label = document.createElement("div");
      label.textContent = task.text + (task.hasQuantity ? ` (Target: ${task.targetQuantity})` : "");
      label.style.fontSize = "13px";
      label.style.color = "var(--text-primary)";
      label.style.flex = "1";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-danger";
      deleteBtn.style.padding = "6px 10px";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        recurringTodos = recurringTodos.filter((item) => item.id !== task.id);
        renderRecurringRows();
      });

      row.appendChild(label);
      row.appendChild(deleteBtn);
      recurringList.appendChild(row);
    });
  }

  addRecurringBtn.addEventListener("click", () => {
    const text = recurringNameInput.value.trim();
    if (!text) {
      showToast("Please enter a task name.");
      return;
    }

    const hasQuantity = trackCbRec ? trackCbRec.checked : false;
    let targetQuantity = 0;
    if (hasQuantity) {
      targetQuantity = parseInt(targetInRec.value, 10);
      if (isNaN(targetQuantity) || targetQuantity <= 0) {
        showToast("Please enter a valid target quantity.");
        targetInRec.focus();
        return;
      }
    }

    recurringTodos.push({
      id: generateReminderId(),
      text,
      hasQuantity,
      targetQuantity
    });

    recurringNameInput.value = "";
    if (trackCbRec) trackCbRec.checked = false;
    if (targetInRec) { targetInRec.value = ""; targetInRec.style.display = "none"; }
    renderRecurringRows();
  });

  const saveRecurringBtn = document.createElement("button");
  saveRecurringBtn.className = "btn btn-primary";
  saveRecurringBtn.style.width = "100%";
  saveRecurringBtn.textContent = "Save Recurring Todos";
  saveRecurringBtn.addEventListener("click", async () => {
    const data = await getStorage(["settings"]);
    const nextSettings = data.settings || {};
    nextSettings.recurringTodos = recurringTodos;
    await setStorage({ settings: nextSettings });
    showToast("Recurring todos saved!");
  });

  recurringTodoSection.appendChild(saveRecurringBtn);
  wrapper.appendChild(recurringTodoSection);
  renderRecurringRows();

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
    usageEl.textContent = `Storage used: ${kb} KB`;
  } catch (e) {
    usageEl.textContent = "Storage used: Unable to calculate";
  }
}
