/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Sparkles, 
  Music, 
  Sliders
} from 'lucide-react';
import { Message, MusicSettingsConfig, Track } from './types/chat';
import { 
  INITIAL_MESSAGES, 
  INITIAL_MUSIC_CONFIG, 
  INITIAL_TRACKS 
} from './data/chatData';
import { audioEngine } from './utils/audioEngine';
import { getDuyLamResponse } from './utils/duyLamAI';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessageItem } from './components/ChatMessageItem';
import { ChatInput } from './components/ChatInput';
import { MusicSettingsModal } from './components/MusicSettingsModal';
import { MemorySidebar } from './components/MemorySidebar';
import { FloatingHearts, FloatingHeartItem } from './components/FloatingHearts';
import { ImagePreviewModal } from './components/ImagePreviewModal';

export default function App() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [musicConfig, setMusicConfig] = useState<MusicSettingsConfig>(INITIAL_MUSIC_CONFIG);
  const [tracks] = useState<Track[]>(INITIAL_TRACKS);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState<string>('Duy Lâm đang trực tuyến');
  const [bgFit, setBgFit] = useState<'cover' | 'contain'>('cover');
  const [previewImage, setPreviewImage] = useState<{ url: string; caption?: string } | null>(null);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeartItem[]>([]);
  const [isChatShaking, setIsChatShaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  const currentTrack = tracks.find((t) => t.id === musicConfig.playback.currentTrackId) || tracks[0];

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isPartnerTyping]);

  // Dọn dẹp các hạt trái tim bay sau khi hoàn tất hiệu ứng
  useEffect(() => {
    if (floatingHearts.length > 0) {
      const timer = setTimeout(() => {
        setFloatingHearts((prev) => prev.slice(5));
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [floatingHearts]);

  // Hiệu ứng chùm tim bay phát sáng
  const triggerHeartBurst = (x?: number, y?: number) => {
    const emojis = ['💖', '💕', '💗', '💓', '✨', '🌸', '❤️'];
    const originX = x ?? (window.innerWidth / 2) + (Math.random() * 80 - 40);
    const originY = y ?? (window.innerHeight * 0.7);

    const newHearts: FloatingHeartItem[] = Array.from({ length: 7 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: originX + (Math.random() * 100 - 50),
      y: originY + (Math.random() * 60 - 30),
      size: Math.floor(Math.random() * 14) + 20,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));

    setFloatingHearts((prev) => [...prev, ...newHearts]);

    if (musicConfig.chatFeedbackAudio.heartBurstSoundEnabled) {
      audioEngine.playHeartSound(musicConfig.volumeLevels.soundEffects);
    }
  };

  // Gửi tin nhắn từ phía bạn gái
  const handleSendMessage = (text: string, options?: { image?: string; voiceMemo?: boolean }) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'me',
      text,
      timestamp: timeStr,
      status: 'sent',
      image: options?.image,
      imageCaption: options?.image ? 'Kỷ niệm CGV Hoàng Văn Thụ · 08/11/2026' : undefined,
      voiceMemo: options?.voiceMemo
        ? {
            duration: 8,
            waveformData: [30, 60, 85, 40, 95, 70, 45, 80, 55, 90, 65, 35],
          }
        : undefined,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Âm thanh gửi tin nhắn
    if (musicConfig.chatFeedbackAudio.sendSoundEnabled) {
      audioEngine.playSendSound(musicConfig.volumeLevels.soundEffects);
    }

    // Tự động thả tim nếu có từ ngữ yêu thương
    if (/yêu|nhớ|thương|thích|tim|hẹn|xinh/i.test(text) || options?.image) {
      triggerHeartBurst();
    }

    // Mô phỏng phản hồi chân thực từ bạn trai Duy Lâm (chậm rãi, thời gian gõ phù hợp)
    simulatePartnerReply(text);
  };

  // Mô phỏng quá trình đọc và soạn tin nhắn chân thực của bạn trai Duy Lâm kết hợp Gemini AI
  const simulatePartnerReply = async (userText: string) => {
    // Luôn có sẵn bản phản hồi dự phòng từ luật nội bộ chuẩn mực
    const fallbackReply = getDuyLamResponse(userText);
    const readDelay = fallbackReply.readDelay;

    // Bước 1: Bạn trai xem tin nhắn
    setPartnerStatus('Đã xem');

    // Gọi API Gemini song song trên máy chủ
    const geminiFetchPromise = (async (): Promise<string | null> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000);
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userText,
            history: messages.slice(-10),
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.text && !data.fallback) {
            return data.text;
          }
        }
      } catch (err) {
        // Lỗi kết nối hoặc timeout, chuyển sang dự phòng
      }
      return null;
    })();

    // Bước 2: Chờ thời gian đọc tin nhắn (1.5s - 2.2s) rồi mới bắt đầu hiển thị đang soạn tin
    setTimeout(async () => {
      setIsPartnerTyping(true);
      setPartnerStatus('Gâu Gâu đang soạn tin...');

      let finalReplyText = fallbackReply.text;
      let finalReaction = fallbackReply.reaction;

      // Ưu tiên phản hồi chính xác tuyệt đối cho các câu lệnh then chốt
      const isCriticalPrompt = /em nho anh|e nho anh|nho anh|muon gap anh/i.test(userText.trim());
      if (!isCriticalPrompt) {
        const geminiText = await geminiFetchPromise;
        if (geminiText) {
          finalReplyText = geminiText;
          finalReaction = '❤️';
        }
      }

      // Bước 3: Tính toán thời gian gõ phím phù hợp với độ dài câu trả lời
      const typingDuration = Math.max(3200, Math.min(8000, finalReplyText.length * 36 + 2200));

      setTimeout(() => {
        setIsPartnerTyping(false);
        setPartnerStatus('Duy Lâm đang trực tuyến');

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const replyMsg: Message = {
          id: `msg_reply_${Date.now()}`,
          sender: 'partner',
          text: finalReplyText,
          timestamp: timeStr,
          status: 'read',
          reactions: finalReaction ? [{ emoji: finalReaction, count: 1, reactedByMe: false }] : undefined,
        };

        setMessages((prev) => [...prev, replyMsg]);

        // Hiệu ứng rung nhẹ khung chat tạo sự chú ý khi Gâu Gâu gửi tin nhắn đến
        setIsChatShaking(true);
        setTimeout(() => setIsChatShaking(false), 460);

        // Phản hồi rung haptic trên thiết bị di động (nếu được hỗ trợ)
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([35, 45, 35]);
          } catch {
            // Trình duyệt không cấp quyền hoặc không hỗ trợ rung phần cứng
          }
        }

        if (musicConfig.chatFeedbackAudio.receiveSoundEnabled) {
          audioEngine.playReceiveSound(musicConfig.volumeLevels.soundEffects);
        }
      }, typingDuration);
    }, readDelay);
  };

  // Thả cảm xúc vào tin nhắn
  const handleReactToMessage = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const reactions = msg.reactions ? [...msg.reactions] : [];
        const existingIdx = reactions.findIndex((r) => r.emoji === emoji);

        if (existingIdx >= 0) {
          const current = reactions[existingIdx];
          if (current.reactedByMe) {
            current.count = Math.max(0, current.count - 1);
            current.reactedByMe = false;
          } else {
            current.count += 1;
            current.reactedByMe = true;
          }
        } else {
          reactions.push({ emoji, count: 1, reactedByMe: true });
        }

        return { ...msg, reactions: reactions.filter((r) => r.count > 0) };
      })
    );
  };

  // Bật/tắt phát nhạc nền
  const handleToggleMusic = () => {
    const nextState = !musicConfig.playback.isPlaying;
    const updated: MusicSettingsConfig = {
      ...musicConfig,
      playback: { ...musicConfig.playback, isPlaying: nextState },
    };
    setMusicConfig(updated);
    if (nextState) {
      audioEngine.startMusic(updated, currentTrack.audioUrl);
    } else {
      audioEngine.stopMusic();
    }
  };

  const handleSelectTrack = (trackId: string) => {
    const selected = tracks.find((t) => t.id === trackId) || tracks[0];
    const updated: MusicSettingsConfig = {
      ...musicConfig,
      playback: { ...musicConfig.playback, currentTrackId: trackId },
    };
    setMusicConfig(updated);
    if (musicConfig.playback.isPlaying) {
      audioEngine.startMusic(updated, selected.audioUrl);
    }
  };

  return (
    <div 
      className="relative w-screen h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col font-sans select-none bg-slate-950"
      style={{ zoom: 0.9 }}
    >
      
      {/* Nền môi trường rộng phía sau cho màn hình máy tính lớn */}
      <div 
        className="absolute inset-0 opacity-40 blur-2xl scale-110 pointer-events-none"
        style={{
          backgroundImage: "url('./assets/aistudio/image_e82f789c.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-pink-950/40 pointer-events-none" />

      {/* Khung ứng dụng chính: Tối ưu trên điện thoại và căn giữa nổi bật trên màn hình lớn */}
      <div className="relative z-10 w-full h-full max-h-full flex items-center justify-center p-0 md:p-2.5 lg:p-3">
        <div className={`w-full h-full max-h-full max-w-xl md:max-w-2xl bg-slate-900 md:rounded-3xl shadow-2xl md:border md:border-pink-300/40 overflow-hidden flex flex-row relative transition-transform ${isChatShaking ? 'animate-chat-shake ring-2 ring-pink-400/40' : ''}`}>
          
          {/* KHUNG VỰC CHAT CHÍNH VỚI HÌNH NỀN GỐC HIỂN THỊ ĐẦY ĐỦ VÀ SẮC NÉT */}
          <div
            className="flex-1 flex flex-col h-full max-h-full overflow-hidden relative"
            style={{
              backgroundImage: "url('./assets/aistudio/image_e82f789c.png')",
              backgroundSize: bgFit,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Lớp phủ tương phản nhẹ nhàng bảo toàn 100% chi tiết ảnh gốc nhưng giúp chữ tin nhắn luôn sắc nét */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 pointer-events-none" />

            {/* Thanh tiêu đề trò chuyện */}
            <ChatHeader
              partnerName="Gâu Gâu 🐶"
              statusText={partnerStatus}
              isMusicPlaying={musicConfig.playback.isPlaying}
              currentTrack={currentTrack}
              onOpenMusicSettings={() => setIsMusicModalOpen(true)}
              onToggleMusic={handleToggleMusic}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              isSidebarOpen={isSidebarOpen}
              bgFit={bgFit}
              onToggleBgFit={() => setBgFit((prev) => (prev === 'cover' ? 'contain' : 'cover'))}
              onHeartBurst={() => triggerHeartBurst()}
            />

            {/* Khung hiển thị các tin nhắn */}
            <div
              ref={chatScrollContainerRef}
              className="flex-1 overflow-y-auto px-3.5 sm:px-5 py-3 space-y-1 relative"
            >
              {/* Huy hiệu ghi nhớ ngày hẹn hò CGV Hoàng Văn Thụ */}
              <div className="flex items-center justify-center my-2">
                <div className="px-3.5 py-1 rounded-full bg-black/40 border border-white/20 backdrop-blur-md shadow-xs text-[11px] font-medium text-pink-200 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-pink-400" />
                  <span>08/11/2026 · CGV Hoàng Văn Thụ</span>
                </div>
              </div>

              {/* Danh sách tin nhắn */}
              {messages.map((message) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  onReact={handleReactToMessage}
                  onOpenImage={(url, caption) => setPreviewImage({ url, caption })}
                  sfxVolume={musicConfig.volumeLevels.soundEffects}
                />
              ))}

              {/* Chỉ báo trạng thái đang gõ phím của Duy Lâm */}
              {isPartnerTyping && (
                <div className="flex items-center gap-2 my-2 text-slate-700 text-xs animate-in fade-in duration-200">
                  <div className="w-8 h-8 rounded-full bg-white/95 border border-pink-200 flex items-center justify-center text-sm shadow-sm">
                    🐶
                  </div>
                  <div className="px-3.5 py-2 rounded-2xl rounded-tl-xs bg-white/95 backdrop-blur-md border border-pink-200 shadow-md flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[11px] text-pink-700 font-semibold ml-1">Gâu Gâu đang soạn tin...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Ô nhập liệu và nút gửi tối giản, sạch đẹp */}
            <ChatInput
              onSendMessage={handleSendMessage}
              typingSoundEnabled={musicConfig.chatFeedbackAudio.typingSoundEnabled}
              sfxVolume={musicConfig.volumeLevels.soundEffects}
              onHeartBurst={() => triggerHeartBurst()}
            />
          </div>

          {/* BẢNG THÔNG TIN KỶ NIỆM (BÊN PHẢI) */}
          <MemorySidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            currentTrack={currentTrack}
            config={musicConfig}
            onOpenMusicSettings={() => setIsMusicModalOpen(true)}
            onOpenImage={(url, caption) => setPreviewImage({ url, caption })}
          />
        </div>
      </div>

      {/* Bảng cài đặt âm nhạc có cấu trúc */}
      <MusicSettingsModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        config={musicConfig}
        onUpdateConfig={setMusicConfig}
        tracks={tracks}
        currentTrack={currentTrack}
        onSelectTrack={handleSelectTrack}
      />

      {/* Hiệu ứng chùm tim bay nổi */}
      <FloatingHearts hearts={floatingHearts} />

      {/* Cửa sổ xem ảnh phóng to sắc nét */}
      <ImagePreviewModal
        imageUrl={previewImage?.url || null}
        caption={previewImage?.caption}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}
