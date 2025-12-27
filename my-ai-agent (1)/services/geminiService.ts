
import { GoogleGenAI, Type } from "@google/genai";
import { LANGUAGES } from '../constants.tsx';
import type {
    AspectRatio,
    ImageStyle,
    WritingTone,
    WritingFormat,
    WritingLength,
    CodeLanguage,
    ResearchResult,
    StudyPlan,
} from '../types.ts';

// Initialize Gemini with the provided API Key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models
const TEXT_MODEL = 'gemini-3-flash-preview';
const IMAGE_MODEL = 'gemini-2.5-flash-image';

// --- Chat Service ---

export interface Chat {
    sendMessageStream(request: { message: string }): AsyncGenerator<{ text: string }, void, unknown>;
}

class GeminiChat implements Chat {
    private chatSession: any;

    constructor(systemInstruction: string, history: any[] = []) {
        this.chatSession = ai.chats.create({
            model: TEXT_MODEL,
            config: {
                systemInstruction: systemInstruction,
            },
            history: history,
        });
    }

    async *sendMessageStream(request: { message: string }) {
        try {
            if (!request.message) {
                 throw new Error("Message content cannot be empty.");
            }
            const streamResult = await this.chatSession.sendMessageStream(request);
            for await (const chunk of streamResult) {
                const text = chunk.text;
                if (text) {
                    yield { text };
                }
            }
        } catch (error) {
            console.error("Gemini Chat Error:", error);
            throw error;
        }
    }
}

const getLanguageInstruction = (): string => {
    const langCode = localStorage.getItem('selected-language') || 'en-US';
    if (langCode === 'en-US') return '';
    const language = LANGUAGES.find(l => l.code === langCode);
    const langName = language ? language.name.split(' (')[0] : 'English';
    return ` Please provide the response in ${langName}.`;
};

export const startChat = (history: { role: string, parts: { text: string }[] }[] = []): Chat => {
    const langInstruction = getLanguageInstruction();
    const systemInstruction = `You are a helpful, clever, and friendly AI assistant.${langInstruction}`;
    return new GeminiChat(systemInstruction, history);
};

// --- Image Generation ---

export const generateImage = async (
    prompt: string,
    style: ImageStyle,
    aspectRatio: AspectRatio,
    count: number = 1
): Promise<string[]> => {
    try {
        const fullPrompt = `${prompt} in ${style} style. Highly detailed and professional quality.`;
        
        // Parallelize generation for multiple images
        const generationPromises = Array.from({ length: count }).map(() => 
            ai.models.generateContent({
                model: IMAGE_MODEL,
                contents: { parts: [{ text: fullPrompt }] },
                config: {
                    imageConfig: {
                        aspectRatio: aspectRatio,
                    }
                }
            })
        );

        const results = await Promise.all(generationPromises);
        const images: string[] = [];

        for (const response of results) {
            const candidates = response.candidates;
            if (candidates && candidates.length > 0 && candidates[0].content.parts) {
                for (const part of candidates[0].content.parts) {
                    if (part.inlineData) {
                        const base64 = part.inlineData.data;
                        const mime = part.inlineData.mimeType;
                        images.push(`data:${mime};base64,${base64}`);
                    }
                }
            }
        }
        
        if (images.length === 0) {
            throw new Error("The model did not return any image data. Try a different prompt.");
        }
        
        return images;
    } catch (error) {
        console.error("Gemini Image Gen Error:", error);
        throw error;
    }
};

export const editImageWithGemini = async (
    prompt: string,
    images: { data: string, mimeType: string }[],
    count: number = 1
): Promise<string[]> => {
    try {
        // Parallelize for multiple variations
        const generationPromises = Array.from({ length: count }).map(() =>
            ai.models.generateContent({
                model: IMAGE_MODEL,
                contents: {
                    parts: [
                        ...images.map(img => ({
                            inlineData: { data: img.data, mimeType: img.mimeType }
                        })),
                        { text: prompt }
                    ]
                }
            })
        );

        const results = await Promise.all(generationPromises);
        const imagesResult: string[] = [];

        for (const response of results) {
            const candidates = response.candidates;
            if (candidates && candidates.length > 0 && candidates[0].content.parts) {
                for (const part of candidates[0].content.parts) {
                    if (part.inlineData) {
                        imagesResult.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                    }
                }
            }
        }
        return imagesResult;
    } catch (error) {
        console.error("Gemini Image Edit Error:", error);
        throw error;
    }
};

