import { MemorySaver } from "@langchain/langgraph/web";

// Initialize and export the MemorySaver instance
export const memorySaver = new MemorySaver();

// Function to retrieve the current workflow state
// async function getWorkflowState() {
//   const savedState = await memorySaver.get("workflowState");
//   return savedState || { last_node: "START" };
// }

// // Function to save the updated workflow state
// async function saveWorkflowState(state) {
//   await memorySaver.put("workflowState", state);
// }
