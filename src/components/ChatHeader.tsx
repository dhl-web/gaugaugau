import React from 'react';
import { Heart, Info, VolumeX, Sliders, Maximize2, Minimize2 } from 'lucide-react';
import { Track } from '../types/chat';

interface ChatHeaderProps {
  partnerName: string;
  statusText: string;
  isMusicPlaying: boolean;
  currentTrack: Track;
  onOpenMusicSettings: () => void;
  onToggleMusic: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  bgFit: 'cover' | 'contain';
  onToggleBgFit: () => void;
  onHeartBurst: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  partnerName,
  statusText,
  isMusicPlaying,
  currentTrack,
  onOpenMusicSettings,
  onToggleMusic,
  onToggleSidebar,
  isSidebarOpen,
  bgFit,
  onToggleBgFit,
  onHeartBurst,
}) => {
  return (
    <header className="shrink-0 z-30 w-full px-3 sm:px-4 pt-2.5 sm:pt-3 pb-2.5 bg-white/95 sm:bg-white/90 backdrop-blur-md border-b border-pink-200/80 shadow-xs flex items-center justify-between gap-2 transition-all">
      
      {/* Left zone: Avatar & Full Partner Information (Ưu tiên hiển thị trọn vẹn tên Gâu Gâu 🐶) */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="relative shrink-0 cursor-pointer group" onClick={onHeartBurst} title="Gâu Gâu (Duy Lâm)">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-0.5 bg-gradient-to-tr from-pink-400 via-rose-300 to-pink-500 shadow-sm shadow-pink-500/25">
            <img
              src="./assets/aistudio/image_e82f789c.png"
              alt={partnerName}
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-cover object-center group-hover:scale-105 transition-transform"
            />
          </div>
          {/* Subtle online indicator */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-white" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm sm:text-base font-bold text-slate-800 whitespace-nowrap leading-tight">
              {partnerName}
            </h1>
            <span className="text-xs text-pink-500 shrink-0">✨</span>
          </div>
          <p className="text-[11px] sm:text-xs text-pink-600 font-medium truncate flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse shrink-0" />
            <span className="truncate">{statusText}</span>
          </p>
        </div>
      </div>

      {/* Right zone: Compact, responsive action controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        
        {/* Nút nhạc nền Phép Màu tinh gọn */}
        <div className="flex items-center bg-pink-100/90 hover:bg-pink-100 border border-pink-200 rounded-full px-2 py-1 transition-all">
          <button
            onClick={onToggleMusic}
            className="flex items-center gap-1.5 text-xs text-pink-800 font-medium hover:text-pink-950 transition-colors"
            title={isMusicPlaying ? 'Tạm dừng nhạc Phép Màu' : 'Bật nhạc nền Phép Màu'}
          >
            {isMusicPlaying ? (
              <div className="flex items-end gap-0.5 h-3.5 w-3.5">
                <span className="w-1 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="hidden md:inline max-w-[85px] truncate text-[11px]">
              {isMusicPlaying ? currentTrack.title : 'Phép Màu'}
            </span>
          </button>

          {/* Cài đặt âm nhạc chi tiết */}
          <button
            onClick={onOpenMusicSettings}
            className="ml-1 w-5 h-5 rounded-full bg-white text-pink-600 hover:bg-pink-500 hover:text-white flex items-center justify-center transition-all shadow-2xs"
            title="Cài đặt âm nhạc chi tiết"
          >
            <Sliders className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Nút chuyển đổi xem trọn ảnh nền (Contain) / Tràn viền (Cover) */}
        <button
          onClick={onToggleBgFit}
          className="w-8 h-8 rounded-full bg-white/90 hover:bg-pink-100 border border-pink-200 text-pink-700 flex items-center justify-center transition-all shadow-2xs"
          title={bgFit === 'contain' ? 'Đang vừa trọn ảnh gốc (Bấm để tràn viền)' : 'Đang tràn viền (Bấm để xem trọn viền ảnh)'}
        >
          {bgFit === 'contain' ? (
            <Maximize2 className="w-3.5 h-3.5" />
          ) : (
            <Minimize2 className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Nút thả tim bay phát sáng */}
        <button
          onClick={onHeartBurst}
          className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-xs shadow-pink-500/30 hover:bg-pink-600 active:scale-90 transition-all"
          title="Thả chùm tim phát sáng"
        >
          <Heart className="w-3.5 h-3.5 fill-white" />
        </button>

        {/* Nút mở kỷ niệm ngày 08/11/2026 */}
        <button
          onClick={onToggleSidebar}
          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors shadow-2xs ${
            isSidebarOpen
              ? 'bg-pink-100 text-pink-700 border-pink-300'
              : 'bg-white/90 text-slate-600 border-pink-200 hover:bg-pink-50'
          }`}
          title="Kỷ niệm CGV Hoàng Văn Thụ"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
