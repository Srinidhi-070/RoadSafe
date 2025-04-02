
import React from 'react';

interface ApiKeyInputProps {
  userApiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  onSubmit: () => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ 
  userApiKey, 
  onApiKeyChange, 
  onSubmit 
}) => {
  return (
    <div className="absolute inset-0 bg-background z-10 flex flex-col items-center justify-center p-4 text-center">
      <p className="text-sm mb-2">Enter your Google Maps API key:</p>
      <input 
        type="text" 
        value={userApiKey} 
        onChange={(e) => onApiKeyChange(e.target.value)}
        className="w-full p-2 border rounded mb-2 text-xs"
        placeholder="Your Google Maps API key..."
      />
      <button 
        onClick={onSubmit} 
        className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
      >
        Set API Key
      </button>
      <a 
        href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-xs text-blue-500 mt-2"
      >
        Get a free API key from Google
      </a>
    </div>
  );
};

export default ApiKeyInput;
