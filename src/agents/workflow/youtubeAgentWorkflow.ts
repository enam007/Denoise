import { StateGraph, START, END } from "@langchain/langgraph/web";
import { YoutubeBlogState, channels } from "../types";
import { extractTranscript } from "../nodes/extractTranscript";
import { generateSummary } from "../nodes/generateSummary";
import { generateBlog } from "../nodes/generateBlog";
import { humanReview } from "../nodes/humanReview";
import { reviseBlog } from "../nodes/reviseBlog";
import { generateQuiz } from "../nodes/generateQuiz";
import { shouldContinue } from "../nodes/shouldContinue";

const workflow = new StateGraph<YoutubeBlogState>({ channels })
  .addNode("extractTranscript", extractTranscript)
  .addNode("generateSummary", generateSummary)
  .addNode("generateBlog", generateBlog)
  .addNode("humanReview", humanReview)
  .addNode("reviseBlog", reviseBlog)
  .addNode("generateQuiz", generateQuiz)
  .addEdge(START, "extractTranscript")
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

// Export Workflow
export { executor, workflow };
