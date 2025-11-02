
import React from "react";

interface SpinnerProps {
  text?: string;
}

const Spinner = ({ text }: SpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
      {text && <p className="text-white">{text}</p>}
    </div>
  );
};

export default Spinner;
