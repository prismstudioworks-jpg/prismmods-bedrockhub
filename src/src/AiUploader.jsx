import React, { useState } from 'react';

export default function AiImageUploader() {
  const [prompt, setPrompt] = useState("What is in this reference picture?");
  const [loading, setLoading] = useState(false);

  const handleAiCall = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onloadend = async () => {
      // Clean up the base64 string metadata
      const base64Data = reader.result.split(',')[1]; 

      try {
        const response = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userPrompt: prompt,
            imageBase64: base64Data,
            imageMimeType: file.type
          })
        });

        const data = await response.json();
        alert("The AI Robot says: " + (data.result || data.error));
      } catch (err) {
        alert("Error talking to AI");
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '20px 0' }}>
      <h3>Free AI Reference Reader</h3>
      <input 
        type="text" 
        value={prompt} 
        onChange={(e) => setPrompt(e.target.value)} 
        style={{ width: '100%', padding: '8px', marginBottom: '10px', color: '#000' }}
      />
      <br />
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleAiCall} 
        disabled={loading}
      />
      {loading && <p>Thinking...</p>}
    </div>
  );
}
