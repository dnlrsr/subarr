import React from 'react';
import { Spinner } from 'react-bootstrap';
import { LoadingIndicatorProps } from '../../types';

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  size = 'medium'
}) => {
  const spinnerSize = size === 'small' ? 'sm' : undefined;

  return (
    <Spinner animation="border" size={spinnerSize} />
  );
};

export default LoadingIndicator;
