// src/ai/genkit.ts
// This file configures and initializes the Genkit AI toolkit for the application.
// It sets up the necessary plugins (e.g., Google AI) and default model.
// The `ai` object exported from this file is used throughout the application
// to define and run AI flows, prompts, and tools.

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai'; // Google AI plugin for Genkit

// --- Environment Variable Check ---
// It's crucial that the Google AI API key is available for Genkit to function.
// This check provides a clear error message to developers during setup if the key is missing.
if (!process.env.GOOGLE_API_KEY) {
  console.error(
    'CRITICAL: GOOGLE_API_KEY environment variable is not set. Genkit AI features will not work. Please add it to your .env.local file.'
  );
}

/**
 * The global Genkit `ai` instance.
 * Configured with:
 * - `plugins`: An array of Genkit plugins. Here, `googleAI` is used.
 *   - `apiKey`: The API key for Google AI services, sourced from an environment variable.
 *     If the key is missing, Genkit operations that require it will fail.
 * - `model`: The default AI model to be used by Genkit if not specified otherwise in a flow or prompt.
 *   Here, 'googleai/gemini-2.0-flash' is set as the default, a fast and capable model.
 */
export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GOOGLE_API_KEY})], // Initialize Google AI plugin
  model: 'googleai/gemini-2.0-flash', // Set default model
});

console.log("Genkit AI toolkit initialized.");
