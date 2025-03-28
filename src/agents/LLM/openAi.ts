import { ChatGroq } from "@langchain/groq";

const llm = new ChatGroq({
  model: "qwen-2.5-32b", // Specify the desired model
  temperature: 0.7,
  apiKey: "g", // Directly provide the API key //TODO to get it from localStorage
});

export { llm };
