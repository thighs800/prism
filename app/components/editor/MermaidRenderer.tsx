'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
});

interface MermaidRendererProps {
    code: string;
}

export function MermaidRenderer({ code }: MermaidRendererProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const render = async () => {
            if (!code.trim()) {
                setSvg('');
                setError(null);
                return;
            }

            try {
                const id = `mermaid-${Date.now()}`;
                // Validate syntax first (basic check, parse is better but render handles it)
                const { svg } = await mermaid.render(id, code);

                if (mounted) {
                    setSvg(svg);
                    setError(null);
                }
            } catch (e) {
                if (mounted) {
                    console.error('Mermaid Render Error:', e);
                    // Catch syntax errors and display them
                    setError((e as Error).message || 'Invalid Mermaid Syntax');
                }
            }
        };

        render();

        return () => {
            mounted = false;
        };
    }, [code]);

    if (error) {
        return (
            <div className="rounded border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400">
                <p className="font-semibold mb-1">Rendering Error</p>
                <pre className="whitespace-pre-wrap">{error}</pre>
            </div>
        );
    }

    if (!svg) return null;

    return (
        <div
            ref={ref}
            className="mermaid-diagram overflow-auto py-4"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
