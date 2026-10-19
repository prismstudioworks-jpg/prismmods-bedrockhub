import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async (req) => {
  try {
    const { userPrompt, imageBase64, imageMimeType } = await req.json();
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        userPrompt,
        { inlineData: { data: imageBase64, mimeType: imageMimeType } }
      ],
    });

    return Response.json({ result: response.text });
  } catch (error) {
    return Response.json({ error: "Oops, it broke!" }, { status: 500 });
  }
};

export const config = { path: "/api/analyze-image" };
