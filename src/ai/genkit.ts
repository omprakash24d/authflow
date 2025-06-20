// src/ai/genkit.ts
// This file configures and initializes the Genkit AI toolkit for the application.
// It sets up the necessary plugins (e.g., Google AI) and default model.
// The `ai` object exported from this file is used throughout the application
// to define and run AI flows, prompts, and tools.

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai'; // Google AI plugin for Genkit

/**
 * The global Genkit `ai` instance.
 * Configured with:
 * - `plugins`: An array of Genkit plugins. Here, `googleAI` is used.
 *   - `apiKey`: The API key for Google AI services, typically sourced from an environment variable.
 * - `model`: The default AI model to be used by Genkit if not specified otherwise in a flow or prompt.
 *   Here, 'googleai/gemini-2.0-flash' is set as the default.
 */
export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GOOGLE_API_KEY})], // Initialize Google AI plugin
  model: 'googleai/gemini-2.0-flash', // Set default model
});
