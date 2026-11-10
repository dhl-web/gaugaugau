import React from 'react';
import { X, Calendar, MapPin, Heart, Film, Popcorn, Music, Sliders, ExternalLink } from 'lucide-react';
import { MusicSettingsConfig, Track } from '../types/chat';

interface MemorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: Track;
  config: MusicSettingsConfig;
  onOpenMusicSettings: () => void;
  onOpenImage: (url: string, caption?: string) => void;
}

export const MemorySidebar: React.FC<MemorySidebarProps> = ({
  isOpen,
  onClose,
  currentTrack,
  config,
  onOpenMusicSettings,
  onOpenImage,
}) => {
  if (!isOpen) return null;

  return (
    <aside className="w-80 sm:w-88 h-full bg-white/90 backdrop-blur-xl border-l border-pink-200/80 flex flex-col shadow-xl z-30 animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-pink-100">
        <div className="flex items-center gap-2 text-pink-700 font-bold text-sm">
          <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
          <span>Kỷ Niệm & Cài Đặt</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-pink-100/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-700 text-xs">
        
        {/* Photo Memory Card */}
        <div className="p-3.5 rounded-3xl bg-gradient-to-b from-pink-50 to-white border border-pink-200 shadow-sm space-y-3">
          <div
            className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-xs"
            onClick={() => onOpenImage('./assets/aistudio/image_e82f789c.png', 'Kỷ niệm CGV Hoàng Văn Thụ 08/11/2026')}
          >
            <img
              src="./assets/aistudio/image_e82f789c.png"
              alt="Kỷ niệm CGV Hoàng Văn Thụ"
              referrerPolicy="no-referrer"
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2.5">
              <span className="text-white text-[11px] font-medium flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5" />
                Xem ảnh gốc sắc nét
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1.5 text-pink-700 font-bold text-sm">
              <Calendar className="w-3.5 h-3.5" />
              <span>08/11/2026</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <MapPin className="w-3.5 h-3.5 text-pink-500" />
              <span>CGV Hoàng Văn Thụ, TP. Hồ Chí Minh</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Popcorn className="w-3.5 h-3.5 text-amber-500" />
              <span>Bắp rang Tom Yum & Đồ uống thơm mát</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Film className="w-3.5 h-3.5 text-indigo-500" />
              <span>Hai chiếc vé xem phim cùng nắm tay</span>
            </div>
          </div>
        </div>

        {/* Music Mini Status Card */}
        <div className="p-4 rounded-3xl bg-pink-50/70 border border-pink-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-pink-600" />
              Âm Nhạc Đang Phát
            </span>
            <button
              onClick={onOpenMusicSettings}
              className="text-[11px] font-semibold text-pink-600 hover:text-pink-800 flex items-center gap-1"
            >
              <Sliders className="w-3 h-3" />
              Cài đặt chi tiết
            </button>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-pink-100 shadow-2xs space-y-1">
            <div className="font-bold text-slate-800 text-xs truncate">{currentTrack.title}</div>
            <div className="text-[11px] text-slate-500">{currentTrack.artist} · {currentTrack.genre}</div>
            <div className="text-[10px] text-pink-600/90 font-medium">{currentTrack.mood}</div>
          </div>

          <div className="space-y-1 text-[11px] text-slate-600">
            <div className="flex justify-between">
              <span>Âm lượng nhạc nền:</span>
              <span className="font-mono font-bold text-pink-600">{config.volumeLevels.masterMusic}%</span>
            </div>
            <div className="flex justify-between">
              <span>Cấu hình Equalizer:</span>
              <span className="font-mono font-medium text-slate-700">{config.equalizer.preset}</span>
            </div>
            <div className="flex justify-between">
              <span>Âm thanh không gian:</span>
              <span className="font-medium text-slate-700">{config.ambience.activeLayer}</span>
            </div>
          </div>

          <button
            onClick={onOpenMusicSettings}
            className="w-full py-2 px-3 rounded-xl bg-pink-500 text-white font-semibold text-xs shadow-xs hover:bg-pink-600 transition-colors text-center"
          >
            Mở Cài Đặt Âm Nhạc Có Cấu Trúc
          </button>
        </div>

        {/* Sweet Quotes / Message Note */}
        <div className="p-4 rounded-3xl bg-white/70 border border-pink-100 space-y-2">
          <div className="text-xs font-bold text-pink-800 flex items-center gap-1.5">
            <span>💌 Nhật Ký Nắm Tay</span>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed italic handwritten text-sm">
            “Giữa không gian rạp chiếu phim mờ ảo, hai bàn tay đan chặt vào nhau. Chiếc vòng tim phát sáng em vẽ lên bức ảnh sẽ mãi là kỷ niệm ngọt ngào nhất.”
          </p>
        </div>
      </div>
    </aside>
  );
};
