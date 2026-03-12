import React, { useState } from 'react';

interface FadeInImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

const FadeInImage: React.FC<FadeInImageProps> = ({ src, alt, className, loading = "lazy" }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-stone-100 ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-stone-200" />
      )}
      <img
        src={error ? "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&q=60&w=800" : src}
        alt={alt}
        loading={loading}
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};

export default React.memo(FadeInImage);
