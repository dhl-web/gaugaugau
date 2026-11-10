import React from 'react';
import { X, Download } from 'lucide-react';

interface ImagePreviewModalProps {
  imageUrl: string | null;
  caption?: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  imageUrl,
  caption,
  onClose,
}) => {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full bg-white/10 p-2 sm:p-4 rounded-3xl border border-white/20 backdrop-blur-xl shadow-2xl flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex items-center justify-between pb-3 px-2">
          <span className="text-sm font-semibold text-white/90">
            {caption || 'Kỷ niệm CGV Hoàng Văn Thụ · 08/11/2026'}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              download="ky-niem-cgv.png"
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
              title="Tải ảnh về"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl max-h-[78vh] flex items-center justify-center">
          <img
            src={imageUrl}
            alt="Ảnh xem chi tiết"
            referrerPolicy="no-referrer"
            className="w-auto h-auto max-h-[75vh] object-contain rounded-2xl shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};
