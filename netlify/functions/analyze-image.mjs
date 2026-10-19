const { GoogleGenAI } = require("@google/genai");

// Automatically pulls the key you saved in the Netlify dashboard
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.handler = async (event) => {
  // Only accept POST requests containing image data
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { userPrompt, imageBase64, imageMimeType } = JSON.parse(event.body);
    const contents = [userPrompt];

    // If an image reference is attached, format it for Gemini
    if (imageBase64 && imageMimeType) {
      contents.push({
        inlineData: {
          data: imageBase64,
          mimeType: imageMimeType
        }
      });
    }

    // Use gemini-2.5-flash for fast, free multimodal analysis
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result: response.text }),
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process image reference" }),
    };
  }
};
