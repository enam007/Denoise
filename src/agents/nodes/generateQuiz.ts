import { YoutubeBlogState, QuizModel, QuestionModel } from "../types";
import { llm } from "../LLM/openAi";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  MessageContentText,
} from "@langchain/core/messages";
import { quizParser } from "../LLM/parsers";
import { RunnableSequence } from "@langchain/core/runnables";

async function generateQuiz(
  state: YoutubeBlogState
): Promise<YoutubeBlogState> {
  const { blog_post, max_quiz_question } = state;

  const prompt = RunnableSequence.from([
    (input: { blog_post: string; max_quiz_question: number }) => [
      new SystemMessage(`
                Generate a multiple-choice quiz based on the given blog content. 
                - Create **${input.max_quiz_question} multiple-choice questions**.
                - Each question must have **exactly four answer choices**.
                - Only **one correct answer** per question.
                - Ensure the output is a **list of questions** (minimum ${input.max_quiz_question}).
                - If there is not enough content, generate **related questions** from the same topic.
                - Ensure the question tests **key concepts** covered in the blog.    
                - Add an **explanation** for why the correct answer is correct.
                - Add the **topic or subject** of the question.
                - Keep the language **clear, concise, and engaging** to enhance understanding.   
            `),
      new HumanMessage(`
                Here is the blog content:
                
                ${input.blog_post}
            `),
    ],
    llm,
  ]);

  try {
    const response: AIMessage = await prompt.invoke({
      blog_post,
      max_quiz_question,
    });

    let responseText = "";

    if (Array.isArray(response.content)) {
      for (const part of response.content) {
        if (typeof part === "string") {
          responseText += part;
        } else if (typeof part === "object" && "text" in part) {
          responseText += (part as MessageContentText).text;
        }
      }
    } else if (typeof response.content === "string") {
      responseText = response.content;
    }

    const parsedQuiz = await quizParser.parse(responseText);

    // Validate and transform the parsed quiz
    const quizModel: QuizModel = {
      questions: parsedQuiz.questions.map((question: any) => {
        if (
          !question.question ||
          !question.options ||
          !question.correct_option ||
          !question.explanation ||
          !question.topic
        ) {
          throw new Error("Missing required question property");
        }
        return {
          question: question.question,
          options: question.options,
          correct_option: question.correct_option,
          explanation: question.explanation,
          topic: question.topic,
        };
      }),
    };

    console.log("Generated Quiz:", quizModel);

    return {
      ...state,
      quiz_questions: quizModel,
      last_node: "generateQuiz",
    };
  } catch (error) {
    console.error("Error while generating quiz:", error);
    return state;
  }
}

export { generateQuiz };
