chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({ url: "dashboard.html" });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "pomodoro") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: "Pomodoro Complete!",
      message: "Take a break. You've earned it."
    });

    chrome.runtime.sendMessage({ action: "pomodoroDone" }).catch(() => {});
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

  return true;
});