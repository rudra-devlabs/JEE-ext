import { getStorage, setStorage } from "./storage.js";

const MISTRAL_API_ENDPOINT = "https://api.mistral.ai/v1/chat/completions";
const ALIBABA_API_ENDPOINT = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
const GROQ_API_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_API_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const CEREBRAS_API_ENDPOINT = "https://api.cerebras.ai/v1/chat/completions";

export const MODELS = [
  { id: "openai/gpt-5.5", label: "GPT-5.5", group: "Puter (Free)", provider: "puter", vision: true },
  { id: "anthropic/claude-opus-4-8", label: "Claude Opus 4.8", group: "Puter (Free)", provider: "puter", vision: true },
  { id: "deepseek/deepseek-v4-pro", label: "DeepSeek V4 Pro", group: "Puter (Free)", provider: "puter" },
  { id: "google/gemini-3.5-flash", label: "Gemini 3.5 Flash", group: "Puter (Free)", provider: "puter", vision: true },
  { id: "x-ai/grok-4.3", label: "Grok 4.3", group: "Puter (Free)", provider: "puter", vision: true },
  { id: "qwen/qwen3.7-max", label: "Qwen 3.7 Max", group: "Puter (Free)", provider: "puter", vision: true },
  { id: "z-ai/glm-5.2", label: "GLM 5.2", group: "Puter (Free)", provider: "puter" },
  { id: "meta-llama/llama-4-maverick", label: "Llama 4 Maverick", group: "Puter (Free)", provider: "puter", vision: true },
  { id: "moonshotai/kimi-k2.6", label: "Kimi K2.6", group: "Puter (Free)", provider: "puter" },
  { id: "microsoft/phi-4", label: "Phi-4", group: "Puter (Free)", provider: "puter" },
  { id: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet", group: "Puter (Free)", provider: "puter", vision: true },
  { id: "gpt-4o", label: "GPT-4o", group: "Puter (Free)", provider: "puter", vision: true },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", group: "Puter (Free)", provider: "puter", vision: true },
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3", params: "70B", group: "Groq Flagship", provider: "groq" },
  { id: "qwen/qwen3.6-27b", label: "Qwen 3.6", params: "27B", group: "Groq Experimental", provider: "groq" },
  { id: "qwen/qwen3-32b", label: "Qwen 3", params: "32B", group: "Groq Experimental", provider: "groq" },
  { id: "groq/compound", label: "Groq Compound", group: "Groq Experimental", provider: "groq" },
  { id: "openai/gpt-oss-120b", label: "GPT OSS", params: "120B", group: "Groq Experimental", provider: "groq" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 (Instant)", params: "8B", group: "Groq Standard", provider: "groq" },
  { id: "pixtral-large-latest", label: "Pixtral Large", vision: true, group: "Mistral Vision", provider: "mistral" },
  { id: "pixtral-12b-2409", label: "Pixtral", params: "12B", vision: true, group: "Mistral Vision", provider: "mistral" },
  { id: "mistral-large-latest", label: "Mistral Large (Latest)", group: "Mistral Flagship", provider: "mistral" },
  { id: "mistral-large-3", label: "Mistral Large 3", group: "Mistral Flagship", provider: "mistral" },
  { id: "mistral-medium-latest", label: "Mistral Medium", group: "Mistral Flagship", provider: "mistral" },
  { id: "open-mistral-nemo", label: "Open Mistral Nemo", group: "Mistral Open", provider: "mistral" },
  { id: "codestral-latest", label: "Codestral", group: "Mistral Specialized", provider: "mistral" },
  { id: "deepseek-v4-pro", label: "DeepSeek V4 Pro", group: "Alibaba DashScope", provider: "alibaba" },
  { id: "deepseek-v4-flash", label: "DeepSeek V4 Flash", group: "Alibaba DashScope", provider: "alibaba" },
  { id: "qwen3.7-max", label: "Qwen 3.7 Max", group: "Alibaba DashScope", provider: "alibaba" },
  { id: "qwen3.7-plus", label: "Qwen 3.7 Plus", group: "Alibaba DashScope", provider: "alibaba" },
  { id: "qwen3.6-max", label: "Qwen 3.6 Max", group: "Alibaba DashScope", provider: "alibaba" },
  { id: "qwen3.6-plus", label: "Qwen 3.6 Plus", group: "Alibaba DashScope", provider: "alibaba" },
  { id: "qwen3.6-flash", label: "Qwen 3.6 Flash", group: "Alibaba DashScope", provider: "alibaba" },
  { id: "qwen-max", label: "Qwen Max", group: "Alibaba DashScope", provider: "alibaba" },
  { id: "qwen-plus", label: "Qwen Plus", group: "Alibaba DashScope", provider: "alibaba" },
  { id: "qwen-turbo", label: "Qwen Turbo", group: "Alibaba DashScope", provider: "alibaba" },
  { id: "qwen-coder-plus", label: "Qwen Coder Plus", group: "Alibaba DashScope", provider: "alibaba" },
  { id: "qwen-vl-max", label: "Qwen VL Max", vision: true, group: "Alibaba DashScope", provider: "alibaba" },
  { id: "qwen-vl-plus", label: "Qwen VL Plus", vision: true, group: "Alibaba DashScope", provider: "alibaba" },
  { id: "glm-5.1", label: "GLM 5.1", group: "Alibaba DashScope", provider: "alibaba" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3", params: "70B", group: "OpenRouter Free", provider: "openrouter" },
  { id: "nousresearch/hermes-3-llama-3.1-405b:free", label: "Hermes 3", params: "405B", group: "OpenRouter Free", provider: "openrouter" },
  { id: "qwen/qwen3-coder:free", label: "Qwen3 Coder", params: "480B", group: "OpenRouter Free", provider: "openrouter" },
  { id: "openai/gpt-oss-120b:free", label: "GPT OSS", params: "120B", group: "OpenRouter Free", provider: "openrouter" },
  { id: "google/gemma-4-31b-it:free", label: "Gemma 4", params: "31B", group: "OpenRouter Free", provider: "openrouter" },
  { id: "nvidia/nemotron-3-super-120b-a12b:free", label: "Nemotron 3 Super", params: "120B", group: "OpenRouter Free", provider: "openrouter" },
  { id: "nvidia/nemotron-nano-12b-v2-vl:free", label: "Nemotron VL", params: "12B", vision: true, group: "OpenRouter Free", provider: "openrouter" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", vision: true, group: "Google AI Studio", provider: "gemini" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", vision: true, group: "Google AI Studio", provider: "gemini" },
  { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite", vision: true, group: "Google AI Studio", provider: "gemini" },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", vision: true, group: "Google AI Studio", provider: "gemini" },
  { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash", vision: true, group: "Google AI Studio", provider: "gemini" },
  { id: "gpt-oss-120b", label: "OpenAI GPT OSS", params: "120B", group: "Cerebras", provider: "cerebras" },
  { id: "zai-glm-4.7", label: "Z.ai GLM 4.7", group: "Cerebras", provider: "cerebras" }
];

let mistralApiKey = "";
let alibabaApiKey = "";
let groqApiKey = "";
let openRouterApiKey = "";
let geminiApiKey = "";
let cerebrasApiKey = "";
let selectedModel = "claude-3-5-sonnet";
let messages = [];
let isLoading = false;
let pendingImages = [];
let isIncognito = false;
let currentAbortController = null;
let chatSessions = [];
let currentSessionId = null;

function getTextContent(msg) {
  if (typeof msg.content === "string") return msg.content;
  if (Array.isArray(msg.content)) {
    const txtPart = msg.content.find(p => p.type === "text");
    return txtPart ? txtPart.text : "Image Context";
  }
  return "";
}

async function generateChatTitle(container, sessionId, userMsg, aiMsg) {
  try {
    const selectedModelData = MODELS.find(m => m.id === selectedModel);
    const provider = selectedModelData ? selectedModelData.provider : "mistral";

    let endpoint = MISTRAL_API_ENDPOINT;
    let currentKey = mistralApiKey;
    if (provider === "alibaba") { endpoint = ALIBABA_API_ENDPOINT; currentKey = alibabaApiKey; }
    if (provider === "groq") { endpoint = GROQ_API_ENDPOINT; currentKey = groqApiKey; }
    if (provider === "openrouter") { endpoint = OPENROUTER_API_ENDPOINT; currentKey = openRouterApiKey; }
    if (provider === "gemini") { endpoint = GEMINI_API_ENDPOINT; currentKey = geminiApiKey; }
    if (provider === "cerebras") { endpoint = CEREBRAS_API_ENDPOINT; currentKey = cerebrasApiKey; }

    const userText = getTextContent(userMsg);
    const aiText = getTextContent(aiMsg);

    const prompt = `Generate a very short title (max 5 words) for a chat based on this first interaction. Do not use quotes, punctuation at the end, or prefixes like "Title:".
User: ${userText}
AI: ${aiText}`;

    let title = "";
    if (provider === "puter") {
      const data = await getStorage(["chatSettings"]);
      const puterApiKey = (data.chatSettings?.puterApiKey || "").replace(/^["']|["']$/g, '');
      if (puterApiKey && window.puter && typeof window.puter.setAuthToken === "function") {
        window.puter.setAuthToken(puterApiKey);
      }
      
      const response = await window.puter.ai.chat([{role: "user", content: prompt}], { model: selectedModel });
      if (response && response.message && response.message.content) {
        title = response.message.content;
      } else if (response && response.text) {
        title = response.text;
      } else if (typeof response === "string") {
        title = response;
      }
      title = title.trim().replace(/['"]/g, '');
    } else {
      const body = JSON.stringify({
        model: selectedModel,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 20
      });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentKey}`
        },
        body: body
      });

      if (response.ok) {
        const json = await response.json();
        title = json.choices?.[0]?.message?.content?.trim().replace(/['"]/g, '');
      }
    }

    if (title) {
      const sessionIndex = chatSessions.findIndex(s => s.id === sessionId);
      if (sessionIndex !== -1) {
        chatSessions[sessionIndex].title = title;
        
        const data = await getStorage(["chatSettings"]);
        const settings = data.chatSettings || {};
        settings.chatSessions = chatSessions;
        await setStorage({ chatSettings: settings });
        
        renderSidebar(container);
      }
    }
  } catch (e) {
    console.error("Failed to generate title", e);
  }
}

function showToast(message) {
  document.dispatchEvent(new CustomEvent("show-toast", {
    detail: { message }
  }));
}

function groupModels(modelsList = MODELS) {
  const groups = {};
  modelsList.forEach((m) => {
    if (!groups[m.group]) groups[m.group] = [];
    groups[m.group].push(m);
  });
  return groups;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

const mathCache = new Map();

function renderMarkdownWithMath(text, element) {
  if (typeof window.marked === "undefined") {
    element.innerHTML = escapeHtml(text);
    return;
  }

  // Preprocess <think> tags for reasoning models
  const thinkIcon = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`;
  text = text.replace(/<think>([\s\S]*?)<\/think>/g, (match, p1) => {
    return `\n\n<details class="chat-thinking"><summary>${thinkIcon} Thinking Process</summary><div class="chat-thinking-content">\n\n${p1}\n\n</div></details>\n\n`;
  });
  if (text.includes("<think>")) {
    const parts = text.split("<think>");
    const before = parts[0];
    const after = parts.slice(1).join("<think>");
    text = before + `\n\n<details class="chat-thinking" open><summary>${thinkIcon} Thinking Process (in progress...)</summary><div class="chat-thinking-content">\n\n${after}\n\n</div></details>\n\n`;
  }

  const mathBlocks = [];
  
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, (match) => {
    mathBlocks.push(match);
    return `%%MATH_${mathBlocks.length - 1}%%`;
  });
  
  text = text.replace(/\\\[([\s\S]+?)\\\]/g, (match) => {
    mathBlocks.push(match);
    return `%%MATH_${mathBlocks.length - 1}%%`;
  });

  text = text.replace(/\\\(([\s\S]+?)\\\)/g, (match) => {
    mathBlocks.push(match);
    return `%%MATH_${mathBlocks.length - 1}%%`;
  });

  text = text.replace(/\\begin\{[a-zA-Z\*]+\}[\s\S]+?\\end\{[a-zA-Z\*]+\}/g, (match) => {
    mathBlocks.push(`$$${match}$$`);
    return `%%MATH_${mathBlocks.length - 1}%%`;
  });

  text = text.replace(/(^|[^\$])\$([^\$]+?)\$(?!\$)/g, (match, before, math) => {
    mathBlocks.push(`\\(${math}\\)`);
    return `${before}%%MATH_${mathBlocks.length - 1}%%`;
  });

  element.innerHTML = window.marked.parse(text);

  element.innerHTML = element.innerHTML.replace(/%%MATH_(\d+)%%/g, (_, idx) => {
    const rawMath = mathBlocks[idx];
    if (typeof window.katex !== "undefined") {
      if (mathCache.has(rawMath)) {
        return mathCache.get(rawMath);
      }
      try {
        const isDisplay = rawMath.startsWith("$$") || rawMath.startsWith("\\[");
        const innerMath = rawMath.replace(/^\$\$|^\\\[|^\\\(|\$\$$|\\\]$|\\\)$/g, '');
        const rendered = window.katex.renderToString(innerMath, { displayMode: isDisplay, throwOnError: false });
        mathCache.set(rawMath, rendered);
        return rendered;
      } catch (e) {
        return escapeHtml(rawMath);
      }
    }
    return escapeHtml(rawMath);
  });
}

function renderMessages(container) {
  const list = container.querySelector(".chat-messages");
  if (!list) return;

  if (messages.length === 0) {
    list.innerHTML = '<div class="chat-empty">Ask me anything about JEE prep — concepts, problem-solving, or study strategy.</div>';
    return;
  }

  list.innerHTML = "";
  messages.forEach((msg) => {
    const row = document.createElement("div");
    row.className = "chat-msg " + (msg.role === "user" ? "chat-msg-user" : "chat-msg-ai");

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    
    if (msg.role === "user") {
      if (Array.isArray(msg.content)) {
        bubble.innerHTML = "";
        msg.content.forEach(part => {
          if (part.type === "text") {
            const span = document.createElement("div");
            span.innerHTML = escapeHtml(part.text);
            bubble.appendChild(span);
          } else if (part.type === "image_url") {
            const img = document.createElement("img");
            img.src = typeof part.image_url === "string" ? part.image_url : part.image_url.url;
            img.className = "chat-bubble-img";
            bubble.appendChild(img);
          }
        });
      } else {
        bubble.innerHTML = escapeHtml(msg.content);
      }
    } else {
      renderMarkdownWithMath(msg.content, bubble);
    }
    const bubbleWrapper = document.createElement("div");
    bubbleWrapper.className = "chat-bubble-wrapper";
    bubbleWrapper.appendChild(bubble);

    const actionBar = document.createElement("div");
    actionBar.className = "chat-action-bar";

    const copyBtn = document.createElement("button");
    copyBtn.className = "chat-action-btn";
    copyBtn.title = "Copy";
    copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    
    let rawText = "";
    if (msg.role === "user") {
      rawText = Array.isArray(msg.content) ? msg.content.filter(p => p.type === "text").map(p => p.text).join("\\n") : msg.content;
    } else {
      rawText = msg.content;
    }

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(rawText);
      copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="#4ade80" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      setTimeout(() => {
        copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      }, 2000);
    };

    if (msg.role === "user") {
      const editBtn = document.createElement("button");
      editBtn.className = "chat-action-btn";
      editBtn.title = "Edit";
      editBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;
      editBtn.onclick = () => {
        const inputField = container.closest(".dashboard-container") ? container.closest(".dashboard-container").querySelector(".chat-input") : document.querySelector(".chat-input");
        if (inputField) {
          inputField.value = rawText;
          inputField.focus();
          inputField.style.height = 'auto';
          inputField.style.height = Math.min(inputField.scrollHeight, 200) + 'px';
        }
      };
      actionBar.appendChild(editBtn);
    }

    actionBar.appendChild(copyBtn);
    bubbleWrapper.appendChild(actionBar);
    row.appendChild(bubbleWrapper);
    list.appendChild(row);
  });

  list.scrollTop = list.scrollHeight;
}

function getModelLabelHtml(m) {
  let html = `<span class="model-name">${m.label}</span>`;
  let tags = '';
  if (m.params) tags += `<span class="model-tag tag-params">${m.params}</span>`;
  if (m.vision) tags += `<span class="model-tag tag-vision">VISION</span>`;
  if (tags) {
    html += `<div class="model-tags">${tags}</div>`;
  }
  return `<div class="model-option-content">${html}</div>`;
}

async function renderModelSelector(container) {
  const wrapper = container.querySelector(".chat-model-selector-wrapper");
  if (!wrapper) return;

  const data = await getStorage(["chatSettings"]);
  const hiddenModels = data.chatSettings?.hiddenModels || [];
  const hiddenGroups = data.chatSettings?.hiddenGroups || [];

  let visibleModels = MODELS.filter(m => !hiddenModels.includes(m.id) && !hiddenGroups.includes(m.group));
  if (visibleModels.length === 0) visibleModels = [MODELS[0]];

  if (!visibleModels.find(m => m.id === selectedModel)) {
    selectedModel = visibleModels[0].id;
    saveModel(selectedModel);
  }

  const currentModelData = visibleModels.find(m => m.id === selectedModel);
  const currentLabelHtml = currentModelData ? getModelLabelHtml(currentModelData) : `<div class="model-option-content"><span class="model-name">${selectedModel}</span></div>`;

  wrapper.innerHTML = `
    <div class="custom-dropdown">
      <div class="custom-dropdown-header">
        <div class="custom-dropdown-value">${currentLabelHtml}</div>
        <svg class="custom-dropdown-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
      <div class="custom-dropdown-options"></div>
    </div>
  `;

  const dropdown = wrapper.querySelector(".custom-dropdown");
  const header = wrapper.querySelector(".custom-dropdown-header");
  const optionsContainer = wrapper.querySelector(".custom-dropdown-options");

  const groups = groupModels(visibleModels);
  Object.keys(groups).forEach((group) => {
    const groupLabel = document.createElement("div");
    groupLabel.className = "custom-dropdown-group-label";
    groupLabel.textContent = group;
    optionsContainer.appendChild(groupLabel);

    groups[group].forEach((m) => {
      const option = document.createElement("div");
      option.className = "custom-dropdown-option" + (m.id === selectedModel ? " selected" : "");
      option.innerHTML = getModelLabelHtml(m);
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        saveModel(m.id);
        dropdown.classList.remove("open");
        renderAll(container);
      });
      optionsContainer.appendChild(option);
    });
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
}



function renderInputArea(container) {
  const sendBtn = container.querySelector(".chat-send-btn-icon");
  const input = container.querySelector(".chat-input");
  if (sendBtn && input) {
    if (isLoading) {
      sendBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12"></rect></svg>`;
      sendBtn.title = "Interrupt Generation";
      sendBtn.style.opacity = "1";
      sendBtn.style.pointerEvents = "auto";
    } else {
      const hasContent = input.value.trim().length > 0 || pendingImages.length > 0;
      sendBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`;
      sendBtn.title = "Send Message";
      sendBtn.style.opacity = hasContent ? "1" : "0.3";
      sendBtn.style.pointerEvents = hasContent ? "auto" : "none";
    }
  }
  if (input) input.disabled = isLoading;
}

function renderSidebar(container) {
  const sidebarList = container.querySelector(".chat-sidebar-list");
  if (!sidebarList) return;
  sidebarList.innerHTML = "";
  
  chatSessions.forEach(session => {
    const item = document.createElement("div");
    item.className = "chat-sidebar-item" + (session.id === currentSessionId ? " active" : "");
    
    const titleSpan = document.createElement("span");
    titleSpan.className = "chat-sidebar-item-title";
    titleSpan.textContent = session.title;
    
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "chat-sidebar-actions";
    
    const editBtn = document.createElement("button");
    editBtn.className = "chat-sidebar-action-btn";
    editBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;
    editBtn.title = "Rename";
    editBtn.onclick = (e) => {
      e.stopPropagation();
      const input = document.createElement("input");
      input.type = "text";
      input.className = "chat-sidebar-rename-input";
      input.value = session.title;
      
      const saveTitle = async () => {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== session.title) {
          session.title = newTitle;
          const data = await getStorage(["chatSettings"]);
          const settings = data.chatSettings || {};
          settings.chatSessions = chatSessions;
          await setStorage({ chatSettings: settings });
        }
        renderSidebar(container);
      };
      
      input.onkeydown = (ev) => {
        if (ev.key === "Enter") saveTitle();
        else if (ev.key === "Escape") renderSidebar(container);
      };
      
      input.onblur = saveTitle;
      
      item.insertBefore(input, titleSpan);
      titleSpan.style.display = "none";
      actionsDiv.style.display = "none";
      input.focus();
      input.select();
    };
    
    const delBtn = document.createElement("button");
    delBtn.className = "chat-sidebar-action-btn";
    delBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
    delBtn.title = "Delete";
    delBtn.onclick = async (e) => {
      e.stopPropagation();
      chatSessions = chatSessions.filter(s => s.id !== session.id);
      if (currentSessionId === session.id) {
        if (chatSessions.length > 0) {
          currentSessionId = chatSessions[0].id;
          messages = [...chatSessions[0].messages];
        } else {
          currentSessionId = null;
          messages = [];
        }
      }
      const data = await getStorage(["chatSettings"]);
      const settings = data.chatSettings || {};
      settings.chatSessions = chatSessions;
      await setStorage({ chatSettings: settings });
      renderAll(container);
    };
    
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(delBtn);
    
    item.appendChild(titleSpan);
    item.appendChild(actionsDiv);
    
    item.addEventListener("click", () => {
      isIncognito = false;
      const incognitoBtn = container.querySelector(".incognito-toggle-btn");
      if (incognitoBtn) incognitoBtn.classList.remove("active");
      const layoutWrapper = container.querySelector(".chat-layout");
      if (layoutWrapper) layoutWrapper.classList.remove("incognito-active");
      
      currentSessionId = session.id;
      messages = [...session.messages];
      renderAll(container);
    });
    sidebarList.appendChild(item);
  });
}

function renderAll(container) {
  renderSidebar(container);
  renderModelSelector(container);
  renderMessages(container);
  renderInputArea(container);
}

async function sendMessage(container) {
  if (isLoading) return;

  const input = container.querySelector(".chat-input");
  const text = input.value.trim();
  if (!text) return;

  const selectedModelData = MODELS.find(m => m.id === selectedModel);
  const provider = selectedModelData ? selectedModelData.provider : "mistral";

  const data = await getStorage(["chatSettings"]);
  mistralApiKey = data.chatSettings?.mistralApiKey || data.chatSettings?.apiKey || "";
  alibabaApiKey = data.chatSettings?.alibabaApiKey || "";
  groqApiKey = data.chatSettings?.groqApiKey || "";
  openRouterApiKey = data.chatSettings?.openRouterApiKey || "";
  geminiApiKey = data.chatSettings?.geminiApiKey || "";
  cerebrasApiKey = data.chatSettings?.cerebrasApiKey || "";
  const puterApiKey = (data.chatSettings?.puterApiKey || "").replace(/^["']|["']$/g, '');

  if (provider === "puter" && puterApiKey) {
    if (window.puter && typeof window.puter.setAuthToken === "function") {
      window.puter.setAuthToken(puterApiKey);
    }
  }

  let currentKey = mistralApiKey;
  if (provider === "alibaba") currentKey = alibabaApiKey;
  if (provider === "groq") currentKey = groqApiKey;
  if (provider === "openrouter") currentKey = openRouterApiKey;
  if (provider === "gemini") currentKey = geminiApiKey;
  if (provider === "cerebras") currentKey = cerebrasApiKey;

  if (provider === "puter" && !puterApiKey) {
    showToast(`Please configure your Puter Auth Token in the Settings tab first.`);
    return;
  } else if (provider !== "puter" && !currentKey) {
    let providerName = "Mistral";
    if (provider === "alibaba") providerName = "Alibaba";
    if (provider === "groq") providerName = "Groq";
    if (provider === "openrouter") providerName = "OpenRouter";
    if (provider === "gemini") providerName = "Google AI Studio (Gemini)";
    if (provider === "cerebras") providerName = "Cerebras";
    showToast(`Please configure your ${providerName} API key in the Settings tab first.`);
    return;
  }

  let msgContent = text;
  if (pendingImages.length > 0) {
    if (!selectedModelData || !selectedModelData.vision) {
      showToast("Please select a vision-capable model to analyze images.");
      return;
    }

    msgContent = [{ type: "text", text: text }];
    pendingImages.forEach(base64 => {
      // Mistral expects string, others expect { url: base64 } format
      msgContent.push({ type: "image_url", image_url: provider === "mistral" ? base64 : { url: base64 } });
    });
  }

  messages.push({ role: "user", content: msgContent });
  saveChatHistory();
  pendingImages = [];
  if (typeof container.updatePreview === "function") {
    container.updatePreview();
  }
  
  input.value = "";
  input.style.height = "auto";
  isLoading = true;
  renderAll(container);

  const loadingPhrases = [
    "Synthesizing knowledge...", "Connecting neural pathways...", "Crunching the numbers...", "Browsing the conceptual void...",
    "Assembling thought fragments...", "Formulating an elegant response...", "Rummaging through data structures...",
    "Searching the latent space...", "Decoding complex patterns...", "Consulting the digital oracle...",
    "Analyzing vector embeddings...", "Generating probabilistic sequences...", "Tuning attention heads...",
    "Weaving strings of logic...", "Traversing the knowledge graph...", "Activating silicon neurons...",
    "Translating thoughts to text...", "Calibrating parameters...", "Deriving optimal solutions...",
    "Gathering quantum insights...", "Structuring the final output...", "Reframing the context...",
    "Polishing the response...", "Evaluating heuristics...", "Pondering the complexities of the universe...",
    "Aligning quantum states...", "Extrapolating the infinite...", "Calibrating cognitive nodes...",
    "Processing semantic vectors...", "Initializing deep thought sequence...", "Bending the fabric of logic...",
    "Unraveling the mysteries of math...", "Compiling the wisdom of ages...", "Consulting the grand archives...",
    "Bridging the gap between data and insight...", "Synthesizing a brilliant idea...", "Fetching thoughts from the ether...",
    "Balancing the equation of truth...", "Calculating the trajectory of success...", "Tuning into the frequency of knowledge...",
    "Distilling complex algorithms...", "Igniting sparks of intelligence...", "Forging a path through the data...",
    "Scanning the horizons of possibility...", "Engaging hyper-threading protocols...", "Booting up the creative engine...",
    "Synchronizing multi-dimensional arrays...", "Mapping the topography of ideas...", "Filtering noise from signal...",
    "Harnessing the power of silicon...", "Assembling the pieces of the puzzle...", "Unlocking the vault of information..."
  ];

  const typing = document.createElement("div");
  typing.className = "chat-msg chat-msg-ai";
  
  let phraseIndex = Math.floor(Math.random() * loadingPhrases.length);
  typing.innerHTML = `
    <div class="chat-bubble chat-typing">
      <div class="chat-typing-spinner"></div>
      <span class="chat-typing-text">${loadingPhrases[phraseIndex]}</span>
    </div>
  `;
  const list = container.querySelector(".chat-messages");
  list.appendChild(typing);
  list.scrollTop = list.scrollHeight;

  function scheduleNextPhrase() {
    const delay = Math.floor(Math.random() * 2000) + 1000;
    typing._intervalId = setTimeout(() => {
      phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
      const phraseEl = typing.querySelector(".chat-typing-text");
      if (phraseEl) {
        phraseEl.textContent = loadingPhrases[phraseIndex];
        scheduleNextPhrase();
      }
    }, delay);
  }
  scheduleNextPhrase();

  let accumulatedContent = "";
  let bubbleDiv = null;

  try {
    currentAbortController = new AbortController();
    let sysPrompt = "You are a helpful JEE exam preparation assistant. Help with Physics, Chemistry, and Mathematics concepts, problem-solving strategies, and study advice. Keep answers concise and educational. ALWAYS wrap inline math equations with \\( and \\) delimiters, and block math equations with $$ and $$ delimiters. Never use plain-text math like 10^-6; always write it as \\(10^{-6}\\).";
    
    // Attach Context Payload
    if (typeof container.getAttachedContexts === "function") {
      const contexts = container.getAttachedContexts();
      if (contexts.length > 0) {
        const db = await getStorage(["backlog", "notes", "subjectNotes", "questions", "mistakeHistory", "sessionHistory"]);
        let contextChunks = [];
        
        if (contexts.includes("backlogs") && db.backlog) {
          contextChunks.push("### User Backlog\n" + JSON.stringify(db.backlog).substring(0, 2000));
        }
        if (contexts.includes("notes") && db.notes) {
          contextChunks.push("### Saved Notes\n" + JSON.stringify(db.notes).substring(0, 3000));
        }
        if (contexts.includes("questions") && db.questions) {
          contextChunks.push("### Important Questions\n" + JSON.stringify(db.questions).substring(0, 2000));
        }
        if (contexts.includes("analytics")) {
          contextChunks.push("### Study Analytics\nMistakes: " + JSON.stringify(db.mistakeHistory || {}).substring(0, 1000) + "\nSessions: " + JSON.stringify(db.sessionHistory || {}).substring(0, 1000));
        }

        const specificQs = contexts.filter(c => typeof c === 'object' && c.type === "specific_questions");
        if (specificQs.length > 0) {
          let qsText = "### User Attached Specific Questions\n";
          specificQs.forEach(sq => {
            sq.data.forEach(q => {
              qsText += `[Question ID: ${q.id}]\nQuestion Label: ${q.questionNumber || 'N/A'}\nCategory: ${q.category || 'N/A'}\nTopic: ${q.chapterTopic || 'N/A'}\nTags: ${(q.tags || []).join(', ')}\n\n`;
            });
          });
          contextChunks.push(qsText);
        }

        const specificNotes = contexts.filter(c => typeof c === 'object' && c.type === "specific_notes");
        if (specificNotes.length > 0) {
          let snText = "### User Attached Specific Notes\n";
          specificNotes.forEach(sn => {
            sn.data.forEach(n => {
              snText += `[Subject: ${n.subject}]\n${n.text}\n\n`;
            });
          });
          contextChunks.push(snText);
        }
        
        if (contextChunks.length > 0) {
          sysPrompt += "\n\n=== RELEVANT USER DATA ===\n" + contextChunks.join("\n\n") + "\n==========================\nUse the above data to contextually answer the user's prompt if applicable.";
        }
        container.clearAttachedContexts();
      }
    }

    let endpoint = MISTRAL_API_ENDPOINT;
    if (provider === "alibaba") endpoint = ALIBABA_API_ENDPOINT;
    if (provider === "groq") endpoint = GROQ_API_ENDPOINT;
    if (provider === "openrouter") endpoint = OPENROUTER_API_ENDPOINT;
    if (provider === "gemini") endpoint = GEMINI_API_ENDPOINT;
    if (provider === "cerebras") endpoint = CEREBRAS_API_ENDPOINT;

    const messagesWithSystem = [
      { role: "system", content: sysPrompt },
      ...messages
    ];

    if (provider === "puter") {
      const response = await window.puter.ai.chat(messagesWithSystem, {
        model: selectedModel,
        stream: true,
        max_tokens: 8192
      });

      let isFirstChunk = true;
      for await (const part of response) {
        if (currentAbortController.signal.aborted) break;
        if (part && part.text) {
          if (isFirstChunk) {
            if (typing) {
              if (typing._intervalId) clearTimeout(typing._intervalId);
              typing.innerHTML = '<div class="chat-bubble markdown-body"></div>';
              bubbleDiv = typing.querySelector(".chat-bubble");
            }
            isFirstChunk = false;
          }
          accumulatedContent += part.text;
          renderMarkdownWithMath(accumulatedContent, bubbleDiv);
          if (list.scrollHeight - list.scrollTop < list.clientHeight + 100) {
            list.scrollTop = list.scrollHeight;
          }
        }
      }
    } else {
      const body = JSON.stringify({
        model: selectedModel,
        messages: messagesWithSystem,
        temperature: 0.7,
        max_tokens: 8192,
        top_p: 1,
        stream: true
      });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentKey}`
        },
        body: body,
        signal: currentAbortController.signal
      });

      if (!response.ok) {
        const errText = await response.text();
        let niceError = errText;
        try {
          const errJson = JSON.parse(errText);
          if (errJson.error) {
            if (errJson.error.metadata && errJson.error.metadata.raw) {
              niceError = errJson.error.metadata.raw;
            } else if (errJson.error.message) {
              niceError = errJson.error.message;
            }
          }
        } catch (e) {
          // Fallback to raw text if not JSON
        }
        throw new Error(`HTTP ${response.status}: ${niceError}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let isFirstChunk = true;
      let streamBuffer = "";
      
      if (typing) bubbleDiv = typing.querySelector(".chat-bubble");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const lines = streamBuffer.split("\n");
        streamBuffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (dataStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed.choices?.[0]?.delta?.content || "";
              if (delta) {
                if (isFirstChunk) {
                  if (typing._intervalId) clearTimeout(typing._intervalId);
                  typing.innerHTML = '<div class="chat-bubble markdown-body"></div>';
                  bubbleDiv = typing.querySelector(".chat-bubble");
                  isFirstChunk = false;
                }
                accumulatedContent += delta;
                renderMarkdownWithMath(accumulatedContent, bubbleDiv);
                
                if (list.scrollHeight - list.scrollTop < list.clientHeight + 100) {
                  list.scrollTop = list.scrollHeight;
                }
              }
            } catch (e) {
              // Ignore parse errors on partial chunks
            }
          }
        }
      }
    }

    // Replace the hidden message history entry with the final accumulated string
    messages.push({ role: "assistant", content: accumulatedContent });
    saveChatHistory();
    if (typing._intervalId) clearTimeout(typing._intervalId);
    typing.remove();
    isLoading = false;
    currentAbortController = null;
    renderAll(container);

    // Auto-generate title if this is the first turn
    if (messages.length === 2 && currentSessionId) {
      generateChatTitle(container, currentSessionId, messages[0], messages[1]);
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      if (accumulatedContent.trim()) {
        messages.push({ role: "assistant", content: accumulatedContent });
      } else {
        messages.pop(); // Remove user message if we aborted immediately
      }
      saveChatHistory();
      if (typing._intervalId) clearTimeout(typing._intervalId);
      typing.remove();
      isLoading = false;
      currentAbortController = null;
      renderAll(container);
      return;
    }

    if (messages.length > 0 && messages[messages.length - 1].role === "user") {
      messages.pop(); // Remove the failed message so it doesn't break future requests
      saveChatHistory();
    }
    if (typing._intervalId) clearTimeout(typing._intervalId);
    typing.remove();
    isLoading = false;
    currentAbortController = null;
    showToast(`Error: ${err.message}`);
    renderAll(container);
  }
}

async function saveChatHistory() {
  if (isIncognito) return;
  const data = await getStorage(["chatSettings"]);
  const settings = data.chatSettings || {};

  if (messages.length > 0) {
    if (!currentSessionId) {
      currentSessionId = "chat_" + Date.now();
      const firstUserMsg = messages.find(m => m.role === "user");
      let title = "New Chat";
      if (firstUserMsg) {
        let content = firstUserMsg.content;
        if (Array.isArray(content)) {
          const txtPart = content.find(p => p.type === "text");
          if (txtPart) content = txtPart.text;
          else content = "Image Analysis";
        }
        title = content.substring(0, 30).trim() + (content.length > 30 ? "..." : "");
      }
      chatSessions.unshift({
        id: currentSessionId,
        title: title,
        messages: [...messages],
        updatedAt: Date.now()
      });
    } else {
      const sessionIndex = chatSessions.findIndex(s => s.id === currentSessionId);
      if (sessionIndex !== -1) {
        chatSessions[sessionIndex].messages = [...messages];
        chatSessions[sessionIndex].updatedAt = Date.now();
        const session = chatSessions.splice(sessionIndex, 1)[0];
        chatSessions.unshift(session);
      } else {
        chatSessions.unshift({
          id: currentSessionId,
          title: "New Chat",
          messages: [...messages],
          updatedAt: Date.now()
        });
      }
    }
  } else if (currentSessionId) {
    const sessionIndex = chatSessions.findIndex(s => s.id === currentSessionId);
    if (sessionIndex !== -1) chatSessions.splice(sessionIndex, 1);
    currentSessionId = null;
  }

  settings.chatSessions = chatSessions;
  delete settings.chatHistory;
  await setStorage({ chatSettings: settings });
}


async function saveModel(model) {
  selectedModel = model;
  const data = await getStorage(["chatSettings"]);
  const settings = data.chatSettings || {};
  settings.model = model;
  await setStorage({ chatSettings: settings });
}

async function clearChat(container) {
  isIncognito = false;
  const incognitoBtn = container.querySelector(".incognito-toggle-btn");
  if (incognitoBtn) incognitoBtn.classList.remove("active");
  const layoutWrapper = container.querySelector(".chat-layout");
  if (layoutWrapper) layoutWrapper.classList.remove("incognito-active");

  messages = [];
  currentSessionId = null;
  renderAll(container);
}

export async function initChat(container) {
  const data = await getStorage(["chatSettings"]);
  const settings = data.chatSettings || {};
  mistralApiKey = settings.mistralApiKey || settings.apiKey || "";
  alibabaApiKey = settings.alibabaApiKey || "";
  groqApiKey = settings.groqApiKey || "";
  openRouterApiKey = settings.openRouterApiKey || "";
  geminiApiKey = settings.geminiApiKey || "";
  cerebrasApiKey = settings.cerebrasApiKey || "";
  selectedModel = settings.model || "llama-3.3-70b-versatile";
  chatSessions = settings.chatSessions || [];

  if (settings.chatHistory && chatSessions.length === 0) {
    if (settings.chatHistory.length > 0) {
      const sessionId = "chat_" + Date.now();
      chatSessions.push({
        id: sessionId,
        title: "Previous Chat",
        messages: settings.chatHistory,
        updatedAt: Date.now()
      });
      currentSessionId = sessionId;
      messages = settings.chatHistory;
    }
    delete settings.chatHistory;
    await setStorage({ chatSettings: settings });
  } else if (chatSessions.length > 0) {
    currentSessionId = chatSessions[0].id;
    messages = [...chatSessions[0].messages];
  } else {
    currentSessionId = null;
    messages = [];
  }

  let isSidebarCollapsed = settings.isSidebarCollapsed || false;

  container.innerHTML = "";

  const layoutWrapper = document.createElement("div");
  layoutWrapper.className = "chat-layout";

  const sidebar = document.createElement("div");
  sidebar.className = "chat-sidebar" + (isSidebarCollapsed ? " collapsed" : "");
  sidebar.innerHTML = `<div class="chat-sidebar-header">Recent</div><div class="chat-sidebar-list"></div>`;
  layoutWrapper.appendChild(sidebar);

  const wrapper = document.createElement("div");
  wrapper.className = "chat-fullscreen-wrapper";

  const topBar = document.createElement("div");
  topBar.className = "chat-top-bar";

  const topBarLeft = document.createElement("div");
  topBarLeft.className = "chat-top-bar-left";

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "btn btn-ghost sidebar-toggle-btn";
  toggleBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>`;
  toggleBtn.title = "Toggle Sidebar";
  toggleBtn.onclick = async () => {
    isSidebarCollapsed = !isSidebarCollapsed;
    if (isSidebarCollapsed) {
      sidebar.classList.add("collapsed");
    } else {
      sidebar.classList.remove("collapsed");
    }
    const data = await getStorage(["chatSettings"]);
    const settings = data.chatSettings || {};
    settings.isSidebarCollapsed = isSidebarCollapsed;
    await setStorage({ chatSettings: settings });
  };

  topBarLeft.appendChild(toggleBtn);

  const modelSelectorWrapper = document.createElement("div");
  modelSelectorWrapper.className = "chat-model-selector-wrapper";
  topBarLeft.appendChild(modelSelectorWrapper);
  
  topBar.appendChild(topBarLeft);

  const topBarRight = document.createElement("div");
  topBarRight.className = "chat-top-bar-right";
  topBarRight.style.display = "flex";
  topBarRight.style.gap = "8px";

  const incognitoBtn = document.createElement("button");
  incognitoBtn.className = "btn btn-ghost incognito-toggle-btn";
  incognitoBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
  incognitoBtn.title = "Incognito Mode";
  incognitoBtn.onclick = () => {
    isIncognito = !isIncognito;
    if (isIncognito) {
      messages = [];
      currentSessionId = null;
      incognitoBtn.classList.add("active");
      layoutWrapper.classList.add("incognito-active");
    } else {
      messages = [];
      currentSessionId = null;
      incognitoBtn.classList.remove("active");
      layoutWrapper.classList.remove("incognito-active");
      if (chatSessions.length > 0) {
        currentSessionId = chatSessions[0].id;
        messages = [...chatSessions[0].messages];
      }
    }
    renderAll(container);
  };

  const clearBtn = document.createElement("button");
  clearBtn.className = "btn btn-ghost clear-chat-btn";
  clearBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
  clearBtn.title = "New Chat";
  
  topBarRight.appendChild(incognitoBtn);
  topBarRight.appendChild(clearBtn);
  topBar.appendChild(topBarRight);

  wrapper.appendChild(topBar);

  const messagesContainer = document.createElement("div");
  messagesContainer.className = "chat-messages chat-messages-full";
  wrapper.appendChild(messagesContainer);

  const inputContainer = document.createElement("div");
  inputContainer.className = "chat-input-container";

  const previewContainer = document.createElement("div");
  previewContainer.className = "chat-attachments-preview";
  previewContainer.style.display = "none";

  const inputWrapper = document.createElement("div");
  inputWrapper.className = "chat-input-wrapper";

  const pillsContainer = document.createElement("div");
  pillsContainer.className = "attached-pills-container";

  const mentionMenu = document.createElement("div");
  mentionMenu.className = "mention-menu";

  let mentionMenuVisible = false;
  let mentionSearch = "";
  let attachedContexts = [];
  let mentionSelectedIndex = 0;
  
  let mentionMode = "default";
  let savedQuestionsData = [];
  let selectedQuestionIds = new Set();
  let includeImagesInQuestions = true;
  
  let savedNotesData = [];
  let selectedNoteIds = new Set();

  const mentionOptions = [
    { id: "screenshot", label: "Screenshot Current Tab", icon: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>` },
    { id: "backlogs", label: "Backlogs", icon: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>` },
    { id: "notes", label: "Saved Notes", icon: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>` },
    { id: "questions", label: "Important Questions", icon: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>` },
    { id: "analytics", label: "Analytics", icon: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>` }
  ];

  function renderMentionMenu() {
    if (!mentionMenuVisible) {
      mentionMenu.classList.remove("open");
      mentionMode = "default";
      return;
    }
    
    if (mentionMode === "questions") {
      mentionMenu.innerHTML = `
        <div class="mention-submenu-header" style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-bottom: 1px solid var(--border-color);">
          <div class="mention-back-btn" style="cursor: pointer; display: flex; align-items: center; color: var(--text-secondary);"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg></div>
          <span style="font-weight:600; font-size:0.95rem;">Select Questions</span>
        </div>
        <div class="mention-questions-list" style="max-height: 250px; overflow-y: auto;"></div>
        <div class="mention-submenu-footer" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid var(--border-color); background: var(--bg-card);">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.85rem; color: var(--text-secondary);">
            <input type="checkbox" id="include-q-images" ${includeImagesInQuestions ? "checked" : ""}>
            <span>Include images</span>
          </label>
          <button class="btn btn-primary mention-attach-btn" disabled style="padding: 6px 12px; font-size: 0.85rem;">Attach</button>
        </div>
      `;
      
      const backBtn = mentionMenu.querySelector(".mention-back-btn");
      backBtn.onclick = () => {
        mentionMode = "default";
        renderMentionMenu();
      };
      
      const imgCheck = mentionMenu.querySelector("#include-q-images");
      imgCheck.onchange = (e) => { includeImagesInQuestions = e.target.checked; };
      
      const listDiv = mentionMenu.querySelector(".mention-questions-list");
      const attachBtn = mentionMenu.querySelector(".mention-attach-btn");
      
      if (savedQuestionsData.length === 0) {
        listDiv.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--text-secondary); font-size: 0.9rem;">No saved questions found.</div>`;
      } else {
        savedQuestionsData.forEach(q => {
          const qDiv = document.createElement("div");
          qDiv.className = "mention-question-item";
          let qText = q.questionNumber || "Unknown Question";
          if (q.chapterTopic) qText += ` • ${q.chapterTopic}`;
          const snippet = qText.substring(0, 60).replace(/\n/g, " ") + (qText.length > 60 ? "..." : "");
          qDiv.innerHTML = `
            <input type="checkbox" class="q-check" value="${q.id}" style="pointer-events: none;">
            <div class="q-snippet" style="font-size: 0.85rem; color: var(--text-primary);">${snippet}</div>
          `;
          
          const checkbox = qDiv.querySelector(".q-check");
          if (selectedQuestionIds.has(q.id)) checkbox.checked = true;
          
          qDiv.onclick = () => {
            checkbox.checked = !checkbox.checked;
            if (checkbox.checked) selectedQuestionIds.add(q.id);
            else selectedQuestionIds.delete(q.id);
            
            attachBtn.disabled = selectedQuestionIds.size === 0;
            attachBtn.textContent = selectedQuestionIds.size > 0 ? `Attach (${selectedQuestionIds.size})` : "Attach";
          };
          listDiv.appendChild(qDiv);
        });
      }
      
      attachBtn.disabled = selectedQuestionIds.size === 0;
      attachBtn.textContent = selectedQuestionIds.size > 0 ? `Attach (${selectedQuestionIds.size})` : "Attach";
      attachBtn.onclick = () => {
        const attachedQuestions = Array.from(selectedQuestionIds).map(id => savedQuestionsData.find(q => q.id === id)).filter(Boolean);
        
        if (includeImagesInQuestions) {
          attachedQuestions.forEach(q => {
            if (q.imageUrl) {
              pendingImages.push(q.imageUrl);
            }
          });
          updatePreview();
        }
        
        attachedContexts.push({
          type: "specific_questions",
          data: attachedQuestions
        });
        
        const val = chatInput.value;
        const atIndex = val.lastIndexOf("@");
        if (atIndex !== -1) chatInput.value = val.substring(0, atIndex);
        
        mentionMenuVisible = false;
        mentionMode = "default";
        renderMentionMenu();
        renderPills();
        chatInput.focus();
      };
      
      mentionMenu.classList.add("open");
      return;
    }
    
    if (mentionMode === "notes") {
      mentionMenu.innerHTML = `
        <div class="mention-submenu-header" style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-bottom: 1px solid var(--border-color);">
          <div class="mention-back-btn" style="cursor: pointer; display: flex; align-items: center; color: var(--text-secondary);"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg></div>
          <span style="font-weight:600; font-size:0.95rem;">Select Notes</span>
        </div>
        <div class="mention-questions-list" style="max-height: 250px; overflow-y: auto;"></div>
        <div class="mention-submenu-footer" style="display: flex; align-items: center; justify-content: flex-end; padding: 12px 16px; border-top: 1px solid var(--border-color); background: var(--bg-card);">
          <button class="btn btn-primary mention-attach-btn" disabled style="padding: 6px 12px; font-size: 0.85rem;">Attach</button>
        </div>
      `;
      
      const backBtn = mentionMenu.querySelector(".mention-back-btn");
      backBtn.onclick = () => {
        mentionMode = "default";
        renderMentionMenu();
      };
      
      const listDiv = mentionMenu.querySelector(".mention-questions-list");
      const attachBtn = mentionMenu.querySelector(".mention-attach-btn");
      
      if (savedNotesData.length === 0) {
        listDiv.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--text-secondary); font-size: 0.9rem;">No saved notes found.</div>`;
      } else {
        savedNotesData.forEach(n => {
          const nDiv = document.createElement("div");
          nDiv.className = "mention-question-item";
          const snippet = n.text.substring(0, 60).replace(/\n/g, " ") + (n.text.length > 60 ? "..." : "");
          nDiv.innerHTML = `
            <input type="checkbox" class="q-check" value="${n.id}" style="pointer-events: none;">
            <div class="q-snippet" style="font-size: 0.85rem; color: var(--text-primary);">
              <span style="color:var(--accent); font-weight:600; font-size:0.75rem; margin-right:4px;">[${n.subject}]</span>${snippet}
            </div>
          `;
          
          const checkbox = nDiv.querySelector(".q-check");
          if (selectedNoteIds.has(n.id)) checkbox.checked = true;
          
          nDiv.onclick = () => {
            checkbox.checked = !checkbox.checked;
            if (checkbox.checked) selectedNoteIds.add(n.id);
            else selectedNoteIds.delete(n.id);
            
            attachBtn.disabled = selectedNoteIds.size === 0;
            attachBtn.textContent = selectedNoteIds.size > 0 ? `Attach (${selectedNoteIds.size})` : "Attach";
          };
          listDiv.appendChild(nDiv);
        });
      }
      
      attachBtn.disabled = selectedNoteIds.size === 0;
      attachBtn.textContent = selectedNoteIds.size > 0 ? `Attach (${selectedNoteIds.size})` : "Attach";
      attachBtn.onclick = () => {
        const attachedNotes = Array.from(selectedNoteIds).map(id => savedNotesData.find(n => n.id === id)).filter(Boolean);
        
        attachedContexts.push({
          type: "specific_notes",
          data: attachedNotes
        });
        
        const val = chatInput.value;
        const atIndex = val.lastIndexOf("@");
        if (atIndex !== -1) chatInput.value = val.substring(0, atIndex);
        
        mentionMenuVisible = false;
        mentionMode = "default";
        renderMentionMenu();
        renderPills();
        chatInput.focus();
      };
      
      mentionMenu.classList.add("open");
      return;
    }

    const filteredOptions = mentionOptions.filter(o => o.label.toLowerCase().includes(mentionSearch.toLowerCase()));
    
    if (filteredOptions.length === 0) {
      mentionMenu.classList.remove("open");
      return;
    }
    
    mentionSelectedIndex = Math.min(mentionSelectedIndex, filteredOptions.length - 1);
    
    mentionMenu.innerHTML = "";
    filteredOptions.forEach((opt, idx) => {
      const optDiv = document.createElement("div");
      optDiv.className = `mention-option ${idx === mentionSelectedIndex ? "active" : ""}`;
      optDiv.innerHTML = `
        <div class="mention-option-icon">${opt.icon}</div>
        <div class="mention-option-text">${opt.label}</div>
      `;
      optDiv.onclick = () => selectMention(opt);
      mentionMenu.appendChild(optDiv);
    });
    
    mentionMenu.classList.add("open");
  }

  function renderPills() {
    pillsContainer.innerHTML = "";
    attachedContexts.forEach((ctx, idx) => {
      let icon, label;
      
      if (typeof ctx === 'object' && ctx.type === "specific_questions") {
        icon = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
        label = `${ctx.data.length} Questions`;
      } else if (typeof ctx === 'object' && ctx.type === "specific_notes") {
        icon = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
        label = `${ctx.data.length} Notes`;
      } else {
        const opt = mentionOptions.find(o => o.id === ctx);
        if (!opt) return;
        icon = opt.icon;
        label = opt.label;
      }
      
      const pill = document.createElement("div");
      pill.className = "context-pill";
      pill.innerHTML = `
        <div class="context-pill-icon">${icon}</div>
        <span>${label}</span>
        <div class="context-pill-remove"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></div>
      `;
      pill.querySelector(".context-pill-remove").onclick = () => {
        attachedContexts.splice(idx, 1);
        renderPills();
      };
      pillsContainer.appendChild(pill);
    });
  }

  async function selectMention(opt) {
    if (opt.id === "screenshot") {
      try {
        chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 80 }, (dataUrl) => {
          if (chrome.runtime.lastError) {
            showToast("Screenshot failed: " + chrome.runtime.lastError.message);
            return;
          }
          pendingImages.push(dataUrl);
          updatePreview();
          
          const val = chatInput.value;
          const atIndex = val.lastIndexOf("@");
          if (atIndex !== -1) chatInput.value = val.substring(0, atIndex);
          
          mentionMenuVisible = false;
          mentionMode = "default";
          renderMentionMenu();
          chatInput.focus();
        });
      } catch (err) {
        showToast("Error capturing screen");
      }
      return;
    }

    if (opt.id === "questions") {
      mentionMode = "questions";
      const db = await getStorage(["questions"]);
      savedQuestionsData = db.questions || [];
      selectedQuestionIds.clear();
      renderMentionMenu();
      return;
    }
    
    if (opt.id === "notes") {
      mentionMode = "notes";
      const db = await getStorage(["subjectNotes", "notes"]);
      savedNotesData = [];
      if (db.subjectNotes) {
        Object.keys(db.subjectNotes).forEach(sub => {
          db.subjectNotes[sub].forEach(note => {
            if (note.text && note.text.trim()) {
              savedNotesData.push({ ...note, subject: sub });
            }
          });
        });
      } else if (db.notes && typeof db.notes === 'string') {
        savedNotesData.push({ id: "legacy", text: db.notes, subject: "Legacy" });
      }
      selectedNoteIds.clear();
      renderMentionMenu();
      return;
    }

    if (!attachedContexts.includes(opt.id)) {
      attachedContexts.push(opt.id);
    }
    
    const val = chatInput.value;
    const atIndex = val.lastIndexOf("@");
    if (atIndex !== -1) {
      chatInput.value = val.substring(0, atIndex);
    }
    
    mentionMenuVisible = false;
    mentionMode = "default";
    renderMentionMenu();
    renderPills();
    chatInput.focus();
  }

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.multiple = true;
  fileInput.style.display = "none";

  const attachBtn = document.createElement("button");
  attachBtn.className = "chat-attach-btn-icon";
  attachBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>`;
  attachBtn.title = "Attach Image";

  const chatInput = document.createElement("textarea");
  chatInput.className = "chat-input chat-input-full";
  chatInput.placeholder = "Type...";
  chatInput.rows = 1;

  const sendBtn = document.createElement("button");
  sendBtn.className = "chat-send-btn-icon";
  sendBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`;

  function updatePreview() {
    previewContainer.innerHTML = "";
    if (pendingImages.length > 0) {
      previewContainer.style.display = "flex";
      pendingImages.forEach((base64, idx) => {
        const thumbBox = document.createElement("div");
        thumbBox.className = "chat-preview-thumb";
        const img = document.createElement("img");
        img.src = base64;
        const removeBtn = document.createElement("button");
        removeBtn.className = "chat-preview-remove";
        removeBtn.innerHTML = "&times;";
        removeBtn.onclick = () => {
          pendingImages.splice(idx, 1);
          updatePreview();
        };
        thumbBox.appendChild(img);
        thumbBox.appendChild(removeBtn);
        previewContainer.appendChild(thumbBox);
      });
    } else {
      previewContainer.style.display = "none";
    }
    renderInputArea(container);
  }

  function handleFiles(files) {
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          pendingImages.push(e.target.result);
          updatePreview();
        };
        reader.readAsDataURL(file);
      }
    }
  }

  fileInput.addEventListener("change", (e) => {
    handleFiles(e.target.files);
    e.target.value = "";
  });

  attachBtn.addEventListener("click", () => {
    fileInput.click();
  });

  chatInput.addEventListener("paste", (e) => {
    if (e.clipboardData && e.clipboardData.files.length > 0) {
      const hasImages = Array.from(e.clipboardData.files).some(f => f.type.startsWith("image/"));
      if (hasImages) {
        e.preventDefault();
        handleFiles(e.clipboardData.files);
      }
    }
  });
  
  inputContainer.appendChild(previewContainer);
  inputContainer.appendChild(pillsContainer);
  inputWrapper.appendChild(attachBtn);
  inputWrapper.appendChild(chatInput);
  inputWrapper.appendChild(sendBtn);
  inputWrapper.appendChild(mentionMenu);
  inputContainer.appendChild(inputWrapper);
  inputContainer.appendChild(fileInput);

  wrapper.appendChild(inputContainer);
  layoutWrapper.appendChild(wrapper);
  container.appendChild(layoutWrapper);

  // Attach reference to container for sendMessage to use later
  container.updatePreview = updatePreview;
  container.getAttachedContexts = () => attachedContexts;
  container.clearAttachedContexts = () => {
    attachedContexts = [];
    renderPills();
  };

  // renderAll will build the custom dropdown and attach its handlers
  renderAll(container);

  clearBtn.addEventListener("click", () => clearChat(container));

  sendBtn.addEventListener("click", () => {
    if (isLoading && currentAbortController) {
      currentAbortController.abort();
    } else if (!isLoading) {
      sendMessage(container);
    }
  });

  chatInput.addEventListener("keydown", (e) => {
    if (mentionMenuVisible) {
      const filteredOptions = mentionOptions.filter(o => o.label.toLowerCase().includes(mentionSearch.toLowerCase()));
      if (e.key === "ArrowDown") {
        e.preventDefault();
        mentionSelectedIndex = (mentionSelectedIndex + 1) % filteredOptions.length;
        renderMentionMenu();
        return;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        mentionSelectedIndex = (mentionSelectedIndex - 1 + filteredOptions.length) % filteredOptions.length;
        renderMentionMenu();
        return;
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredOptions[mentionSelectedIndex]) {
          selectMention(filteredOptions[mentionSelectedIndex]);
        }
        return;
      } else if (e.key === "Escape") {
        mentionMenuVisible = false;
        renderMentionMenu();
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        sendMessage(container);
      }
    }
  });

  chatInput.addEventListener("input", function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    if(this.value === '') this.style.height = 'auto';

    const val = this.value;
    const cursorPos = this.selectionStart;
    const textBeforeCursor = val.substring(0, cursorPos);
    const atMatch = textBeforeCursor.match(/(?:^|\s)@([a-zA-Z0-9_]*)$/);

    if (atMatch) {
      mentionMenuVisible = true;
      mentionSearch = atMatch[1];
      mentionSelectedIndex = 0;
      renderMentionMenu();
    } else {
      mentionMenuVisible = false;
      renderMentionMenu();
    }
    renderInputArea(container);
  });
}