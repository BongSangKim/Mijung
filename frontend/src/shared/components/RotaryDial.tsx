import React, { useState, useRef, useEffect } from 'react';
import useSound from 'use-sound';

interface RotaryDialProps {
  value: number;
  onChange: (value: number) => void;
  max: number;
  label: string;
  isFocused: boolean;
  onFocus: () => void;
}

const RotaryDial: React.FC<RotaryDialProps> = ({
  value,
  onChange,
  max,
  label,
  isFocused,
  onFocus,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [animatedValue, setAnimatedValue] = useState(value);
  const [playClick] = useSound('/sounds/click.wav', { volume: 0.5 });

  useEffect(() => {
    setAnimatedValue(value);
  }, [value]);

  const handleStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
  };

  const handleMove = (clientY: number) => {
    if (!isDragging) return;
    const deltaY = startY - clientY;
    if (Math.abs(deltaY) > 20) {
      // 틱틱 걸리는 느낌을 위해 임계값 증가
      const newValue = (value + Math.sign(deltaY) + max + 1) % (max + 1);
      onChange(newValue);
      setStartY(clientY);
      playClick();
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newValue = (value + Math.sign(e.deltaY) + max + 1) % (max + 1);
    onChange(newValue);
    playClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    // 키보드 이벤트 처리는 상위 컴포넌트에서 수행합니다.
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      handleStart(e.touches[0].clientY);
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e.touches[0].clientY);
    };
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      handleEnd();
    };

    container.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    container.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, startY, value, max, onChange]);

  return (
    <div
      className={`flex flex-col items-center select-none ${isFocused ? 'ring-1 ring-blue-400' : ''}`}
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={(e) => handleStart(e.clientY)}
      onMouseMove={(e) => handleMove(e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
    >
      <div className="text-sm font-light mb-2">{label}</div>
      <div className="relative w-16 h-28 bg-gray-700 rounded-md overflow-hidden">
        <div
          className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-100 ease-in-out"
          style={{ transform: `translateY(${(value - animatedValue) * 28}px)` }}
        >
          {[...Array(5)].map((_, i) => {
            const itemValue = (value - 2 + i + max + 1) % (max + 1);
            return (
              <div
                key={i}
                className={`text-xl font-light ${i === 2 ? 'text-white scale-110' : 'text-gray-400'} transition-all duration-100`}
              >
                {itemValue.toString().padStart(2, '0')}
              </div>
            );
          })}
        </div>
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-gray-800 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-gray-800 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-1/2 h-8 border-y border-gray-600 pointer-events-none transform -translate-y-1/2" />
      </div>
    </div>
  );
};

export default RotaryDial;
