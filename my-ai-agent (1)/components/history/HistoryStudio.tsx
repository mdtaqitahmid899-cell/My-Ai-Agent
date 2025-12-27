import React, { useState, useEffect } from 'react';
import { initGapi, handleAuthClick, saveBackup, listBackups, loadBackup, signOut } from '../../services/driveService';
import type { Message, DriveFile, BackupData } from '../../types';

interface HistoryStudioProps {
    messages: Message[];
    theme: string;
    language: string;
    onRestore: (data: BackupData) => void;
}

const HistoryStudio: React.FC<HistoryStudioProps> = ({ messages, theme, language, onRestore }) => {
    const [clientId, setClientId] = useState(() => localStorage.getItem('google-client-id') || '');
    const [isConnected, setIsConnected] = useState(false);
    const [backups, setBackups] = useState<DriveFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<string>('');
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    const handleSaveClientId = () => {
        if (clientId.trim()) {
            localStorage.setItem('google-client-id', clientId);
            initDrive();
        }
    };

    const initDrive = async () => {
        setIsLoading(true);
        try {
            await initGapi(clientId);
            setStatus('Drive API initialized. Please connect.');
        } catch (error) {
            console.error(error);
            setStatus('Failed to initialize Drive API. Check Client ID.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnect = async () => {
        try {
            await handleAuthClick();
            setIsConnected(true);
            refreshBackups();
        } catch (error) {
            console.error('Auth error', error);
            setStatus('Authentication failed.');
        }
    };

    const handleDisconnect = () => {
        signOut();
        setIsConnected(false);
        setBackups([]);
    };

    const refreshBackups = async () => {
        setIsLoading(true);
        try {
            const files = await listBackups();
            setBackups(files);
        } catch (error) {
            console.error(error);
            setStatus('Failed to list backups.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackup = async () => {
        setIsLoading(true);
        const apiKey = localStorage.getItem('gemini-api-key') || '';
        const data: BackupData = {
            timestamp: new Date().toISOString(),
            settings: {
                geminiApiKey: apiKey,
                theme,
                language,
            },
            chatHistory: messages,
        };

        try {
            await saveBackup(data);
            setStatus('Backup saved successfully to Google Drive!');
            refreshBackups();
        } catch (error) {
            console.error(error);
            setStatus('Failed to save backup.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestore = async (fileId: string) => {
        setIsLoading(true);
        try {
            const data = await loadBackup(fileId);
            onRestore(data);
        } catch (error) {
            console.error(error);
            setStatus('Failed to load backup.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (clientId) {
            initDrive();
        }
    }, []);

    if (!clientId || !localStorage.getItem('google-client-id')) {
        return (
             <div className="flex flex-col items-center justify-center h-full bg-light-surface dark:bg-dark-surface p-8 rounded-lg border border-light-border dark:border-dark-border max-w-2xl mx-auto">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-6">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-accent-start" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-center">Google Drive Sync Setup</h2>
                <p className="text-center text-light-text-secondary dark:text-dark-text-secondary mb-6">
                    To save your chat history and API keys securely to your Google Drive, you need to provide a <strong>Google Cloud Client ID</strong>. This ensures only you can access your data.
                </p>
                <div className="w-full max-w-md space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Google Client ID</label>
                        <input 
                            type="text" 
                            value={clientId} 
                            onChange={(e) => setClientId(e.target.value)}
                            placeholder="ex: 123456...apps.googleusercontent.com"
                            className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded p-3 focus:ring-2 focus:ring-accent-start outline-none"
                        />
                    </div>
                    <button 
                        onClick={handleSaveClientId}
                        className="w-full bg-accent-start text-white font-bold py-3 rounded hover:opacity-90 transition"
                    >
                        Save Client ID
                    </button>
                    <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-4">
                        <p className="font-semibold mb-2">How to get a Client ID:</p>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Go to <a href="https://console.cloud.google.com/" target="_blank" className="underline text-accent-start">Google Cloud Console</a>.</li>
                            <li>Create a project and enable the <strong>Google Drive API</strong>.</li>
                            <li>Go to Credentials {'>'} Create Credentials {'>'} OAuth client ID.</li>
                            <li>Select "Web application".</li>
                            <li>
                                Add this URL to "Authorized JavaScript origins":<br/>
                                <code className="block mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded select-all font-mono text-accent-start break-all">
                                    {origin}
                                </code>
                            </li>
                        </ol>
                    </div>
                </div>
             </div>
        );
    }

    return (
        <div className="h-full flex flex-col max-w-5xl mx-auto">
            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg border border-light-border dark:border-dark-border mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-start" viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.5 4.43l.32 1.33 1.34.13C20.53 11.97 22 13.09 22 15c0 1.66-1.34 3-3 3z"/></svg>
                            Backup & Sync
                        </h2>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            {isConnected ? 'Connected to Google Drive' : 'Sync disconnected'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {!isConnected ? (
                            <button 
                                onClick={handleConnect}
                                className="bg-gradient-to-r from-accent-start to-accent-end text-white px-6 py-2 rounded-lg hover:opacity-90 font-medium"
                            >
                                Connect Google Drive
                            </button>
                        ) : (
                             <button 
                                onClick={handleDisconnect}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-medium text-sm"
                            >
                                Disconnect
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isConnected && (
                <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
                     <div className="md:w-1/3 bg-light-surface dark:bg-dark-surface p-6 rounded-lg border border-light-border dark:border-dark-border flex flex-col">
                        <h3 className="font-bold text-lg mb-4">Actions</h3>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6">
                            Backup your current conversation history, Gemini API Key, and application settings to a secure folder in your Drive.
                        </p>
                        
                        <button 
                            onClick={handleBackup}
                            disabled={isLoading}
                            className="w-full bg-light-bg dark:bg-dark-bg hover:bg-light-border dark:hover:bg-dark-border border border-light-border dark:border-dark-border p-4 rounded-lg flex items-center justify-center gap-2 mb-4 transition-colors"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-start" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            <span className="font-semibold">Backup Now</span>
                        </button>

                         <button 
                            onClick={refreshBackups}
                            disabled={isLoading}
                            className="w-full bg-light-bg dark:bg-dark-bg hover:bg-light-border dark:hover:bg-dark-border border border-light-border dark:border-dark-border p-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            <span className="font-semibold">Refresh List</span>
                        </button>
                        
                        {status && (
                             <div className="mt-4 p-3 rounded bg-accent-start/10 text-accent-start text-sm">
                                {status}
                            </div>
                        )}
                     </div>

                     <div className="md:w-2/3 bg-light-surface dark:bg-dark-surface p-6 rounded-lg border border-light-border dark:border-dark-border flex flex-col overflow-hidden">
                        <h3 className="font-bold text-lg mb-4">Available Backups</h3>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {isLoading && backups.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-2 border-accent-start border-t-transparent rounded-full animate-spin mx-auto"></div>
                                </div>
                            ) : backups.length === 0 ? (
                                <div className="text-center py-10 text-light-text-secondary dark:text-dark-text-secondary">
                                    No backups found in "My-Ai-Data" folder.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {backups.map(file => (
                                        <div key={file.id} className="flex items-center justify-between p-4 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                                            <div>
                                                <p className="font-medium text-sm">{file.name}</p>
                                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                                    {new Date(file.createdTime).toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRestore(file.id)}
                                                disabled={isLoading}
                                                className="px-3 py-1.5 text-xs font-semibold rounded bg-accent-start/10 text-accent-start hover:bg-accent-start/20 transition-colors"
                                            >
                                                Restore
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default HistoryStudio;