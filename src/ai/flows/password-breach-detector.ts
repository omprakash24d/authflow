
'use server';
/**
 * @fileOverview Implements a password breach detection system using the HaveIBeenPwned (HIBP) API.
 * This system checks if a given password has appeared in known data breaches, providing a crucial
 * layer of security during user registration or password changes. The check is performed using
 * k-Anonymity to protect the user's password privacy.
 *
 * Exported Functions:
 * - checkPasswordBreach: An async function that takes a password and returns whether it's breached and the count.
 *
 * Exported Types:
 * - CheckPasswordBreachInput: The Zod schema type for the input to `checkPasswordBreach`.
 * - CheckPasswordBreachOutput: The Zod schema type for the output from `checkPasswordBreach`.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Zod schema for the input to the password breach check flow.
 */
const CheckPasswordBreachInputSchema = z.object({
  password: z.string().describe('The password to check for breaches.'),
});
export type CheckPasswordBreachInput = z.infer<typeof CheckPasswordBreachInputSchema>;

/**
 * Zod schema for the output of the password breach check flow.
 */
const CheckPasswordBreachOutputSchema = z.object({
  isBreached: z.boolean().describe('Whether the password has been breached.'),
  breachCount: z
    .number()
    .describe('The number of times the password has appeared in known breaches.')
    .optional(),
});
export type CheckPasswordBreachOutput = z.infer<typeof CheckPasswordBreachOutputSchema>;

/**
 * Publicly exported wrapper function to invoke the password breach check flow.
 * This is the primary entry point for application code to use the breach detection feature.
 * @param input An object containing the password to check, conforming to `CheckPasswordBreachInput`.
 * @returns A Promise resolving to an object indicating if the password is breached and the breach count.
 */
export async function checkPasswordBreach(input: CheckPasswordBreachInput): Promise<CheckPasswordBreachOutput> {
  return checkPasswordBreachFlow(input);
}

/**
 * Genkit tool definition for interacting with the HaveIBeenPwned (HIBP) API.
 * This tool securely checks if a password has been compromised.
 * 
 * It uses the k-Anonymity model required by the HIBP Pwned Passwords API:
 * 1. The password is hashed using SHA-1.
 * 2. Only the first 5 characters of the hash (the prefix) are sent to the API.
 * 3. The API returns a list of hash suffixes that match the prefix, along with their breach counts.
 * 4. The tool then locally checks if the rest of the password's hash (the suffix) is in the returned list.
 * This ensures the full password hash is never sent over the network.
 * 
 * NOTE (Production Consideration): For high-traffic applications, consider adding rate-limiting
 * to your API endpoint that calls this flow to prevent abuse and manage costs.
 */
const haveIBeenPwnedTool = ai.defineTool({
  name: 'haveIBeenPwned',
  description: 'Checks if a password has been compromised using the HaveIBeenPwned API. Returns the number of times the password has been found in breaches.',
  inputSchema: z.object({
    password: z.string().describe('The password to check.'),
  }),
  outputSchema: z.number().describe('The number of times the password has been breached.'),
},
async (input) => {
  // Hash the password using SHA-1
  const passwordHash = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(input.password));
  const passwordHashHex = Array.from(new Uint8Array(passwordHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

  const prefix = passwordHashHex.slice(0, 5);
  const suffix = passwordHashHex.slice(5);

  console.log(`Checking HIBP for password hash prefix: ${prefix}`);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch breach data from HaveIBeenPwned API: ${response.status} ${response.statusText}`);
  }
  const responseText = await response.text();
  const matches = responseText.split('\r\n').map(line => line.split(':'));

  for (const [hashSuffix, count] of matches) {
    if (hashSuffix === suffix) {
      const breachCount = parseInt(count, 10);
      console.log(`Password breach found. Count: ${breachCount}`);
      return breachCount;
    }
  }

  console.log("No password breach found for the given hash.");
  return 0; // Return 0 if no match is found
});

/**
 * Genkit prompt definition for the password breach check.
 * This prompt instructs the AI model (LLM) to use the `haveIBeenPwnedTool`
 * and then structure the output according to `CheckPasswordBreachOutputSchema`.
 */
const checkPasswordBreachPrompt = ai.definePrompt({
  name: 'checkPasswordBreachPrompt',
  tools: [haveIBeenPwnedTool], // Makes the HIBP tool available to the LLM.
  input: { schema: CheckPasswordBreachInputSchema },
  output: { schema: CheckPasswordBreachOutputSchema },
  prompt: `You are a security expert. Your task is to determine if a password is breached using the haveIBeenPwned tool.
  
  Based on the tool's output:
  - If the breach count is greater than 0, set 'isBreached' to true.
  - If the breach count is 0, set 'isBreached' to false.
  - Always return the 'breachCount' field with the exact number provided by the tool.

  Password to check: {{{password}}}`,
});

/**
 * Genkit flow that orchestrates the password breach check process.
 * It takes the user's password, invokes the prompt that uses the HIBP tool,
 * and returns the final structured output.
 */
const checkPasswordBreachFlow = ai.defineFlow(
  {
    name: 'checkPasswordBreachFlow',
    inputSchema: CheckPasswordBreachInputSchema,
    outputSchema: CheckPasswordBreachOutputSchema,
  },
  async (input: CheckPasswordBreachInput) => {
    const {output} = await checkPasswordBreachPrompt(input);
    // The '!' non-null assertion is safe here as the prompt is configured with a required output schema,
    // and the LLM is instructed to always produce a valid output.
    return output!;
  }
);
