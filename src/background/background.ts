import { setStoredOptions } from "../utils/storage";
import { executor } from "../agents/workflow/youtubeAgentWorkflow";
chrome.runtime.onInstalled.addListener(() => {
  setStoredOptions({
    hideComments: false,
    hideLiveChat: false,
    hidePlaylist: false,
    hideRecommended: false,
    hideShorts: true,
    hideTopHeader: false,
    hideMerch: false,
    hideVideoInfo: false,
    summary: false,
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

console.log("Background script running...");

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log("Background script received message:", request);
  if (request.action === "start_workflow") {
    console.log("Starting LangGraph Workflow with video:", request.video_url);

    try {
      let finalState = await executor.invoke({
        video_url: request.video_url,
      });

      if (finalState) {
        // Check if finalState is defined
        // ... (rest of your logic) ...
        sendResponse({ success: true, state: finalState });
      } else {
        console.error("executor.invoke() returned undefined");
        sendResponse({
          success: false,
          error: "executor.invoke() returned undefined",
        });
      }
      // Check if review is needed
      if (!finalState.review_approved) {
        console.log("Review needed. Sending message to popup.");
        chrome.runtime.sendMessage({
          action: "reviewNeeded",
          state: finalState,
        });

        // Wait for review result from popup
        chrome.runtime.onMessage.addListener(async function handleReviewResult(
          reviewMessage,
          reviewSender,
          reviewSendResponse
        ) {
          console.log("Background received review result:", reviewMessage); // Log review message
          if (reviewMessage.action === "reviewResult") {
            // Process the review
            finalState = await executor.invoke({
              video_url: request.video_url,
              state: reviewMessage.state,
            });
            console.log("Sending workflow completed to popup");
            // Send final state back to popup
            chrome.runtime.sendMessage({
              action: "workflowCompleted",
              state: finalState,
            });
            // Remove the listener
            chrome.runtime.onMessage.removeListener(handleReviewResult);
          }
        });
      } else {
        // No review needed, send final state directly
        console.log("No review needed. Sending workflow completed to popup");
        chrome.runtime.sendMessage({
          action: "workflowCompleted",
          state: finalState,
        });
      }
    } catch (error) {
      console.error("Error in Workflow:", error);
      sendResponse({ success: false, error });
    }

    return true; // Keeps the message channel open for async response
  }
});
