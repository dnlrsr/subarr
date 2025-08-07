import { useEffect, useState } from 'react';

function Thumbnail({ className, src, alt, placeholder = 'https://placehold.co/160x90?text=Thumbnail+loading...', width, height, maxRetries = 5 }) {
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (attempt >= maxRetries) return;
  
    const bustedSrc = src + (src.includes('?') ? '&' : '?') + `t=${Date.now()}`;
    const img = new Image();
  
    img.onload = () => {
      setCurrentSrc(bustedSrc);
    };
  
    img.onerror = () => {
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      const retryTimer = setTimeout(() => {
        setAttempt(prev => prev + 1);
      }, delay);
      return () => clearTimeout(retryTimer);
    };
  
    img.src = bustedSrc;
  }, [attempt, src, maxRetries]);  

  return (
    <img
      className={className}
      src={currentSrc}
      alt={alt}
      width={width ?? 160}
      height={height ?? 90}
      loading="lazy"
      style={{ objectFit: 'cover', maxWidth: '100%' }}
    />
  );
}

export default Thumbnail;