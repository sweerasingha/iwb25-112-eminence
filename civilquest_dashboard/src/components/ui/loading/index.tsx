import React from "react";

const Loading = () => {
  return (
    <div className="flex fixed  items-center justify-center min-h-screen bg-gray-100/50 z-50 top-0 left-0 bottom-0 right-0 w-full h-full">
      <span className="loader"></span>
    </div>
  );
};

export default Loading;
