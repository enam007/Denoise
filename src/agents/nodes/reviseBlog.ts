import { YoutubeBlogState } from "../types";
import { llm } from "../LLM/openAi"; // Ensure your LLM instance is correctly imported
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  MessageContentText,
  MessageContentComplex,
} from "@langchain/core/messages";
import { RunnableSequence } from "@langchain/core/runnables";

async function reviseBlog(state: YoutubeBlogState): Promise<YoutubeBlogState> {
  const { blog_post, human_feedback } = state;

  const prompt = RunnableSequence.from([
    (input: { blog_post: string; human_feedback: string }) => [
      new SystemMessage(`
                You are an expert blog editor. Your task is to refine and enhance the given blog post 
                by incorporating human feedback. Ensure that:

                - The writing style remains clear, engaging, and professional.
                - The blog structure flows smoothly from introduction to conclusion.
                - Any unclear or weak sections are improved based on the feedback.
                - Grammar, spelling, and readability are enhanced.
                - The tone remains consistent with the original intent.
                - Format the content in **Markdown** for better presentation.    
                
                Revise the blog while maintaining its original meaning and key message.
            `),
      new HumanMessage(`
                ## Original Blog:
                ${input.blog_post}

                ## Feedback:
                ${input.human_feedback}

                Please improve the blog based on this feedback while keeping it well-structured and engaging.
            `),
    ],
    llm,
  ]);
  try {
    const response: AIMessage = await prompt.invoke({
      blog_post,
      human_feedback,
    });
    let revisedBlog: string = "";

    if (Array.isArray(response.content)) {
      for (const part of response.content) {
        if (typeof part === "string") {
          revisedBlog += part;
        } else if (typeof part === "object" && "text" in part) {
          revisedBlog += (part as MessageContentText).text;
        }
        //You can add more else if statements to handle other content types if needed.
      }
    } else if (typeof response.content === "string") {
      revisedBlog = response.content;
    }

    console.log("Revised Blog:", revisedBlog);

    return {
      ...state,
      blog_post: revisedBlog,
      last_node: "reviseBlog",
    };
  } catch (error) {
    console.error("Error while revising blog:", error);
    return state; // Return the original state in case of an error
  }
}

export { reviseBlog };
