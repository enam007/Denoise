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
