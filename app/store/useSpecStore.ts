import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Constraint {
    id: string;
    category: string;
    content: string;
}

interface SpecState {
    constraints: Constraint[];
    markdown: string;
    addConstraint: (constraint: Omit<Constraint, 'id'>) => void;
    setConstraints: (constraints: Constraint[]) => void;
    clearConstraints: () => void;
    setMarkdown: (markdown: string) => void;
    resetProject: () => void;
}

export const useSpecStore = create<SpecState>()(
    persist(
        (set) => ({
            constraints: [],
            markdown: '# Prism Editor\n\nStart typing your spec here...\n\n```mermaid\ngraph TD;\n  A-->B;\n```',
            addConstraint: (constraint) => set((state) => ({
                constraints: [...state.constraints, { ...constraint, id: crypto.randomUUID() }]
            })),
            setConstraints: (constraints) => set({ constraints }),
            clearConstraints: () => set({ constraints: [] }),
            setMarkdown: (markdown) => set({ markdown }),
            resetProject: () => set({
                constraints: [],
                markdown: '# Prism Editor\n\nStart typing your spec here...\n\n```mermaid\ngraph TD;\n  A-->B;\n```'
            }),
        }),
        {
            name: 'prism-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
