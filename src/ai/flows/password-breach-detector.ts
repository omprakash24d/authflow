
'use server';
/**
 * @fileOverview Implements a password breach detection system using the HaveIBeenPwned API via a Genkit flow.
 * This system allows checking if a given password has appeared in known data breaches.
 *
 * Exported Functions:
 * - checkPasswordBreach: An asynchronous function that takes a password and returns whether it's breached and the count.
 *
 * Exported Types:
 * - CheckPasswordBreachInput: The Zod schema type for the input to `checkPasswordBreach`.
 * - CheckPasswordBreachOutput: The Zod schema type for the output from `checkPasswordBreach`.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Zod schema for the input to the password breach check flow.
 * Requires a 'password' string.
 */
const CheckPasswordBreachInputSchema = z.object({
  password: z.string().describe('The password to check for breaches.'),
});
export type CheckPasswordBreachInput = z.infer<typeof CheckPasswordBreachInputSchema>;

/**
 * Zod schema for the output of the password breach check flow.
 * Returns 'isBreached' (boolean) and optionally 'breachCount' (number).
 */
const CheckPasswordBreachOutputSchema = z.object({
  isBreached: z.boolean().describe('Whether the password has been breached.'),
  breachCount: z
    .number()
    .describe('The number of times the password has been breached.')
    .optional(),
});
export type CheckPasswordBreachOutput = z.infer<typeof CheckPasswordBreachOutputSchema>;

/**
 * Publicly exported wrapper function to invoke the password breach check flow.
 * @param input An object containing the password to check, conforming to `CheckPasswordBreachInput`.
 * @returns A Promise resolving to an object indicating if the password is breached and the breach count, conforming to `CheckPasswordBreachOutput`.
 */
export async function checkPasswordBreach(input: CheckPasswordBreachInput): Promise<CheckPasswordBreachOutput> {
  return checkPasswordBreachFlow(input);
}

/**
 * Genkit tool definition for interacting with the HaveIBeenPwned API.
 * This tool takes a password, hashes it (SHA-1, as required by HIBP for k-anonymity),
 * and queries the HIBP API to get the breach count.
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
  // Hash the password using SHA-1 (as required by HIBP Pwned Passwords API for k-anonymity)
  const passwordHash = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(input.password));
  const passwordHashHex = Array.from(new Uint8Array(passwordHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

  // The HIBP API requires sending only the first 5 characters of the SHA-1 hash (prefix)
  const prefix = passwordHashHex.slice(0, 5);
  // The rest of the hash (suffix) is used to find matches in the API's response
  const suffix = passwordHashHex.slice(5);

  // Fetch the range of hashes from HIBP API
  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch breach data from HaveIBeenPwned API: ${response.status} ${response.statusText}`);
  }
  const responseText = await response.text();
  // Response is a list of hash suffixes and their counts, separated by newlines
  const matches = responseText.split('\r\n').map(line => line.split(':'))

  let breachCount = 0;
  // Find the matching suffix in the response
  for (const [hashSuffix, count] of matches) {
    if (hashSuffix === suffix) {
      breachCount = parseInt(count, 10);
      break;
    }
  }
  return breachCount; // Return the count of breaches for the given password
});

/**
 * Genkit prompt definition for the password breach check.
 * This prompt instructs the AI model (LLM) to use the `haveIBeenPwnedTool`
 * to check the provided password and then structure the output according to `CheckPasswordBreachOutputSchema`.
 */
const checkPasswordBreachPrompt = ai.definePrompt({
  name: 'checkPasswordBreachPrompt',
  tools: [haveIBeenPwnedTool], // Makes the tool available to the LLM
  input: { schema: CheckPasswordBreachInputSchema },
  output: { schema: CheckPasswordBreachOutputSchema }, // Specifies the desired output format
  prompt: `You are a security expert assisting users in selecting secure passwords.

  I will provide you with a password. Your task is to use the haveIBeenPwned tool to check if this password has been involved in any data breaches.

  Please follow these steps:
  1. Check the breach count returned by the tool.
  2. If the breach count is greater than 0, set isBreached to true.
  3. If the breach count is 0, set isBreached to false.
  4. Always return the breachCount exactly as provided by the tool's output. 
     - If the breachCount is undefined or null, do not include the breachCount field in your output.

  **Important:** A breached password means it has been exposed in a data leak, which can compromise user security. Always encourage users to choose strong, unique passwords.

  Password: {{{password}}}`, // Handlebars template to insert the password from input
});

/**
 * Genkit flow definition for the password breach check process.
 * This flow takes the password input, invokes the `checkPasswordBreachPrompt` (which uses the tool),
 * and returns the structured output.
 */
const checkPasswordBreachFlow = ai.defineFlow(
  {
    name: 'checkPasswordBreachFlow',
    inputSchema: CheckPasswordBreachInputSchema,
    outputSchema: CheckPasswordBreachOutputSchema,
  },
  async (input: CheckPasswordBreachInput) => {
    // Invoke the prompt with the input
    const {output} = await checkPasswordBreachPrompt(input);
    // The output from the prompt should conform to CheckPasswordBreachOutputSchema
    // The '!' non-null assertion is used here assuming the LLM successfully follows the output schema.
    return output!;
  }
);

