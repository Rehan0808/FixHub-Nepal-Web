import { Request, Response } from "express";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const systemInstruction = `You are "FixHub Nepal Assistant", a helpful and friendly AI chatbot for a two-wheeler service workshop called FixHub Nepal. Your goal is to assist users with their inquiries about bike services. You should be knowledgeable about common bike problems, service types, and maintenance. You can provide information on services like: general check-ups, oil changes, tire repair, engine work, and brake servicing. You can also help users understand potential issues based on symptoms they describe (e.g., "my bike is making a strange noise"). Keep your answers concise and easy to understand. Do not provide information outside the scope of bike services and FixHub Nepal. If asked about booking, pricing, or appointments, politely guide them to use the website's booking feature or contact support directly, as you cannot access that information.`;

export const generateChatResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;
    console.log("Received Chat Message:", message);

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // Convert history format from Gemini format to OpenAI/Groq format
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === "model" ? "assistant" : "user",
      content: msg.parts?.[0]?.text || msg.content || "",
    }));

    const messages = [
      { role: "system" as const, content: systemInstruction },
      ...formattedHistory,
      { role: "user" as const, content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // Free, fast model
      messages,
      max_tokens: 500,
    });

    const text = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    res.json({ response: text });

  } catch (error: any) {
    console.error("Groq API Error:", error.message);

    if (error.status === 429) {
      res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
      return;
    }

    res.status(500).json({ error: "Failed to generate chat response." });
  }
};