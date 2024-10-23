import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ActionTypes } from "../utils/messages";
import { hideElement, pollForElement, showElement } from "../utils/domHandller";
import { getStoredOptions, LocalStorageOptions } from "../utils/storage";
import useWindowLoad from "../hooks/useWindowLoad";

const App: React.FC<{}> = () => {
  const [isActive, setIsActive] = useState(false);
  const [options1, setOptions] = useState<LocalStorageOptions | null>(null);
  console.log("Content script loaded");

  const fetchOptions = async () => {
    const options = await getStoredOptions();
    console.log("Fetching", options);
    setOptions(options);

    // Poll for the element and execute hide/show logic once the element exists
    pollForElement("ytd-watch-next-secondary-results-renderer", (element) => {
      console.log("element exists", element);
      if (options.hideRecommended) {
        console.log("Hiding recommended");
        hideElement("ytd-watch-next-secondary-results-renderer");
      } else {
        console.log("Showing recommended");
        showElement("ytd-watch-next-secondary-results-renderer");
      }
    });
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    const messageListener = (msg: any) => {
      if (msg.action === ActionTypes.TOGGLE_RECOMMENDED) {
        const shouldHide = msg.hide;
        setIsActive(shouldHide);
        if (!shouldHide) {
          //console.log(options1.hideRecommended);
          hideElement("ytd-watch-next-secondary-results-renderer");
        } else {
          //console.log(options1);
          showElement("ytd-watch-next-secondary-results-renderer");
        }
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Cleanup listener on component unmount
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [isActive]); // Empty dependency array to set up listener once

  return isActive && <div className="text-9xl">Hello</div>;
};

const rootElement = document.createElement("div");
document.body.appendChild(rootElement);
const root = createRoot(rootElement);
root.render(<App />);
