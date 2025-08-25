"use client";
import React, { useState } from "react";

type StaticButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

const StaticButton: React.FC<StaticButtonProps> = ({
  onClick,
  children,
  className = "",
  disabled = false,
}) => {
  const handleClick = () => {
    try {
      onClick();
    } finally {
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={
        className
          ? className
          : `flex cursor-pointer items-center justify-center gap-2 my-2 px-4 py-2 rounded-md text-white font-medium transition
        bg-primary hover:bg-secondary disabled:opacity-60 disabled:cursor-not-allowed `
      }
    >
      {children}
    </button>
  );
};

export default StaticButton;
