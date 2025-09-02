"use client";

import { useState, useRef, useEffect } from "react";
import { ImageWithFallback } from "./ImageWithFallback";

interface VideoWithFallbackProps {
  videoSrc: string;
  imageSrc: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export function VideoWithFallback({
  videoSrc,
  imageSrc,
  alt,
  className,
  style,
}: VideoWithFallbackProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsVideoLoaded(true);
      video.play().catch(() => {
        // If autoplay fails, still show the video but it won't play automatically
        console.warn("Video autoplay was prevented by browser");
      });
    };

    const handleError = () => {
      setHasError(true);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <div className={className} style={style}>
      {/* Video element */}
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isVideoLoaded && !hasError ? "opacity-100" : "opacity-0"
        }`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* Fallback image */}
      <ImageWithFallback
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isVideoLoaded && !hasError ? "opacity-0" : "opacity-100"
        }`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
