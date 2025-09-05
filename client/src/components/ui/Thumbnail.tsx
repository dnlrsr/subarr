import React, { useEffect, useState } from 'react';
import { ThumbnailProps } from '../../types';

const Thumbnail: React.FC<ThumbnailProps> = ({ 
  className, 
  src, 
  alt, 
  width = 160, 
  height = 90 
}) => {
  const placeholder = 'https://placehold.co/160x90?text=Thumbnail+loading...';
  const maxRetries = 5;
  
  const [currentSrc, setCurrentSrc] = useState<string>(placeholder);
  const [attempt, setAttempt] = useState<number>(0);

  useEffect(() => {
    if (!src || attempt >= maxRetries) {
      return;
    }
  
    // wsrv.nl is a free & open-source image caching service
    const cachedSrc = `https://wsrv.nl/?url=${src}`;
    const img = new Image();
  
    img.onload = () => {
      setCurrentSrc(cachedSrc);
    };
  
    img.onerror = () => {
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      const retryTimer = setTimeout(() => {
        setAttempt(prev => prev + 1);
      }, delay);
      return () => clearTimeout(retryTimer);
    };
  
    img.src = cachedSrc;
  }, [attempt, src, maxRetries]);  

  return (
    <img
      className={className}
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      style={{ objectFit: 'cover', maxWidth: '100%' }}
    />
  );
};

export default Thumbnail;
