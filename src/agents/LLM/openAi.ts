import { ChatGroq } from "@langchain/groq";

const llm = new ChatGroq({
  model: "qwen-2.5-32b", // Specify the desired model
  temperature: 0.7,
  apiKey: "", // Directly provide the API key
});

export { llm };
