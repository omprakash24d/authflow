
'use server';
/**
 * @fileOverview Implements a password breach detection system using the HaveIBeenPwned API.
 *
 * - checkPasswordBreach - A function that checks if a password has been breached.
 * - CheckPasswordBreachInput - The input type for the checkPasswordBreach function.
 * - CheckPasswordBreachOutput - The return type for the checkPasswordBreach function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckPasswordBreachInputSchema = z.object({
  password: z.string().describe('The password to check for breaches.'),
});
export type CheckPasswordBreachInput = z.infer<typeof CheckPasswordBreachInputSchema>;

const CheckPasswordBreachOutputSchema = z.object({
  isBreached: z.boolean().describe('Whether the password has been breached.'),
  breachCount: z
    .number()
    .describe('The number of times the password has been breached.')
    .optional(),
});
export type CheckPasswordBreachOutput = z.infer<typeof CheckPasswordBreachOutputSchema>;

export async function checkPasswordBreach(input: CheckPasswordBreachInput): Promise<CheckPasswordBreachOutput> {
  return checkPasswordBreachFlow(input);
}

const haveIBeenPwnedTool = ai.defineTool({
  name: 'haveIBeenPwned',
  description: 'Checks if a password has been compromised using the HaveIBeenPwned API. Returns the number of times the password has been found in breaches.',
  inputSchema: z.object({
    password: z.string().describe('The password to check.'),
  }),
  outputSchema: z.number().describe('The number of times the password has been breached.'),
},
async (input) => {
  const passwordHash = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(input.password));
  const passwordHashHex = Array.from(new Uint8Array(passwordHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  const prefix = passwordHashHex.slice(0, 5);
  const suffix = passwordHashHex.slice(5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch breach data from HaveIBeenPwned API: ${response.status} ${response.statusText}`);
  }
  const responseText = await response.text();
  const matches = responseText.split('\r\n').map(line => line.split(':'))

  let breachCount = 0;
  for (const [hashSuffix, count] of matches) {
    if (hashSuffix === suffix) {
      breachCount = parseInt(count, 10);
      break;
    }
  }
  return breachCount;
});

const checkPasswordBreachPrompt = ai.definePrompt({
  name: 'checkPasswordBreachPrompt',
  tools: [haveIBeenPwnedTool],
  input: { schema: CheckPasswordBreachInputSchema },
  output: { schema: CheckPasswordBreachOutputSchema },
  prompt: `You are a security expert assisting users in selecting secure passwords.

  I will provide you with a password. Your task is to use the haveIBeenPwned tool to check if this password has been involved in any data breaches.

  Please follow these steps:
  1. Check the breach count returned by the tool.
  2. If the breach count is greater than 0, set isBreached to true.
  3. If the breach count is 0, set isBreached to false.
  4. Always return the breachCount exactly as provided by the tool's output. 
     - If the breachCount is undefined or null, do not include the breachCount field in your output.

  **Important:** A breached password means it has been exposed in a data leak, which can compromise user security. Always encourage users to choose strong, unique passwords.

  Password: {{{password}}}`,
});


const checkPasswordBreachFlow = ai.defineFlow(
  {
    name: 'checkPasswordBreachFlow',
    inputSchema: CheckPasswordBreachInputSchema,
    outputSchema: CheckPasswordBreachOutputSchema,
  },
  async (input: CheckPasswordBreachInput) => {
    const {output} = await checkPasswordBreachPrompt(input);
    return output!;
  }
);

