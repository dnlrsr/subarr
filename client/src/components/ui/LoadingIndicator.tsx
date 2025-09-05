import React from 'react';
import { LoadingIndicatorProps } from '../../types';

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  size = 'medium', 
  color 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div 
      className={`ripple-loader ${sizeClasses[size]}`}
      style={color ? { color } : undefined}
    >
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default LoadingIndicator;
