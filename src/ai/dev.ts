// src/ai/dev.ts
// This file is used by the Genkit development server (`genkit:dev` script).
// It imports Genkit flows to make them available for local testing and inspection
// via the Genkit Developer UI.
// Environment variables (e.g., for API keys) are loaded using `dotenv`.

import { config } from 'dotenv';
config(); // Load environment variables from .env file

// Import your Genkit flows here to register them with the dev server.
import '@/ai/flows/password-breach-detector.ts';
// import '@/ai/flows/another-flow.ts'; // Example of adding another flow
