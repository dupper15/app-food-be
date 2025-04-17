import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY || 'my_api_key';

function getModel(): GenerativeModel {
  if (!API_KEY) {
    throw new Error('API_KEY is not defined.');
  }
  const genAI = new GoogleGenerativeAI(API_KEY);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

export const generateText = async (prompt: string): Promise<string> => {
  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    return result.response.text().slice(0, -2);
  } catch (err) {
    console.error('Error generating content:', err);
    return 'Lỗi khi tạo văn bản';
  }
};

export const generateTextFromImage = async (
  imageUrl: string,
  text: string = 'Mô tả món ăn này',
): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');

    const model = getModel();
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg',
        },
      },
      text,
    ]);

    return result.response.text();
  } catch (err) {
    console.error('Error generating content from image:', err);
    return 'Lỗi khi tạo mô tả từ ảnh';
  }
};
