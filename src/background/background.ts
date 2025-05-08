import { setStoredOptions } from "../utils/storage";
import { executor, workflow } from "../agents/workflow/youtubeAgentWorkflow";
import { YoutubeBlogState } from "../agents/types";

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
  }
  if (request.action === "CURRENT_TAB_URL") {
    console.log("Current tab URL:", request.url);
    if (workflowState.video_url !== request.url) {
      console.log("URL changed! Resetting workflow...");

      // Preserve user-defined settings but reset everything else
      workflowState = {
        video_url: request.url,
        transcript: undefined,
        summary: undefined,
        blog_post: undefined,
        quiz_questions: undefined,
        review_approved: undefined,
        human_feedback: undefined,
        last_node: undefined, // Force restart from START
        max_quiz_question: workflowState.max_quiz_question, // Preserve setting
        text_leveler: workflowState.text_leveler, // Preserve setting
      };
    }
  } else if (request.action === "START_WORKFLOW") {
    // Send an immediate acknowledgment to popup.tsx
    sendResponse({ success: false, message: "Workflow started" });

    // Execute the workflow asynchronously
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
// chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
//   console.log("Background script received message:", request);
//   let finalState: any;
//   if (request.action === "start_workflow") {
//     console.log("Starting LangGraph Workflow with video:", request.video_url);

//     try {
//       finalState = await executor.invoke({
//         video_url: request.video_url,
//       });

//       if (finalState) {
//         // Check if finalState is defined
//         // ... (rest of your logic) ...
//         sendResponse({ success: true, state: finalState });
//       } else {
//         console.error("executor.invoke() returned undefined");
//         sendResponse({
//           success: false,
//           error: "executor.invoke() returned undefined",
//         });
//       }
//       //Check if review is needed
//     } catch (error) {
//       console.error("Error in Workflow:", error);
//       sendResponse({ success: false, error });
//     }
//   } else if (!request.state.review_approved) {
//     finalState = request.state;
//     console.log("Review needed. Sending message to popup.");
//     chrome.runtime.sendMessage({
//       action: "reviewNeeded",
//       state: finalState,
//     });

//     // Wait for review result from popup
//     chrome.runtime.onMessage.addListener(async function handleReviewResult(
//       reviewMessage,
//       reviewSender,
//       reviewSendResponse
//     ) {
//       console.log("Background received review result:", reviewMessage); // Log review message
//       if (reviewMessage.action === "reviewResult") {
//         // Process the review
//         finalState = await executor.invoke({
//           video_url: request.video_url,
//           state: reviewMessage.state,
//         });
//         console.log("Sending workflow completed to popup");
//         // Send final state back to popup
//         chrome.runtime.sendMessage({
//           action: "workflowCompleted",
//           state: finalState,
//         });
//         // Remove the listener
//         chrome.runtime.onMessage.removeListener(handleReviewResult);
//       }
//     });
//   } else {
//     // No review needed, send final state directly
//     console.log("No review needed. Sending workflow completed to popup");
//     chrome.runtime.sendMessage({
//       action: "workflowCompleted",
//       state: finalState,
//     });
//   }

//   return true; // Keeps the message channel open for async response
// });
