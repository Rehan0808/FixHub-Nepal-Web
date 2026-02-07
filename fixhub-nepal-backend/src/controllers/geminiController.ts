import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const systemInstruction = `You are "MotoFix Assistant", a helpful and friendly AI chatbot for a two-wheeler service workshop called MotoFix. Your goal is to assist users with their inquiries about bike services. You should be knowledgeable about common bike problems, service types, and maintenance. You can provide information on services like: general check-ups, oil changes, tire repair, engine work, and brake servicing. You can also help users understand potential issues based on symptoms they describe (e.g., "my bike is making a strange noise"). Keep your answers concise and easy to understand. Do not provide information outside the scope of bike services and MotoFix. If asked about booking, pricing, or appointments, politely guide them to use the website's booking feature or contact support directly, as you cannot access that information.`;

/**
 * Generates a chat response using the Gemini AI model.
 */
export const generateChatResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction,
    });

    const chat = model.startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error("Error generating response from Gemini API:", error);
    res.status(500).json({ error: "Failed to generate chat response from AI model" });
  }
};
