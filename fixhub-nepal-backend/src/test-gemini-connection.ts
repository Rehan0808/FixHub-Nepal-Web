// import { GoogleGenerativeAI } from "@google/generative-ai";
// import dotenv from "dotenv";
// import path from "path";

// // Load environment variables from .env file
// dotenv.config({ path: path.join(__dirname, "../.env") });

// async function testGemini() {
//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) {
//         console.error("❌ GEMINI_API_KEY is missing in .env file");
//         return;
//     }
//     console.log("✅ GEMINI_API_KEY found (length: " + apiKey.length + ")");

//     console.log("Listing available models via REST API...");

//     try {
//         const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

//         if (!response.ok) {
//             console.error(`❌ API Request Failed: ${response.status} ${response.statusText}`);
//             const errorText = await response.text();
//             console.error("Error details:", errorText);
//             return;
//         }

//         const data = await response.json();
//         console.log(`✅ Successfully fetched models! Found ${data.models?.length || 0} models.`);

//         // Filter for generateContent supported models
//         const generateModels = data.models?.filter((m: any) =>
//             m.supportedGenerationMethods?.includes("generateContent")
//         ).map((m: any) => m.name.replace("models/", ""));

//         console.log("\nModels supporting 'generateContent':");
//         console.log(generateModels?.join("\n"));

//         if (generateModels && generateModels.length > 0) {
//             console.log(`\nRecommended model to use: ${generateModels[0]}`);
//         }

//     } catch (error: any) {
//         console.error("❌ Network or Parsing Error:", error.message);
//     }
// }

// testGemini();
