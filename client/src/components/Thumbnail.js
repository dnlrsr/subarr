import { useEffect, useState } from 'react';

function Thumbnail({ className, src, alt, fallback = 'https://placehold.co/160x90?text=Thumbnail+loading...', width, height, maxRetries = 5 }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!error || attempt >= maxRetries) return;

    const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, ...

    const timer = setTimeout(() => {
      // Add cache-busting to avoid CDN returning cached error
      const bustedSrc = src + (src.includes('?') ? '&' : '?') + `t=${Date.now()}`;
      setCurrentSrc(bustedSrc);
      setError(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [error, attempt, src, maxRetries]);

  const handleError = () => {
    setError(true);
    setAttempt(prev => prev + 1);
  };

  return (
    <img
      className={className}
      src={error && attempt >= maxRetries ? fallback : currentSrc} // Todo: I'd like this to show the fallback immediately, then only update when the true src has been loaded successfully
      alt={alt}
      width={width ?? 160}
      height={height ?? 90}
      loading="lazy"
      onError={handleError}
      style={{ objectFit: 'cover', maxWidth: '100%' }}
    />
  );
}

export default Thumbnail;