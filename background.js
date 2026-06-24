const CLASS_PRE_ALARM_PREFIX = "class_pre_";
const CLASS_START_ALARM_PREFIX = "class_start_";

function getNextOccurrenceMs(timeString, offsetMinutes = 0) {
  if (!timeString || !timeString.includes(":")) return null;
  const [hourStr, minuteStr] = timeString.split(":");
  const hours = Number(hourStr);
  const minutes = Number(minuteStr);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes + offsetMinutes, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime();
}

async function clearClassAlarms() {
  const alarms = await chrome.alarms.getAll();
  const toClear = alarms.filter(
    (alarm) => alarm.name.startsWith(CLASS_PRE_ALARM_PREFIX) || alarm.name.startsWith(CLASS_START_ALARM_PREFIX)
  );
  await Promise.all(toClear.map((alarm) => chrome.alarms.clear(alarm.name)));
}

async function scheduleClassReminders(schedules) {
  await clearClassAlarms();
  if (!Array.isArray(schedules) || schedules.length === 0) return;

  for (const schedule of schedules) {
    if (!schedule?.id || !schedule?.name || !schedule?.time) continue;
    const preWhen = getNextOccurrenceMs(schedule.time, -10);
    const startWhen = getNextOccurrenceMs(schedule.time, 0);
    if (preWhen) {
      await chrome.alarms.create(`${CLASS_PRE_ALARM_PREFIX}${schedule.id}`, {
        when: preWhen,
        periodInMinutes: 24 * 60
      });
    }
    if (startWhen) {
      await chrome.alarms.create(`${CLASS_START_ALARM_PREFIX}${schedule.id}`, {
        when: startWhen,
        periodInMinutes: 24 * 60
      });
    }
  }
}

async function resyncClassRemindersFromStorage() {
  const data = await chrome.storage.local.get(["settings"]);
  const schedules = data.settings?.classSchedules || [];
  await scheduleClassReminders(schedules);
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({ url: "dashboard.html" });
  resyncClassRemindersFromStorage().catch(() => {});
});

chrome.runtime.onStartup.addListener(() => {
  resyncClassRemindersFromStorage().catch(() => {});
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "pomodoro") {
    chrome.notifications.create("pomodoro_" + Date.now(), {
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: "Pomodoro Complete!",
      message: "Take a break. You've earned it.",
      priority: 2,
      requireInteraction: true
    });

    chrome.runtime.sendMessage({ action: "pomodoroDone" }).catch(() => {});
  }

  if (alarm.name.startsWith(CLASS_PRE_ALARM_PREFIX) || alarm.name.startsWith(CLASS_START_ALARM_PREFIX)) {
    chrome.storage.local.get(["settings"], (data) => {
      const schedules = data.settings?.classSchedules || [];
      const isPre = alarm.name.startsWith(CLASS_PRE_ALARM_PREFIX);
      const prefix = isPre ? CLASS_PRE_ALARM_PREFIX : CLASS_START_ALARM_PREFIX;
      const scheduleId = alarm.name.slice(prefix.length);
      const schedule = schedules.find((item) => item.id === scheduleId);
      if (!schedule) return;

      chrome.notifications.create(alarm.name + "_" + Date.now(), {
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: isPre ? "Class starts in 10 minutes" : "Class starting now",
        message: `${schedule.name} (${schedule.time})`,
        priority: 2,
        requireInteraction: true
      });
      
      chrome.runtime.sendMessage({ action: "playClassBeep" }).catch(() => {});
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startTimer") {
    chrome.alarms.create("pomodoro", { delayInMinutes: message.duration });
    sendResponse({ status: "started", duration: message.duration });
  }

  if (message.action === "stopTimer") {
    chrome.alarms.clear("pomodoro");
    sendResponse({ status: "stopped" });
  }

  if (message.action === "updateBadge") {
    const count = message.count;
    chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });
    chrome.action.setBadgeBackgroundColor({ color: "#e94560" });
    sendResponse({ status: "badgeUpdated" });
  }

  if (message.action === "syncClassReminders") {
    scheduleClassReminders(message.schedules)
      .then(() => sendResponse({ status: "classRemindersSynced" }))
      .catch((error) => sendResponse({ status: "error", message: error?.message || "Failed to sync reminders" }));
  }

  if (message.action === "testNotification") {
    chrome.notifications.create("test_notif_" + Date.now(), {
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: "Test Class Notification",
      message: "This is a test to ensure notifications stay on screen!",
      priority: 2,
      requireInteraction: true
    }, (id) => {
      chrome.runtime.sendMessage({ action: "playClassBeep" }).catch(() => {});
      if (chrome.runtime.lastError) {
        console.error("Notification Error:", chrome.runtime.lastError.message);
        sendResponse({ status: "error", message: chrome.runtime.lastError.message });
      } else {
        sendResponse({ status: "testSent", id: id });
      }
    });
    return true; // Keep message channel open for async response
  }

  return true;
});