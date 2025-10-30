import React, { useState, useRef, useCallback, ReactNode } from 'react';

interface ImageUploaderProps {
  title: string;
  onImageSelect: (file: File | null) => void;
  icon: ReactNode;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ title, onImageSelect, icon }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(URL.createObjectURL(file));
      onImageSelect(file);
    } else {
      setImagePreview(null);
      onImageSelect(null);
    }
  }, [onImageSelect, imagePreview]);
  
  const handleClearImage = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    onImageSelect(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }, [imagePreview, onImageSelect]);

  const handleUploaderClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center aspect-square">
      <h2 className="text-2xl font-bold mb-4 text-gray-300">{title}</h2>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
      {imagePreview ? (
        <div className="relative w-full h-full rounded-xl overflow-hidden group">
          <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleUploaderClick}
              className="bg-white/20 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors"
            >
              변경
            </button>
             <button
              onClick={handleClearImage}
              className="absolute top-2 right-2 bg-red-500/70 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
              aria-label="이미지 제거"
            >
              &times;
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={handleUploaderClick}
          className="w-full h-full flex flex-col justify-center items-center border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-gray-700/50 transition-all duration-300"
        >
          <div className="text-gray-500 group-hover:text-purple-400 transition-colors">
            {icon}
          </div>
          <p className="mt-2 text-gray-400">클릭하여 업로드</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;