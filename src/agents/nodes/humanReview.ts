import { YoutubeBlogState } from "../types";

async function humanReview(state: YoutubeBlogState): Promise<YoutubeBlogState> {
  console.log("\n------------ Blog Review ------------------\n");
  console.log(state.blog_post);

  // Ask for approval using a confirm dialog
  return new Promise((resolve) => {
    chrome.action.openPopup(() => {
      // Send the blog post to the popup
      chrome.runtime.sendMessage({
        action: "sendBlog",
        blogPost: state.blog_post,
      });

      // Listen for messages from the popup
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "reviewResult") {
          resolve({
            ...state,
            review_approved: message.approved,
            human_feedback: message.feedback,
            text_leveler: message.level,
          });
        }
      });
    });
  });
}
export { humanReview };
