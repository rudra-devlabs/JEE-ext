import { getStorage, setStorage } from "./storage.js";
import { getIconSvg } from "./ui.js";

const MISTRAL_API_ENDPOINT = "https://api.mistral.ai/v1/chat/completions";
const ALIBABA_API_ENDPOINT = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
const GROQ_API_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_API_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const CEREBRAS_API_ENDPOINT = "https://api.cerebras.ai/v1/chat/completions";

export const MODELS = [
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
let selectedModel = "llama-3.3-70b-versatile";
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

function estimateTokensFromText(text) {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

function estimateTokensFromMessages(msgs) {
  let total = 0;
  for (const msg of msgs) {
    if (typeof msg.content === "string") {
      total += estimateTokensFromText(msg.content);
    } else if (Array.isArray(msg.content)) {
      for (const part of msg.content) {
        if (part.type === "text") total += estimateTokensFromText(part.text);
        else if (part.type === "image_url") total += 765;
      }
    }
  }
  return total;
}

function buildResponseMetrics({ usage, messagesWithSystem, completionText, ttftMs }) {
  if (ttftMs == null) return null;

  let promptTokens = usage?.prompt_tokens;
  let completionTokens = usage?.completion_tokens;
  let estimated = false;

  if (promptTokens == null) {
    promptTokens = estimateTokensFromMessages(messagesWithSystem);
    estimated = true;
  }
  if (completionTokens == null) {
    completionTokens = estimateTokensFromText(completionText);
    estimated = true;
  }

  return { promptTokens, completionTokens, ttftMs, estimated };
}

function formatChatMetrics(metrics) {
  const prefix = metrics.estimated ? "~" : "";
  const sent = `${prefix}${metrics.promptTokens.toLocaleString()}`;
  const received = `${prefix}${metrics.completionTokens.toLocaleString()}`;
  const ttft = `${metrics.ttftMs.toLocaleString()}ms`;
  return `↑ ${sent} sent · ↓ ${received} received · ${ttft} to first token`;
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
        "Authorization": provider === "gemini" ? undefined : `Bearer ${currentKey}`
      },
      body: body
    });

    if (response.ok) {
      const json = await response.json();
      title = json.choices?.[0]?.message?.content?.trim().replace(/['"]/g, '');
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

function extractQuizFromResponse(text) {
  if (!text || typeof text !== "string") return null;
  const codeMatch = text.match(/```json\s*([\s\S]*?)```/i);
  let rawJson = codeMatch ? codeMatch[1].trim() : text.trim();
  const firstBrace = rawJson.indexOf('{');
  const lastBrace = rawJson.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) return null;
  rawJson = rawJson.substring(firstBrace, lastBrace + 1);

  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch (e) {
    // Robust fallback: replace literal newlines with spaces to fix unescaped newlines in strings
    try {
      const noNewlines = rawJson.replace(/\n/g, ' ').replace(/\r/g, '');
      parsed = JSON.parse(noNewlines);
    } catch (e2) {
      return null;
    }
  }

  if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) return null;

  // Validate required top-level fields
  const topic = parsed.topic ? String(parsed.topic) : null;
    const maxMarks = typeof parsed.maxMarks === 'number' ? parsed.maxMarks : null;
    const markingScheme = parsed.markingScheme && typeof parsed.markingScheme === 'object'
      ? {
          correct: Number(parsed.markingScheme.correct) || 0,
          incorrect: Number(parsed.markingScheme.incorrect) || 0,
          unanswered: Number(parsed.markingScheme.unanswered) || 0
        }
      : null;
    const timed = typeof parsed.timed === 'boolean' ? parsed.timed : false;
    const timeLimitMinutes = typeof parsed.timeLimitMinutes === 'number' ? parsed.timeLimitMinutes : null;

    const normalizedQuestions = parsed.questions.map((q, idx) => {
      const qText = q.q || q.question;
      const opts = q.o || q.options;
      const ans = q.a !== undefined ? q.a : q.answerIndex;
      const expl = q.e || q.explanation;
      const diff = q.d || q.difficulty;
      
      const options = Array.isArray(opts) ? opts.filter(Boolean).map(String) : [];
      const answerIndex = Number.isInteger(ans) ? ans : Number(ans);
      if (!qText || options.length < 2) return null;
      if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= options.length) return null;
      return {
        question: String(qText),
        options,
        answerIndex,
        explanation: expl ? String(expl) : "",
        difficulty: diff ? String(diff) : ""
      };
    }).filter(Boolean);

    if (normalizedQuestions.length === 0) return null;
    return {
      title: topic || parsed.title || "Generated Quiz",
      topic: topic || parsed.title || "Generated Quiz",
      maxMarks: maxMarks !== null ? maxMarks : normalizedQuestions.length * 4,
      markingScheme: markingScheme || { correct: 4, incorrect: -1, unanswered: 0 },
      timed: timed !== false,
      timeLimitMinutes: timeLimitMinutes || normalizedQuestions.length * 2,
      questions: normalizedQuestions
    };
}

