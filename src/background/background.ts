import { setStoredOptions } from "../utils/storage";
chrome.runtime.onInstalled.addListener(() => {
  setStoredOptions({
    hideComments: false,
    hideLiveChat: false,
    hidePlaylist: false,
    hideRecommended: false,
    hideShorts: true,
    hideTopHeader: false,
  });
});

// Inject content.js programmatically into active YouTube tab when the tab is updated or activated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the URL matches YouTube and the tab has completed loading
  if (
    tab.url &&
    tab.url.includes("youtube.com") &&
    changeInfo.status === "complete"
  ) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["contentScript.js"],
    });
  }
});

// Also listen when the user switches to an active tab (in case the script needs to be injected)
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && tab.url.includes("youtube.com")) {
      chrome.scripting.executeScript({
        target: { tabId: activeInfo.tabId },
        files: ["contentScript.js"],
      });
    }
  });
});
