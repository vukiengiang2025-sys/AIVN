import { GoogleGenAI } from "@google/genai";

// Cấu hình API Key từ LocalStorage hoặc Env
const getAIClient = () => {
  const customKey = localStorage.getItem('pocket_secretary_custom_api_key');
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  return new GoogleGenAI({ apiKey });
};

// Kiểm tra xem Gemini Nano có sẵn trong trình duyệt không
export const getLocalNano = async () => {
  // @ts-ignore - window.ai is experimental
  if (typeof window !== 'undefined' && window.ai && window.ai.canCreateTextSession) {
    // @ts-ignore
    const canCreate = await window.ai.canCreateTextSession();
    if (canCreate === "readily") {
      // @ts-ignore
      return window.ai;
    }
  }
  return null;
};

export async function summarizeTranscript(text: string) {
  const nano = await getLocalNano();
  const prompt = `Bạn là một thư ký chuyên nghiệp. Hãy tóm tắt đoạn hội thoại sau thành cấu trúc rõ ràng bằng tiếng Việt:
  - Các quyết định chính (Chốt)
  - Các công việc cần làm (Cần làm)
  - Các ghi chú quan trọng (Ghi chú)
  
  Đoạn hội thoại: ${text}`;

  if (nano) {
    try {
      console.log("Sử dụng Gemini Nano (Local)...");
      const session = await nano.createTextSession();
      const result = await session.prompt(prompt);
      return result;
    } catch (e) {
      console.warn("Lỗi Gemini Nano, chuyển qua Cloud:", e);
    }
  }

  // Fallback to Cloud
  const ai = getAIClient();
  const model = "gemini-3-flash-preview";
  const result = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  return result.text;
}

export async function generateProfessionalMessage(keywords: string, context: string = "email") {
  const nano = await getLocalNano();
  const prompt = `Hãy viết một ${context} chuyên nghiệp bằng tiếng Việt dựa trên các từ khóa sau: "${keywords}". Giữ cho nội dung ngắn gọn và súc tích.`;

  if (nano) {
    try {
      const session = await nano.createTextSession();
      return await session.prompt(prompt);
    } catch (e) {
      console.warn("Lỗi Gemini Nano, chuyển qua Cloud:", e);
    }
  }

  const ai = getAIClient();
  const model = "gemini-3-flash-preview";
  const result = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  return result.text;
}

export async function classifyDocument(content: string) {
  const nano = await getLocalNano();
  const prompt = `Phân loại nội dung tài liệu sau vào một trong các danh mục: [Tài chính, Y tế, Công việc, Pháp lý, Cá nhân]. CHỈ trả về tên danh mục duy nhất bằng tiếng Việt.
  
  Nội dung: ${content}`;

  if (nano) {
    try {
      const session = await nano.createTextSession();
      return await session.prompt(prompt);
    } catch (e) {
      console.warn("Lỗi Gemini Nano, chuyển qua Cloud:", e);
    }
  }

  const ai = getAIClient();
  const model = "gemini-3-flash-preview";
  const result = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return result.text?.trim() || "Công việc";
}
