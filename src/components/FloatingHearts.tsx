import React from 'react';

export interface FloatingHeartItem {
  id: number;
  x: number;
  y: number;
  size: number;
  emoji: string;
}

interface FloatingHeartsProps {
  hearts: FloatingHeartItem[];
}

export const FloatingHearts: React.FC<FloatingHeartsProps> = ({ hearts }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {hearts.map((heart) => (
        <span
          key={heart.id}
          className="absolute animate-float-heart select-none drop-shadow-md"
          style={{
            left: `${heart.x}px`,
            top: `${heart.y}px`,
            fontSize: `${heart.size}px`,
          }}
        >
          {heart.emoji}
        </span>
      ))}
    </div>
  );
};
