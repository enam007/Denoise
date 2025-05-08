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
import ReviewPopup from "../components/ReviewPopup";

const App: React.FC<{}> = () => {
  const defaultOptions: LocalStorageOptions = {
    hideRecommended: false,
    hideLiveChat: false,
    hidePlaylist: false,
    hideShorts: true,
    hideComments: false,
    hideTopHeader: false,
    hideMerch: false,
    hideVideoInfo: false,
    summary: false,
  };
  const [options, setOptions] = useState<LocalStorageOptions>(defaultOptions);
  const [isToggled, setIsToggled] = useState(false);
  const [videoUrl, setVideoUrl] = useState(""); // State to store the YouTube video URL
  const [isProcessing, setIsProcessing] = useState(false); // State to manage loading state
  const [reviewState, setReviewState] = useState<any>(null);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [blogPost, setBlogPost] = useState<string>("");
  const [currentTabUrl, setCurrentTabUrl] = useState("");
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

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        setCurrentTabUrl(tabs[0].url);

        chrome.runtime.sendMessage({
          action: "CURRENT_TAB_URL",
          url: tabs[0].url,
        });
      }
    });
  }, []);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handlePopupMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handlePopupMessage);
    };
  }, []);
  const handlePopupMessage = (message, sender, sendResponse) => {
    if (message.action === "sendBlog") {
      setBlogPost(message.blogPost);
      setReviewVisible(true);
      setReviewState({ blog_post: message.blogPost }); // setting the review state here, so the review popup will have access to the blog post.
    }
  };
  const fetchOptions = async () => {
    const options = await getStoredOptions();
    console.log(options);
    setOptions(options);
  };

  useEffect(() => {
    fetchOptions();
  }, []);
  const startWorkflow = () => {
    setIsProcessing(true);

    chrome.runtime.sendMessage({ action: "START_WORKFLOW" }, (response) => {
      if (response?.success) {
        console.log("Workflow started successfully.");
      } else {
        console.log("Workflow acknowledged but not yet completed.");
      }
    });

    // Listen for the workflow completion message
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === "WORKFLOW_COMPLETED") {
        setIsProcessing(false);

        if (message.success) {
          chrome.runtime.onMessage.addListener(handleBackgroundMessage);
          console.log("Workflow Output:", message.state);
        } else {
          alert("Workflow failed. Check console.");
          console.error("Error:", message.error);
        }
      }
    });
  };

  const handleBackgroundMessage = (message, sender, sendResponse) => {
    if (message.action === "reviewNeeded") {
      setReviewState(message.state);
      setReviewVisible(true);
    } else if (message.action === "workflowCompleted") {
      alert("Workflow completed!");
      console.log("Final State:", message.state);
      //Clean up listener
      chrome.runtime.onMessage.removeListener(handleBackgroundMessage);
    }
  };

  const handleReviewApproval = (
    approved: boolean,
    feedback: string,
    level: number
  ) => {
    chrome.runtime.sendMessage({ action: "GET_WORKFLOW_STATE" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
      }
      if (response?.state) {
        console.log("Workflow State:", response.state);
        chrome.runtime.sendMessage({
          action: "REVIEW_SUBMITTED",
          state: {
            ...response.state,
            review_approved: approved,
            human_feedback: feedback,
            text_leveler: level,
            last_node: "humanReview",
            __start__: "generateBlog",
          },
        });
        setReviewVisible(false);
      }
    });
  };
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
      {/* <div className="w-[22.7rem] h-auto rounded-lg border border-gray-300 shadow-lg p-4">
        <input
          type="text"
          placeholder="Enter YouTube video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mt-2"
        />

        <button
          className="mt-4 bg-blue-500 text-white p-2 rounded w-full"
          onClick={startWorkflow}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Start LangGraph Workflow"}
        </button>
        {reviewVisible && reviewState && (
          <ReviewPopup state={reviewState} onReview={handleReviewApproval} />
        )}
      </div> */}
    </div>
  );
};

const rootElement = document.createElement("div");
rootElement.style.width = "22.7 rem";

document.body.appendChild(rootElement);
const root = createRoot(rootElement);
root.render(<App />);
