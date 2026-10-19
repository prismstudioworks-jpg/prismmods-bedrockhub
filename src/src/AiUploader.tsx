import React, { useState } from 'react';

export default function AiImageUploader() {
  const [prompt, setPrompt] = useState("What is in this reference picture?");
  const [loading, setLoading] = useState(false);

  const handleAiCall = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onloadend = async () => {
      if (typeof reader.result !== 'string') return;
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
        alert("The AI Robot says: " + (data.result || data.error || "No response"));
      } catch (err) {
        alert("Error talking to AI");
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #334155', borderRadius: '12px', margin: '20px 0', backgroundColor: '#1e293b' }}>
      <h3 style={{ color: '#fff', marginBottom: '10px' }}>Free AI Reference Reader</h3>
      <input 
        type="text" 
        value={prompt} 
        onChange={(e) => setPrompt(e.target.value)} 
        style={{ width: '100%', padding: '8px', marginBottom: '10px', color: '#000', borderRadius: '6px' }}
      />
      <br />
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleAiCall} 
        disabled={loading}
        style={{ color: '#fff' }}
      />
      {loading && <p style={{ color: '#38bdf8', marginTop: '10px' }}>Thinking...</p>}
    </div>
  );
}
