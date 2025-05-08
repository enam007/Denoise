import React from "react";
import { QuestionModel } from "../agents/types";

interface QuizSummaryProps {
  questions: QuestionModel[];
  answers: (string | null)[];
}

const QuizSummary: React.FC<QuizSummaryProps> = ({ questions, answers }) => {
  const correctCount = questions.reduce(
    (count, q, i) => (q.correct_option === answers[i] ? count + 1 : count),
    0
  );

  const weakTopics = questions
    .filter((q, i) => q.correct_option !== answers[i])
    .map((q) => q.topic);

  const topicFrequency: Record<string, number> = {};
  weakTopics.forEach((topic) => {
    topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
  });

  const sortedWeakTopics = Object.entries(topicFrequency).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="mt-6 p-4 border rounded bg-gray-50">
      <h3 className="text-xl font-bold mb-2">
        Your Score: {correctCount} / {questions.length}
      </h3>

      {sortedWeakTopics.length > 0 && (
        <>
          <p className="font-semibold">You should review these topics:</p>
          <ul className="list-disc list-inside ml-4 mt-2">
            {sortedWeakTopics.map(([topic, count], i) => (
              <li key={i}>
                {topic} ({count} incorrect)
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default QuizSummary;
