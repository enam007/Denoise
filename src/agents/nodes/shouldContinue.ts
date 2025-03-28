import { YoutubeBlogState } from "../types";

function shouldContinue(state: YoutubeBlogState): string {
  return state.review_approved ? "generateQuiz" : "reviseBlog";
}

export { shouldContinue };
