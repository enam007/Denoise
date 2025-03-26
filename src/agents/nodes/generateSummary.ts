import { YoutubeBlogState, SummaryModel } from "../types";
import { llm } from "../LLM/openAi";
import { summaryParser } from "../LLM/parsers";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  MessageContentText,
} from "@langchain/core/messages";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatPromptTemplate } from "@langchain/core/prompts";

async function generateSummary(
  state: YoutubeBlogState
): Promise<YoutubeBlogState> {
  const transcript = state.transcript;

  if (!transcript) {
    console.error("Transcript is missing. Cannot generate summary.");
    return state;
  }

  try {
    const prompt = RunnableSequence.from([
      ChatPromptTemplate.fromTemplate(
        `System:Generate a well-structured summary of the following YouTube transcript.
          - Correct any spelling or grammatical mistakes while preserving the original meaning.
          - Ensure the summary is concise, coherent, and contextually accurate.
          - Extract the key points and present them in a structured manner.
          - Use clear, simple language for better readability.
          -{format_instructions}
          Human:Here is the transcript: {transcript}`
      ),

      llm,
      summaryParser,
    ]);
    // const prompt = RunnableSequence.from([
    //   (input: { transcript: string : }) => [
    //     new SystemMessage(
    //       `Generate a well-structured summary of the following YouTube transcript.
    //       - Correct any spelling or grammatical mistakes while preserving the original meaning.
    //       - Ensure the summary is concise, coherent, and contextually accurate.
    //       - Extract the key points and present them in a structured manner.
    //       - Use clear, simple language for better readability.
    //       -{format_instructions}`

    //     ),
    //     new HumanMessage(`Here is the transcript: ${transcript}`),
    //   ],
    //   llm.pipe(summaryParser),
    // ]);
    const summaryModel: SummaryModel = await prompt.invoke({
      transcript: transcript,
      format_instructions: summaryParser.getFormatInstructions(),
    });
    //const summaryModel: SummaryModel = await prompt.invoke({ transcript });
    return {
      ...state,
      summary: summaryModel,
    };
  } catch (error) {
    console.error("Error generating summary:", error);
    return state;
  }
}

export { generateSummary };
