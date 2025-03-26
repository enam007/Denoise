import React from "react";

const Card: React.FC<{}> = () => {
  return (
    <div
      id="summary-card"
      className="w-24 h-24 z-[999999] top-9 right-6 bg-black"
    >
      <div className="fixed right-0">
        <h1 className="z-50 text-3xl text-red-800">Hello World</h1>
      </div>
    </div>
  );
};

export default Card;