function renderQuizCard(bubble, msg, container) {
  const quiz = msg.quiz;
  if (!quiz || !Array.isArray(quiz.questions)) {
    renderMarkdownWithMath(msg.content, bubble);
    return;
  }

  if (!msg.quizState) {
    msg.quizState = { selected: {}, submitted: false, currentQuestion: 0 };
  }

  bubble.innerHTML = "";
  
  const text = msg.content || "";
  const codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  let preText = text;
  let postText = "";
  if (codeMatch) {
    const idx = text.indexOf(codeMatch[0]);
    preText = text.substring(0, idx);
    postText = text.substring(idx + codeMatch[0].length);
  } else {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      preText = text.substring(0, firstBrace);
      postText = text.substring(lastBrace + 1);
    }
  }

  let existingQuiz = bubble.querySelector('.chat-quiz');
  let preDiv = bubble.querySelector('.quiz-pre-text');
  let postDiv = bubble.querySelector('.quiz-post-text');

  if (!existingQuiz) {
    bubble.innerHTML = "";
    
    if (preText.trim()) {
      preDiv = document.createElement("div");
      preDiv.className = "quiz-pre-text";
      renderMarkdownWithMath(preText.trim(), preDiv);
      bubble.appendChild(preDiv);
    }

    const quizWrapper = document.createElement("div");
    quizWrapper.className = "chat-quiz";
    quizWrapper.style.margin = "12px 0";
    quizWrapper.style.opacity = "0";
    quizWrapper.style.transform = "translateY(10px)";
    quizWrapper.style.transition = "all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)";

    const bar = document.createElement("div");
    bar.className = "quiz-bar";

    const topicSpan = document.createElement("span");
    topicSpan.className = "quiz-bar-topic";
    topicSpan.textContent = quiz.topic || quiz.title || "Quiz";

    const marksSpan = document.createElement("span");
    marksSpan.className = "quiz-bar-marks";
    marksSpan.textContent = `Max: ${quiz.maxMarks || quiz.questions.length} marks`;

    const chevron = document.createElement("span");
    chevron.className = "quiz-bar-chevron";
    chevron.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

    const openBtn = document.createElement("button");
    openBtn.className = "quiz-bar-open-btn";
    openBtn.textContent = "Open";

    bar.appendChild(topicSpan);
    bar.appendChild(marksSpan);
    bar.appendChild(chevron);
    bar.appendChild(openBtn);
    quizWrapper.appendChild(bar);

    const accordion = document.createElement("div");
    accordion.className = "quiz-accordion";

    const rows = [
      { label: "Marking (Correct)", value: `+${(quiz.markingScheme && quiz.markingScheme.correct) || 1}` },
      { label: "Marking (Incorrect)", value: `${(quiz.markingScheme && quiz.markingScheme.incorrect) || 0}` },
      { label: "Marking (Unanswered)", value: `${(quiz.markingScheme && quiz.markingScheme.unanswered) || 0}` },
      { label: "Questions", value: `${quiz.questions.length}` },
      { label: "Timed", value: quiz.timed ? `Yes — ${quiz.timeLimitMinutes || 30} min` : "No" }
    ];
    rows.forEach(r => {
      const row = document.createElement("div");
      row.className = "quiz-accordion-row";
      row.innerHTML = `<span class="quiz-accordion-label">${r.label}</span><span class="quiz-accordion-value">${r.value}</span>`;
      accordion.appendChild(row);
    });
    quizWrapper.appendChild(accordion);
    bubble.appendChild(quizWrapper);

    let accordionExpanded = false;
    chevron.addEventListener("click", (e) => {
      e.stopPropagation();
      accordionExpanded = !accordionExpanded;
      accordion.classList.toggle("expanded", accordionExpanded);
      chevron.classList.toggle("expanded", accordionExpanded);
      bar.classList.toggle("accordion-open", accordionExpanded);
    });

    openBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openQuizOverlay(msg, container);
    });

    requestAnimationFrame(() => {
      quizWrapper.style.opacity = "1";
      quizWrapper.style.transform = "translateY(0)";
    });
  }

  if (preText.trim()) {
    if (!preDiv) {
      preDiv = document.createElement("div");
      preDiv.className = "quiz-pre-text";
      bubble.insertBefore(preDiv, bubble.querySelector('.chat-quiz'));
    }
    renderMarkdownWithMath(preText.trim(), preDiv);
  } else if (preDiv) {
    preDiv.remove();
  }

  if (postText.trim()) {
    if (!postDiv) {
      postDiv = document.createElement("div");
      postDiv.className = "quiz-post-text";
      bubble.appendChild(postDiv);
    }
    renderMarkdownWithMath(postText.trim(), postDiv);
  } else if (postDiv) {
    postDiv.remove();
  }
}

