import React from 'react';
import type { Feature } from '../../types';

interface PlaceholderProps {
  feature: Feature;
}

const Placeholder: React.FC<PlaceholderProps> = ({ feature }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-light-surface dark:bg-dark-surface rounded-lg p-8 border border-light-border dark:border-dark-border">
      {/* Fix: Removed unnecessary type assertion `as React.ReactElement` which was causing the type error. The `feature.icon` prop is already correctly typed to accept a className. */}
      <div className="text-accent-start mb-4">{React.cloneElement(feature.icon, { className: 'h-16 w-16' })}</div>
      <h2 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">{feature.name}</h2>
      <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-md">The "{feature.name}" feature is coming soon. Stay tuned for updates on this powerful new capability!</p>
    </div>
  );
};

export default Placeholder;