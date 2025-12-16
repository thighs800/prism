import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import fs from 'fs';
import path from 'path';

// Manual .env.local parsing
const loadEnv = () => {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const lines = envFile.split('\n');
        for (const line of lines) {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        }
    } catch (e) {
        console.error('Could not read .env.local. Make sure you are running this from the app root.');
    }
};

loadEnv();

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

console.log('--- Debug Info ---');
console.log('API Key Found:', !!apiKey);
if (apiKey) {
    console.log('API Key Length:', apiKey.length);
    console.log('API Key First 4 chars:', apiKey.substring(0, 4));
}
console.log('------------------');

if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    console.error('Error: Invalid API Key found in .env.local');
    console.error('Please open .env.local and replace "YOUR_API_KEY_HERE" with your actual Gemini API Key.');
    process.exit(1);
}

const google = createGoogleGenerativeAI({
    apiKey,
});

async function listAvailableModels(key) {
    try {
        console.log('Fetching available models from Google API...');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.error) {
            console.error('API Error Listing Models:', data.error.message);
            return [];
        }

        if (!data.models) {
            console.log('No models returned from API.');
            return [];
        }

        console.log('\n--- Available Models for your Key ---');
        const usableModels = [];
        data.models.forEach(m => {
            const isGenerateContentSupported = m.supportedGenerationMethods?.includes('generateContent');
            if (isGenerateContentSupported) {
                const id = m.name.replace('models/', '');
                console.log(`- ${id} (Supported)`);
                usableModels.push(id);
            } else {
                console.log(`- ${m.name} (Not supported for generateContent)`);
            }
        });
        console.log('-------------------------------------\n');
        return usableModels;
    } catch (e) {
        console.error('Failed to fetch models:', e.message);
        return [];
    }
}

async function main() {
    // List models first
    const availableModels = await listAvailableModels(apiKey);

    if (availableModels.length === 0) {
        console.error('No models found. Please check your API Key and Google Cloud Project settings.');
        return;
    }

    // Try the first available model that looks like 'gemini'
    const bestModel = availableModels.find(m => m.includes('gemini-1.5-flash')) || availableModels.find(m => m.includes('gemini'));

    if (bestModel) {
        console.log(`Attempting to use discovered model: ${bestModel}...`);
        try {
            const { text } = await generateText({
                model: google(bestModel),
                prompt: 'Say "Hello" if you work.',
            });
            console.log(`✅ SUCCESS: ${bestModel} worked!`);
            console.log(`Please tell the developer to use: '${bestModel}'`);
        } catch (e) {
            console.error(`Failed to use ${bestModel}:`, e.message);
        }
    } else {
        console.log('Could not find a suitable Gemini model in the list.');
    }
}

main();
