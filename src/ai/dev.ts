// src/ai/dev.ts
/**
 * @fileOverview Development server entry point for Genkit.
 *
 * This file is used by the Genkit development server (`npm run genkit:dev`).
 * Its primary purpose is to import all Genkit flows that you want to be available
 * for local testing and inspection via the Genkit Developer UI (usually at http://localhost:4000).
 *
 * It also handles loading environment variables from your `.env` or `.env.local` file
 * using `dotenv`, which is essential for providing API keys and other secrets to Genkit during development.
 */

import { config } from 'dotenv';
config(); // Load environment variables from .env file

// --- Register Your Genkit Flows Here ---
// To make a flow available in the Genkit Developer UI, simply import its file.
// The import statement ensures the flow's code is executed, which in turn calls `ai.defineFlow()`
// and registers it with the Genkit framework.

import '@/ai/flows/password-breach-detector.ts';

// Example of adding another flow:
// import '@/ai/flows/another-flow.ts';
