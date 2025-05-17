import { useState, useEffect, useRef } from 'react';
interface TypingTextProps {
  texts: string[];
  typingSpeed?: number;
  delayBetweenTexts?: number;
}

export default function TypingText({
  texts,
  typingSpeed = 50,
  delayBetweenTexts = 1000
}: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const typingInterval = useRef<number | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typingInterval.current) {
        clearTimeout(typingInterval.current);
      }
    };
  }, []);

  // Handle typing animation
  useEffect(() => {
    if (!isTyping || isPaused || textIndex >= texts.length) return;

    const currentText = texts[textIndex];

    if (charIndex < currentText.length) {
      // Still typing current text
      typingInterval.current = window.setTimeout(() => {
        setDisplayedText(prev => prev + currentText[charIndex]);
        setCharIndex(prev => prev + 1);
      }, typingSpeed);
    } else {
      // Finished typing current text
      if (textIndex < texts.length - 1) {
        // Move to next text after delay
        setIsPaused(true);
        typingInterval.current = window.setTimeout(() => {
          setTextIndex(prev => prev + 1);
          setCharIndex(0);
          setDisplayedText('');
          setIsPaused(false);
        }, delayBetweenTexts);
      } else {
        // All texts completed
        setIsTyping(false);
      }
    }

    return () => {
      if (typingInterval.current) {
        clearTimeout(typingInterval.current);
      }
    };
  }, [isTyping, isPaused, textIndex, charIndex, texts, typingSpeed, delayBetweenTexts]);

  // Toggle typing by clicking
  const handleClick = () => {
    if (isTyping && !isPaused) {
      // Complete current text immediately
      setDisplayedText(texts[textIndex]);
      setCharIndex(texts[textIndex].length);
    } else if (!isTyping && textIndex < texts.length - 1) {
      // Restart typing if there are more texts
      setTextIndex(prev => prev + 1);
      setCharIndex(0);
      setDisplayedText('');
      setIsTyping(true);
    }
  };

  return (
    <div className="typing-text" onClick={handleClick}>
      {displayedText}
      {isTyping && !isPaused && <span className="typing-cursor">|</span>}
    </div>
  );
}