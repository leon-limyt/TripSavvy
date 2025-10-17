
import React from 'react';

const TripIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.933l-9 5.25v9l8.628-5.033A.75.75 0 0021.75 16.5V7.933zM2.25 7.933V16.5a.75.75 0 00.372.648L12 22.182v-9l-9-5.25z" />
  </svg>
);

export default TripIcon;
