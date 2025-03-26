import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ActionTypes } from "../utils/messages";
import { hideElement, pollForElement, showElement } from "../utils/domHandller";
import { getStoredOptions, LocalStorageOptions } from "../utils/storage";

import {
  OptionsSelectors,
  VisibilityOption,
  ShowOptionsType,
} from "../utils/constant";
import Card from "../components/Card";

const App: React.FC<{}> = () => {
  const [isActive, setIsActive] = useState(false);
  const [options, setOptions] = useState<LocalStorageOptions | null>(null);
  const [summary, setSummary] = useState<boolean>(false);
  console.log("Content script loaded");

  const toggleVisibility = (selector: string, shouldHide: boolean) => {
    shouldHide ? hideElement(selector) : showElement(selector);
  };

  const handleElementVisibility = (selector: string, shouldHide: boolean) => {
    pollForElement(selector, (element) => {
      console.log("element", element);
      //console.log("optionKey", options[optionKey]);
      console.log("SetOptions", options);

      toggleVisibility(selector, shouldHide);
    });
  };

  const fetchOptions = async () => {
    try {
      const fetchedOptions: LocalStorageOptions = await getStoredOptions();
      setOptions(fetchedOptions);
      setSummary(fetchedOptions.summary);
      console.log("Options", fetchedOptions);
      const visibilityOptions: VisibilityOption<keyof ShowOptionsType>[] = [
        {
          selector: OptionsSelectors.hideTopHeader,
          option: fetchedOptions.hideTopHeader,
        },
        {
          selector: OptionsSelectors.hideRecommended,
          option: fetchedOptions.hideRecommended,
        },
        {
          selector: OptionsSelectors.hideComments,
          option: fetchedOptions.hideComments,
        },
        {
          selector: OptionsSelectors.hideLiveChat,
          option: fetchedOptions.hideLiveChat,
        },
        {
          selector: OptionsSelectors.hideShorts,
          option: fetchedOptions.hideShorts,
        },
        {
          selector: OptionsSelectors.hideMerch,
          option: fetchedOptions.hideMerch,
        },
        {
          selector: OptionsSelectors.hidePlaylist,
          option: fetchedOptions.hidePlaylist,
        },
        {
          selector: OptionsSelectors.hideVideoInfo,
          option: fetchedOptions.hideVideoInfo,
        },
      ] as const;
      visibilityOptions.forEach(({ selector, option }) => {
        handleElementVisibility(selector, option);
      });
    } catch (error) {
      console.error("Failed to fetch options:", error);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    const messageListener = (msg: any) => {
      const { action, hide } = msg;

      switch (action) {
        case ActionTypes.TOGGLE_RECOMMENDED:
          toggleVisibility(OptionsSelectors.hideRecommended, !hide);
          //setIsActive(hide);
          break;
        case ActionTypes.TOGGLE_TOP_HEADER:
          toggleVisibility(OptionsSelectors.hideTopHeader, !hide);
          //setIsActive(hide);
          break;
        case ActionTypes.TOGGLE_COMMENTS:
          toggleVisibility(OptionsSelectors.hideComments, !hide);
          //setIsActive(hide);
          break;
        case ActionTypes.TOGGLE_SHORTS:
          toggleVisibility(OptionsSelectors.hideShorts, !hide);
          //setIsActive(hide);
          break;
        case ActionTypes.TOGGLE_LIVE_CHAT:
          toggleVisibility(OptionsSelectors.hideLiveChat, !hide);
          //setIsActive(hide);
          break;
        case ActionTypes.TOGGLE_PLAYLIST:
          toggleVisibility(OptionsSelectors.hidePlaylist, !hide);
          //setIsActive(hide);
          break;
        case ActionTypes.TOGGLE_MERCH:
          toggleVisibility(OptionsSelectors.hideMerch, !hide);
          //setIsActive(hide);
          break;
        case ActionTypes.TOGGLE_VIDEOINFO:
          toggleVisibility(OptionsSelectors.hideVideoInfo, !hide);
          //setIsActive(hide);
          break;
        case ActionTypes.TOGGLE_SUMMARY:
          setSummary(!hide);
          setIsActive(hide);
          console.log("toggleSummary", summary);
          break;
        default:
          console.warn(`Unknown action: ${action}`);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  return <div>{summary ? <Card /> : null}</div>;
};
let isComponentInjected = false;
const injectComponent = () => {
  if (isComponentInjected) return;
  const secondaryElement = document.getElementById("secondary");
  const rootElement = document.createElement("div");

  if (secondaryElement) {
    isComponentInjected = true;
    secondaryElement.insertBefore(rootElement, secondaryElement.firstChild);
    //secondaryElement.appendChild(rootElement);
    const root = createRoot(rootElement);
    root.render(<App />);
  } else {
    console.log("Element Not Found");
  }
};

setTimeout(injectComponent, 3000);
