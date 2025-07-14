import React from 'react';

export const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#CBAB58] focus:text-[#1F2024] focus:rounded-lg focus:font-semibold focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
};