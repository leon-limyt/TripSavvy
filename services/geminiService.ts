
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Message, OCRExtraction } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const receiptSchema = {
    type: Type.OBJECT,
    properties: {
        merchant: { type: Type.STRING, description: 'The name of the store or merchant.' },
        totalAmount: { type: Type.NUMBER, description: 'The final total amount on the receipt.' },
        date: { type: Type.STRING, description: 'The date of the transaction in YYYY-MM-DD format.' },
        suggestedCategory: { 
            type: Type.STRING,
            enum: Object.values(Category),
            description: 'A suggested expense category based on the merchant or items.'
        }
    },
    required: ['merchant', 'totalAmount', 'date', 'suggestedCategory']
};

export const extractReceiptData = async (imageBase64: string, mimeType: string): Promise<OCRExtraction | null> => {
    try {
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType,
            },
        };

        const textPart = {
            text: 'Analyze this receipt image and extract the merchant name, the final total amount, the date of the transaction, and suggest an appropriate expense category. Use the provided schema for your response.',
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: receiptSchema,
            }
        });

        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        return data as OCRExtraction;

    } catch (error) {
        console.error("Error extracting receipt data:", error);
        return null;
    }
};

export const getTravelAdvice = async (history: Message[], newMessage: string, tripDestination: string): Promise<string> => {
    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are a helpful and friendly travel planner assistant. The user is currently planning a trip to ${tripDestination}. Provide concise and useful travel advice, recommendations for places to visit, local weather, restaurants, transport, and other travel tips.`,
            },
        });
        
        // This is a simplified history implementation for stateless service
        // A real app might pass full history to the `chat.sendMessage` call
        
        const response = await chat.sendMessage({ message: newMessage });
        return response.text;
    } catch (error) {
        console.error("Error getting travel advice:", error);
        return "Sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.";
    }
};
