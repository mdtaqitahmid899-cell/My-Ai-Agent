import React, { useEffect, useRef } from 'react';
import type { Message } from '../../types';
import 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
import ActionToolbar from '../shared/ActionToolbar';
import clsx from 'clsx';
import { useLanguage } from '../../contexts/LanguageContext';

declare var marked: {
  parse(markdown: string): string;
};

const MessageItem: React.FC<{ message: Message; isLastMessage: boolean; isLoading: boolean; }> = ({ message, isLastMessage, isLoading }) => {
  const isUser = message.role === 'user';
  const containerClasses = `flex items-start gap-3 md:gap-4 mb-6 animate-fade-in-up px-2 md:px-4`;
  const bubbleClasses = clsx(
      "p-4 rounded-2xl max-w-full shadow-sm text-sm md:text-base", 
      isUser 
        ? 'bg-gradient-to-br from-accent-start to-accent-end text-white rounded-tr-sm' 
        : 'bg-white dark:bg-[#2f2f2f] rounded-tl-sm border border-light-border dark:border-[#424242] shadow-md'
  );
  const isStreaming = !isUser && isLastMessage && isLoading;

  const UserAvatar = () => (
    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center justify-center font-bold text-xs md:text-sm text-light-text-primary dark:text-dark-text-primary shrink-0 shadow-sm">
      You
    </div>
  );

  const AssistantAvatar = () => (
    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-light-surface dark:bg-dark-surface flex items-center justify-center shrink-0 p-1 shadow-sm border border-light-border dark:border-dark-border">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-4A2.5 2.5 0 0 1 9.5 2Z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-4A2.5 2.5 0 0 0 14.5 2Z" />
            </svg>
        </div>
    </div>
  );

  const formattedContent = { __html: marked.parse(message.content.replace(/```(\w+)?\n/g, '```\n').replace(/```/g, '\n```\n')) };
  
  return (
    <div className={containerClasses}>
      {isUser ? <div className="flex-grow"></div> : <AssistantAvatar />}
      
      {isUser ? (
        // User message bubble
        <div className="group relative flex items-start gap-2 max-w-[85%] md:max-w-xl">
           <div className={bubbleClasses}>
              <div className="prose prose-sm md:prose-base prose-p:my-0 prose-pre:bg-black/20 prose-pre:p-3 prose-pre:rounded-lg prose-invert text-white" dangerouslySetInnerHTML={formattedContent} />
          </div>
        </div>
      ) : (
        // Assistant message
        <div className="group relative flex flex-col items-start flex-1 max-w-[90%] md:max-w-3xl min-w-0">
            <div className={bubbleClasses}>
                <div 
                    className={clsx(
                        "prose prose-sm md:prose-base max-w-none prose-p:my-1.5 prose-pre:bg-[#1e1e1e] prose-pre:p-4 prose-pre:rounded-lg prose-invert dark:prose-invert text-light-text-primary dark:text-dark-text-primary prose-a:text-accent-start break-words",
                        { 'streaming-message': isStreaming }
                    )}
                    dangerouslySetInnerHTML={formattedContent} 
                />
            </div>
            {!isStreaming && (
                <div className="mt-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ActionToolbar contentToCopy={message.content} />
                </div>
            )}
        </div>
      )}

       {isUser && <UserAvatar />}
    </div>
  );
};

const LoadingIndicator = () => (
    <div className="flex items-start gap-3 md:gap-4 mb-6 animate-fade-in-up px-2 md:px-4">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-light-surface dark:bg-dark-surface flex items-center justify-center shrink-0 p-1 shadow-sm border border-light-border dark:border-dark-border">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-4A2.5 2.5 0 0 1 9.5 2Z" />
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-4A2.5 2.5 0 0 0 14.5 2Z" />
                </svg>
            </div>
        </div>
        <div className="p-4 rounded-2xl rounded-tl-sm bg-white dark:bg-[#2f2f2f] shadow-md border border-light-border dark:border-[#424242] flex items-center space-x-2">
            <div className="flex space-x-1">
                <div className="w-2 h-2 bg-accent-start rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-accent-start rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-accent-start rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
        </div>
    </div>
)

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const showInitialLoader = isLoading && (messages.length === 0 || messages[messages.length - 1].role === 'user');

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth w-full relative bg-light-bg/50 dark:bg-dark-bg/50 lg:bg-transparent">
       <div className="max-w-5xl mx-auto py-6 min-h-full flex flex-col justify-end">
          {/* Empty state spacer */}
          {messages.length === 0 && (
             <div className="flex-1 flex items-center justify-center opacity-50 text-center p-8">
                 <div className="max-w-md">
                    <p className="text-xl font-semibold mb-2">{t('chat.welcome')}</p>
                    <p className="text-sm">{t('chat.start')}</p>
                 </div>
             </div>
          )}
          
          {messages.map((msg, index) => (
            <MessageItem 
                key={msg.id} 
                message={msg}
                isLastMessage={index === messages.length - 1}
                isLoading={isLoading}
            />
          ))}
          {showInitialLoader && <LoadingIndicator />}
       </div>
    </div>
  );
};

export default MessageList;