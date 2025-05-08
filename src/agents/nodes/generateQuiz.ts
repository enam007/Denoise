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
import { ChatPromptTemplate } from "@langchain/core/prompts";

async function generateQuiz(
  state: YoutubeBlogState
): Promise<YoutubeBlogState> {
  const { blog_post, max_quiz_question } = state;

  try {
    const prompt = RunnableSequence.from([
      ChatPromptTemplate.fromTemplate(`
    Generate a multiple-choice quiz based on the given blog content.
    
    - Create exactly **{max_quiz_question}** questions.
    - Each question must include:
      - A field named \`question\`: a single quiz question as a clear string.
      - A field named \`options\`: a list of exactly **4 distinct answer choices** as strings.
      - A field named \`correct_option\`: a string that **exactly matches one of the options**.
      - A field named \`explanation\`: a brief explanation of why the correct answer is correct.
      - A field named \`topic\`: the relevant subject or concept for the question.
    
    - Ensure the output is a **JSON object** with a single key \`questions\` mapping to an **array of such question objects**.
    - If the blog lacks enough content, generate **related questions from the same topic**.
    - Make sure each question tests **key concepts** from the blog.
    - Keep the language **clear, concise, and engaging**.
    
    Here is the blog content:
    {blog_post}
    `),

      // 3. Your LLM instance (must be initialized beforehand)
      llm,

      // 4. The parser to enforce structure
      quizParser,
    ]);

    const rawQuiz = await prompt.invoke({
      blog_post: blog_post,
      max_quiz_question: max_quiz_question,
      format_instructions: quizParser.getFormatInstructions(),
    });

    const quizModel: QuizModel = rawQuiz as QuizModel;

    // Validate and transform the response
    const validatedQuizModel: QuizModel = {
      questions:
        quizModel.questions?.map((q) => {
          if (
            q.question && // Ensure the question is present
            q.options && // Ensure options are present
            q.options.length === 4 && // Ensure exactly 4 options
            q.correct_option && // Ensure the correct option is present
            q.explanation && // Ensure the explanation is present
            q.topic // Ensure the topic is present
          ) {
            return {
              question: q.question,
              options: [q.options[0], q.options[1], q.options[2], q.options[3]], // Ensure exactly 4 options
              correct_option: q.correct_option,
              explanation: q.explanation,
              topic: q.topic,
            };
          } else {
            throw new Error("Invalid question format in quizModel");
          }
        }) || [], // Fallback to an empty array if no questions are returned
    };

    return {
      ...state,
      quiz_questions: validatedQuizModel,
      last_node: "generateQuiz",
    };
  } catch (error) {
    console.error("Error while generating quiz:", error);
    return state;
  }
}

export { generateQuiz };
