import React from 'react';
import SpinnerIcon from './icons/SpinnerIcon';
import CheckIcon from './icons/CheckIcon';
import CloudErrorIcon from './icons/CloudErrorIcon';

export type SyncState = 'idle' | 'syncing' | 'saved' | 'error';

interface SyncStatusProps {
  state: SyncState;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ state }) => {
  if (state === 'idle') {
    return null; // Don't show anything when idle
  }

  const statusMap = {
    syncing: {
      icon: <SpinnerIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />,
      text: 'Syncing...',
      textColor: 'text-gray-500 dark:text-gray-400',
    },
    saved: {
      icon: <CheckIcon className="w-4 h-4 text-green-500" />,
      text: 'Saved',
      textColor: 'text-green-500',
    },
    error: {
      icon: <CloudErrorIcon className="w-4 h-4 text-red-500" />,
      text: 'Sync Failed',
      textColor: 'text-red-500',
    },
  };

  const currentStatus = statusMap[state];

  return (
    <div className="flex items-center space-x-2 transition-opacity duration-300">
      {currentStatus.icon}
      <span className={`text-sm font-medium ${currentStatus.textColor}`}>{currentStatus.text}</span>
    </div>
  );
};

export default SyncStatus;