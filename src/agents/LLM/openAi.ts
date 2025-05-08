import { ChatGroq } from "@langchain/groq";

const llm = new ChatGroq({
  model: "gemma2-9b-it", // Specify the desired model
  temperature: 0.7,
  apiKey: "", // Directly provide the API key  //TODO to get it from localStorage
});

export { llm };
