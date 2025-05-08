import { LocalStorageOptions } from "./storage";

// export interface ShowOptionsType {
//   hideRecommended: string;
//   hideLiveChat: string;
//   hidePlaylist: string;
//   hideShorts: string;
//   hideComments: string;
//   hideTopHeader: string;
//   hideMerch: string;
// }
export type ShowOptionsType = {
  [K in keyof LocalStorageOptions]: string;
};

export interface VisibilityOption<K extends keyof LocalStorageOptions> {
  selector: string;
  option: LocalStorageOptions[K];
}

export const ShowOptions: ShowOptionsType = {
  hideRecommended: "Hide Recommended",
  hideLiveChat: "Hide Live Chat",
  hidePlaylist: "Hide Playlist",
  hideShorts: "Hide Shorts",
  hideComments: "Hide Comments",
  hideTopHeader: "Hide Top Header",
  hideMerch: "Hide Merch, Tickets, Offers, Ads",
  hideVideoInfo: "Hide Video Info",
  summary: "Get Summary/Question/Quiz",
};

export const OptionsSelectors: ShowOptionsType = {
  hideRecommended: "ytd-watch-next-secondary-results-renderer",
  hideLiveChat: "#chat-container",
  hidePlaylist: "#playlist",
  hideShorts:
    "ytd-rich-section-renderer, [title='Shorts'], ytd-reel-shelf-renderer, #player-shorts-container, .ytd-shorts yt-chip-cloud-chip-renderer:has(yt-formatted-string[title='Shorts']), yt-tab-shape[tab-title='Shorts'], yt-tab-shape[tab-title='Shorts']",
  hideComments: "#comments",
  hideTopHeader: "#masthead-container",
  hideVideoInfo: "ytd-watch-metadata",
  summary: "",
  hideMerch:
    "ytd-ad-slot-renderer, #player-ads, ytd-merch-shelf-renderer, yt-alert-with-actions-renderer, .ytp-drawer, #ticket-shelf, #offer-module,  #clarify-box, ytd-metadata-row-container-renderer, ytd-engagement-panel-section-list-renderer, panel-ad-header-image-lockup-view-model",
} as const;
