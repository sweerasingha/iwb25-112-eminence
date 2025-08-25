"use client";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";

type LoadingButtonProps = {
  onClick: () => Promise<void>;
  children: any;
  className?: string;
};

const LoadingButton: React.FC<LoadingButtonProps> = ({
  onClick,
  children,
  className = "",
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={
        className
          ? className
          : `flex cursor-pointer items-center justify-center gap-2 my-2 px-4 py-2 rounded-md text-white font-medium transition
        bg-primary hover:bg-secondary disabled:opacity-60 disabled:cursor-not-allowed `
      }
    >
      {loading && <Loader2 className="animate-spin h-4 w-4" />}
      {!loading && children}
    </button>
  );
};

export default LoadingButton;