// --- Text & Code Generation ---

export const generateLongFormText = async function* (
  prompt: string,
  tone: WritingTone,
  format: WritingFormat,
  length: WritingLength
): AsyncGenerator<string, void, unknown> {
    const langInstruction = getLanguageInstruction();
    const systemPrompt = `You are an expert writer. Tone: ${tone}. Format: ${format}. Length: ${length}.${langInstruction}`;
    try {
        const responseStream = await ai.models.generateContentStream({
            model: TEXT_MODEL,
            contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nTask: ${prompt}` }] }]
        });
        for await (const chunk of responseStream) {
            yield chunk.text || '';
        }
    } catch (error) {
        console.error("Write Error:", error);
        throw error;
    }
};

export const generateCode = async function* (
  prompt: string,
  language: CodeLanguage,
  existingCode?: string
): AsyncGenerator<string, void, unknown> {
    const langInstruction = getLanguageInstruction();
    let systemInstruction = `You are an expert developer specializing in ${language}.${langInstruction}`;
    let taskInstruction = existingCode 
        ? `EDIT the provided code. USER REQUEST: ${prompt}\n\nEXISTING CODE:\n\`\`\`${language}\n${existingCode}\n\`\`\``
        : `GENERATE new code from scratch. USER REQUEST: ${prompt}`;

    const fullPrompt = `${systemInstruction}\n\n${taskInstruction}\n\nProvide ONLY the code.`;

    try {
        const responseStream = await ai.models.generateContentStream({
            model: TEXT_MODEL,
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }]
        });
        for await (const chunk of responseStream) {
            yield chunk.text || '';
        }
    } catch (error) {
        console.error("Code Gen Error:", error);
        throw error;
    }
};

// --- Deep Research ---

export const performDeepResearch = async (query: string): Promise<ResearchResult> => {
    const langInstruction = getLanguageInstruction();
    try {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: `Research the following query in detail: "${query}". Provide a comprehensive summary.${langInstruction}`,
            config: { tools: [{ googleSearch: {} }] },
        });
        const summary = response.text || "No summary generated.";
        const sources: { uri: string; title: string }[] = [];
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks && Array.isArray(chunks)) {
            chunks.forEach((chunk: any) => {
                if (chunk.web?.uri) {
                    sources.push({ uri: chunk.web.uri, title: chunk.web.title || chunk.web.uri });
                }
            });
        }
        return { summary, sources: Array.from(new Map(sources.map(s => [s.uri, s])).values()) };
    } catch (error) {
        console.error("Research Error:", error);
        throw error;
    }
};

export const enhancePrompt = async (prompt: string): Promise<string> => {
    const langInstruction = getLanguageInstruction();
    try {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: `Improve this prompt to be more detailed: "${prompt}". Return ONLY the enhanced text.${langInstruction}`,
        });
        return response.text?.trim() || prompt;
    } catch (error) {
        return prompt;
    }
};

export const generateStudyPlan = async (topic: string): Promise<StudyPlan> => {
    const langInstruction = getLanguageInstruction();
    const studyPlanSchema = {
        type: Type.OBJECT,
        properties: {
            learningTopic: { type: Type.STRING },
            durationWeeks: { type: Type.NUMBER },
            weeklyBreakdown: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        week: { type: Type.NUMBER },
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
                                            properties: { description: { type: Type.STRING }, url: { type: Type.STRING } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        required: ["learningTopic", "durationWeeks", "weeklyBreakdown"]
    };
    try {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: `Create a comprehensive study plan for "${topic}".${langInstruction}`,
            config: { responseMimeType: "application/json", responseSchema: studyPlanSchema },
        });
        return JSON.parse(response.text || "{}") as StudyPlan;
    } catch (error) {
        console.error("Study Plan Error:", error);
        throw error;
    }
};
