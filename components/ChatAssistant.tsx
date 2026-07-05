import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { useI18n } from '../hooks/useI18n';
import type { ChatMessage, Language } from '../types';
import { XIcon, SendIcon } from './icons/Icons';

interface ChatAssistantProps {
    onClose: () => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const getSystemInstruction = (language: Language) => {
    const langMap = {
        en: 'English',
        hi: 'Hindi',
        mr: 'Marathi'
    };
    return `You are a helpful and friendly agricultural assistant for farmers in India. Your name is "Agri Assistant". Answer questions concisely about crops, soil, weather, and modern farm management. Always respond in ${langMap[language]}.`;
};


const ChatAssistant: React.FC<ChatAssistantProps> = ({ onClose }) => {
    const { t, language } = useI18n();
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const chatSession = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: getSystemInstruction(language),
            },
        });
        setChat(chatSession);
        setMessages([{ role: 'model', text: 'Hello! I am your Agri Assistant. How can I help you today?' }]);
    }, [language]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !chat || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseStream = await chat.sendMessageStream({ message: input });
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);
            
            for await (const chunk of responseStream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = modelResponse;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-end animate-fade-in" onClick={onClose}>
            <div 
                className="w-full max-w-lg h-[80vh] bg-base-200 rounded-t-2xl flex flex-col shadow-2xl m-4 animate-slide-in-up" 
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-base-300">
                    <h3 className="text-xl font-bold text-primary-content">Agri Assistant</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-base-300" aria-label="Close chat">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-content rounded-br-none' : 'bg-base-300 text-primary-content rounded-bl-none'}`}>
                                <p style={{ whiteSpace: "pre-wrap" }}>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={handleSubmit} className="p-4 border-t border-base-300">
                    <div className="flex items-center bg-base-300 rounded-full p-1">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            className="flex-1 bg-transparent px-4 py-2 text-primary-content focus:outline-none"
                            disabled={isLoading}
                        />
                        <button type="submit" className="bg-primary text-primary-content rounded-full p-3 disabled:bg-neutral" disabled={isLoading || !input.trim()}>
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatAssistant;
