'use client';

import { useChat } from 'ai/react';
import { Send, Bot, Download, Upload, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useRef, useEffect } from 'react';
import { useSpecStore } from '@/store/useSpecStore';
import { motion, AnimatePresence } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MaieuticSidebar() {
    const { addConstraint, setConstraints, setMarkdown, resetProject, constraints, markdown } = useSpecStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const data = {
            constraints,
            markdown,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prism-spec-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);
                if (data.constraints && data.markdown) {
                    setConstraints(data.constraints);
                    setMarkdown(data.markdown);
                } else {
                    alert('Invalid Prism Spec file.');
                }
            } catch (err) {
                console.error('Import failed', err);
                alert('Failed to parse file.');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const { messages, input, handleInputChange, handleSubmit, error, setMessages } = useChat({
        initialMessages: [
            {
                id: 'welcome',
                role: 'assistant',
                content: "Hello! I'm Prism. Describe your idea, and I'll help you turn it into a perfect specification."
            }
        ],
        onFinish: (message) => {
            if (message.role === 'assistant') {
                const regex = /```json:constraints\s*([\s\S]*?)\s*```/;
                const match = message.content.match(regex);
                if (match) {
                    try {
                        const extracted = JSON.parse(match[1]);
                        if (Array.isArray(extracted)) {
                            extracted.forEach(c => {
                                if (typeof c === 'string') {
                                    addConstraint({ category: 'General', content: c });
                                } else if (typeof c === 'object' && c.content) {
                                    addConstraint({
                                        category: c.category || 'General',
                                        content: c.content
                                    });
                                }
                            });
                        }
                    } catch (e) {
                        console.error('Failed to parse constraints:', e);
                    }
                }
            }
        }
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            formRef.current?.requestSubmit();
        }
    };

    const cleanContent = (content: string) => {
        return content.replace(/```json:constraints[\s\S]*?```/g, '').trim();
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to clear the entire project? This cannot be undone.')) {
            resetProject();
            setMessages([]);
        }
    };

    return (
        <div className="flex h-full w-80 flex-col border-r border-white/5 bg-slate-950/30 backdrop-blur-xl">
            {/* Header */}
            <div className="glass flex h-14 items-center justify-between px-4">
                <span className="flex items-center gap-2 text-sm font-semibold text-indigo-100">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 ring-1 ring-inset ring-indigo-500/30">
                        <Bot className="h-5 w-5" />
                    </div>
                    Maieutic Engine
                </span>

                {/* Project Actions */}
                <div className="flex items-center gap-1">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImport}
                        className="hidden"
                        accept=".json"
                    />
                    <button onClick={handleExport} className="p-1.5 text-slate-400 hover:text-indigo-300 transition-colors" title="Export Project">
                        <Download className="h-4 w-4" />
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-slate-400 hover:text-emerald-300 transition-colors" title="Import Project">
                        <Upload className="h-4 w-4" />
                    </button>
                    <button onClick={handleReset} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors" title="Reset Project">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <AnimatePresence initial={false}>
                    {messages.map((m) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className={clsx("flex flex-col gap-2 max-w-[90%]", m.role === 'user' ? "ml-auto items-end" : "items-start")}
                        >
                            <div className={clsx(
                                "rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-lg",
                                m.role === 'user'
                                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
                                    : "glass bg-slate-900/40 text-slate-200 border-slate-700/50"
                            )}>
                                <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-slate-950/50 prose-pre:border prose-pre:border-white/10 text-inherit max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {cleanContent(m.content)}
                                    </ReactMarkdown>
                                </div>
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium px-1">
                                {m.role === 'user' ? 'You' : 'Prism AI'}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {error && (
                    <div className="mx-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-200 backdrop-blur-sm">
                        <span className="mb-1 block font-bold text-red-400 uppercase tracking-wider">Error Encountered</span>
                        {error.message}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                <form ref={formRef} onSubmit={handleSubmit} className="relative group">
                    <div className="absolute inset-0 -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-violet-500/20 opacity-0 transition group-focus-within:opacity-100 blur-lg" />
                    <TextareaAutosize
                        className="glass-strong relative w-full resize-none rounded-2xl py-3.5 pl-5 pr-12 text-sm text-slate-200 placeholder-slate-500 shadow-xl transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                        placeholder="Type your response..."
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        minRows={1}
                        maxRows={5}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="absolute right-2 bottom-2 rounded-xl p-1.5 text-slate-400 transition-all hover:bg-indigo-500 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
