'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { PanelLeft, PanelRight } from 'lucide-react';
import { MermaidRenderer } from './MermaidRenderer';

export function HybridEditor() {
    const [markdown, setMarkdown] = useState<string>('# Prism Editor\n\nStart typing your spec here...\n\n```mermaid\ngraph TD;\n  A-->B;\n```');
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

    // Simple regex to extract mermaid blocks
    const mermaidMatch = markdown.match(/```mermaid([\s\S]*?)```/);
    const mermaidCode = mermaidMatch ? mermaidMatch[1] : '';

    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-slate-950 text-slate-100 md:flex-row">
            {/* Left Pane: Markdown Editor */}
            <div className="flex h-1/2 w-full flex-col border-r border-slate-800 md:h-full md:w-1/2">
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
                    <span className="text-sm font-medium text-slate-400">Narrative (Spec)</span>
                    <PanelLeft className="h-4 w-4 text-slate-500" />
                </div>
                <textarea
                    className="flex-1 resize-none bg-slate-950 p-4 font-mono text-sm leading-relaxed text-slate-300 outline-none focus:ring-0"
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    placeholder="Describe your app idea..."
                />
            </div>

            {/* Right Pane: Visual/AI View */}
            <div className="flex h-1/2 w-full flex-col md:h-full md:w-1/2">
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={clsx(
                                "rounded px-2 py-1 text-xs font-medium transition-colors",
                                activeTab === 'preview' ? "bg-indigo-500/10 text-indigo-400" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            Visual
                        </button>
                        <button
                            onClick={() => setActiveTab('code')}
                            className={clsx(
                                "rounded px-2 py-1 text-xs font-medium transition-colors",
                                activeTab === 'code' ? "bg-indigo-500/10 text-indigo-400" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            Constraints (AI)
                        </button>
                    </div>
                    <PanelRight className="h-4 w-4 text-slate-500" />
                </div>

                <div className="flex-1 overflow-auto bg-slate-900/50 p-4">
                    {activeTab === 'preview' ? (
                        <div className="prose prose-invert max-w-none">
                            {mermaidCode ? (
                                <div className="mb-4 rounded-lg bg-slate-950 p-4 border border-slate-800">
                                    <MermaidRenderer code={mermaidCode} />
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic mb-4">No mermaid diagram detected. Add a ```mermaid block.</p>
                            )}
                            <div className="whitespace-pre-wrap font-sans text-sm text-slate-300">
                                {markdown.replace(/```mermaid[\s\S]*?```/g, '')}
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs font-mono text-emerald-400">
                            <p>{'// AI Generated Constraints'}</p>
                            <p>{`{
  "specVersion": "1.0.0",
  "constraints": []
}`}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
