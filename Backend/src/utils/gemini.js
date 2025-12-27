// utils/gemini.js
import { ApiError, GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const getResponse = async (content) => {
  const maxRetries = 3;
  let delay = 1000; // start at 1s

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: content }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      });

      // ✅ Extract text safely
      let rawText =
        response.candidates?.[0]?.content?.parts?.[0]?.text ||
        response.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        null;

      if (!rawText) {
        console.error("Gemini raw response:", JSON.stringify(response, null, 2));
        throw new ApiError("No text output from Gemini");
      }

      return rawText;
    } catch (error) {
      if (error.status === 503 && attempt < maxRetries) {
        console.warn(
          `Gemini overloaded (503). Retry ${attempt}/${maxRetries} in ${delay}ms...`
        );
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2; // exponential backoff
      } else {
        console.error("Gemini API Error:", error);
        throw error;
      }
    }
  }

  // If all retries fail
  throw new ApiError(503, "Gemini API unavailable after multiple retries");
};

export { getResponse };
