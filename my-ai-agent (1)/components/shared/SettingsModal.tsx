import React from 'react';
import Modal from './Modal';
import clsx from 'clsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onClearHistory?: () => void;
}

const ThemeToggle: React.FC<{ theme: 'light' | 'dark'; toggleTheme: () => void; }> = ({ theme, toggleTheme }) => (
  <button
    onClick={toggleTheme}
    className={clsx(
      "relative inline-flex items-center h-8 w-14 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-start",
      {
        'bg-gray-200 dark:bg-gray-700': true,
      }
    )}
  >
    <span className="sr-only">Toggle theme</span>
    <span
      className={clsx(
        "inline-block h-6 w-6 transform bg-white rounded-full transition-transform duration-300",
        {
          'translate-x-1': theme === 'light',
          'translate-x-7': theme === 'dark',
        }
      )}
    />
     <span className={clsx("absolute left-2", {'opacity-100': theme === 'light', 'opacity-0': theme === 'dark'})}>
        ☀️
     </span>
     <span className={clsx("absolute right-2", {'opacity-100': theme === 'dark', 'opacity-0': theme === 'light'})}>
        🌙
     </span>
  </button>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, theme, toggleTheme, onClearHistory }) => {
  
  const handleClearHistory = () => {
      if (onClearHistory && confirm('Are you sure? This will delete the current session history locally.')) {
          onClearHistory();
          onClose();
      }
  }

  const SettingRow: React.FC<{ label: string; children: React.ReactNode; onClick?: () => void; clickable?: boolean }> = ({ label, children, onClick, clickable }) => (
    <div 
        className={clsx(
            "flex items-center justify-between py-4 border-b border-light-border dark:border-dark-border",
            clickable && "cursor-pointer hover:bg-light-bg/50 dark:hover:bg-dark-bg/50 -mx-6 px-6 transition-colors"
        )}
        onClick={onClick}
    >
      <p className="text-base font-medium text-light-text-primary dark:text-dark-text-primary">{label}</p>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
    >
        <div className="flex flex-col">
            <SettingRow label={theme === 'light' ? 'Light Mode' : 'Dark Mode'}>
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </SettingRow>

            <SettingRow label="Conversation History">
                <button 
                    onClick={handleClearHistory}
                    className="px-3 py-1.5 text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                    Clear Local
                </button>
            </SettingRow>
        </div>
    </Modal>
  );
};

export default SettingsModal;