import React, { useState } from "react";
import { QuizModel, QuestionModel } from "../agents/types";
import QuizQuestion from "./QuizQuestion";
import QuizSummary from "./QuizSummary";

interface QuizProps {
  quiz: QuizModel;
}

const Quiz: React.FC<QuizProps> = ({ quiz }) => {
  const [answers, setAnswers] = useState<(string | null)[]>(
    Array(quiz.questions.length).fill(null)
  );
  const [submitted, setSubmitted] = useState(false);

  const handleAnswer = (index: number, answer: string) => {
    if (submitted) return;
    const updated = [...answers];
    updated[index] = answer;
    setAnswers(updated);
  };

  const handleSubmit = () => {
    if (answers.every((a) => a !== null)) {
      setSubmitted(true);
    } else {
      alert("Please answer all questions.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Quiz</h2>

      {quiz.questions.map((q, i) => (
        <QuizQuestion
          key={i}
          index={i}
          question={q}
          selectedAnswer={answers[i]}
          onAnswer={handleAnswer}
          submitted={submitted}
        />
      ))}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={answers.includes(null)}
          className={`mt-6 px-6 py-2 rounded text-white ${
            answers.includes(null)
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Submit
        </button>
      ) : (
        <QuizSummary questions={quiz.questions} answers={answers} />
      )}
    </div>
  );
};

export default Quiz;
