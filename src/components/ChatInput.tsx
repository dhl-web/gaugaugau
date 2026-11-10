import React, { useState, useRef } from 'react';
import { Send, Smile, Paperclip, Heart, Mic } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface ChatInputProps {
  onSendMessage: (text: string, options?: { image?: string; voiceMemo?: boolean }) => void;
  typingSoundEnabled: boolean;
  sfxVolume: number;
  onHeartBurst: () => void;
}

const COMMON_EMOJIS = ['💕', '🥰', '🌸', '🍿', '🥤', '✨', '🎬', '🫶', '🥺', '💖'];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  typingSoundEnabled,
  sfxVolume,
  onHeartBurst,
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typingSoundEnabled && e.key.length === 1) {
      audioEngine.playKeyClick(sfxVolume);
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
    setShowEmojiPicker(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSendPhoto = () => {
    onSendMessage('Gửi lại bức ảnh kỷ niệm CGV Hoàng Văn Thụ hai đứa mình nắm tay nè! ❤️', {
      image: './assets/aistudio/image_e82f789c.png',
    });
  };

  const handleSendVoice = () => {
    onSendMessage('', { voiceMemo: true });
  };

  const handleAddEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="sticky bottom-0 z-30 p-2.5 sm:p-3.5 bg-gradient-to-t from-black/50 via-black/30 to-transparent backdrop-blur-xs">

      {/* Emoji Floating Panel */}
      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2 left-4 right-4 sm:left-6 sm:right-auto sm:w-80 p-3 bg-white/95 backdrop-blur-lg rounded-3xl shadow-xl border border-pink-200/80 z-40 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-pink-100 text-xs font-semibold text-slate-700">
            <span>Biểu tượng cảm xúc ngọt ngào</span>
            <button onClick={() => setShowEmojiPicker(false)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <div className="grid grid-cols-5 gap-2 pt-2 text-xl">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleAddEmoji(emoji)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-pink-100/70 transition-transform hover:scale-115 active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Control Pill */}
      <div className="relative flex items-center gap-2 bg-white/90 border border-pink-200/90 rounded-full p-1.5 pl-3 shadow-md shadow-pink-500/5 focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-400/20 transition-all">
        
        {/* Emoji trigger */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0 ${
            showEmojiPicker ? 'text-pink-600 bg-pink-100' : 'text-slate-400 hover:text-pink-600 hover:bg-pink-50'
          }`}
          title="Chọn biểu cảm"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn yêu thương..."
          className="flex-1 bg-transparent py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
        />

        {/* Media / Quick Attach Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleSendPhoto}
            className="w-9 h-9 rounded-full text-slate-400 hover:text-pink-600 hover:bg-pink-50 flex items-center justify-center transition-colors"
            title="Gửi ảnh kỷ niệm CGV"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleSendVoice}
            className="w-9 h-9 rounded-full text-slate-400 hover:text-pink-600 hover:bg-pink-50 flex items-center justify-center transition-colors hidden sm:flex"
            title="Gửi tin nhắn thoại"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onHeartBurst}
            className="w-9 h-9 rounded-full text-pink-500 hover:text-pink-600 hover:bg-pink-100/70 flex items-center justify-center transition-transform active:scale-90"
            title="Thả chùm tim"
          >
            <Heart className="w-4 h-4 fill-pink-500" />
          </button>

          {/* Primary Send CTA */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
              text.trim()
                ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-md shadow-pink-500/30 hover:brightness-105 active:scale-95'
                : 'bg-pink-100 text-pink-300 cursor-not-allowed'
            }`}
            title="Gửi tin nhắn"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
