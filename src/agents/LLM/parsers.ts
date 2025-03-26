import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

// 🎯 Parser for Summary Generation
export const summaryParser = StructuredOutputParser.fromZodSchema(
  z.object({
    summary_text: z.string().describe("Brief summary of the content"),
    key_points: z
      .array(z.string())
      .describe("List of key takeaways or important points"),
  })
);

// 🎯 Parser for Quiz Generation
export const quizParser = StructuredOutputParser.fromZodSchema(
  z.object({
    questions: z.array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        correct_option: z.string(),
        explanation: z.string(),
        topic: z.string(),
      })
    ),
  })
);
