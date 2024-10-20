export interface LocalStorage {
  topic?: string;
  options?: LocalStorageOptions;
}

export type LocalStorageKeys = keyof LocalStorage;
export interface LocalStorageOptions {
  hideRecommended: boolean;
  hideLiveChat: boolean;
  hidePlaylist: boolean;
  hideShorts: boolean;
  hideComments: boolean;
  hideTopHeader: boolean;
}

export async function setStoredOptions(
  options: LocalStorageOptions
): Promise<void> {
  const vals: LocalStorage = {
    options,
  };
  await chrome.storage.local.set(vals);
}

export async function getStoredOptions(): Promise<LocalStorageOptions> {
  const keys: LocalStorageKeys[] = ["options"];
  const res: LocalStorage = await chrome.storage.local.get(keys);
  return res.options;
}
