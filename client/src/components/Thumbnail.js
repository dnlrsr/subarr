import { useEffect, useState } from 'react';

function Thumbnail({ className, src, alt, placeholder = 'https://placehold.co/160x90?text=Thumbnail+loading...', width, height, maxRetries = 5 }) {
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (attempt >= maxRetries)
      return;
  
    // wsrv.nl is a free & open-source image caching service
    const cachedSrc = `https://wsrv.nl/?url=${src}`; // There's also width & height options, but setting those alone seems to produce low resolution images (might need dpr or something as well)
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
      width={width ?? 160}
      height={height ?? 90}
      loading="lazy"
      style={{ objectFit: 'cover', maxWidth: '100%' }}
    />
  );
}

export default Thumbnail;