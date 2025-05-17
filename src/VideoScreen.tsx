import { useState, useRef, useEffect } from 'react';

interface VideoScreenProps {
  videoSrc: string;
  onVideoEnded: () => void;
}

export default function VideoScreen({ videoSrc, onVideoEnded}: VideoScreenProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(error => {
        console.error("Video playback failed:", error);
      });
    }
    
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
    onVideoEnded();
  };

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(error => {
          console.error("Video playback failed:", error);
        });
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  return (
    <div className="screen video-screen">
      <div className="video-container">
        <video
          ref={videoRef}
          src={videoSrc}
          controls={false}
          onEnded={handleVideoEnded}
          onClick={toggleVideoPlayback}
          className="video"
        />
        <div className="video-overlay" onClick={toggleVideoPlayback}>
          {!isVideoPlaying && <div className="play-icon">▶</div>}
        </div>
      </div>
    </div>
  );
}