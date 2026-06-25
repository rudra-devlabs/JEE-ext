# JEE Study Dashboard

> A Chrome Extension (Manifest V3) for JEE preparation — countdown timer, question tracker, mistakes log, backlog manager, Pomodoro timer, subject notes, test planner, analytics, and AI-powered chat with LaTeX rendering.

## Features

### 📅 Countdown Timer
Live countdown to JEE Mains (target: January 15, 2027) with days/hours/minutes/seconds displayed in a clean grid. Includes an SVG progress ring showing elapsed percentage, a rotating set of 15 motivational quotes (cycling every 30s), and an upcoming test alert for tests within the next 7 days.

### 📝 Questions Log
Track problems solved with categorized metadata:
- **Category**: Class / Topic / Module / DIBY (Do It By Yourself) / DPP (Daily Practice Problem) / KPP (Key Practice Problem) / Homework
- **Question number**, chapter/topic, and lecture number (shown only for Class category)
- **Tags** with autocomplete from previously used tags
- **Image attachments** — paste multiple images, upload multiple files, drag-and-drop, or use the **Instant Screenshot** button in the popup to capture the active tab. Supports zoom via lightbox.
- **Search** by text content or `#tag` syntax
- **Delete with undo** via toast notification

### ❌ Mistakes Log
Record and review mistakes:
- Subject selection (Physics / Chemistry / Mathematics / Other)
- Text description with tag support
- History tracking — shows counts by date
- **Image attachments** — paste multiple screenshots directly into mistakes to save full context
- Search by content or tags
- Delete with undo

### 📋 Backlog Manager
Simple checkbox-based task list:
- Add items with text input
- **Progress bar** showing completion percentage
- **Badge sync** — pending count displayed on the extension icon
- Search and delete with undo

### ✅ Weekly Todo
Tasks grouped by day of the week:
- Current week's tasks shown; older tasks auto-cleaned
- Today's tasks are editable with checkbox; past tasks become read-only with "Done" or "Missed" badges

### ⏱ Pomodoro Timer
Focus timer with session tracking:
- Presets: **25/5** (study 25 min, break 5 min) and **50/10** (study 50 min, break 10 min)
- **Custom durations** for both focus and break
- SVG circular progress ring
- Audio beep on completion
- Chrome notification on timer end (via background worker)
- **Streak tracking** — consecutive study days
- Session history with daily counts

### 📓 Subject Notes
Three-column layout for Physics, Chemistry, and Mathematics:
- Auto-growing textareas
- **Auto-save** with 500ms debounce
- Add/delete notes per subject
- Saved indicator

### 🗓 Test Planner
Manage your test schedule:
- Add tests with name and date
- Auto-sorted chronologically; past dates prevented
- Seeded with 37 default tests (Short Tests, JEE Main 1–11, JEE Advanced 1–3, AITS 1–19, Board Pattern Tests)

### 📊 Analytics
Four canvas-based charts:
- **Questions Added** — 7-day bar chart
- **Mistakes Logged** — 4-week bar chart
- **Backlog Completion** — donut chart (done vs. pending)
- **Study Sessions** — 4-week bar chart
- Theme-aware colors (reads computed CSS variables)

### 🤖 AI Chat
Chat with 106 AI models across 6 providers for JEE assistance:

| Provider | Models |
|----------|--------|
| **Mistral** | mistral-large, mistral-small, pixtral, ministral, codestral, open-mistral-nemo, open-codestral-mamba |
| **Alibaba (DashScope)** | Massive roster of 60+ models including Qwen Max/Plus/Turbo versions, DeepSeek V3.2, QwQ, QvQ, Qwen3.7/3.6, and advanced vision models |
| **Groq** | llama-4-scout, llama-4-maverick, llama-3.3-70b-versatile, llama-3.1-8b, deepseek-r1-distill-llama-70b, mixtral-8x7b, qwen-2.5-32b, gemma2-9b |
| **OpenRouter** | deepseek-r1, deepseek-v3-0324, meta-llama-4-scout, meta-llama-4-maverick, qwen-qwq-32b, qwen-2.5-vl-72b, qwen-2.5-32b-instruct, anthropic-claude-sonnet-3.7, x-ai-grok-2, google-gemini-2.0-flash, openai-gpt-4o, mistralai-mistral-small |
| **Google AI Studio** | gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash |
| **Cerebras** | llama-3.3-70b, llama-3.1-8b |

