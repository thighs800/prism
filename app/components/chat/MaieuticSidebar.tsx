'use client';

import { useChat } from 'ai/react';
import { Send, Bot } from 'lucide-react';
import { clsx } from 'clsx';
import { useRef, useEffect } from 'react';

export function MaieuticSidebar() {
    const { messages, input, handleInputChange, handleSubmit, error } = useChat({
        initialMessages: [
            {
                id: 'welcome',
                role: 'assistant',
                content: "Hello! I'm Prism. Describe your idea, and I'll help you turn it into a perfect specification."
            }
        ]
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex h-full w-80 flex-col border-r border-slate-800 bg-slate-950">
            <div className="flex h-14 items-center border-b border-slate-800 px-4">
                <span className="font-semibold text-indigo-400 flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    Maieutic Engine
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m) => (
                    <div key={m.id} className={clsx("flex flex-col gap-1", m.role === 'user' ? "items-end" : "items-start")}>
                        <div className={clsx(
                            "max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap",
                            m.role === 'user' ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-300"
                        )}>
                            {m.content}
                        </div>
                        <span className="text-[10px] text-slate-600 capitalize">{m.role}</span>
                    </div>
                ))}
                {error && (
                    <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-400 border border-red-500/20">
                        <span className="font-bold block mb-1">Error</span>
                        {error.message}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-800">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        className="w-full rounded-full bg-slate-900 py-3 pl-4 pr-12 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        placeholder="Type your reply..."
                        value={input}
                        onChange={handleInputChange}
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-2 rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-indigo-400 transition-all"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