function openQuizOverlay(msg, container) {
  const quiz = msg.quiz;
  if (!quiz) return;
  if (!msg.quizState) msg.quizState = { selected: {}, submitted: false, currentQuestion: 0 };
  const state = msg.quizState;

  // Find the chat-fullscreen-wrapper to position overlay correctly
  const chatWrapper = container.querySelector(".chat-fullscreen-wrapper");
  if (!chatWrapper) return;
  chatWrapper.style.position = "relative";

  // Remove any existing overlay
  const existing = chatWrapper.querySelector(".quiz-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.className = "quiz-overlay";

  const card = document.createElement("div");
  card.className = "quiz-card";

  // Header
  const header = document.createElement("div");
  header.className = "quiz-card-header";

  const topicEl = document.createElement("div");
  topicEl.className = "quiz-card-header-topic";
  topicEl.textContent = quiz.topic || quiz.title || "Quiz";

  const closeBtn = document.createElement("button");
  closeBtn.className = "quiz-card-close-btn";
  closeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

  header.appendChild(topicEl);
  header.appendChild(closeBtn);
  card.appendChild(header);

  // Timer (if timed)
  let timerInterval = null;
  let timeRemaining = (quiz.timed && quiz.timeLimitMinutes) ? quiz.timeLimitMinutes * 60 : 0;

  if (quiz.timed && !state.submitted) {
    const timerEl = document.createElement("div");
    timerEl.className = "quiz-card-timer";
    timerEl.id = "quiz-timer";
    card.appendChild(timerEl);

    if (state.timerRemaining !== undefined) {
      timeRemaining = state.timerRemaining;
    }

    function updateTimer() {
      const m = Math.floor(timeRemaining / 60);
      const s = timeRemaining % 60;
      timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    updateTimer();
    timerInterval = setInterval(() => {
      timeRemaining--;
      state.timerRemaining = timeRemaining;
      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        state.submitted = true;
        renderQuizOverlayContent(card, msg, container, timerInterval);
      } else {
        updateTimer();
      }
    }, 1000);
  }

  // Body container
  const body = document.createElement("div");
  body.className = "quiz-card-body";
  card.appendChild(body);

  // Footer
  const footer = document.createElement("div");
  footer.className = "quiz-card-footer";
  card.appendChild(footer);

  overlay.appendChild(card);
  chatWrapper.appendChild(overlay);

  // Store timer ref for cleanup
  overlay._timerInterval = timerInterval;

  closeBtn.addEventListener("click", () => {
    if (timerInterval) clearInterval(timerInterval);
    overlay.remove();
  });

  renderQuizOverlayContent(card, msg, container, timerInterval);
}

function renderQuizOverlayContent(card, msg, container, timerInterval) {
  const quiz = msg.quiz;
  const state = msg.quizState;
  const body = card.querySelector(".quiz-card-body");
  const footer = card.querySelector(".quiz-card-footer");
  if (!body || !footer) return;

  body.innerHTML = "";
  footer.innerHTML = "";

  if (state.submitted) {
    renderQuizResults(body, footer, msg, container, card, timerInterval);
    return;
  }

  const qIdx = state.currentQuestion || 0;
  const q = quiz.questions[qIdx];

  // Progress dots
  const progressDiv = document.createElement("div");
  progressDiv.className = "quiz-card-progress";
  progressDiv.innerHTML = `<span>Q${qIdx + 1} of ${quiz.questions.length}</span>`;
  const dotsDiv = document.createElement("div");
  dotsDiv.className = "quiz-card-progress-dots";
  quiz.questions.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "quiz-card-progress-dot";
    if (i === qIdx) dot.classList.add("current");
    else if (state.selected[i] !== undefined) dot.classList.add("answered");
    dotsDiv.appendChild(dot);
  });
  progressDiv.appendChild(dotsDiv);
  // Insert progress before body
  const existingProgress = card.querySelector(".quiz-card-progress");
  if (existingProgress) existingProgress.remove();
  card.insertBefore(progressDiv, body);

  // Question text
  const qText = document.createElement("div");
  qText.className = "quiz-card-question-text";
  renderMarkdownWithMath(`**Q${qIdx + 1}.** ${q.question}`, qText);
  body.appendChild(qText);

  // Options
  q.options.forEach((opt, optIdx) => {
    const optDiv = document.createElement("div");
    optDiv.className = "quiz-card-option";
    if (state.selected[qIdx] === optIdx) optDiv.classList.add("selected");

    const letter = document.createElement("div");
    letter.className = "quiz-card-option-letter";
    letter.textContent = String.fromCharCode(65 + optIdx);

    const optText = document.createElement("div");
    optText.className = "quiz-card-option-text";
    renderMarkdownWithMath(opt, optText);

    optDiv.appendChild(letter);
    optDiv.appendChild(optText);
    optDiv.addEventListener("click", () => {
      state.selected[qIdx] = optIdx;
      renderQuizOverlayContent(card, msg, container, timerInterval);
    });
    body.appendChild(optDiv);
  });

  // Footer navigation
  const prevBtn = document.createElement("button");
  prevBtn.className = "quiz-card-nav-btn";
  prevBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg> Previous`;
  prevBtn.disabled = qIdx === 0;
  prevBtn.addEventListener("click", () => {
    state.currentQuestion = qIdx - 1;
    renderQuizOverlayContent(card, msg, container, timerInterval);
  });

  const spacer = document.createElement("div");
  spacer.style.flex = "1";

  const isLast = qIdx === quiz.questions.length - 1;
  const nextBtn = document.createElement("button");
  nextBtn.className = `quiz-card-nav-btn ${isLast ? 'submit' : ''}`;

  if (isLast) {
    const allAnswered = Object.keys(state.selected).length === quiz.questions.length;
    nextBtn.textContent = "Submit";
    nextBtn.disabled = !allAnswered;
    nextBtn.addEventListener("click", () => {
      state.submitted = true;
      if (timerInterval) clearInterval(timerInterval);
      renderQuizOverlayContent(card, msg, container, timerInterval);
    });
  } else {
    nextBtn.innerHTML = `Next <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
    nextBtn.disabled = state.selected[qIdx] === undefined;
    nextBtn.addEventListener("click", () => {
      state.currentQuestion = qIdx + 1;
      renderQuizOverlayContent(card, msg, container, timerInterval);
    });
  }

  footer.appendChild(prevBtn);
  footer.appendChild(spacer);
  footer.appendChild(nextBtn);
}

