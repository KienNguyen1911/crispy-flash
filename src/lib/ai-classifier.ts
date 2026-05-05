import { Vocabulary } from './types';

const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
const CACHE_PREFIX = "vocab_categories_v3_";

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(36);
}

export async function categorizeVocabularies(vocabs: Vocabulary[]): Promise<Record<string, string>> {
  if (!vocabs || vocabs.length === 0) return {};

  const simplified = vocabs.map(v => ({ id: v.id, w: v.word, m: v.meaning }));
  // Stable sort by ID so cache hits regardless of array order
  simplified.sort((a, b) => a.id.localeCompare(b.id)); 
  
  const payloadStr = JSON.stringify(simplified);
  const hashKey = CACHE_PREFIX + hashString(payloadStr);
  
  const cached = localStorage.getItem(hashKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch(e) {
      console.error("Cache parsing error", e);
    }
  }

  const prompt = `Bạn là một chuyên gia ngôn ngữ học và khoa học nhận thức.
Dưới đây là một danh sách từ vựng tiếng Nhật.
Nhiệm vụ của bạn là phân loại các từ vựng này dựa theo SEMANTIC CLUSTER (Cụm ngữ nghĩa) và ABSTRACT MEANING (Ý nghĩa trừu tượng cốt lõi).

LƯU Ý QUAN TRỌNG:
- Trọng tâm là Ý nghĩa trừu tượng: Tìm điểm chung về CONCEPT để gom nhóm (Ví dụ: "Sự phân chia & Kết hợp", "Tác động vật lý & Thay đổi trạng thái", "Sự tương đồng & Khác biệt", "Nhận thức & Không gian").
- KHÔNG phân loại theo ngữ pháp hay thể từ (không tách tẻ nhạt các bộ Tự động từ/Tha động từ ra riêng biệt, mà hãy gom những từ có chung lõi nghĩa vào 1 cluster lớn).
- ÉP BUỘC CHỈ CHIA TỪ 2 ĐẾN 5 NHÓM LỚN tuỳ theo dữ liệu đầu vào. Tuyệt đối KHÔNG ĐƯỢC tạo ra các nhóm vụn vặt chỉ có 1 hoặc 2 từ. Hãy mở rộng semantic concept để bao trọn các từ vào các cluster lớn hơn.
- Đặt tên nhóm thật chuyên nghiệp và bao quát, phản ánh đúng abstract meaning của cluster đó.

Trả về ĐÚNG MỘT block JSON KHÔNG CÓ BẤT KỲ VĂN BẢN NÀO KHÁC nằm ngoài object JSON, với định dạng key-value map ID -> Category name:
{
  "uuid-1": "Tên nhóm A",
  "uuid-2": "Tên nhóm B"
}

DANH SÁCH TỪ VỰNG:
${simplified.map(v => `- ID ${v.id} | Từ: ${v.w} | Nghĩa: ${v.m}`).join('\n')}
`;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error("API call returned " + response.status);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No payload in response");
    }
    
    // Sometimes LLM might put json inside markdown blocks
    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const categoryMap = JSON.parse(cleanContent);
    
    // Ensure it's stored in cache
    localStorage.setItem(hashKey, JSON.stringify(categoryMap));
    return categoryMap;
  } catch (err) {
    console.error("Failed to categorize vocabularies", err);
    return {};
  }
}
