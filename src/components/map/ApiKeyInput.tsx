
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
      <p className="text-sm mb-2">API key has been set!</p>
      <button 
        onClick={onSubmit} 
        className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
      >
        Continue to Map
      </button>
    </div>
  );
};

export default ApiKeyInput;
