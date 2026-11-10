import React, { useState } from 'react';
import { CheckCheck, Check, Heart, Play, Pause, SmilePlus, Image as ImageIcon } from 'lucide-react';
import { Message } from '../types/chat';
import { audioEngine } from '../utils/audioEngine';

interface ChatMessageItemProps {
  message: Message;
  onReact: (messageId: string, emoji: string) => void;
  onOpenImage: (imageUrl: string, caption?: string) => void;
  sfxVolume: number;
}

const QUICK_EMOJIS = ['💖', '🥰', '🌸', '🍿', '✨', '🎬'];

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onReact,
  onOpenImage,
  sfxVolume,
}) => {
  const isMe = message.sender === 'me';
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const handleToggleVoice = () => {
    setIsPlayingVoice(!isPlayingVoice);
    if (!isPlayingVoice) {
      audioEngine.playHeartSound(sfxVolume);
      setTimeout(() => setIsPlayingVoice(false), (message.voiceMemo?.duration || 10) * 1000);
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    onReact(message.id, emoji);
    setShowEmojiPicker(false);
    audioEngine.playHeartSound(sfxVolume);
  };

  return (
    <div className={`group flex flex-col ${isMe ? 'items-end' : 'items-start'} my-2.5 transition-all`}>
      <div className={`relative max-w-[85%] sm:max-w-[72%] flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Message Bubble Container with soft rounded corners */}
        <div
          className={`relative px-4 py-3 shadow-sm transition-all ${
            isMe
              ? 'bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 text-white rounded-3xl rounded-tr-md shadow-pink-500/15'
              : 'bg-white/90 text-slate-800 rounded-3xl rounded-tl-md border border-pink-100/90 shadow-pink-900/5 backdrop-blur-md'
          }`}
        >
          {/* Image attachment if present */}
          {message.image && (
            <div className="mb-2.5 overflow-hidden rounded-2xl border border-pink-200/50 group/img relative cursor-pointer"
                 onClick={() => onOpenImage(message.image!, message.imageCaption)}>
              <img
                src={message.image}
                alt="Hình ảnh kỷ niệm"
                referrerPolicy="no-referrer"
                className="w-full max-h-64 object-cover rounded-2xl hover:scale-[1.02] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-2.5">
                <span className="text-[11px] text-white/95 flex items-center gap-1 font-medium">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Nhấn để xem ảnh phóng to
                </span>
              </div>
              {message.imageCaption && (
                <div className={`px-2.5 py-1.5 text-xs font-medium ${isMe ? 'text-pink-100' : 'text-pink-900/90'}`}>
                  {message.imageCaption}
                </div>
              )}
            </div>
          )}

          {/* Voice Memo if present */}
          {message.voiceMemo && (
            <div className={`flex items-center gap-3 p-2.5 rounded-2xl mb-2 ${
              isMe ? 'bg-white/20' : 'bg-pink-50/80 border border-pink-100'
            }`}>
              <button
                onClick={handleToggleVoice}
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
                  isMe ? 'bg-white text-pink-600' : 'bg-pink-500 text-white shadow-sm'
                }`}
              >
                {isPlayingVoice ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              {/* Waveform bars */}
              <div className="flex-1 flex items-center gap-0.5 h-6">
                {message.voiceMemo.waveformData.map((height, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all duration-200 ${
                      isMe ? 'bg-white/70' : 'bg-pink-400'
                    } ${isPlayingVoice ? 'animate-pulse' : ''}`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <span className={`text-[11px] font-mono shrink-0 ${isMe ? 'text-pink-100' : 'text-slate-500'}`}>
                0:{String(message.voiceMemo.duration).padStart(2, '0')}
              </span>
            </div>
          )}

          {/* Text message */}
          {message.text && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap font-normal select-text">
              {message.text}
            </p>
          )}

          {/* Message Footer: Timestamp & status */}
          <div className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
            isMe ? 'text-pink-100/80' : 'text-slate-400'
          }`}>
            <span>{message.timestamp}</span>
            {isMe && (
              <span>
                {message.status === 'read' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-pink-200" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-pink-200" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Reaction Trigger Button (Hover / Tap) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-7 h-7 rounded-full bg-white/80 hover:bg-pink-100 text-slate-500 hover:text-pink-600 flex items-center justify-center shadow-xs border border-pink-100 transition-colors"
            title="Thả cảm xúc"
          >
            <SmilePlus className="w-3.5 h-3.5" />
          </button>

          {/* Emoji Floating Picker */}
          {showEmojiPicker && (
            <div className={`absolute bottom-full mb-1.5 z-30 flex items-center gap-1 p-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-pink-200/80 animate-in fade-in zoom-in-95 duration-150 ${
              isMe ? 'right-0' : 'left-0'
            }`}>
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSelectEmoji(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-base hover:scale-125 transition-transform active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rendered Reaction Badges */}
      {message.reactions && message.reactions.length > 0 && (
        <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'mr-2' : 'ml-2'}`}>
          {message.reactions.map((reaction, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectEmoji(reaction.emoji)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all border ${
                reaction.reactedByMe
                  ? 'bg-pink-100/90 text-pink-700 border-pink-300 shadow-xs'
                  : 'bg-white/80 text-slate-600 border-pink-100 hover:bg-pink-50'
              }`}
            >
              <span>{reaction.emoji}</span>
              <span className="font-mono text-[10px] font-semibold">{reaction.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
