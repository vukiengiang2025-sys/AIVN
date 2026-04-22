import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  const customKey = localStorage.getItem('pocket_secretary_custom_api_key');
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  return new GoogleGenAI({ apiKey });
};

export async function summarizeTranscript(text: string) {
  const ai = getAIClient();
  const model = "gemini-3-flash-preview";
  const prompt = `Bạn là một thư ký chuyên nghiệp. Hãy tóm tắt đoạn hội thoại sau thành cấu trúc rõ ràng bằng tiếng Việt:
  - Các quyết định chính (Chốt)
  - Các công việc cần làm (Cần làm)
  - Các ghi chú quan trọng (Ghi chú)
  
  Đoạn hội thoại: ${text}`;

  const result = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return result.text;
}

export async function generateProfessionalMessage(keywords: string, context: string = "email") {
  const ai = getAIClient();
  const model = "gemini-3-flash-preview";
  const prompt = `Hãy viết một ${context} chuyên nghiệp bằng tiếng Việt dựa trên các từ khóa sau: "${keywords}". Giữ cho nội dung ngắn gọn và súc tích.`;

  const result = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return result.text;
}

export async function classifyDocument(content: string) {
  const ai = getAIClient();
  const model = "gemini-3-flash-preview";
  const prompt = `Phân loại nội dung tài liệu sau vào một trong các danh mục: [Tài chính, Y tế, Công việc, Pháp lý, Cá nhân]. CHỈ trả về tên danh mục duy nhất.
  
  Nội dung: ${content}`;

  const result = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  const categoryMap: { [key: string]: string } = {
    'Finance': 'Tài chính',
    'Medical': 'Y tế',
    'Work': 'Công việc',
    'Legal': 'Pháp lý',
    'Personal': 'Cá nhân'
  };

  const rawResult = result.text?.trim() || "Work";
  return categoryMap[rawResult] || rawResult;
}
