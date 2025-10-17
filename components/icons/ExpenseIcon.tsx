
import React from 'react';

const ExpenseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.375A3.375 3.375 0 0017.628 3H9.375a3.375 3.375 0 00-3.375 3.375V18a3 3 0 003 3h1.125a.75.75 0 010-1.5H7.502a1.5 1.5 0 01-1.5-1.5v-10.5a1.875 1.875 0 011.875-1.875z"
      clipRule="evenodd"
    />
    <path d="M3 9.375A3.375 3.375 0 016.375 6h11.25a.75.75 0 010 1.5H6.375A1.875 1.875 0 004.5 9.375v11.25a.75.75 0 01-1.5 0V9.375z" />
  </svg>
);

export default ExpenseIcon;
