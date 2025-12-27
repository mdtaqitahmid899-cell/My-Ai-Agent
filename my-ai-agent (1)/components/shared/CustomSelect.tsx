import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (Option | string)[]; // Supports simple strings or {label, value} objects
  label?: string;
  placeholder?: string;
  className?: string;
}

const ChevronDownIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const CheckIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, label, placeholder, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Normalize options to Option[]
    const normalizedOptions: Option[] = options.map(opt => 
        typeof opt === 'string' ? { value: opt, label: opt } : opt
    );

    const selectedOption = normalizedOptions.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className={clsx("relative", className)} ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "w-full flex items-center justify-between bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary rounded-lg p-3 text-left border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-start",
                    isOpen ? "border-accent-start ring-2 ring-accent-start/20" : "border-light-border dark:border-dark-border hover:border-accent-start/50"
                )}
            >
                <span className={clsx("block truncate", !selectedOption && "text-light-text-secondary/70 dark:text-dark-text-secondary/70")}>
                    {selectedOption ? selectedOption.label : placeholder || "Select..."}
                </span>
                <ChevronDownIcon className={clsx("h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary transition-transform duration-200", isOpen && "transform rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-light-surface dark:bg-dark-surface rounded-xl shadow-xl border border-light-border dark:border-dark-border py-1 animate-fade-in-up max-h-60 overflow-auto custom-scrollbar">
                    {normalizedOptions.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelect(opt.value)}
                            className={clsx(
                                "w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left",
                                value === opt.value
                                    ? "bg-gradient-to-r from-accent-start/10 to-accent-end/10 text-accent-start font-medium"
                                    : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg dark:hover:bg-dark-bg"
                            )}
                        >
                            <span className="truncate">{opt.label}</span>
                            {value === opt.value && <CheckIcon className="h-4 w-4 text-accent-start shrink-0 ml-2" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;