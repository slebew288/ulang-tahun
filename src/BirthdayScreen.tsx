import { useState, useEffect, useCallback, useRef } from 'react';
import { tetrisPieces, tetrisColors } from './constants';
import Gift from './Gift';
import './BirthdayScreen.css';

interface BirthdayScreenProps {
    navigateToMenu: () => void;
    sounds: {
        birthday: string;
        click: string;
        photoprint: string;
        photo: string;
        textScreen: string;
        photoScreen: string;
        background: string;
        musicgame: string;
        gameover: string;
    };
}
type BoardCell = number | string;
type Board = BoardCell[][];
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_SPEED = 600;
const SPEED_DECREMENT = 50;
const CELL_SIZE = 20;

export default function BirthdayScreen({ navigateToMenu, sounds }: BirthdayScreenProps) {
    const [board, setBoard] = useState<Board>(Array(BOARD_HEIGHT).fill(0).map(() => Array(BOARD_WIDTH).fill(0)));
    const [currentPiece, setCurrentPiece] = useState<number[][]>([]);
    const [currentColor, setCurrentColor] = useState<string>('');
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showGift, setShowGift] = useState(false);
    const birthdayAudioRef = useRef<HTMLAudioElement | null>(null);
    const clickAudioRef = useRef<HTMLAudioElement | null>(null);
    const gameOverAudioRef = useRef<HTMLAudioElement | null>(null);
    const gameTimerRef = useRef<number | null>(null);
    const gameSpeed = INITIAL_SPEED - (level - 1) * SPEED_DECREMENT;
    const audioInitializedRef = useRef(false);

    const getRandomPiece = useCallback(() => {
        const index = Math.floor(Math.random() * tetrisPieces.length);
        return {
            shape: JSON.parse(JSON.stringify(tetrisPieces[index])),
            color: tetrisColors[index]
        };
    }, []);

    const checkCollision = useCallback((newX: number, newY: number, piece: number[][]) => {
        for (let y = 0; y < piece.length; y++) {
            for (let x = 0; x < piece[y].length; x++) {
                if (piece[y][x] !== 0) {
                    const boardX = newX + x;
                    const boardY = newY + y;


                    if (
                        boardX < 0 ||
                        boardX >= BOARD_WIDTH ||
                        boardY >= BOARD_HEIGHT ||
                        (boardY >= 0 && board[boardY] && board[boardY][boardX] !== 0)
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    }, [board]);


    const playClickSound = useCallback(() => {
        if (clickAudioRef.current && audioInitializedRef.current) {
            clickAudioRef.current.currentTime = 0;
            clickAudioRef.current.play().catch(error => {
                console.log("Click audio play failed:", error);
            });
        }
    }, []);


    const playGameOverSound = useCallback(() => {
        if (gameOverAudioRef.current && audioInitializedRef.current) {

            gameOverAudioRef.current.currentTime = 0;
            gameOverAudioRef.current.play().catch(error => {
                console.log("Game over audio play failed:", error);
            });
        }
    }, []);

    const spawnNewPiece = useCallback(() => {
        const { shape, color } = getRandomPiece();
        setCurrentPiece(shape);
        setCurrentColor(color);


        const newX = Math.floor((BOARD_WIDTH - shape[0].length) / 2);
        setPosition({ x: newX, y: 0 });


        if (checkCollision(newX, 0, shape)) {
            setGameOver(true);
            setIsPlaying(false);
            playGameOverSound();

            if (gameTimerRef.current) {
                clearInterval(gameTimerRef.current);
                gameTimerRef.current = null;
            }
        }
    }, [getRandomPiece, checkCollision, playGameOverSound]);

    const checkCompletedLines = useCallback((currentBoard: Board) => {
        const completedRows: number[] = [];


        currentBoard.forEach((row, index) => {
            if (row.every(cell => cell !== 0)) {
                completedRows.push(index);
            }
        });

        if (completedRows.length > 0) {

            const newBoard = [...currentBoard];


            for (let i = completedRows.length - 1; i >= 0; i--) {
                newBoard.splice(completedRows[i], 1);
            }


            for (let i = 0; i < completedRows.length; i++) {
                newBoard.unshift(Array(BOARD_WIDTH).fill(0));
            }


            const pointsEarned = completedRows.length * 100 * level;
            setScore(prev => prev + pointsEarned);


            if (score > 0 && score % 500 === 0) {
                setLevel(prev => Math.min(prev + 1, 10));
            }

            return newBoard;
        }

        return currentBoard;
    }, [level, score]);

    const mergePieceToBoard = useCallback(() => {

        const newBoard = board.map(row => [...row]);


        for (let y = 0; y < currentPiece.length; y++) {
            for (let x = 0; x < currentPiece[y].length; x++) {
                if (currentPiece[y][x]) {
                    const boardY = position.y + y;
                    const boardX = position.x + x;


                    if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
                        newBoard[boardY][boardX] = currentColor;
                    }
                }
            }
        }


        const updatedBoard = checkCompletedLines(newBoard);
        setBoard(updatedBoard);


        spawnNewPiece();
    }, [board, currentPiece, currentColor, position, checkCompletedLines, spawnNewPiece]);

    const moveDown = useCallback(() => {
        if (!gameOver && isPlaying) {
            if (!checkCollision(position.x, position.y + 1, currentPiece)) {
                setPosition(prev => ({ ...prev, y: prev.y + 1 }));
            } else {

                mergePieceToBoard();
            }
        }
    }, [position, currentPiece, checkCollision, mergePieceToBoard, gameOver, isPlaying]);

    const moveHorizontal = useCallback((direction: number) => {
        if (!gameOver && isPlaying) {
            const newX = position.x + direction;
            if (!checkCollision(newX, position.y, currentPiece)) {
                setPosition(prev => ({ ...prev, x: newX }));
                playClickSound();
            }
        }
    }, [position, checkCollision, currentPiece, gameOver, isPlaying, playClickSound]);

    const rotatePiece = useCallback(() => {
        if (!gameOver && isPlaying && currentPiece.length > 0) {

            const rotated = Array(currentPiece[0].length).fill(0).map((_, i) =>
                Array(currentPiece.length).fill(0).map((_, j) =>
                    currentPiece[currentPiece.length - 1 - j][i]
                )
            );


            if (!checkCollision(position.x, position.y, rotated)) {
                setCurrentPiece(rotated);
                playClickSound();
            } else {

                for (let offset of [-1, 1, -2, 2]) {
                    if (!checkCollision(position.x + offset, position.y, rotated)) {
                        setCurrentPiece(rotated);
                        setPosition(prev => ({ ...prev, x: prev.x + offset }));
                        playClickSound();
                        break;
                    }
                }
            }
        }
    }, [currentPiece, position, checkCollision, gameOver, isPlaying, playClickSound]);

    const hardDrop = useCallback(() => {
        if (!gameOver && isPlaying) {
            let newY = position.y;


            while (!checkCollision(position.x, newY + 1, currentPiece)) {
                newY++;
            }

            setPosition(prev => ({ ...prev, y: newY }));
            playClickSound();

            setTimeout(() => mergePieceToBoard(), 10);
        }
    }, [position, currentPiece, checkCollision, mergePieceToBoard, gameOver, isPlaying, playClickSound]);


    const handleTouch = useCallback((action: 'left' | 'right' | 'rotate' | 'down' | 'drop') => {
        playClickSound();

        switch (action) {
            case 'left': moveHorizontal(-1); break;
            case 'right': moveHorizontal(1); break;
            case 'rotate': rotatePiece(); break;
            case 'down': moveDown(); break;
            case 'drop': hardDrop(); break;
        }
    }, [moveHorizontal, rotatePiece, moveDown, hardDrop, playClickSound]);

    const handleKeyPress = useCallback((e: KeyboardEvent) => {
        if (!isPlaying || gameOver) return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                moveHorizontal(-1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                moveHorizontal(1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                moveDown();
                break;
            case 'ArrowUp':
                e.preventDefault();
                rotatePiece();
                break;
            case ' ':
                e.preventDefault();
                hardDrop();
                break;
        }
    }, [isPlaying, gameOver, moveHorizontal, moveDown, rotatePiece, hardDrop]);


    const initializeAudio = useCallback(() => {
        if (audioInitializedRef.current) return;

        const playAudio = () => {
            if (birthdayAudioRef.current) {
                birthdayAudioRef.current.volume = 0.5;
                birthdayAudioRef.current.play()
                    .then(() => {
                        audioInitializedRef.current = true;
                    })
                    .catch(error => {
                        console.log("Audio play failed:", error);
                    });
            }
        };


        const userEvents = ['click', 'touchstart', 'keydown'];
        const handleUserInteraction = () => {
            playAudio();
            userEvents.forEach(event =>
                document.removeEventListener(event, handleUserInteraction)
            );
        };

        userEvents.forEach(event =>
            document.addEventListener(event, handleUserInteraction, { once: true })
        );
    }, []);


    useEffect(() => {
        spawnNewPiece();
        initializeAudio();


        return () => {
            if (birthdayAudioRef.current) {
                birthdayAudioRef.current.pause();
                birthdayAudioRef.current.src = "";
            }
            if (clickAudioRef.current) {
                clickAudioRef.current.pause();
                clickAudioRef.current.src = "";
            }
            if (gameOverAudioRef.current) {
                gameOverAudioRef.current.pause();
                gameOverAudioRef.current.src = "";
            }
            if (gameTimerRef.current) {
                clearInterval(gameTimerRef.current);
                gameTimerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (isPlaying && !gameOver) {
            if (gameTimerRef.current) {
                clearInterval(gameTimerRef.current);
            }
            gameTimerRef.current = window.setInterval(moveDown, gameSpeed);
        } else if (gameOver && gameTimerRef.current) {
            clearInterval(gameTimerRef.current);
            gameTimerRef.current = null;
        }

        return () => {
            if (gameTimerRef.current) {
                clearInterval(gameTimerRef.current);
                gameTimerRef.current = null;
            }
        };
    }, [isPlaying, gameOver, moveDown, gameSpeed]);


    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    const resetGame = () => {
        playClickSound();
        setBoard(Array(BOARD_HEIGHT).fill(0).map(() => Array(BOARD_WIDTH).fill(0)));
        setScore(0);
        setLevel(1);
        setGameOver(false);
        setIsPlaying(true);
        spawnNewPiece();
    };


    const [showLoveMessage, setShowLoveMessage] = useState(true);


    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLoveMessage(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);


    const renderShadowPiece = () => {
        if (!currentPiece.length || gameOver) return null;

        let shadowY = position.y;


        while (!checkCollision(position.x, shadowY + 1, currentPiece)) {
            shadowY++;
        }

        return currentPiece.map((row, y) =>
            row.map((cell, x) => cell !== 0 && (
                <div
                    key={`shadow-${y}-${x}`}
                    className="shadow-cell"
                    style={{
                        position: 'absolute',
                        top: `${(shadowY + y) * CELL_SIZE}px`,
                        left: `${(position.x + x) * CELL_SIZE}px`,
                        width: `${CELL_SIZE - 2}px`,
                        height: `${CELL_SIZE - 2}px`,
                        backgroundColor: 'transparent',
                        border: '1px dashed rgba(255,255,255,0.3)',
                        zIndex: 1
                    }}
                />
            ))
        );
    };


    const toggleGift = () => {
        playClickSound();
        setShowGift(!showGift);
    };

    const handleBackToMenu = () => {
        playClickSound();
        navigateToMenu();
    };

    return (
        <div className="birthday-screen">
            <audio ref={birthdayAudioRef} src={sounds.musicgame} loop />
            <audio ref={clickAudioRef} src={sounds.click} />
            <audio ref={gameOverAudioRef} src={sounds.gameover} />
            {/* Gift component */}
            {showGift && <Gift onClose={toggleGift} />}
            {showLoveMessage && (
                <div className="love-message-notification">
                    <div className="love-message-content">
                        <span className="love-heart">❤️</span>
                        <p>Selamat bermain sayang! Kamu pasti bisa!</p>
                    </div>
                </div>
            )}

            <div className="game-info">
                <div>SCORE: {score}</div>
                <div>LEVEL: {level}</div>
            </div>

            <div
                className="tetris-board"
                style={{
                    width: `${BOARD_WIDTH * CELL_SIZE}px`,
                    height: `${BOARD_HEIGHT * CELL_SIZE}px`,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'black',
                    border: '2px solid #00bfff',
                    overflow: 'hidden'
                }}

            >
                {/* Render board cells */}
                {board.map((row, y) => (
                    row.map((cell, x) => (
                        <div
                            key={`${y}-${x}`}
                            className="board-cell"
                            style={{
                                position: 'absolute',
                                top: `${y * CELL_SIZE}px`,
                                left: `${x * CELL_SIZE}px`,
                                width: `${CELL_SIZE - 2}px`,
                                height: `${CELL_SIZE - 2}px`,
                                backgroundColor: cell !== 0 ? String(cell) : 'transparent',
                                border: cell !== 0 ? '1px solid rgba(0,0,0,0.1)' : 'none'
                            }}
                        />
                    ))
                ))}

                {/* Render shadow piece (ghost piece) */}
                {renderShadowPiece()}

                {/* Render current active piece */}
                {currentPiece.map((row, y) =>
                    row.map((cell, x) => cell !== 0 && (
                        <div
                            key={`piece-${y}-${x}`}
                            className="piece-cell"
                            style={{
                                position: 'absolute',
                                top: `${(position.y + y) * CELL_SIZE}px`,
                                left: `${(position.x + x) * CELL_SIZE}px`,
                                width: `${CELL_SIZE - 2}px`,
                                height: `${CELL_SIZE - 2}px`,
                                backgroundColor: currentColor,
                                border: '1px solid rgba(0,0,0,0.1)',
                                zIndex: 2
                            }}
                        />
                    ))
                )}
            </div>

            <div className="touch-controls">
                <button
                    className="touch-button"
                    onClick={() => handleTouch('left')}
                >
                    ←
                </button>
                <button
                    className="touch-button"
                    onClick={() => handleTouch('rotate')}
                >
                    ↻
                </button>
                <button
                    className="touch-button"
                    onClick={() => handleTouch('right')}
                >
                    →
                </button>
                <button
                    className="touch-button"
                    onClick={() => handleTouch('down')}
                >
                    ↓
                </button>
            </div>

            {gameOver && (
                <div className="game-over">
                    <h2>Game Over!</h2>
                    <p className="love-message">Inget ya, meskipun kamu kalah, aku tetap mencintaimu dengan sepenuh hati ❤️</p>
                    <div className="game-over-buttons">
                        <button
                            className="play-again"
                            onClick={resetGame}
                        >
                            Play Again
                        </button>
                        <button
                            className="back-to-menu"
                            onClick={handleBackToMenu}
                        >
                            Main Menu
                        </button>

                        {/* Add gift button */}
                        <button
                            className="gift-button"
                            onClick={toggleGift}
                        >
                            🎁 Special Gift
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}