import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const run = async () => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY not found in environment variables");
            return;
        }
        console.log("Using API Key ending in:", apiKey.slice(-4));

        const genAI = new GoogleGenerativeAI(apiKey);
        // Use the getGenerativeModel method to list models isn't direct, 
        // but we can try to get the model list via the API if the SDK supports it,
        // or just try a standard Hello World with a few known models.

        // Actually the SDK doesn't have a listModels method exposed directly on the main class in some versions,
        // but let's try a simple generation with "gemini-1.5-flash" and "gemini-2.0-flash" and "gemini-pro"
        // to see which one works.

        const modelsToTest = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-pro", "models/gemini-1.5-flash"];

        for (const modelName of modelsToTest) {
            console.log(`\nTesting model: ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello, are you there?");
                const response = await result.response;
                console.log(`✅ Success with ${modelName}! Response: ${response.text()}`);
                return; // Exit on first success
            } catch (error: any) {
                console.log(`❌ Failed with ${modelName}: ${error.message.split('\n')[0]}`);
            }
        }

    } catch (error) {
        console.error("Fatal error:", error);
    }
};

run();