function renderQuizResults(body, footer, msg, container, card, timerInterval) {
  const quiz = msg.quiz;
  const state = msg.quizState;
  const ms = quiz.markingScheme || { correct: 1, incorrect: 0, unanswered: 0 };

  // Remove progress dots
  const progressDiv = card.querySelector(".quiz-card-progress");
  if (progressDiv) progressDiv.remove();

  // Calculate score
  let score = 0;
  quiz.questions.forEach((q, i) => {
    const sel = state.selected[i];
    if (sel === undefined) {
      score += ms.unanswered;
    } else if (sel === q.answerIndex) {
      score += ms.correct;
    } else {
      score += ms.incorrect;
    }
  });

  // Score display
  const scoreDiv = document.createElement("div");
  scoreDiv.className = "quiz-results-score";
  scoreDiv.innerHTML = `<div class="quiz-results-score-number">${score} / ${quiz.maxMarks || quiz.questions.length}</div><div class="quiz-results-score-label">Final Score</div>`;
  body.appendChild(scoreDiv);

  // Each question review
  quiz.questions.forEach((q, i) => {
    const qDiv = document.createElement("div");
    qDiv.className = "quiz-results-question";

    const qText = document.createElement("div");
    qText.className = "quiz-results-question-text";
    renderMarkdownWithMath(`**Q${i + 1}.** ${q.question}`, qText);
    qDiv.appendChild(qText);

    q.options.forEach((opt, optIdx) => {
      const optDiv = document.createElement("div");
      optDiv.className = "quiz-results-option";
      const sel = state.selected[i];

      if (optIdx === q.answerIndex) {
        optDiv.classList.add("correct");
        renderMarkdownWithMath(`**&#10003; ${String.fromCharCode(65 + optIdx)}.** ${opt}`, optDiv);
      } else if (sel === optIdx) {
        optDiv.classList.add("wrong");
        renderMarkdownWithMath(`**&#10007; ${String.fromCharCode(65 + optIdx)}.** ${opt}`, optDiv);
      } else {
        optDiv.classList.add("neutral");
        renderMarkdownWithMath(`**${String.fromCharCode(65 + optIdx)}.** ${opt}`, optDiv);
      }
      qDiv.appendChild(optDiv);
    });

    if (q.explanation) {
      const exp = document.createElement("div");
      exp.className = "quiz-results-explanation";
      renderMarkdownWithMath(`**Explanation:**\n\n${q.explanation}`, exp);
      qDiv.appendChild(exp);
    }

    body.appendChild(qDiv);
  });

  // Footer with close only
  footer.innerHTML = "";
  const closeBtn = document.createElement("button");
  closeBtn.className = "quiz-card-nav-btn submit";
  closeBtn.textContent = "Close";
  closeBtn.addEventListener("click", () => {
    const overlay = card.closest(".quiz-overlay");
    if (overlay) overlay.remove();
  });
  footer.appendChild(closeBtn);
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
    if (msg.isHidden) return;
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
    } else if (msg.quiz) {
      renderQuizCard(bubble, msg, container);
    } else if (msg.quizFormatWarning) {
      renderMarkdownWithMath(msg.content, bubble);
      const warning = document.createElement("div");
      warning.className = "quiz-format-warning";
      warning.textContent = "Invalid quiz format — retrying with correct schema...";
      bubble.appendChild(warning);
    } else {
      renderMarkdownWithMath(msg.content, bubble);
    }
    const bubbleWrapper = document.createElement("div");
    bubbleWrapper.className = "chat-bubble-wrapper";
    bubbleWrapper.appendChild(bubble);

    if (msg.role === "assistant" && msg.metrics) {
      const metricsEl = document.createElement("div");
      metricsEl.className = "chat-metrics";
      metricsEl.textContent = formatChatMetrics(msg.metrics);
      if (msg.metrics.estimated) {
        metricsEl.title = "Token counts estimated — provider did not return usage data";
      }
      bubbleWrapper.appendChild(metricsEl);
    }

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
  const quizBtn = container.querySelector(".chat-quiz-mode-btn");
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
  if (quizBtn) {
    quizBtn.disabled = isLoading;
    quizBtn.style.opacity = isLoading ? "0.6" : "1";
    quizBtn.style.pointerEvents = isLoading ? "none" : "auto";
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

async function sendMessage(container, overrideText, isSilentRetry = false) {
  if (isLoading) return;

  const input = container.querySelector(".chat-input");
  const text = overrideText || (input ? input.value.trim() : "");
  if (!text && !isSilentRetry) return;
  const isQuizMode = true;

  const selectedModelData = MODELS.find(m => m.id === selectedModel);
  const provider = selectedModelData ? selectedModelData.provider : "mistral";

  const data = await getStorage(["chatSettings"]);
  mistralApiKey = data.chatSettings?.mistralApiKey || data.chatSettings?.apiKey || "";
  alibabaApiKey = data.chatSettings?.alibabaApiKey || "";
  groqApiKey = data.chatSettings?.groqApiKey || "";
  openRouterApiKey = data.chatSettings?.openRouterApiKey || "";
  geminiApiKey = data.chatSettings?.geminiApiKey || "";
  cerebrasApiKey = data.chatSettings?.cerebrasApiKey || "";

  let currentKey = mistralApiKey;
  let endpoint = MISTRAL_API_ENDPOINT;

  if (provider === "alibaba") { currentKey = alibabaApiKey; endpoint = ALIBABA_API_ENDPOINT; }
  else if (provider === "groq") { currentKey = groqApiKey; endpoint = GROQ_API_ENDPOINT; }
  else if (provider === "openrouter") { currentKey = openRouterApiKey; endpoint = OPENROUTER_API_ENDPOINT; }
  else if (provider === "gemini") { currentKey = geminiApiKey; endpoint = `${GEMINI_API_ENDPOINT}?key=${geminiApiKey}`; }
  else if (provider === "cerebras") { currentKey = cerebrasApiKey; endpoint = CEREBRAS_API_ENDPOINT; }

  if (!currentKey) {
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

  messages.push({ role: "user", content: msgContent, isHidden: isSilentRetry });
  saveChatHistory();
  pendingImages = [];
  if (typeof container.updatePreview === "function") {
    container.updatePreview();
  }
  
  if (input && !isSilentRetry) {
    input.value = "";
    input.style.height = "auto";
  }
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
  let messagesWithSystem = [];
  let ttftMs = null;
  let streamUsage = null;

  try {
    currentAbortController = new AbortController();
    let sysPrompt = "You are a helpful JEE exam preparation assistant. Help with Physics, Chemistry, and Mathematics concepts, problem-solving strategies, and study advice. Keep answers concise and educational. ALWAYS wrap inline math equations with \\( and \\) delimiters, and block math equations with $$ and $$ delimiters. Never use plain-text math like 10^-6; always write it as \\(10^{-6}\\).";
    sysPrompt += "\n\nIf the user explicitly asks for a quiz, test, or assessment, you MUST generate an interactive quiz. You can include conversational text before and after the quiz. The quiz itself MUST be enclosed in a ```json markdown block anywhere in your response. The JSON must match this EXACT minimalist schema: {\"topic\":\"<short topic name>\",\"questions\":[{\"q\":\"...\",\"o\":[\"...\",\"...\",\"...\",\"...\"],\"a\":0,\"e\":\"...\",\"d\":\"easy|medium|hard\"}]}. Use 'q' for question, 'o' for options array, 'a' for correct answer index (0-based), 'e' for explanation, and 'd' for difficulty. You may optionally add top-level keys to the JSON: \"timed\": true, \"timeLimitMinutes\": <number>, \"maxMarks\": <number>, and \"markingScheme\": {\"correct\": <number>, \"incorrect\": <number>, \"unanswered\": 0} to deeply customize the quiz mechanics. CRITICAL: Escape all newlines (use \\n) inside JSON string values. Do not output literal raw newlines inside strings. Do NOT output a json block unless you intend to render an interactive quiz.";
    
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

    const sanitizedMessages = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    messagesWithSystem = [
      { role: "system", content: sysPrompt },
      ...sanitizedMessages
    ];

    const requestBody = {
      model: selectedModel,
      messages: messagesWithSystem,
      temperature: 0.7,
      top_p: 1,
      stream: true
    };

    if (!["groq", "cerebras"].includes(provider)) {
      requestBody.max_tokens = 8192;
    }

    if (["openai", "openrouter", "mistral"].includes(provider)) {
      requestBody.stream_options = { include_usage: true };
    }

    const body = JSON.stringify(requestBody);

      const requestStartTime = performance.now();
      ttftMs = null;
      streamUsage = null;

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
              if (parsed.usage) {
                streamUsage = parsed.usage;
              }
              const delta = parsed.choices?.[0]?.delta?.content || "";
              if (delta) {
                if (isFirstChunk) {
                  ttftMs = Math.round(performance.now() - requestStartTime);
                  if (typing._intervalId) clearTimeout(typing._intervalId);
                  typing.innerHTML = '<div class="chat-bubble markdown-body"></div>';
                  bubbleDiv = typing.querySelector(".chat-bubble");
                  isFirstChunk = false;
                }
                accumulatedContent += delta;
                
                if (isQuizMode) {
                  const tempQuiz = extractQuizFromResponse(accumulatedContent);
                  if (tempQuiz) {
                    renderQuizCard(bubbleDiv, { content: accumulatedContent, quiz: tempQuiz }, container);
                  } else {
                    const startMatch = accumulatedContent.match(/```(?:json)?\s*([\s\S]*)/i);
                    const firstBrace = accumulatedContent.indexOf('{');
                    
                    let preText = accumulatedContent;
                    let showLoader = false;
                    
                    if (startMatch) {
                      const idx = accumulatedContent.indexOf(startMatch[0]);
                      preText = accumulatedContent.substring(0, idx);
                      showLoader = true;
                    } else if (firstBrace !== -1) {
                      preText = accumulatedContent.substring(0, firstBrace);
                      showLoader = true;
                    }

                    let preDiv = bubbleDiv.querySelector('.quiz-pre-text');
                    if (!preDiv && preText.trim()) {
                      preDiv = document.createElement("div");
                      preDiv.className = "quiz-pre-text";
                      bubbleDiv.insertBefore(preDiv, bubbleDiv.firstChild);
                    }
                    if (preDiv) {
                      renderMarkdownWithMath(preText.trim(), preDiv);
                    }
                    
                    if (showLoader) {
                      let loader = bubbleDiv.querySelector(".chat-quiz-loader");
                      if (!loader) {
                        loader = document.createElement("div");
                        loader.className = "chat-quiz-loader";
                        loader.style.margin = "12px 0";
                        loader.style.padding = "12px 16px";
                        loader.style.background = "var(--bg-secondary)";
                        loader.style.border = "1px solid var(--border-color)";
                        loader.style.borderRadius = "10px";
                        loader.style.display = "flex";
                        loader.style.alignItems = "center";
                        loader.style.gap = "8px";
                        loader.innerHTML = `
                          <div class="chat-typing-spinner" style="margin: 0;"></div>
                          <div class="chat-quiz-loader-text" style="font-weight:600; font-size:0.9rem;">Extracting quiz...</div>
                        `;
                        bubbleDiv.appendChild(loader);
                      }
                    } else {
                      const loader = bubbleDiv.querySelector(".chat-quiz-loader");
                      if (loader) loader.remove();
                    }
                  }
                } else {
                  renderMarkdownWithMath(accumulatedContent, bubbleDiv);
                }
                
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

    const metrics = buildResponseMetrics({
      usage: streamUsage,
      messagesWithSystem,
      completionText: accumulatedContent,
      ttftMs
    });

    const quiz = extractQuizFromResponse(accumulatedContent);
    const attemptedQuiz = accumulatedContent.includes("```json") || accumulatedContent.includes('{"topic"');

    // If the model attempted to generate a quiz but format was violated, show warning and retry
    if (attemptedQuiz && !quiz) {
      const retryCount = container._quizRetryCount || 0;
      if (retryCount >= 2) {
        // Give up after 2 retries
        container._quizRetryCount = 0;
        messages.push({
          role: "assistant",
          content: accumulatedContent,
          quizFormatWarning: true,
          ...(metrics ? { metrics } : {})
        });
        saveChatHistory();
        if (typing._intervalId) clearTimeout(typing._intervalId);
        typing.remove();
        isLoading = false;
        currentAbortController = null;
        renderAll(container);
        showToast("Quiz generation failed after multiple attempts. Please try again.");
        return;
      }
      // Push the failed response silently so the AI has context
      messages.push({
        role: "assistant",
        content: accumulatedContent,
        isHidden: true,
        ...(metrics ? { metrics } : {})
      });
      saveChatHistory();
      if (typing._intervalId) clearTimeout(typing._intervalId);
      typing.remove();
      isLoading = false;
      currentAbortController = null;
      
      showToast("Quiz generation formatting failed. Retrying automatically...");

      // Auto-retry silently
      container._quizRetryCount = retryCount + 1;
      const retryText = "The previous response had an invalid quiz JSON. Please include the quiz enclosed in a ```json markdown block, matching this EXACT schema: {\"topic\":\"...\",\"questions\":[{\"q\":\"...\",\"o\":[\"...\"],\"a\":0,\"e\":\"...\"}]}. CRITICAL: You must escape all newlines inside string values as \\n. Do not output raw newlines.";
      setTimeout(() => sendMessage(container, retryText, true), 500);
      return;
    }
    // Reset retry counter on success
    container._quizRetryCount = 0;

    messages.push({
      role: "assistant",
      content: accumulatedContent,
      ...(quiz ? { quiz } : {}),
      ...(metrics ? { metrics } : {})
    });
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
        const metrics = buildResponseMetrics({
          usage: streamUsage,
          messagesWithSystem,
          completionText: accumulatedContent,
          ttftMs
        });
        const quiz = isQuizMode ? extractQuizFromResponse(accumulatedContent) : null;
        messages.push({
          role: "assistant",
          content: accumulatedContent,
          ...(quiz ? { quiz } : {}),
          ...(metrics ? { metrics } : {})
        });
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
    }
    delete settings.chatHistory;
    await setStorage({ chatSettings: settings });
  }

  // Always start with a fresh, blank session
  currentSessionId = null;
  messages = [];

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
  getIconSvg("incognito").then(svg => {
    incognitoBtn.innerHTML = svg;
    const svgEl = incognitoBtn.querySelector("svg");
    if (svgEl) {
      svgEl.setAttribute("width", "18");
      svgEl.setAttribute("height", "18");
    }
  });
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