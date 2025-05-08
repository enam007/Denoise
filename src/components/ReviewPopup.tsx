import React, { useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { textLevels } from "../agents/types";

const ReviewPopup: React.FC<{
  state: any;
  onReview: (approved: boolean, feedback: string, level: number) => void;
  reviewAction: "approved" | "rejected" | "";
  onClose: () => void;
}> = ({ state, onReview, reviewAction, onClose }) => {
  const [feedback, setFeedback] = useState("");
  const [level, setLevel] = useState<number | undefined>(undefined);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4">
      <div className="relative bg-white p-6 rounded shadow-lg w-[80vw] h-[80vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-black hover:text-red-600 text-4xl font-extrabold leading-none focus:outline-none z-10"
          aria-label="Close"
        >
          ×
        </button>
        {/* Scrollable content section */}
        <div className="flex-1 overflow-y-auto border p-3 rounded mb-4">
          <MarkdownRenderer content={state.blog_post} />
        </div>
        {reviewAction !== "approved" && (
          <>
            <textarea
              className="w-full p-2 border rounded mb-4 bg-white shadow"
              placeholder="Provide feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <div className="mb-4 w-fit">
              <label className="block text-base font-semibold text-gray-900 mb-2">
                📘 Readability Level
              </label>

              <div className="relative">
                <select
                  className="appearance-none w-52 p-3 pr-10 border rounded-lg bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={level ?? ""}
                  onChange={(e) => setLevel(parseInt(e.target.value))}
                >
                  <option value="" disabled>
                    Select level
                  </option>
                  {Object.entries(textLevels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {`${key}: ${label.split(":")[0]}`}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ▼
                </div>
              </div>
            </div>

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
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewPopup;
