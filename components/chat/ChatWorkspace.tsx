import React, { useState, useCallback, useEffect } from 'react';
import type { Message } from '../../types';
import MessageList from './MessageList';
import Composer from './Composer';
import { startChat } from '../../services/geminiService';
import type { Chat } from '@google/genai';
import { PlusIcon } from '../../constants';

const ChatWorkspace: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);

  const initializeChat = () => {
     setMessages([
      {
        id: `assistant-init-${Date.now()}`,
        role: 'assistant',
        content: "Hello! I'm your AI assistant. How can I help you today?",
      },
    ]);
    setChat(startChat());
  }

  // Send an initial message and initialize the chat session
  useEffect(() => {
    initializeChat();
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading || !chat) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const stream = await chat.sendMessageStream({ message: content });
      
      let firstChunk = true;
      const assistantMessageId = `assistant-${Date.now()}`;
      let fullResponse = '';

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullResponse += chunkText;
        if (firstChunk) {
          // Create the new message object on the first chunk
          setMessages((prev) => [...prev, { id: assistantMessageId, role: 'assistant', content: fullResponse }]);
          firstChunk = false;
        } else {
          // Update the content of the existing message object
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: fullResponse }
                : msg
            )
          );
        }
      }
    } catch (error) {
      console.error("Error during chat stream:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I couldn't process your request. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [chat, isLoading]);
  
  const handleNewChat = () => {
    initializeChat();
  }

  return (
    <div className="flex flex-col h-full w-full mx-auto relative">
      <MessageList messages={messages} isLoading={isLoading} />
      <Composer onSendMessage={handleSendMessage} isLoading={isLoading} />
      {/* Floating Action Button for Mobile */}
      <button 
        onClick={handleNewChat}
        className="lg:hidden absolute bottom-24 right-4 bg-gradient-to-br from-accent-start to-accent-end text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform"
        aria-label="New Chat"
      >
        <PlusIcon className="h-6 w-6" />
      </button>
    </div>
  );
};

export default ChatWorkspace;