Features:
- **Streaming responses**
- **Client-Side Image Optimization** — Intercepts images and dynamically shrinks them (capping at 650px or 499px based on dimensions) to save drastically on token limits while preserving vision accuracy.
- **Advanced Context Management** — A strict 5000-token dynamic hard limit algorithm that prunes older text but perfectly exempts and preserves any images you've sent.
- **Native Drag-and-Drop Vision** — Beautiful blurred overlays when dragging images into Chat, Questions, or Mistakes logs.
- **API Key Enhancements** — Single-click Copy/Unlink buttons for API keys with refined padding and visual cues.
 with real-time markdown + math rendering
- **Markdown formatting** — headings, lists, code blocks, blockquotes, bold/italic, tables (via KaTeX renderer)
- **LaTeX math rendering** — `$...$` (inline), `$$...$$` (display), `\(...\)`, `\[...\]`, `\begin{env}` environments
- **Session management** — sidebar with rename, delete, and auto-generated titles
- **Incognito mode** — messages are not saved to history
- **Image attachments** — paste or upload images to chat
- **Premium loading UX** — sleek glowing pulse wave animation while the AI streams
- **Model visibility toggles** — hide models or entire provider groups you don't use
- **@mention context system** — attach backlog items, notes, questions, or analytics data to provide context to the AI
- **Stop generation** — abort mid-stream
- **Reasoning model support** — `<think>` tags rendered as expandable details panels

### ⚙️ Settings
- **Theme toggle** — dark/light mode with CSS variables
- **API key management** — configure keys for all 6 AI providers with quick "Unlink" buttons
- **Export all data** as JSON
- **Import data** from JSON backup
- **Reset all data** with confirmation
- **Unlimited Storage** — the extension uses the `unlimitedStorage` permission, allowing you to save tens of thousands of image attachments.

### 🎨 Theme Support
Dual dark/light theme with CSS custom properties:
- Dark theme (default) with deep navy background and teal accent
- Light theme with white background and purple accent
- Toggle from dashboard header or settings panel
- Color-scheme meta for native form element styling

### ⌨️ Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Alt+1`–`Alt+9` | Switch to tab by number (1-indexed) |
| `/` | Focus search input |
| `Ctrl+Enter` | Submit active form |

### 🖥 Two Interfaces
**Popup** (click extension icon) — compact 420×560px overlay with 6 essential tabs (Countdown, Questions, Mistakes, Backlog, Timer, Notes) and a chat overlay. Quick access without leaving your current page.

**Dashboard** (opens as new tab) — full-page layout with 11 tabs (Countdown, Questions, Mistakes, Backlog, Todo, Timer, Notes, Tests, Analytics, Chat, Settings). SVG icons, streak badge, and responsive design.

## Installation

### From Chrome Web Store
*(Not yet published)*

### Developer Mode
1. Clone or download this repository:
   ```
   git clone https://github.com/rudra-devlabs/JEE-ext
   ```
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked** and select the project directory
5. The extension icon will appear in your toolbar; clicking it opens the popup
6. Opening a new tab will show the dashboard (or click "Open Dashboard" in the popup)

### Dependencies
The extension bundles **KaTeX** (v0.17.0) and **marked** (v18.0.5) as local libraries. To update them:
```
npm install
```

## Usage

### Quick Start
1. Click the extension icon to open the popup
2. The **Countdown** tab shows time remaining until JEE Mains
3. Navigate tabs to log questions, mistakes, and use the timer

### Setting Up AI Chat
1. Open the **Chat** tab in the dashboard (new tab)
2. Go to the **Settings** tab (or click the gear icon)
3. Enter your API key for your preferred provider (Mistral, Groq, OpenRouter, etc.)
4. Go back to **Chat**, select a model from the dropdown, and start asking questions

