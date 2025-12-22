'use client';

import { useState, useEffect } from 'react'; // Added useEffect
import { clsx } from 'clsx';
import { PanelLeft, PanelRight, CheckCircle2, Sparkles, Loader2 } from 'lucide-react'; // Added Sparkles, Loader2
import { MermaidRenderer } from './MermaidRenderer';
import { useSpecStore } from '@/store/useSpecStore';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function HybridEditor() {
    const { markdown, setMarkdown, constraints } = useSpecStore();
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
    const [isGenerating, setIsGenerating] = useState(false); // Added isGenerating state

    // Added handleGenerate function
    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    constraints: constraints,
                    prompt: "Draft a comprehensive specification."
                }),
            });

            if (!response.ok) throw new Error(response.statusText);

            // Simple streaming reader
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let result = '';

            if (reader) {
                setMarkdown(''); // Clear existing
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    result += chunk;
                    setMarkdown(result);
                }
            }
        } catch (error) {
            console.error('Generation failed:', error);
            alert('Failed to generate spec.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-slate-950/30 backdrop-blur-xl text-slate-100 md:flex-row">
            {/* Left Pane: Markdown Editor */}
            <div className="flex h-1/2 w-full flex-col border-r border-white/5 md:h-full md:w-1/2">
                <div className="glass flex h-14 items-center justify-between border-b border-white/5 px-4 backdrop-blur-md">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                        <PanelLeft className="h-4 w-4 text-indigo-400" />
                        Narrative Spec
                    </span>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className={clsx(
                            "group flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                            isGenerating
                                ? "bg-indigo-500/20 text-indigo-300 cursor-not-allowed"
                                : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
                        )}
                    >
                        {isGenerating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                        )}
                        {isGenerating ? 'Drafting...' : 'Generate Spec'}
                    </button>
                </div>
                <textarea
                    className="flex-1 resize-none bg-slate-950/50 p-6 font-mono text-sm leading-relaxed text-slate-300 outline-none focus:ring-0 placeholder-slate-600 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    placeholder="# Describe your app feature...\n\n- User logs in...\n- System validates..."
                    spellCheck={false}
                />
            </div>

            {/* Right Pane: Visual/AI View */}
            <div className="flex h-1/2 w-full flex-col bg-slate-900/30 md:h-full md:w-1/2">
                <div className="glass flex h-14 items-center justify-between border-b border-white/5 px-4 backdrop-blur-md">
                    <div className="flex gap-1 p-1 bg-slate-900/50 rounded-lg border border-white/5">
                        {['preview', 'constraints'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={clsx(
                                    "relative rounded-md px-3 py-1 text-xs font-semibold transition-colors duration-200 capitalize z-10",
                                    activeTab === tab
                                        ? "text-indigo-300"
                                        : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-indigo-500/20 rounded-md shadow-sm ring-1 ring-inset ring-indigo-500/20 -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                {tab === 'preview' ? 'Visual' : 'Constraints'}
                            </button>
                        ))}
                    </div>
                    <PanelRight className="h-4 w-4 text-slate-600" />
                </div>

                <div className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    <AnimatePresence mode="wait">
                        {activeTab === 'preview' ? (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className="markdown-preview prose prose-invert max-w-none prose-pre:bg-slate-900/50 prose-headings:text-indigo-100 prose-a:text-indigo-400"
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code({ node, inline, className, children, ...props }: any) {
                                            const match = /language-(\w+)/.exec(className || '')
                                            if (!inline && match && match[1] === 'mermaid') {
                                                return (
                                                    <div className="mermaid flex justify-center p-4 bg-transparent">
                                                        <MermaidRenderer code={String(children).replace(/\n$/, '')} />
                                                    </div>
                                                )
                                            }
                                            return !inline && match ? (
                                                <div className="relative rounded-lg border border-white/5 bg-slate-950/50 p-4 shadow-xl">
                                                    <div className="absolute right-4 top-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">{match[1]}</div>
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                </div>
                                            ) : (
                                                <code className="rounded bg-slate-800/50 px-1.5 py-0.5 text-indigo-200" {...props}>
                                                    {children}
                                                </code>
                                            )
                                        }
                                    }}
                                >
                                    {markdown}
                                </ReactMarkdown>
                                {!markdown.trim() && (
                                    <div className="flex h-full flex-col items-center justify-center space-y-4 text-slate-600 opacity-50 mt-10">
                                        <div className="rounded-full bg-slate-800 p-4">
                                            <PanelRight className="h-8 w-8" />
                                        </div>
                                        <p className="text-sm font-medium">Start typing to generate a preview...</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="constraints"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="glass-strong rounded-xl border border-white/5 p-6 min-h-full"
                            >
                                <div className="mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">AI Extracted Rules</span>
                                </div>

                                {constraints.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                                        <p className="text-sm italic">No constraints detected yet.</p>
                                        <p className="text-xs opacity-50 mt-2">Chat with Prism to extract requirements.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {Object.entries(
                                            constraints.reduce((acc, c) => {
                                                const cat = c.category || 'General';
                                                if (!acc[cat]) acc[cat] = [];
                                                acc[cat].push(c);
                                                return acc;
                                            }, {} as Record<string, typeof constraints>)
                                        ).map(([category, items]) => (
                                            <div key={category}>
                                                <h4 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">{category}</h4>
                                                <div className="space-y-3">
                                                    {items.map((constraint, i) => (
                                                        <motion.div
                                                            key={constraint.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.1, duration: 0.3 }}
                                                            className="flex gap-3 rounded-lg bg-slate-900/50 p-3 border border-white/5 transition-all hover:border-indigo-500/30 hover:bg-slate-900/80"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                                                            <span className="text-sm text-slate-300 leading-relaxed font-medium">{constraint.content}</span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
