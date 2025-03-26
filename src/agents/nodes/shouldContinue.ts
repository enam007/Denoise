import { YoutubeBlogState } from "../types";

function shouldContinue(state: YoutubeBlogState): string {
  return state.review_approved ? "generate_quiz" : "revise_blog";
}

export { shouldContinue };
