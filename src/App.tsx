import { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import TypingText from './TypingText.tsx';
import PhotoScreen from './PhotoScreen';
import MusicScreen from './MusicScreen';
import VideoScreen from './VideoScreen';
import BirthdayScreen from './BirthdayScreen';
import data from './data.json';
import './App.css';
import './BirthdayScreen.css';
import './PhotoScreen.css';
import './TypingText.css';
import './VideoScreen.css';
import './MusicScreen.css';
import './TetrisStyles.css';

interface AppData {
  message: string;
  photos: PhotoData[];
  captions: string[];
  songs: Array<{
    title: string;
    artist: string;
    url: string;
  }>;
  video: string;
  sounds: {
    background: string;
    birthday: string;
    click: string;
    photoprint: string;
    photo: string;
    textScreen: string;
    photoScreen: string;
    musicgame: string;
    gameover: string;
  };
}

interface PhotoData {
  url: string;
  title: string;
}

const typedData = data as unknown as AppData;
type Step = 'menu' | 'text' | 'photo' | 'music' | 'video' | 'birthday';

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>('menu');
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const clickSoundRef = useRef<HTMLAudioElement>(null);
  const textScreenAudioRef = useRef<HTMLAudioElement>(null);
  const photoScreenAudioRef = useRef<HTMLAudioElement>(null);
  const [tetriminos, setTetriminos] = useState<Array<{ id: number, type: string, x: number, y: number, duration: number }>>([]);


  useEffect(() => {
    if (currentStep === 'menu') {
      const shapes = ['i', 'j', 'l', 'o', 's', 't', 'z'];
      const newTetriminos = [];


      for (let i = 0; i < 15; i++) {
        const type = shapes[Math.floor(Math.random() * shapes.length)];
        const x = Math.random() * 100;
        const duration = 5 + Math.random() * 10;

        newTetriminos.push({
          id: i,
          type,
          x,
          y: 0,
          duration
        });
      }

      setTetriminos(newTetriminos);
    } else {

      setTetriminos([]);
    }
  }, [currentStep]);

  const navigateTo = useCallback((step: Step) => {
    if (clickSoundRef.current) {
      clickSoundRef.current.play().catch(err => console.warn("Error playing click sound:", err));
    }

    setCurrentStep(step);


    if (bgAudioRef.current) bgAudioRef.current.pause();
    if (textScreenAudioRef.current) textScreenAudioRef.current.pause();
    if (photoScreenAudioRef.current) photoScreenAudioRef.current.pause();

    if (step === 'menu') {
      if (bgAudioRef.current) {
        bgAudioRef.current.play().catch(err => console.warn("Error playing background music:", err));
      }
    } else if (step === 'text') {
      if (textScreenAudioRef.current) {
        textScreenAudioRef.current.play().catch(err => console.warn("Error playing text screen music:", err));
      }
    } else if (step === 'photo') {
      if (photoScreenAudioRef.current) {
        photoScreenAudioRef.current.play().catch(err => console.warn("Error playing photo screen music:", err));
      }
    } else if (step === 'birthday') {

    } else if (step === 'video') {

      setVideoEnded(false);
    }
  }, []);

  const handlePhotoNav = useCallback((direction: 'prev' | 'next') => {
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(err => console.warn("Error playing click sound:", err));
    }

    if (direction === 'prev') {
      setCurrentPhotoIndex(prev => Math.max(0, prev - 1));
    } else {
      setCurrentPhotoIndex(prev => Math.min(typedData.photos.length - 1, prev + 1));
    }
  }, []);

  const handleVideoEnded = useCallback(() => {
    setVideoEnded(true);
  }, []);

  const getPreviousStep = (current: Step): Step => {
    const steps: Step[] = ['menu', 'text', 'photo', 'music', 'video', 'birthday'];
    const index = Math.max(steps.indexOf(current) - 1, 0);
    return steps[index];
  };

  const getNextStep = (current: Step): Step => {
    const steps: Step[] = ['menu', 'text', 'photo', 'music', 'video', 'birthday'];
    const index = Math.min(steps.indexOf(current) + 1, steps.length - 1);
    return steps[index];
  };

  useEffect(() => {
    const loadAudio = async () => {
      try {
        if (currentStep === 'menu' && bgAudioRef.current) {
          await bgAudioRef.current.play();
        } else if (currentStep === 'text' && textScreenAudioRef.current) {
          await textScreenAudioRef.current.play();
        } else if (currentStep === 'photo' && photoScreenAudioRef.current) {
          await photoScreenAudioRef.current.play();
        }
      } catch (err) {
        console.warn("Audio autoplay prevented:", err);
      }
    };

    loadAudio();

    return () => {
      bgAudioRef.current?.pause();
      textScreenAudioRef.current?.pause();
      photoScreenAudioRef.current?.pause();
    };
  }, [currentStep]);

  const renderTetrisGrid = () => {
    return Array.from({ length: 20 }).map((_, rowIndex) => (
      <div key={`grid-row-${rowIndex}`} className="grid-row">
        {Array.from({ length: 10 }).map((_, colIndex) => (
          <div key={`grid-cell-${rowIndex}-${colIndex}`} className="grid-cell" />
        ))}
      </div>
    ));
  };

  const renderTetriminos = () => {
    return tetriminos.map(tetrimino => (
      <div
        key={`tetrimino-${tetrimino.id}`}
        className={`falling-tetrimino tetrimino-${tetrimino.type}`}
        style={{
          left: `${tetrimino.x}%`,
          animation: `falling ${tetrimino.duration}s linear infinite`
        }}
      />
    ));
  };

  return (
    <div className="container">
      {/* Audio elements */}
      <audio ref={bgAudioRef} src={typedData.sounds.background} loop />
      <audio ref={clickSoundRef} src={typedData.sounds.click} />
      <audio ref={textScreenAudioRef} src={typedData.sounds.textScreen} loop />
      <audio ref={photoScreenAudioRef} src={typedData.sounds.photoScreen} loop />

      {/* Tetris grid background */}
      <div className="tetris-grid">{renderTetrisGrid()}</div>

      {/* Animated falling tetriminos */}
      {renderTetriminos()}

      {/* Menu Screen */}
      {currentStep === 'menu' && (
        <div className="screen menu-screen">

          <h1 className="game-title">Birthday Game</h1>
          <div className='svg-cinta'>
            <svg xmlns="http://www.w3.org/2000/svg" width="250px" height="250px" viewBox="0 0 1024 1024" className="icon" version="1.1"><path d="M927.4 273.5v-95.4h-87.9V82.8h-201v95.3h-87.9v95.4h-78.5v-95.4h-88V82.8H183.2v95.3H95.3v95.4H16.7v190.6h78.6v95.4h75.3v95.3H246v95.3h87.9v95.4h100.5v95.3h153.9v-95.3h100.4v-95.4h88v-95.3H852.1v-95.3h75.3v-95.4h78.5V273.5z" fill="#E02D2D" /></svg>
          </div>
          <div className="menu-buttons">
            <button className="menu-button" onClick={() => navigateTo('text')}>PLAY GAMES</button>
          </div>
        </div>
      )}

      {/* Text Screen */}
      {currentStep === 'text' && (
        <div className="screen text-screen">
          {/* <h2 className="screen-title">Dear Hifzi</h2> */}
          <div className="message-container">
            <TypingText texts={[typedData.message]} />
          </div>
        </div>
      )}

      {/* Photo Screen */}
      {currentStep === 'photo' && (
        <>
          <PhotoScreen
            photos={typedData.photos}
            captions={typedData.captions}
            currentPhotoIndex={currentPhotoIndex}
            onNavigate={handlePhotoNav}
            sounds={{ photo: typedData.sounds.photo }}
          />
        </>
      )}

      {/* Music Screen */}
      {currentStep === 'music' && (
        <MusicScreen
          songs={typedData.songs && typedData.songs.length > 0
            ? typedData.songs.map(song => ({
              ...song,
              image: (song as any).image ?? ""
            }))
            : [
              { title: "Birthday Song", artist: "Artist 1", url: typedData.sounds.birthday, image: "" },
              { title: "Background Music", artist: "Artist 2", url: typedData.sounds.background, image: "" },
              { title: "Game Music", artist: "Artist 3", url: typedData.sounds.musicgame, image: "" }
            ]
          }
          sounds={{ click: typedData.sounds.click }}
        />
      )}

      {/* Video Screen */}
      {currentStep === 'video' && (
        <>
          <VideoScreen
            videoSrc={typedData.video}
            onVideoEnded={handleVideoEnded}
          />
          {!videoEnded && (
            <div className="video-message">
              Mohon tunggu hingga video selesai...<br />
              Agar bisa melanjutkan ke permainan selanjutnya
            </div>

          )}
        </>
      )}

      {/* Birthday Screen (Tetris Game) */}
      {currentStep === 'birthday' && (
        <BirthdayScreen
          navigateToMenu={() => navigateTo('menu')}
          sounds={{
            birthday: typedData.sounds.birthday,
            click: typedData.sounds.click,
            photoprint: typedData.sounds.photoprint,
            photo: typedData.sounds.photo,
            textScreen: typedData.sounds.textScreen,
            photoScreen: typedData.sounds.photoScreen,
            background: typedData.sounds.background,
            musicgame: typedData.sounds.musicgame,
            gameover: typedData.sounds.gameover

          }}
        />
      )}

      {/* Global Navigation Buttons */}
      <div className="bottom-navigation">
        {currentStep !== 'menu' && currentStep !== 'birthday' && (
          <>
            <button
              className="nav-button"
              onClick={() => navigateTo(getPreviousStep(currentStep))}
            >
              BACK
            </button>
            {(currentStep !== 'video' || videoEnded) && (
              <button
                className="nav-button"
                onClick={() => navigateTo(getNextStep(currentStep))}
              >
                NEXT
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}