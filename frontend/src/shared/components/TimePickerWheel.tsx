import React from 'react';

interface TimePickerWheelProps {
  value: number;
  onChange: (value: number) => void;
  max: number;
  label: string;
}

const TimePickerWheel: React.FC<TimePickerWheelProps> = ({
  value,
  onChange,
  max,
  label,
}) => {
  const handleIncrement = () => {
    onChange((value + 1) % (max + 1));
  };

  const handleDecrement = () => {
    onChange((value - 1 + max + 1) % (max + 1));
  };

  return (
    <div className="flex flex-col items-center">
      <button
        className="text-2xl font-bold text-coral hover:text-coral-dark transition-colors"
        onClick={handleIncrement}
        aria-label={`Increase ${label}`}
      >
        ▲
      </button>
      <div className="text-3xl font-bold my-2 text-blueberry">
        {value.toString().padStart(2, '0')}
      </div>
      <button
        className="text-2xl font-bold text-coral hover:text-coral-dark transition-colors"
        onClick={handleDecrement}
        aria-label={`Decrease ${label}`}
      >
        ▼
      </button>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
};

export default TimePickerWheel;
