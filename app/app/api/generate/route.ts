import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
    const { constraints, prompt } = await req.json();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        return new Response('Missing API Key', { status: 500 });
    }

    const google = createGoogleGenerativeAI({
        apiKey,
    });

    try {
        const result = await streamText({
            model: google('gemini-2.5-flash'),
            system: `You are a Senior Software Architect.
            
            Your goal is to write a detailed "Narrative Specification" (Markdown) based on the provided Constraints and User Prompt.
            
            **Rules**:
            -   Strictly adhere to the provided "Constraints".
            -   Use professional Markdown formatting (headers, lists).
            -   Include Mermaid diagrams (graph TD, sequenceDiagram) where appropriate to explain flows.
            -   Structure the doc:
                1.  **Overview**: High-level summary.
                2.  **Constraints Compliance**: Briefly list key rules being followed.
                3.  **User Flow**: Step-by-step description with Mermaid.
                4.  **Technical Details**: Data models, API rough sketch.
            
            **Constraints**:
            ${JSON.stringify(constraints, null, 2)}`,
            prompt: prompt || "Draft a complete specification for this application.",
        });

        return result.toDataStreamResponse();
    } catch (error) {
        console.error('Spec Gen Error:', error);
        return new Response('Error generating spec', { status: 500 });
    }
}
