import { setStoredOptions } from "../utils/storage";
import { executor, workflow } from "../agents/workflow/youtubeAgentWorkflow";
import { YoutubeBlogState } from "../agents/types";
import { ActionTypes } from "../utils/messages";

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

let workflowState: YoutubeBlogState = {};

// Function to retrieve the current workflow state

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

async function executeWorkflow(startNodeOverride?: string) {
  //console.log("Resuming workflow from:", workflowState.last_node || "START");
  let startNode = startNodeOverride || workflowState.last_node;
  console.log("Resuming workflow from:", startNode);
  const updatedWorkflowState = {
    ...workflowState,
    __start__: startNode,
  };

  for await (const stateObj of await executor.stream(updatedWorkflowState)) {
    // Extract the node name and the actual state
    const [[currentNode, newState]] = Object.entries(stateObj);

    console.log("Executing node:", currentNode, "with state:", newState);

    // ✅ Automatically update last executed node
    workflowState = { ...(newState as object), last_node: currentNode };
  }
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "GET_WORKFLOW_STATE") {
    console.log("popuprequested workflow state");
    sendResponse({ state: workflowState });
  } else if (request.action === "START_WORKFLOW") {
    // Send an immediate acknowledgment to popup.tsx
    sendResponse({ success: false, message: "Workflow started" });
    const { video_url } = request;
    if (workflowState.video_url !== video_url) {
      workflowState = {
        video_url: video_url,
        transcript: undefined,
        summary: undefined,
        blog_post: undefined,
        quiz_questions: undefined,
        review_approved: undefined,
        human_feedback: undefined,
        last_node: undefined,
        max_quiz_question: workflowState.max_quiz_question,
        text_leveler: workflowState.text_leveler,
      };
    }
    // Execute the workflow asynchrono
    executeWorkflow()
      .then(() => {
        // Notify popup.tsx when the workflow completes
        chrome.runtime.sendMessage({
          action: "WORKFLOW_COMPLETED",
          success: true,
          state: workflowState, // Send the final state
        });
      })
      .catch((error) => {
        console.error("Workflow execution failed:", error);
        chrome.runtime.sendMessage({
          action: "WORKFLOW_COMPLETED",
          success: false,
          error: error.message,
        });
      });

    // Return true to keep the message channel open for async response
    return true;
  }
  if (request.action === "REVIEW_SUBMITTED") {
    console.log("Review result received:", request.state);
    if (!request.state.review_approved) {
      workflowState.review_approved = request.state.review_approved;
      workflowState.human_feedback = request.state.human_feedback;
      workflowState.text_leveler = request.state.text_leveler;
      workflowState.last_node = request.state.last_node;
      executeWorkflow();
    } else {
      workflowState.review_approved = true;
      workflowState.last_node = request.state.last_node;
      executeWorkflow();
    }
  }
  return true;
});
