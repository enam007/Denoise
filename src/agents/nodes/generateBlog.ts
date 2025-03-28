import { YoutubeBlogState, textLevels } from "../types";
import { llm } from "../LLM/openAi";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  MessageContentText,
} from "@langchain/core/messages";
import { RunnableSequence } from "@langchain/core/runnables";

async function generateBlog(
  state: YoutubeBlogState
): Promise<YoutubeBlogState> {
  let summary: string = state.summary?.summary_text ?? ""; // Extract summary_text, default to empty string

  if (state.summary?.key_points && state.summary.key_points.length > 0) {
    summary += "\n\nKey Points:\n" + state.summary.key_points.join("\n"); // Concatenate key points
  }
  const textLevel = state.text_leveler ?? 3;
  const levelDescription =
    textLevels[textLevel] || "Default: Use clear and concise language.";

  if (!summary) {
    console.error("Summary is missing. Cannot generate blog.");
    return state;
  }

  try {
    const prompt = RunnableSequence.from([
      (input: { summary: string; levelDescription: string }) => [
        new SystemMessage(
          `Transform the following summarized transcript into a well-structured and engaging blog post.
                        - **Readability Level:** ${input.levelDescription}
                        - Use **clear, simple English** to ensure readability.
                        - Make it **informative, engaging, and easy to follow**.
                        - Use **analogies** to simplify complex concepts.
                        - Wherever an analogy is used, provide an **easy-to-follow code example** with a **line-by-line explanation**.
                        - Ensure the blog has a **compelling title, an introduction, key takeaways, and a strong conclusion**.
                        - Format the content in **Markdown** for better presentation.
                        - Structure the blog so that each major concept is introduced with an **analogy first**, followed by a **level-appropriate code example**.
                        - Ensure all **code examples are well-commented and practical**.`
        ),
        new HumanMessage(`Here is the summary: ${input.summary}`),
      ],
      llm,
    ]);

    const response: AIMessage = await prompt.invoke({
      summary,
      levelDescription,
    });

    let blogModel: string = "";

    if (Array.isArray(response.content)) {
      for (const part of response.content) {
        if (typeof part === "string") {
          blogModel += part;
        } else if (typeof part === "object" && "text" in part) {
          blogModel += (part as MessageContentText).text;
        }
      }
    } else if (typeof response.content === "string") {
      blogModel = response.content;
    }

    console.log("Generated Blog Post:", blogModel);

    return {
      ...state,
      blog_post: blogModel,
      last_node: "generateBlog",
    };
  } catch (error) {
    console.error("Error generating blog post:", error);
    return state;
  }
}

export { generateBlog };
