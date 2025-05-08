import { YoutubeBlogState } from "../types";

async function humanReview(state: YoutubeBlogState): Promise<YoutubeBlogState> {
  console.log("\n------------ Blog Review ------------------\n");
  console.log(state.blog_post);
  if (state.last_node === "humanReview") {
    console.log("Skipping already executed humanReview step...");
    return state; // Don't re-run
  }
  // Ask for approval using a confirm dialog
  return new Promise((resolve) => {
    //chrome.action.openPopup(() => {
    // Send the blog post to the popup
    chrome.runtime.sendMessage({
      action: "sendBlog",
      blogPost: state.blog_post,
    });
  });
  //});
}
export { humanReview };
