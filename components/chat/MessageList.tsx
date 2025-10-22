import React, { useEffect, useRef } from 'react';
import type { Message } from '../../types';
import 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
import ActionToolbar from '../shared/ActionToolbar';
import clsx from 'clsx';

declare var marked: {
  parse(markdown: string): string;
};

const MessageItem: React.FC<{ message: Message; isLastMessage: boolean; isLoading: boolean; }> = ({ message, isLastMessage, isLoading }) => {
  const isUser = message.role === 'user';
  const containerClasses = `flex items-start gap-3 md:gap-4 mb-6 animate-fade-in-up`;
  const bubbleClasses = `p-4 rounded-2xl max-w-xl shadow-md ${isUser ? 'bg-gradient-to-br from-accent-start to-accent-end text-white' : 'bg-light-surface dark:bg-dark-surface'}`;
  const isStreaming = !isUser && isLastMessage && isLoading;

  const UserAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center justify-center font-bold text-light-text-primary dark:text-dark-text-primary shrink-0">
      U
    </div>
  );

  const AssistantAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-light-surface dark:bg-dark-surface flex items-center justify-center shrink-0 p-1">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        </div>
    </div>
  );

  const formattedContent = { __html: marked.parse(message.content.replace(/```(\w+)?\n/g, '```\n').replace(/```/g, '\n```\n')) };
  
  return (
    <div className={containerClasses}>
      {isUser ? <div className="flex-grow"></div> : <AssistantAvatar />}
      
      {isUser ? (
        // User message bubble (no toolbar needed)
        <div className="group relative flex items-start gap-2">
           <div className={bubbleClasses}>
              <div className="prose prose-p:my-0 prose-pre:bg-light-bg prose-pre:dark:bg-dark-bg prose-pre:p-4 prose-pre:rounded-lg prose-invert dark:prose-invert" dangerouslySetInnerHTML={formattedContent} />
          </div>
        </div>
      ) : (
        // Assistant message with responsive toolbar
        <div className="group relative flex flex-col items-start flex-1">
            <div className={bubbleClasses}>
                <div 
                    className={clsx(
                        "prose prose-p:my-0 prose-pre:bg-light-bg prose-pre:dark:bg-dark-bg prose-pre:p-4 prose-pre:rounded-lg prose-invert dark:prose-invert",
                        { 'streaming-message': isStreaming }
                    )}
                    dangerouslySetInnerHTML={formattedContent} 
                />
            </div>
            {!isStreaming && (
                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
    <div className="flex items-start gap-3 md:gap-4 mb-6 animate-fade-in-up">
        <div className="w-8 h-8 rounded-full bg-light-surface dark:bg-dark-surface flex items-center justify-center shrink-0 p-1">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            </div>
        </div>
        <div className="p-4 rounded-2xl max-w-xl bg-light-surface dark:bg-dark-surface shadow-md flex items-center space-x-2">
            <div className="w-0.5 h-5 bg-light-text-primary dark:bg-dark-text-primary animate-typing-cursor"></div>
        </div>
    </div>
)

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const showInitialLoader = isLoading && (messages.length === 0 || messages[messages.length - 1].role === 'user');

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto pr-4 -mr-4 pb-4">
       <div className="max-w-4xl mx-auto">
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