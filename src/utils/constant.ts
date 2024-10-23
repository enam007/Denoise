import { LocalStorageOptions } from "./storage";

export interface ShowOptionsType {
  hideRecommended: string;
  hideLiveChat: string;
  hidePlaylist: string;
  hideShorts: string;
  hideComments: string;
  hideTopHeader: string;
}

export const ShowOptions: ShowOptionsType = {
  hideRecommended: "Hide Recommended",
  hideLiveChat: "Hide Live Chat",
  hidePlaylist: "Hide Playlist",
  hideShorts: "Hide Shorts",
  hideComments: "Hide Comments",
  hideTopHeader: "Hide Top Header",
};
