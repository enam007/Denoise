import React, { useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer";

const ReviewPopup: React.FC<{
  state: any;
  onReview: (approved: boolean, feedback: string, level: number) => void;
}> = ({ state, onReview }) => {
  const [feedback, setFeedback] = useState("");
  const [level, setLevel] = useState<number | undefined>(undefined);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4">
      <div className="bg-white p-4 rounded shadow-lg w-full max-w-2xl">
        {/* Ensuring content fits within the container */}
        <div className="max-h-60 overflow-y-auto mb-4 border p-2 rounded">
          <MarkdownRenderer content={state.blog_post} />
        </div>
        <textarea
          className="w-full p-2 border rounded mb-2"
          placeholder="Provide feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded mb-2"
          type="number"
          placeholder="Readability level (1-5)"
          value={level}
          onChange={(e) => setLevel(parseInt(e.target.value))}
        />
        <div className="flex justify-between">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={() =>
              onReview(true, feedback, level || state.text_leveler)
            }
          >
            Approve
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={() =>
              onReview(false, feedback, level || state.text_leveler)
            }
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPopup;
