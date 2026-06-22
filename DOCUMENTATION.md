# JEE Study Dashboard – Comprehensive Documentation

Welcome to the ultimate preparation companion designed exclusively for JEE Aspirants. This document serves as both a User Guide and a Technical Reference for the JEE Study Dashboard Chrome Extension.

---

## Table of Contents
1. [Overview & Philosophy](#1-overview--philosophy)
2. [User Guide: Tab by Tab Breakdown](#2-user-guide-tab-by-tab-breakdown)
   - [Countdown](#countdown)
   - [Questions Log](#questions-log)
   - [Mistakes Log](#mistakes-log)
   - [Backlogs & Weekly Todo](#backlogs--weekly-todo)
   - [Timer & Notes](#timer--notes)
   - [Tests & Analytics](#tests--analytics)
   - [AI Chat](#ai-chat)
3. [Configuration & Settings](#3-configuration--settings)
4. [Data Management & Privacy](#4-data-management--privacy)
5. [Technical Architecture](#5-technical-architecture)
6. [Developer Guide](#6-developer-guide)

---

## 1. Overview & Philosophy

The **JEE Study Dashboard** is built on three core pillars:
- **Zero Friction**: The extension sits in your browser. Whether you want to quickly log a doubt, snap a screenshot of a hard question, or run a Pomodoro timer, it takes exactly two clicks via the extension popup.
- **Deep Organization**: It maps precisely to the JEE framework (Physics, Chemistry, Math), test planning, and error tracking to help you spot weaknesses and optimize your score.
- **Limitless AI Intelligence**: A built-in, native AI client connects you directly to the world's best models (Mistral, Gemini, Groq, Cerebras, Qwen, etc.) without needing a monthly subscription to any single provider.

---

## 2. User Guide: Tab by Tab Breakdown

### Countdown
The heartbeat of the dashboard. It calculates the live remaining time until JEE Mains (Jan 15, 2027) down to the second.
- **Motivational Quotes**: Cycles every 30 seconds to keep you focused.
- **Upcoming Test Alert**: Automatically displays a warning banner if you have a scheduled mock test within the next 7 days.

### Questions Log
A structured repository for every important question you encounter.
- **Multiple Images**: You can upload, drag-and-drop, or paste multiple screenshots into a single question. 
- **Instant Screenshot**: Click the camera icon in the extension popup to instantly capture the active browser tab and attach it as a thumbnail.
- **Categorization**: Tag questions by `Class`, `Topic`, `DIBY`, or `DPP`. 
- **Tracking**: Logs the chapter, topic, and lecture number for easy retrieval.

### Mistakes Log
A critical tool for boosting your percentile. It allows you to log what went wrong.
- **Multi-Image Paste**: Paste as many screenshots of your error and the correct solution as needed.
- **Subject Tagging**: Automatically color-coded for Physics, Chemistry, and Mathematics.
- **Mistakes History**: View a calendar streak indicating how many mistakes you've reviewed daily.

### Backlogs & Weekly Todo
- **Backlogs**: A master list of everything you need to catch up on. The number of pending backlogs is reflected directly on the extension's icon badge in your browser.
- **Weekly Todo**: Breaks down your schedule by days of the week. Past tasks are locked and marked as either "Done" or "Missed" based on your completion.

### Timer & Notes
- **Pomodoro Timer**: Features presets for 25/5 and 50/10 sessions, plus custom intervals. It tracks your consecutive study streak and sends Chrome notifications with a beep when a session ends.
- **Notes**: Three persistent scratchpads for Physics, Chemistry, and Math. Automatically saves as you type.

### Tests & Analytics
- **Test Planner**: Pre-loaded with 37 standard mock tests (AITS, JEE Mains, Advanced). Allows you to plan out your test dates.
- **Analytics**: Beautiful Canvas-based charts showing 7-day activity for Questions, Mistakes, Backlog Completion, and Study Sessions.

### AI Chat
Your personal JEE tutor. Connects to 52 different AI models.
- **@Mention Context**: Type `@` in the chat to instantly inject your notes, pending backlogs, recent mistakes, or questions into the chat context.
- **Advanced Rendering**: Renders full LaTeX math equations, Markdown tables, and `<think>` reasoning chains perfectly.
- **Incognito Mode**: Talk to the AI without saving the conversation to history.

---

## 3. Configuration & Settings

To power the AI Chat, you must configure your API keys in the **Settings** tab.
- Navigate to the **Settings** tab on the full dashboard.
- Enter your API Keys (e.g., Mistral, Groq, Google AI Studio).
- **Unlink Buttons**: You can instantly remove any saved API key by clicking the "Unlink" button next to it.
- **Model Visibility**: Uncheck any AI providers or specific models that you do not want cluttering your chat dropdown menu.

---

## 4. Data Management & Privacy

**100% Local Privacy.**
All of your data (notes, tasks, images, API keys) is stored locally on your hard drive using Chrome's `chrome.storage.local` API. Nothing is sent to a central server. AI chat messages are sent directly from your browser to the respective AI provider's API.

- **Unlimited Storage**: The extension utilizes the `unlimitedStorage` permission to ensure you can paste tens of thousands of image screenshots without ever hitting a quota.
- **Export/Import**: You can export your entire database as a JSON file for backups or moving to a new computer.

---

## 5. Technical Architecture

The extension is built natively for **Chrome Manifest V3 (MV3)** using Vanilla JavaScript (ES6 modules).

- **Popup vs Dashboard**: The extension offers two entry points. The popup (`popup.html`) is a quick-action 420x560 overlay. The dashboard (`dashboard.html`) is a full-page Single Page Application.
- **Modular Design**: Code is split into domain-specific modules (`modules/questions.js`, `modules/timer.js`). The dashboard dynamically instantiates these modules when a tab is clicked.
- **Service Worker (`background.js`)**: Runs in the background to handle:
  1. API Proxying (bypassing CORS for strict endpoints).
  2. Alarms (`chrome.alarms`) for the Pomodoro timer.
  3. Badge updates for pending backlogs.

---

## 6. Developer Guide

To contribute or modify the codebase:

1. **No Build Step Required**: The project uses native ES Modules. You can edit `.js` files directly without needing Webpack or Vite.
2. **Local Dependencies**: The Markdown parser (`marked.min.js`) and Math renderer (`katex.min.js`) are bundled in the `libs/` folder to comply with MV3's strict CSP requirements against remote scripts.
3. **Reloading**: If you modify `background.js` or `manifest.json`, you must click the Reload button in `chrome://extensions`. If you modify popup or dashboard UI, just close and reopen the tab/popup.
4. **CSS Variables**: All styling is driven by CSS custom properties in `dashboard.css`. To change the theme colors, simply adjust the variables under the `:root` and `.light-theme` selectors.
