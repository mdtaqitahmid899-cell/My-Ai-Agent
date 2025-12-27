import React, { useState, useCallback, useEffect } from 'react';
import type { Message } from '../../types';
import MessageList from './MessageList';
import Composer from './Composer';
import { startChat, Chat } from '../../services/geminiService';

interface ChatWorkspaceProps {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({ messages, setMessages }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);

  const initializeChat = () => {
    // Convert existing messages to history format for Gemini
    // We map 'assistant' to 'model' as per Gemini API requirements
    const history = messages
        .filter(m => !m.content.startsWith("I'm sorry, I couldn't process")) // Filter out error messages
        .map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

    if (messages.length === 0) {
        setMessages([
            {
                id: `assistant-init-${Date.now()}`,
                role: 'assistant',
                content: "Hello! I'm your AI assistant powered by Google Gemini. How can I help you today?",
            },
        ]);
        // Start fresh chat if no history
        setChat(startChat([]));
    } else {
        // Start chat with preserved history
        setChat(startChat(history));
    }
  }

  // Initialize chat whenever the component mounts (which happens on language change due to key prop in App.tsx)
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
  }, [chat, isLoading, setMessages]);
  
  return (
    <div className="h-full w-full flex justify-center items-start lg:items-center lg:py-4">
      <div className="w-full lg:max-w-5xl h-full flex flex-col lg:bg-light-surface/50 lg:dark:bg-dark-surface/50 lg:backdrop-blur-sm lg:rounded-2xl lg:border lg:border-light-border lg:dark:border-dark-border lg:shadow-2xl overflow-hidden relative transition-all duration-300">
        <MessageList messages={messages} isLoading={isLoading} />
        <Composer onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatWorkspace;