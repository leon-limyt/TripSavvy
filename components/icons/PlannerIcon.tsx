
import React from 'react';

const PlannerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M11.47 1.72a.75.75 0 011.06 0l3 3a.75.75 0 01-1.06 1.06l-1.72-1.72V7.5h-1.5V4.06L9.53 5.78a.75.75 0 01-1.06-1.06l3-3zM11.25 7.5V15a.75.75 0 001.5 0V7.5h-1.5z" />
    <path
      fillRule="evenodd"
      d="M6.163 14.534a.75.75 0 011.06 0l3.535 3.536a.75.75 0 010 1.06l-3.535 3.536a.75.75 0 01-1.06-1.061L9.128 18.5H3a.75.75 0 010-1.5h6.128L6.163 15.6a.75.75 0 010-1.06z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M17.837 14.534a.75.75 0 010 1.06L14.87 18.56a.75.75 0 010 1.06l2.967 2.967a.75.75 0 11-1.06 1.06l-3.536-3.535a.75.75 0 010-1.06l3.536-3.535a.75.75 0 011.06 0z"
      clipRule="evenodd"
    />
  </svg>
);

export default PlannerIcon;