> Get a free Mistral API key from [console.mistral.ai](https://console.mistral.ai). Free Groq API keys from [console.groq.com](https://console.groq.com).

### LaTeX in Chat
The AI chat renders math expressions using KaTeX:
- Inline: `$E = mc^2$` or `\(E = mc^2\)`
- Display: `$$\int_a^b f(x)\,dx$$` or `\[ \sum_{n=1}^\infty \frac{1}{n^2} \]`
- Environments: `\begin{pmatrix} ... \end{pmatrix}`, `\begin{cases} ... \end{cases}`, `\begin{aligned} ... \end{aligned}`, etc.

### Managing Data
All data is stored in `chrome.storage.local` and persists across sessions.
- Use **Settings → Export** to download a JSON backup
- Use **Settings → Import** to restore from a backup
- Use **Settings → Reset All Data** to clear everything

## Project Structure

```
jee-ext/
├── manifest.json              # Chrome Extension manifest (MV3)
├── package.json               # Dependencies (KaTeX, marked)
├── background.js              # Service worker — alarms, badge, chat proxy
├── popup.html                 # Popup interface (420×560)
├── popup.js                   # Popup logic (all features inline)
├── popup.css                  # Popup styles (dark theme)
├── dashboard.html             # Full-page dashboard (new tab)
├── dashboard.js               # Dashboard orchestrator — module registry, theme
├── dashboard.css              # Dashboard styles (dark/light themes)
│
├── modules/
│   ├── storage.js             # chrome.storage Promise wrappers
│   ├── ui.js                  # Shared UI: dropdowns, SVG icons
│   ├── testData.js            # Default test schedule (37 tests)
│   ├── countdown.js           # Countdown timer, quotes, test alerts
│   ├── questions.js           # Question CRUD with image attachments
│   ├── mistakes.js            # Mistakes CRUD with history
│   ├── backlog.js             # Backlog manager with progress + badges
│   ├── timer.js               # Pomodoro timer with streaks
│   ├── notes.js               # Subject notes (3-column)
│   ├── todo.js                # Weekly todo with day grouping
│   ├── tests.js               # Test planner
│   ├── analytics.js           # Canvas charts (4 types)
│   ├── chat.js                # AI chat (6 providers, 52 models, streaming)
│   └── settings.js            # Settings, export/import, theme
│
├── libs/
│   ├── katex/                 # KaTeX math renderer (v0.17.0)
│   │   ├── katex.min.js
│   │   ├── katex.min.css
│   │   ├── contrib/auto-render.min.js
│   │   └── fonts/
│   └── marked/                # Markdown parser (v18)
│       └── marked.min.js
│
└── icons/
    ├── icon16.png             # Extension icon (16px)
    ├── icon48.png             # Extension icon (48px)
    ├── icon128.png            # Extension icon (128px)
    ├── countdown.svg          # Tab icons
    ├── questions.svg
    ├── mistakes.svg
    ├── backlog.svg
    ├── todo.svg
    ├── timer.svg
    ├── notes.svg
    ├── tests.svg
    ├── analytics.svg
    ├── chat.svg
    ├── settings.svg
    ├── search.svg
    ├── flame.svg
    ├── sun.svg
    ├── moon.svg
    ├── chevron-down.svg
    └── external-link.svg
```

## Architecture Notes

**Module Pattern** — Dashboard modules are lazily initialized on first tab switch. Each module exports an `init(container)` function that builds its own DOM and manages its state from `chrome.storage.local`.

**Two Interfaces** — The popup and dashboard share the same storage namespace but have separate code. Dashboard uses modular files from `modules/`; the popup bundles equivalent logic inline in `popup.js`.

**Background Worker** — The service worker (`background.js`) handles:
- Proxying AI API calls (bypassing CORS)
- Pomodoro and revision alarms via `chrome.alarms`
- Extension badge updates (pending backlog count)
- Session streak tracking

**Math Rendering** — Chat responses are processed through: extract math → markdown (marked) → replace placeholders with KaTeX. Single-pass streaming renders incrementally.

## Development

The extension uses vanilla JavaScript (ES6 modules) with no build step.

- Service worker is ES module (`"type": "module"` in manifest)
- Libraries are loaded via `<script>` tags in HTML files
- All styles are in two CSS files — one for popup, one for dashboard

To make changes, edit the source files, then reload the extension at `chrome://extensions`.

## License

MIT
