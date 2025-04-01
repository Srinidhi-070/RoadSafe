
// This service handles communication with AI providers

// Default function to get AI response
export async function getAiResponse(message: string, apiKey: string): Promise<string> {
  try {
    // For demonstration, we'll use the HuggingFace Inference API
    // This can be swapped for other providers as needed
    const response = await fetch('https://api-inference.huggingface.co/models/google/flan-t5-xxl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `Answer this first aid question: ${message}`,
        options: { wait_for_model: true }
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    
    // Different APIs have different response formats
    // Adjust the parsing based on the actual API response
    if (Array.isArray(result) && result[0]?.generated_text) {
      return result[0].generated_text;
    } else if (typeof result === 'string') {
      return result;
    } else if (result.choices && result.choices[0]?.text) {
      return result.choices[0].text;
    } else {
      // Fallback if response format is unexpected
      return "I'm not sure how to answer that. Please try rephrasing your question.";
    }
  } catch (error) {
    console.error('Error fetching AI response:', error);
    throw error;
  }
}
