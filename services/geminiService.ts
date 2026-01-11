
import { GoogleGenAI, Type } from "@google/genai";
import { AIPatternResponse } from "../types";

export const generatePatternGuidance = async (
  imageB64: string,
  measurements: { bust: string; waist: string; hip: string; shoulder: string; length: string },
  type: string
): Promise<AIPatternResponse> => {
  // Use process.env.API_KEY directly as per guidelines
  // Strictly following initialization format: new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `
    Act as a professional pattern maker. Analyze this garment image and provide educational pattern drafting guidance.
    Garment Type: ${type}
    Measurements (inches):
    - Bust: ${measurements.bust}
    - Waist: ${measurements.waist}
    - Hip: ${measurements.hip}
    - Shoulder: ${measurements.shoulder}
    - Full Length: ${measurements.length}

    Provide detailed pattern pieces with dimensions calculated based on the measurements provided.
    Include step-by-step cutting and sewing instructions.
    Format your response as a JSON object.
  `;

  // Align contents format with guidelines: { parts: [...] }
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: imageB64, mimeType: 'image/jpeg' } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          patternPieces: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                dimensions: { type: Type.STRING }
              },
              required: ["name", "description", "dimensions"]
            }
          },
          instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          fabricSuggestions: { type: Type.STRING },
          estimatedYardage: { type: Type.STRING }
        },
        required: ["patternPieces", "instructions", "fabricSuggestions", "estimatedYardage"]
      }
    }
  });

  // Extracting text output directly from property
  return JSON.parse(response.text!) as AIPatternResponse;
};
