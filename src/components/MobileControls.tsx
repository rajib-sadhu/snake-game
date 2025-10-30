import React from 'react';

interface MobileControlsProps {
  onDirectionChange: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
}

const MobileControls: React.FC<MobileControlsProps> = ({ onDirectionChange }) => {
  return (
    <div className="flex flex-col items-center mt-4 md:hidden">
      <div className="grid grid-cols-3 gap-2">
        <div></div>
        <button
          onClick={() => onDirectionChange('UP')}
          className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold hover:bg-gray-300 active:bg-gray-400 transition-colors"
        >
          ↑
        </button>
        <div></div>
        
        <button
          onClick={() => onDirectionChange('LEFT')}
          className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold hover:bg-gray-300 active:bg-gray-400 transition-colors"
        >
          ←
        </button>
        <div className="w-24 h-24"></div>
        <button
          onClick={() => onDirectionChange('RIGHT')}
          className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold hover:bg-gray-300 active:bg-gray-400 transition-colors"
        >
          →
        </button>
        
        <div></div>
        <button
          onClick={() => onDirectionChange('DOWN')}
          className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold hover:bg-gray-300 active:bg-gray-400 transition-colors"
        >
          ↓
        </button>
        <div></div>
      </div>
    </div>
  );
};

export default MobileControls;