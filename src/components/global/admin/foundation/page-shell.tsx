import React from "react";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  // Set to true only for full-bleed pages like Stories, Maps, or Canvas Editors
  fullWidth?: boolean; 
}

export function PageShell({ children, className = "", fullWidth = false }: PageShellProps) {
  if (fullWidth) {
    return <div className={`w-full h-full flex-1 ${className}`}>{children}</div>;
  }

  return (
    <div className={`max-w-7xl mx-auto w-full p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}