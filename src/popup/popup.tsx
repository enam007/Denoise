import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  getStoredOptions,
  LocalStorageOptions,
  setStoredOptions,
} from "../utils/storage";
import ToggleSwitch from "../components/Toggle";
import "../style.css";
import { ShowOptions, ShowOptionsType } from "../utils/constant";
import { messages } from "../utils/messages";

const App: React.FC<{}> = () => {
  const defaultOptions: LocalStorageOptions = {
    hideRecommended: false,
    hideLiveChat: false,
    hidePlaylist: false,
    hideShorts: true,
    hideComments: false,
    hideTopHeader: false,
  };
  const [options, setOptions] = useState<LocalStorageOptions>(defaultOptions);
  const [isToggled, setIsToggled] = useState(false);

  const handleToggle = (key: keyof LocalStorageOptions) => {
    setOptions((prevOptions) => {
      const isChecked = prevOptions[key];
      const updatedOptions = {
        ...prevOptions,
        [key]: !isChecked,
      };
      setStoredOptions(updatedOptions);
      const messageAction = messages[key];
      if (messageAction) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            // Ensure there is an active tab
            chrome.tabs.sendMessage(tabs[0].id, {
              action: messageAction.action,
              hide: !updatedOptions[key], // Send the new toggle state
              key: key,
            });
          }
        });
      }
      return updatedOptions;
    });
  };

  const fetchOptions = async () => {
    const options = await getStoredOptions();
    console.log(options);
    setOptions(options);
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  return (
    <div className="w-[22.7rem] h-auto rounded-lg border border-gray-300 shadow-lg p-4">
      <h1 className="text-4xl text-blue-700">Denoise</h1>
      <div>
        {Object.entries(options).map(([key, value]) => (
          <ToggleSwitch
            key={key}
            isToggled={value}
            onToggle={() => handleToggle(key as keyof LocalStorageOptions)}
            label={ShowOptions[key as keyof ShowOptionsType]}
          />
        ))}
      </div>
    </div>
  );
};

const rootElement = document.createElement("div");
rootElement.style.width = "22.7 rem";

document.body.appendChild(rootElement);
const root = createRoot(rootElement);
root.render(<App />);
