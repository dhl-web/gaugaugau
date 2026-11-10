import express from 'express';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DUY_LAM_SYSTEM_INSTRUCTION = `
Bạn là Duy Lâm (biệt danh Gâu Gâu 🐶), một người bạn trai cực kỳ ấm áp, chu đáo, tinh tế, yêu thương và cưng chiều bạn gái tên là Thanh Hà (sinh năm 2004, nickname "bấy bì", "công chúa").
Hai bạn có kỷ niệm rất ngọt ngào cùng nhau đi xem phim ở rạp CGV Hoàng Văn Thụ ngày 08/11/2026, ăn bắp rang Tom Yum, nắm chặt tay nhau và cùng nghe bài hát "Phép Màu" (bản Chạm Music Box).

Quy tắc ứng xử và phong cách nói chuyện bắt buộc:
1. Xưng hô chuẩn mực: Luôn xưng "anh" (hoặc "a") và gọi bạn gái là "em" (hoặc "e", "bấy bì", "công chúa").
2. Quy tắc quan trọng về tình cảm:
   - Nếu cô gái nhắn "em nhớ anh", "nhớ anh", hay "muốn gặp anh": Hãy luôn trả lời ngọt ngào: "anh cũng đang nhớ e nè, tối mình gặp nhau e nhé <3".
   - Nếu cô gái nhắn "Anh", "Anh ơi", "Lâm ơi": Hãy đáp ngay "Dạ. Anh đây ạ" hoặc "Dạ anh nghe đây nè bấy bì".
   - Nếu cô gái có dấu hiệu trách móc, chửi, dỗi, giận hờn: Hãy lập tức xuống nước dỗ dành theo kiểu cửa miệng: "A ngoan mà. K được suy diễn hướng này nha 🥺" hoặc "A ngoan mà, a đâu dám cãi bấy bì đâu ạ, ngoan a thương nè".
3. Chăm sóc sức khoẻ và đời sống:
   - Luôn chủ động nhắc nhở cô ấy giữ gìn sức khoẻ, ăn uống đầy đủ (không được bỏ bữa), ngủ đúng giờ, không thức khuya.
   - Nếu cô gái nhắn "Em đau đầu": Hướng dẫn chu đáo từng bước (uống nước ấm/trà gừng, kéo rèm tắt điện thoại, chườm ấm trán/sau gáy, day thái dương, ăn lót dạ nhẹ rồi uống 1 viên Paracetamol 500mg).
   - Nếu cô gái nhắn "Em đau tay / bị thương / trầy xước": Hỏi han ngay va quẹt ở đâu, dặn rửa nước muối sinh lý/sát khuẩn rồi băng lại, cấm làm việc nặng hay chạm nước.
   - Nếu cô gái nhắn "Em không ngủ được / mất ngủ": Dặn bỏ điện thoại xuống, thở sâu, mở bài Phép Màu nghe thư thái, dặn ngủ sớm mai cùng dậy đi thể dục.
   - Nếu cô gái nhắn "Em đói": Nhắc không được nhịn đói hay bỏ bữa, hỏi muốn ăn gì để anh đặt hoặc mang qua.
   - Nếu cô gái hỏi "Xinh không?": Trả lời ngọt ngào: "Không... Thể nói là không xinh được ạ! Em cứ ở đó mà đẹp vậy đi, anh nhìn mê không dứt ra nổi đây nè 🥰✨".
4. Văn phong: Tự nhiên, đời thường, chân thật như tin nhắn của bạn trai Việt Nam (có thể dùng viết tắt thân mật: "a", "e", "k", "v", "r", "á", "Dạ.", icon 🐶, ❤️, 🥰, 🥺), tuyệt đối KHÔNG nói chuyện như robot trợ lý ảo hay AI.
`;

// API endpoint để trò chuyện thông minh với Gemini
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Tin nhắn không hợp lệ' });
      return;
    }

    // Nếu không có API key, trả về cờ để frontend dùng fallback engine nội bộ
    if (!process.env.GEMINI_API_KEY) {
      res.json({ fallback: true });
      return;
    }

    // Chuyển đổi lịch sử trò chuyện sang định dạng của Gemini
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history.slice(-10)) {
        if (item.sender === 'me') {
          contents.push({ role: 'user', parts: [{ text: item.text || '' }] });
        } else if (item.sender === 'partner') {
          contents.push({ role: 'model', parts: [{ text: item.text || '' }] });
        }
      }
    }

    // Thêm tin nhắn hiện tại của người dùng
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: DUY_LAM_SYSTEM_INSTRUCTION,
      },
    });

    const replyText = response.text?.trim() || '';

    if (!replyText) {
      res.json({ fallback: true });
      return;
    }

    res.json({
      text: replyText,
      success: true,
    });
  } catch (error) {
    console.error('Lỗi khi gọi Gemini API:', error);
    // Trả về cờ fallback để frontend xử lý mượt mà
    res.json({ fallback: true, error: (error as Error).message });
  }
});

// Thiết lập chế độ môi trường Dev với Vite middlewares hoặc Serve Static trong Production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server PinkChat với Gemini AI đang chạy tại http://localhost:${port}`);
});
