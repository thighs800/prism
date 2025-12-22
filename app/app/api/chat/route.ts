import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        console.error('Missing Google API Key. Set GOOGLE_GENERATIVE_AI_API_KEY, GEMINI_API_KEY, or GOOGLE_API_KEY.');
        return new Response('Missing API Key', { status: 500 });
    }

    const google = createGoogleGenerativeAI({
        apiKey,
    });

    try {
        console.log('Starting Gemini Stream...');
        const result = await streamText({
            model: google('gemini-2.5-flash'),
            system: `You are Prism, a "Maieutic Engine" designed to help users create perfect software specifications.
        
        Your goal is to practice "Spec-Driven Development".
        1.  **Ask Clarifying Questions**: Do not just nod along. If the user says "I want a login", ask "Which provider? Google? Email? What happens on failure?".
        2.  **Be Socratic**: Guide the user to find the answers themselves by asking the right questions.
        3.  **Focus on Constraints**: Try to extract strict rules (e.g., "Password must be 8 chars", "Timeout is 30s").
        4.  **Suggest Mermaid Flows**: If the user describes a process, suggest a Mermaid diagram syntax they can copy.
        
        **CRITICAL INSTRUCTION**:
        If you identify SPECIFIC CONSTRAINTS or BUSINESS RULES in the user's input or your own reasoning, you MUST output them in a machine-readable JSON block at the very end of your response.
        
        Format:
        \`\`\`json:constraints
        [
          { "category": "Auth", "content": "Password must be 8 chars" },
          { "category": "UI", "content": "Button color is blue" }
        ]
        \`\`\`
        
        Common Categories: Authentication, Database, UI/UX, Performance, Business Rule.
        
        Only output this block if there are new or updated constraints.`,
            messages,
            onFinish: (event) => {
                console.log('Gemini Stream Finished:', event.finishReason, event.text.substring(0, 50));
            },
        });

        console.log('Stream created successfully.');
        return result.toDataStreamResponse();
    } catch (error) {
        console.error('Gemini API Error:', error);
        return new Response('Error calling Gemini API', { status: 500 });
    }
}
