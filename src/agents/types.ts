export interface SummaryModel {
  summary_text?: string; // Brief summary of the content
  key_points?: string[]; // List of key takeaways or important points
}

export interface QuestionModel {
  question: string; // Optional
  options: [string, string, string, string]; // Optional
  correct_option: string; // Optional
  explanation: string; // Optional
  topic: string; // Optional
}

export interface QuizModel {
  questions: QuestionModel[]; // A list of quiz questions
}

// Define text complexity levels
export const textLevels: Record<number, string> = {
  1: "Kindergarten: Very simple words, short sentences. Explain like talking to a 5-year-old.",
  2: "5th Grade: Simple words, short sentences. Avoid complex words.",
  3: "High School: Clear language but allows some technical terms with explanations.",
  4: "College: More formal and technical. Assumes basic prior knowledge.",
  5: "Professional: Advanced terminology, precise definitions, detailed explanations.",
};

// Define the state interface
export interface YoutubeBlogState {
  video_url?: string;
  transcript?: string;
  summary?: SummaryModel;
  blog_post?: string; // Placeholder for a BlogModel if needed
  quiz_questions?: QuizModel;
  review_approved?: boolean;
  human_feedback?: string;
  max_quiz_question?: number;
  text_leveler?: number;
  last_node?: string;
  __start__?: string;
}

export const channels = {
  video_url: {
    value: (current?: string, update?: string) => update ?? current ?? "",
    default: () => "",
  },
  transcript: {
    value: (current?: string, update?: string) => update ?? current ?? "",
    default: () => "",
  },
  summary: {
    value: (current?: SummaryModel, update?: SummaryModel) => update ?? current,
    default: () => undefined,
  },
  blog_post: {
    value: (current?: string, update?: string) => update ?? current ?? "",
    default: () => "",
  },
  quiz_questions: {
    value: (current?: QuizModel, update?: QuizModel) => update ?? current,
    default: () => undefined,
  },
  review_approved: {
    value: (current?: boolean, update?: boolean) => update ?? current ?? false,
    default: () => false,
  },
  human_feedback: {
    value: (current?: string, update?: string) => update ?? current ?? "",
    default: () => "",
  },
  max_quiz_question: {
    value: (current?: number, update?: number) => update ?? current ?? 0,
    default: () => 10,
  },
  text_leveler: {
    value: (current?: number, update?: number) => update ?? current ?? 0,
    default: () => 1,
  },
  last_node: {
    value: (current?: string, update?: string) => update ?? current ?? "START",
    default: () => "START",
  },
};
