
'use server';
/**
 * @fileOverview AI color palette generation flow.
 *
 * - generatePaletteWithAi - A function that handles AI palette generation.
 * - GeneratePaletteInput - The input type for the generatePaletteWithAi function.
 * - GeneratePaletteOutput - The return type for the generatePaletteWithAi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePaletteInputSchema = z.object({
  generationMode: z.enum(['image', 'color', 'keywords', 'general'])
    .describe("The mode of generation: 'image', 'color' (seed hex), 'keywords', or 'general' for a random beautiful palette."),
  imageDataUri: z.optional(z.string().describe(
    "An image as a data URI for 'image' mode. Format: 'data:<mimetype>;base64,<encoded_data>'."
  )),
  baseColorHex: z.optional(z.string().regex(/^#[0-9a-fA-F]{6}$/i, "Must be a valid 6-digit hex color code, e.g., #RRGGBB")
    .describe("A base HEX color for 'color' mode.")),
  keywords: z.optional(z.string().min(3, "Keywords must be at least 3 characters long.")
    .describe("Descriptive keywords for 'keywords' mode, e.g., 'tropical beach sunset'.")),
});
export type GeneratePaletteInput = z.infer<typeof GeneratePaletteInputSchema>;

const GeneratePaletteOutputSchema = z.object({
  colors: z.array(
      z.string().regex(/^#[0-9a-fA-F]{6}$/i, "Must be a valid 6-digit hex color code")
        .describe("A valid 6-digit hex color code, e.g., #RRGGBB")
    )
    .length(5, "Palette must contain exactly 5 colors")
    .describe("An array of exactly 5 hex color codes."),
});
export type GeneratePaletteOutput = z.infer<typeof GeneratePaletteOutputSchema>;


const palettePrompt = ai.definePrompt({
  name: 'generatePalettePrompt',
  input: { schema: GeneratePaletteInputSchema },
  output: { schema: GeneratePaletteOutputSchema },
  prompt: `You are an expert color palette designer. Your task is to generate a harmonious 5-color palette based on the user's input.
The palette must consist of exactly 5 HEX color codes.

{{#if imageDataUri}}
Generate a palette inspired by this image: {{media url=imageDataUri}}
{{else if baseColorHex}}
Generate a palette that harmonizes well with the color {{{baseColorHex}}}. Consider including this color or a close variant as one of the five colors in the palette.
{{else if keywords}}
Generate a palette inspired by the following keywords: "{{{keywords}}}".
{{else}}
Generate a beautiful and harmonious 5-color palette suitable for a modern digital interface.
{{/if}}

Output your response ONLY as a JSON object with a single key "colors" which is an an array of 5 strings, where each string is a valid HEX color code (e.g., "#RRGGBB").
Example of valid output format:
{
  "colors": ["#FF5733", "#33FF57", "#3357FF", "#FFFF33", "#FF33FF"]
}
Do not include any other text, explanations, or markdown formatting in your response. Just the JSON object.
`,
});

const generatePaletteFlowInternal = ai.defineFlow(
  {
    name: 'generatePaletteFlowInternal',
    inputSchema: GeneratePaletteInputSchema,
    outputSchema: GeneratePaletteOutputSchema,
  },
  async (input: GeneratePaletteInput) => {
    const { output, usage } = await palettePrompt(input);
    if (!output?.colors || output.colors.length !== 5) {
      console.error('AI response error. Output:', output, 'Usage:', usage);
      throw new Error('AI failed to generate a valid 5-color palette. Please try again with different inputs.');
    }
    // Validate each color format again, as LLMs can sometimes miss instructions
    output.colors.forEach(color => {
        if (!/^#[0-9a-fA-F]{6}$/i.test(color)) {
            console.error('Invalid color format from AI:', color, 'Full output:', output);
            throw new Error(`AI generated an invalid color format: ${color}. Please try again.`);
        }
    });
    return output;
  }
);

export async function generatePaletteWithAi(input: GeneratePaletteInput): Promise<GeneratePaletteOutput> {
  if (input.generationMode === 'image' && !input.imageDataUri) {
    throw new Error('Image data URI is required for image generation mode.');
  }
  if (input.generationMode === 'color' && !input.baseColorHex) {
    throw new Error('Base color HEX is required for color generation mode.');
  }
  if (input.generationMode === 'keywords' && !input.keywords) {
    throw new Error('Keywords are required for keywords generation mode.');
  }
  return generatePaletteFlowInternal(input);
}
