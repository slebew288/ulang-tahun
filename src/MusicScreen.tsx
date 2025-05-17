import { useState, useRef, useEffect } from 'react';

interface MusicScreenProps {
    songs: Array<{
        title: string;
        artist: string;
        url: string;
        image: string; // <-- Tambahkan ini
    }>;
    sounds: {
        click: string;
    };
}

export default function MusicScreen({ songs, sounds }: MusicScreenProps) {
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const clickSoundRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play()
                    .catch(err => console.warn("Error playing music:", err));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentSongIndex]);

    useEffect(() => {
        const updateProgress = () => {
            if (audioRef.current) {
                const percentage = (audioRef.current.currentTime / audioRef.current.duration) * 100;
                setProgress(isNaN(percentage) ? 0 : percentage);
            }
        };

        const timer = setInterval(updateProgress, 1000);
        return () => clearInterval(timer);
    }, []);

    const handlePlayPause = () => {
        if (clickSoundRef.current) {
            clickSoundRef.current.currentTime = 0;
            clickSoundRef.current.play().catch(err => console.warn("Error playing click sound:", err));
        }
        setIsPlaying(!isPlaying);
    };

    const handlePrevSong = () => {
        if (clickSoundRef.current) {
            clickSoundRef.current.currentTime = 0;
            clickSoundRef.current.play().catch(err => console.warn("Error playing click sound:", err));
        }
        setCurrentSongIndex(prev => (prev === 0 ? songs.length - 1 : prev - 1));
        setIsPlaying(true);
    };

    const handleNextSong = () => {
        if (clickSoundRef.current) {
            clickSoundRef.current.currentTime = 0;
            clickSoundRef.current.play().catch(err => console.warn("Error playing click sound:", err));
        }
        setCurrentSongIndex(prev => (prev === songs.length - 1 ? 0 : prev + 1));
        setIsPlaying(true);
    };

    const handleSongEnd = () => {
        handleNextSong();
    };

    const handleSongSelection = (index: number) => {
        if (clickSoundRef.current) {
            clickSoundRef.current.currentTime = 0;
            clickSoundRef.current.play().catch(err => console.warn("Error playing click sound:", err));
        }
        setCurrentSongIndex(index);
        setIsPlaying(true);
    };

    const currentSong = songs[currentSongIndex];

    return (
        <div className="screen music-screen">
            <h2 className="screen-title">Music Player</h2>

            <div className="music-player">
                <div className="now-playing">
                    <div className="song-info">
                        <img
                            src={currentSong.image}
                            alt="Album cover"
                            className="song-image"
                        />
                        <h3>{currentSong.title}</h3>
                        <p>{currentSong.artist}</p>
                    </div>

                    <div className="progress-bar">
                        <div className="progress" style={{ width: `${progress}%` }}></div>
                    </div>

                    <div className="controls">
                        <button className="control-button" onClick={handlePrevSong}>⏮</button>
                        <button className="control-button play-pause" onClick={handlePlayPause}>
                            {isPlaying ? '⏸' : '▶'}
                        </button>
                        <button className="control-button" onClick={handleNextSong}>⏭</button>
                    </div>
                </div>

                <div className="playlist">
                    <h3>Playlist</h3>
                    <ul>
                        {songs.map((song, index) => (
                            <li
                                key={index}
                                className={index === currentSongIndex ? 'active' : ''}
                                onClick={() => handleSongSelection(index)}
                            >
                                <span className="song-number">{index + 1}</span>
                                <span className="song-title">{song.title}</span>
                                <span className="song-artist">{song.artist}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={currentSong.url}
                onEnded={handleSongEnd}
            />
            <audio ref={clickSoundRef} src={sounds.click} />
        </div>
    );
}