export enum ActionTypes {
  TOGGLE_RECOMMENDED,
  TOGGLE_LIVE_CHAT,
  TOGGLE_PLAYLIST,
  TOGGLE_SHORTS,
  TOGGLE_COMMENTS,
  TOGGLE_TOP_HEADER,
}

export const messages = {
  hideRecommended: { action: ActionTypes.TOGGLE_RECOMMENDED },
  hideLiveChat: { action: ActionTypes.TOGGLE_LIVE_CHAT },
  hidePlaylist: { action: ActionTypes.TOGGLE_PLAYLIST },
  hideShorts: { action: ActionTypes.TOGGLE_SHORTS },
  hideComments: { action: ActionTypes.TOGGLE_COMMENTS },
  hideTopHeader: { action: ActionTypes.TOGGLE_TOP_HEADER },
};