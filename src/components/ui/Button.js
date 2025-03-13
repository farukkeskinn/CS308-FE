import React from "react";
export function Button({ children, className, ...props }) {
    return (
      <button
        className={`px-6 py-2 rounded-md font-medium transition-all ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
  