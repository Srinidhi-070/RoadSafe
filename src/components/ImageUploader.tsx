
import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Camera, Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  className?: string;
  previewClassName?: string;
}

const ImageUploader = ({ onImageSelect, className, previewClassName }: ImageUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file));
      onImageSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        capture="environment"
      />
      
      {!preview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer bg-background/50',
            isDragging ? 'border-primary bg-primary/5' : 'border-muted',
            className
          )}
          onClick={handleCameraClick}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-primary/10">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium">Capture or upload accident image</p>
              <p className="text-sm text-muted-foreground mt-1">Tap to take a photo or drag and drop</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden group">
          <img 
            src={preview} 
            alt="Preview" 
            className={cn(
              'w-full h-auto object-cover rounded-lg transition-all duration-200',
              previewClassName
            )} 
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <button 
              onClick={handleRemoveImage}
              className="p-2 bg-emergency rounded-full"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
