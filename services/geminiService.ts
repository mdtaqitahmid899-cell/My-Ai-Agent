import { GoogleGenAI, Modality, GenerateContentResponse, Type, Chat } from "@google/genai";
import type {
    AspectRatio,
    ImageStyle,
    WritingTone,
    WritingFormat,
    WritingLength,
    CodeLanguage,
    ResearchResult,
    GroundingSource,
    StudyPlan,
} from '../types';

// The API key is retrieved from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const startChat = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
    });
};

export const generateImageWithGemini = async (
    prompt: string,
    style: ImageStyle,
    aspectRatio: AspectRatio,
    numberOfImages: number,
    quality: 'standard' | 'high'
): Promise<string[]> => {
    try {
        if (quality === 'high') {
            const fullPrompt = `${prompt}, ${style} style`;
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: fullPrompt,
                config: {
                    numberOfImages: numberOfImages,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: aspectRatio,
                },
            });

            if (response.generatedImages && response.generatedImages.length > 0) {
                return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
            }
            return [];
        } else { // standard quality
            const fullPrompt = `${prompt}, ${style} style, aspect ratio ${aspectRatio}`;
            
            const generationPromises: Promise<GenerateContentResponse>[] = [];
            for (let i = 0; i < numberOfImages; i++) {
                generationPromises.push(ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: {
                        parts: [{ text: fullPrompt }],
                    },
                    config: {
                        responseModalities: [Modality.IMAGE],
                    },
                }));
            }

            const responses = await Promise.all(generationPromises);

            const imageUrls = responses.map(response => {
                const generatedPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                if (generatedPart?.inlineData) {
                    const base64ImageBytes: string = generatedPart.inlineData.data;
                    return `data:${generatedPart.inlineData.mimeType};base64,${base64ImageBytes}`;
                }
                return null;
            }).filter((url): url is string => url !== null);

            return imageUrls;
        }
    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        throw error;
    }
};


export const editImageWithGemini = async (
    prompt: string,
    base64ImageData: string,
    mimeType: string,
    numberOfImages: number
): Promise<string[]> => {
    try {
        const imagePart = {
            inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
            },
        };
        const textPart = { text: prompt };

        const generationPromises: Promise<GenerateContentResponse>[] = [];

        for (let i = 0; i < numberOfImages; i++) {
             generationPromises.push(ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [imagePart, textPart],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            }));
        }

        const responses = await Promise.all(generationPromises);

        const imageUrls = responses.map(response => {
            const generatedPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (generatedPart?.inlineData) {
                const base64ImageBytes: string = generatedPart.inlineData.data;
                return `data:${generatedPart.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
            return null;
        }).filter((url): url is string => url !== null);

        return imageUrls;

    } catch (error) {
        console.error("Error editing image with Gemini:", error);
        throw error;
    }
};

export const generateLongFormText = async function* (
  prompt: string,
  tone: WritingTone,
  format: WritingFormat,
  length: WritingLength
): AsyncGenerator<string, void, unknown> {
  try {
    const fullPrompt = `You are an expert writer. Task: Write a piece of content based on the following prompt. Prompt: "${prompt}" Tone: ${tone}. Format: ${format}. Length: ${length}.`;
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-pro',
      contents: fullPrompt,
    });
    for await (const chunk of response) {
        yield chunk.text;
    }
  } catch (error) {
    console.error("Error generating long-form text:", error);
    throw error;
  }
};

export const generateCode = async function* (
  prompt: string,
  language: CodeLanguage,
  existingCode?: string
): AsyncGenerator<string, void, unknown> {
  try {
    let fullPrompt: string;

    if (existingCode) {
      // Prompt for editing existing code
      fullPrompt = `You are an expert programmer specializing in ${language}.
      Task: Edit the following code based on the user's request.
      Request: "${prompt}".

      Existing Code to Edit:
      \`\`\`${language.toLowerCase().split('/')[0]}
      ${existingCode}
      \`\`\`

      IMPORTANT: Provide only the complete, updated code block as your response. Do not include any explanations, apologies, or introductory text before or after the code block.`;

    } else if (language === 'HTML/CSS') {
      // Specific prompt for generating a full, self-contained HTML file
      fullPrompt = `You are an expert web developer specializing in HTML, CSS, and JavaScript. 
      Task: Generate a single, self-contained HTML file for the following request.
      Request: "${prompt}".
      Requirements:
      1.  Include all CSS within a single <style> tag in the <head>.
      2.  Include all JavaScript within a single <script> tag at the end of the <body>.
      3.  Do not use any external libraries or assets unless specifically asked.
      4.  The output must be a single markdown code block containing the complete HTML document. Do not add any explanation before or after the code block.
      5.  Use a modern, clean design. Use placeholder content if necessary.`;
    } else {
      // Generic prompt for other languages
      fullPrompt = `You are an expert programmer specializing in ${language}. Task: Generate a code snippet for the following request. Request: "${prompt}". Language: ${language}. Provide only the code, wrapped in a single markdown code block for ${language.toLowerCase().split('/')[0]}. Do not add any explanation before or after the code block.`;
    }

    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-pro',
      contents: fullPrompt,
    });

    for await (const chunk of response) {
        yield chunk.text;
    }
  } catch (error) {
    console.error("Error generating/editing code:", error);
    throw error;
  }
};

export const performDeepResearch = async (query: string): Promise<ResearchResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a comprehensive summary for the query: "${query}".`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const summary = response.text;
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources: GroundingSource[] = rawChunks
      .map((chunk: any) => ({
        uri: chunk.web?.uri,
        title: chunk.web?.title,
      }))
      .filter((source: GroundingSource) => source.uri && source.title);
      
    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    return { summary, sources: uniqueSources };
  } catch (error) {
    console.error("Error performing deep research:", error);
    throw error;
  }
};

// Fix: Add the missing 'enhancePrompt' function to be used by the PromptEnhancerModal component.
export const enhancePrompt = async (prompt: string): Promise<string> => {
  try {
    const fullPrompt = `You are an expert prompt engineer. Take the following user's idea and transform it into a detailed, effective prompt for a large language model. The enhanced prompt should be clear, specific, and provide context to guide the AI towards a high-quality response. Do not add any introductory text or explanation, just provide the enhanced prompt. User's idea: "${prompt}"`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    throw error;
  }
};

export const generateStudyPlan = async (topic: string): Promise<StudyPlan> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: `Create a detailed, week-by-week study plan for someone wanting to learn about "${topic}". The plan should span a reasonable number of weeks (e.g., 4-8 weeks) and for each week, include a main theme and specific topics to cover. For each topic, provide a brief description and suggest 1-2 online resources (like articles, videos, or tutorials) with their URLs.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            learningTopic: { type: Type.STRING },
            durationWeeks: { type: Type.INTEGER },
            weeklyBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  week: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  topics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        resources: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              description: { type: Type.STRING },
                              url: { type: Type.STRING },
                            },
                            required: ["description", "url"],
                          },
                        },
                      },
                      required: ["title", "description", "resources"],
                    },
                  },
                },
                required: ["week", "title", "topics"],
              },
            },
          },
          required: ["learningTopic", "durationWeeks", "weeklyBreakdown"],
        },
      },
    });

    return JSON.parse(response.text) as StudyPlan;
  } catch (error) {
    console.error("Error generating study plan:", error);
    throw error;
  }
};