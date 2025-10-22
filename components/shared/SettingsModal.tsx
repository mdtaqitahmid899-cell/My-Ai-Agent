import React from 'react';
import Modal from './Modal';
import clsx from 'clsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
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


const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, theme, toggleTheme }) => {

  const SettingRow: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
    <div className="flex items-center justify-between py-3 border-b border-light-border dark:border-dark-border">
      <p className="text-light-text-primary dark:text-dark-text-primary">{label}</p>
      <div>{children}</div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
    >
        <div className="space-y-4">
            <SettingRow label={theme === 'light' ? 'Light Mode' : 'Dark Mode'}>
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </SettingRow>

            <SettingRow label="Conversation History">
                <button className="px-4 py-2 text-sm font-medium rounded-md text-white bg-accent-start hover:opacity-90 transition-opacity">
                    Clear History
                </button>
            </SettingRow>

             <SettingRow label="API Key">
                <button className="px-4 py-2 text-sm font-medium rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg transition-colors">
                    Manage
                </button>
            </SettingRow>
        </div>
    </Modal>
  );
};

export default SettingsModal;
