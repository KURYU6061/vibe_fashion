import { GoogleGenAI, Modality } from "@google/genai";
import { ImagePart } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove the data URL prefix: 'data:image/jpeg;base64,'
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const generateFittingImage = async (
  personImageFile: File,
  topImageFile: File | null,
  bottomImageFile: File | null,
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API 키가 설정되지 않았습니다. API_KEY 환경 변수를 설정해주세요.");
  }
  if (!topImageFile && !bottomImageFile) {
    throw new Error("피팅할 의류 이미지를 하나 이상 업로드해주세요.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts: (ImagePart | { text: string })[] = [];
  
  const personImageBase64 = await fileToBase64(personImageFile);
  const personImagePart: ImagePart = {
    inlineData: { data: personImageBase64, mimeType: personImageFile.type },
  };
  parts.push(personImagePart);

  const imageDescriptions: string[] = [];
  let imageCounter = 2;

  if (topImageFile) {
    const topImageBase64 = await fileToBase64(topImageFile);
    const topImagePart: ImagePart = {
      inlineData: { data: topImageBase64, mimeType: topImageFile.type },
    };
    parts.push(topImagePart);
    imageDescriptions.push(`${imageCounter}번째 이미지의 상의`);
    imageCounter++;
  }

  if (bottomImageFile) {
    const bottomImageBase64 = await fileToBase64(bottomImageFile);
    const bottomImagePart: ImagePart = {
      inlineData: { data: bottomImageBase64, mimeType: bottomImageFile.type },
    };
    parts.push(bottomImagePart);
    imageDescriptions.push(`${imageCounter}번째 이미지의 하의`);
  }

  let promptText = `첫 번째 이미지에 있는 사람에게 ${imageDescriptions.join('와 ')}를 자연스럽게 입혀주세요.`;
  promptText += " 사람의 포즈와 배경은 첫 번째 이미지를 기준으로 최대한 유지해주세요.";
  
  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error('응답에서 이미지가 생성되지 않았습니다.');

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("이미지 생성에 실패했습니다. 모델이 요청을 거부했을 수 있습니다. 다른 이미지를 시도해 보세요.");
  }
};