import React from "react";
import { SummaryModel } from "../agents/types";
import { ListChecks, AlignLeft } from "lucide-react";

interface SummaryProps {
  data: SummaryModel;
}

const Summary: React.FC<SummaryProps> = ({ data }) => {
  if (
    !data?.summary_text &&
    (!data?.key_points || data.key_points.length === 0)
  ) {
    return (
      <div className="text-gray-500 italic text-sm">No summary available.</div>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto bg-white rounded-2xl shadow-md p-6 space-y-4 border border-gray-100">
      {data.summary_text && (
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2 text-blue-600">
            <AlignLeft className="w-5 h-5" />
            Summary
          </h2>
          <p className="mt-2 text-gray-800 leading-relaxed whitespace-pre-line">
            {data.summary_text}
          </p>
        </div>
      )}

      {data.key_points && data.key_points.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 text-green-600">
            <ListChecks className="w-5 h-5" />
            Key Takeaways
          </h3>
          <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
            {data.key_points.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Summary;
