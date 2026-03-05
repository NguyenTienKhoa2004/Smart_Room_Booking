import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { askRag } from '../services/api';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export default function Chatbox() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! I am the AI Assistant for the Smart Room Booking system. How can I help you today?',
            sender: 'ai',
            timestamp: new Date(),
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userText = inputValue.trim();
        // Add user message
        const newUserMessage: Message = {
            id: Date.now().toString(),
            text: userText,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const result = await askRag(userText);

            let replyText = "Xin lỗi, đã xảy ra lỗi không thể kết nối hệ thống AI.";
            if (result.success && result.data) {
                replyText = result.data.answer;
                // We could also append citations here if needed
                if (result.data.citations && result.data.citations.length > 0) {
                    replyText += "\n\n[Có trích dẫn nguồn tài liệu tham khảo]";
                }
            }

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: replyText,
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiResponse]);
        } catch (error: any) {
            let errorMsg = "Hệ thống AI không phản hồi. Vui lòng thử lại.";
            if (error?.response?.status === 401) {
                errorMsg = "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
            } else if (error?.response?.status === 500) {
                errorMsg = "Hệ thống AI đang gặp sự cố kết nối. Vui lòng thử lại sau.";
            }

            setMessages((prev) => [...prev, {
                id: Date.now().toString(),
                text: errorMsg,
                sender: 'ai',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 p-4 bg-linear-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center animate-bounce group"
                    aria-label="Open Chat"
                >
                    <MessageCircle size={28} />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)]  bg-linear-to-r from-slate-900 to-slate-800 rounded-[14px] shadow-2xl z-50 transform transition-all duration-300 scale-100 opacity-100 origin-bottom-right flex flex-col">
                    <div className="flex-1 dark:bg-zinc-900 rounded-[12px] flex flex-col overflow-hidden">

                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-700 bg-linear-to-r from-slate-900 to-slate-800 text-white p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Bot size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg leading-tight">AI Assistant</h3>
                                    <p className="text-slate-300 text-xs flex items-center mt-1">
                                        <span className="w-2 h-2 rounded-full bg-green-400 mr-1.5 animate-pulse"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-full transition-colors focus:outline-none"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950 scroll-smooth">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>

                                        {/* Avatar */}
                                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-zinc-200 dark:bg-zinc-800' : 'bg-slate-100 dark:bg-slate-800'
                                            }`}>
                                            {msg.sender === 'user' ? (
                                                <User size={16} className="text-zinc-600 dark:text-zinc-400" />
                                            ) : (
                                                <Bot size={16} className="text-slate-700 dark:text-slate-300" />
                                            )}
                                        </div>

                                        {/* Message Bubble */}
                                        <div className={`p-3 rounded-2xl shadow-sm ${msg.sender === 'user'
                                            ? 'bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-br-none'
                                            : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-bl-none border border-zinc-100 dark:border-zinc-700'
                                            }`}>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                            <p className={`text-[10px] mt-1.5 text-right ${msg.sender === 'user' ? 'text-slate-300' : 'text-zinc-400'
                                                }`}>
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                            <form onSubmit={handleSend} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask about room booking..."
                                    className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 transition-shadow dark:placeholder-zinc-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="p-2.5 bg-linear-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shrink-0"
                                >
                                    {isLoading ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Send size={18} className={`transform transition-transform ${inputValue.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''}`} />
                                    )}
                                </button>
                            </form>
                            <div className="text-center mt-2">
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">✨ Powered by RAG AI</span>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}
