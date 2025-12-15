import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = await streamText({
        model: google('gemini-1.5-pro-latest'),
        system: `You are Prism, a "Maieutic Engine" designed to help users create perfect software specifications.
    
    Your goal is to practice "Spec-Driven Development".
    1.  **Ask Clarifying Questions**: Do not just nod along. If the user says "I want a login", ask "Which provider? Google? Email? What happens on failure?".
    2.  **Be Socratic**: Guide the user to find the answers themselves by asking the right questions.
    3.  **Focus on Constraints**: Try to extract strict rules (e.g., "Password must be 8 chars").
    4.  **Suggest Mermaid Flows**: If the user describes a process, suggest a Mermaid diagram syntax they can copy.
    
    Keep responses concise and helpful.`,
        messages,
    });

    return result.toDataStreamResponse();
}
