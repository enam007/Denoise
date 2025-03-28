import { StateGraph, START, END } from "@langchain/langgraph/web";
import { YoutubeBlogState, channels } from "../types";
import { extractTranscript } from "../nodes/extractTranscript";
import { generateSummary } from "../nodes/generateSummary";
import { generateBlog } from "../nodes/generateBlog";
import { humanReview } from "../nodes/humanReview";
import { reviseBlog } from "../nodes/reviseBlog";
import { generateQuiz } from "../nodes/generateQuiz";
import { shouldContinue } from "../nodes/shouldContinue";
import { memorySaver } from "./memorySaver";

const workflow = new StateGraph<YoutubeBlogState>({ channels })
  .addNode("extractTranscript", extractTranscript)
  .addNode("generateSummary", generateSummary)
  .addNode("generateBlog", generateBlog)
  .addNode("humanReview", humanReview)
  .addNode("reviseBlog", reviseBlog)
  .addNode("generateQuiz", generateQuiz)
  .addConditionalEdges("__start__", (state) => {
    return state.last_node === "humanReview"
      ? "humanReview"
      : "extractTranscript";
  })
  .addEdge("extractTranscript", "generateSummary")
  .addEdge("generateSummary", "generateBlog")
  .addEdge("generateBlog", "humanReview")
  .addConditionalEdges("humanReview", shouldContinue, [
    "reviseBlog",
    "generateQuiz",
  ])
  .addEdge("reviseBlog", "humanReview")
  .addEdge("generateQuiz", END);

// Compile Graph
const executor = workflow.compile();
console.log("GraphCompiled");
// Export Workflow
export { executor, workflow };
