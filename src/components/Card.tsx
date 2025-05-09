import React, { useState, useEffect } from "react";
import { Brain } from "lucide-react";
import Summary from "./Summary";
import ReviewPopup from "./ReviewPopup";
import { SummaryModel } from "../agents/types";

const tabs = ["Summary", "Blog", "Quiz", "Result"];

let previousUrl = "";
const Card: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Summary");
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Track the workflow status
  const [reviewState, setReviewState] = useState<any>(null);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [summaryText, setSummaryText] = useState<SummaryModel>(null);
  const [blogPost, setBlogPost] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState("");

  const [reviewAction, setReviewAction] = useState<
    "approved" | "rejected" | ""
  >("");
  useEffect(() => {
    const interval = setInterval(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== previousUrl) {
        console.log("URL changed:", currentUrl);
        setIsOpen(false);
        setIsProcessing(false);
        setReviewAction("");
      }
    }, 1000); // check every second

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleSummary);
    chrome.runtime.onMessage.addListener(handleBlog);

    return () => {
      chrome.runtime.onMessage.removeListener(handleSummary);
      chrome.runtime.onMessage.removeListener(handleBlog);
    };
  }, []);
  const handleSummary = (message, sender, sendResponse) => {
    if (message.action === "sendSummary") {
      setSummaryText(message.summary);
      setIsProcessing(false);
    }
  };

  const handleBlog = (message, sender, sendResponse) => {
    if (message.action === "sendBlog") {
      setBlogPost(message.blogPost);
      setReviewVisible(true);
      setReviewState({ blog_post: message.blogPost }); // setting the review state here, so the review popup will have access to the blog post.
    }
  };

  const handleReviewApproval = (
    approved: boolean,
    feedback: string,
    level: number
  ) => {
    const action = approved ? "approved" : "rejected";
    setReviewAction(action);
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
      }
    });
  };
  // Start Workflow function
  const startWorkflow = () => {
    if (summaryText && window.location.href === previousUrl) {
      console.log(
        "Summary already exists for this URL. Workflow not restarted."
      );
      return;
    }
    setIsProcessing(true); // Set the processing state to true
    const currentUrl = window.location.href;
    previousUrl = currentUrl;
    setVideoUrl(currentUrl);
    chrome.runtime.sendMessage(
      { action: "START_WORKFLOW", video_url: currentUrl },
      (response) => {
        if (response?.success) {
          console.log("Workflow started successfully.");
        } else {
          console.log("Workflow acknowledged but not yet completed.");
        }
      }
    );

    // Listen for the workflow completion message
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === "WORKFLOW_COMPLETED") {
        setIsProcessing(false); // Reset processing state

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

  // Optionally handle background message here (as per your logic)
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Only hide review when switching away from Blog tab
    if (tab !== "Blog") {
      setReviewVisible(false);
    } else if (reviewState) {
      // When returning to Blog tab, show review again if it exists
      setReviewVisible(true);
    }
  };
  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {/* Compose Icon with Solid Color */}
      <button
        onClick={() => {
          startWorkflow(); // Start workflow on click
          setIsOpen(!isOpen); // Toggle card open/close
        }}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-6 shadow-lg transition-all duration-300"
        title="Compose"
        disabled={isProcessing} // Disable button when processing
      >
        {/* Brain Icon with Solid Color */}
        <div className="bg-yellow-300 p-1 rounded-full">
          <Brain size={40} className="text-gray-800" />
        </div>
      </button>

      {/* Card Panel */}
      {isOpen && (
        <div className="mt-4 w-[320px] rounded-2xl shadow-2xl bg-white text-gray-800 overflow-hidden animate-fade-in-up">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex-1 px-4 py-2 text-sm font-semibold ${
                  activeTab === tab
                    ? "bg-white text-blue-700 border-b-2 border-blue-700"
                    : "text-gray-500 hover:text-blue-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 min-h-[150px] flex items-center justify-center">
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                <p className="mt-2 text-sm text-blue-700">Processing...</p>
              </div>
            ) : (
              <>
                {activeTab === "Summary" && <Summary data={summaryText} />}
                {activeTab === "Blog" && reviewVisible && reviewState && (
                  <ReviewPopup
                    state={reviewState}
                    onReview={handleReviewApproval}
                    reviewAction={reviewAction}
                    onClose={
                      () => {
                        setReviewVisible(false);
                        setActiveTab("Summary");
                      } // Close review and switch to Summary tab
                    }
                  />
                )}
                {activeTab === "Quiz" && <div>Quiz content here</div>}
                {activeTab === "Result" && <div>Result content here</div>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;
