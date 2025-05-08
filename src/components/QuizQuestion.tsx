import React from "react";
import { QuestionModel } from "../agents/types";

interface QuizQuestionProps {
  index: number;
  question: QuestionModel;
  selectedAnswer: string | null;
  onAnswer: (index: number, answer: string) => void;
  submitted: boolean;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  index,
  question,
  selectedAnswer,
  onAnswer,
  submitted,
}) => {
  return (
    <div className="mb-6 p-4 border rounded">
      <h3 className="font-semibold text-lg mb-3">
        {index + 1}. {question.question}
      </h3>
      {question.options.map((opt, idx) => {
        const isCorrect = opt === question.correct_option;
        const isWrong = submitted && selectedAnswer === opt && !isCorrect;

        return (
          <label
            key={idx}
            className={`block p-2 rounded border mb-2 cursor-pointer ${
              submitted
                ? isCorrect
                  ? "bg-green-100 border-green-500"
                  : isWrong
                  ? "bg-red-100 border-red-500"
                  : "border-gray-300"
                : "hover:bg-gray-100 border-gray-300"
            }`}
          >
            <input
              type="radio"
              name={`q-${index}`}
              disabled={submitted}
              checked={selectedAnswer === opt}
              onChange={() => onAnswer(index, opt)}
              className="mr-2"
            />
            {opt}
          </label>
        );
      })}
      {submitted && (
        <div className="mt-3 text-sm text-gray-700">
          <p>
            <strong>Correct Answer:</strong> {question.correct_option}
          </p>
          <p>
            <strong>Explanation:</strong> {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizQuestion;
