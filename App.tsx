import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import Spinner from './components/Spinner';
import { generateFittingImage } from './services/geminiService';
import { Icon } from './components/Icon';

const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [topImage, setTopImage] = useState<File | null>(null);
  const [bottomImage, setBottomImage] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTryOn = useCallback(async () => {
    if (!personImage) {
      setError('인물 사진을 업로드해주세요.');
      return;
    }
    if (!topImage && !bottomImage) {
      setError('피팅할 의류(상의 또는 하의)를 하나 이상 업로드해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const resultImage = await generateFittingImage(personImage, topImage, bottomImage);
      setGeneratedImage(`data:image/png;base64,${resultImage}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [personImage, topImage, bottomImage]);

  const handleSaveImage = useCallback(() => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-패션-피팅-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedImage]);

  const canTryOn = personImage && (topImage || bottomImage) && !isLoading;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          AI 패션 피팅
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          Gemini (Nano Banana) 제공
        </p>
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* Input Panels */}
        <div className="flex flex-col gap-6 lg:gap-8">
           <ImageUploader
            title="인물 사진 업로드"
            onImageSelect={setPersonImage}
            icon={<Icon name="person" />}
          />
          <div className="grid grid-cols-2 gap-6 lg:gap-8">
            <ImageUploader
              title="상의 사진 업로드"
              onImageSelect={setTopImage}
              icon={<Icon name="clothing" />}
            />
            <ImageUploader
              title="하의 사진 업로드"
              onImageSelect={setBottomImage}
              icon={<Icon name="pants" />}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-gray-800/50 rounded-2xl shadow-lg p-6 h-full flex flex-col justify-center items-center aspect-square lg:aspect-auto">
          <div className="w-full h-full flex justify-center items-center border-2 border-dashed border-gray-600 rounded-xl">
            {isLoading ? (
              <div className="text-center">
                <Spinner />
                <p className="mt-4 text-gray-400">새로운 스타일을 생성 중입니다...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-400 p-4">
                 <Icon name="error" className="w-12 h-12 mx-auto mb-2"/>
                <p className="font-semibold">생성 실패</p>
                <p className="text-sm">{error}</p>
              </div>
            ) : generatedImage ? (
              <div className="relative w-full h-full group">
                <img
                  src={generatedImage}
                  alt="생성된 패션 피팅 이미지"
                  className="w-full h-full object-contain rounded-xl"
                />
                <button
                  onClick={handleSaveImage}
                  className="absolute bottom-4 right-4 bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-all duration-300 ease-in-out flex items-center gap-2 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="이미지 저장"
                >
                  <Icon name="download" className="w-5 h-5" />
                  <span>저장하기</span>
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Icon name="sparkles" className="w-16 h-16 mx-auto mb-4"/>
                <h3 className="text-xl font-bold text-gray-300">결과 이미지</h3>
                <p>이미지를 업로드하고 "피팅해보기" 버튼을 누르세요.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-8 flex justify-center">
        <button
          onClick={handleTryOn}
          disabled={!canTryOn}
          className={`w-full max-w-md py-4 px-8 text-xl font-bold rounded-full transition-all duration-300 ease-in-out transform
            ${canTryOn
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 shadow-lg shadow-purple-500/30 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
        >
          {isLoading ? '생성 중...' : '✨ 피팅해보기'}
        </button>
      </footer>
    </div>
  );
};

export default App;