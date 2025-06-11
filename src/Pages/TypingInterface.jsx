import React, { useState, useEffect, useRef, useCallback } from 'react';

const TypingInterface = ({audioMode ,setAudioMode}) => {
  // Sample texts for typing practice
  const sampleTexts = [
    "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet and is perfect for typing practice.",
    "Technology has revolutionized the way we communicate, work, and live our daily lives in the modern world.",
    "Programming requires patience, practice, and persistence to master the art of creating efficient and elegant solutions.",
    "Artificial intelligence is transforming industries by automating complex tasks and providing intelligent insights.",
    "The beauty of nature lies in its complexity and the intricate relationships between all living organisms."
  ];

  const handleSetAudioMode = ()=>{
    setAudioMode(!AudioMode);
  }

  // State management
  const [currentText, setCurrentText] = useState(sampleTexts[0]);
  const [userInput, setUserInput] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Refs
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (isActive && !isPaused && !isCompleted) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setTimeElapsed(elapsed);
        
        // Calculate WPM (Words Per Minute)
        if (elapsed > 0) {
          const wordsTyped = correctChars / 5; // Standard: 5 characters = 1 word
          const minutes = elapsed / 60;
          const calculatedWpm = Math.round(wordsTyped / minutes);
          setWpm(calculatedWpm);
        }
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, isPaused, isCompleted, startTime, correctChars]);

  // Calculate accuracy
  useEffect(() => {
    if (userInput.length > 0) {
      const totalChars = userInput.length;
      const accuracyPercentage = Math.round((correctChars / totalChars) * 100);
      setAccuracy(accuracyPercentage);
    }
  }, [correctChars, userInput.length]);

  // Handle input change with real-time character comparison
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    
    // Don't allow typing beyond the text length
    if (value.length > currentText.length) return;
    
    // Start timer on first keystroke
    if (!isActive && value.length === 1) {
      setIsActive(true);
      setStartTime(Date.now());
    }

    setUserInput(value);
    
    // Real-time character comparison
    let correct = 0;
    let errorCount = 0;
    
    for (let i = 0; i < value.length; i++) {
      if (value[i] === currentText[i]) {
        correct++;
      } else {
        errorCount++;
      }
    }
    
    setCorrectChars(correct);
    setErrors(errorCount);
    setCurrentCharIndex(value.length);
    
    // Check if typing is completed
    if (value.length === currentText.length) {
      setIsCompleted(true);
      setIsActive(false);
      setEndTime(Date.now());
    }
  }, [currentText, isActive]);

  // Reset function
  const resetTest = () => {
    setUserInput('');
    setCurrentCharIndex(0);
    setStartTime(null);
    setEndTime(null);
    setIsActive(false);
    setTimeElapsed(0);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setCorrectChars(0);
    setIsCompleted(false);
    setIsPaused(false);
    inputRef.current?.focus();
  };

  // Pause/Resume function
  const togglePause = () => {
    if (isActive) {
      setIsPaused(!isPaused);
    }
  };

  // Change text function
  const changeText = () => {
    const randomIndex = Math.floor(Math.random() * sampleTexts.length);
    setCurrentText(sampleTexts[randomIndex]);
    resetTest();
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render character with appropriate styling
  const renderCharacter = (char, index) => {
    let className = 'text-lg ';
    
    if (index < currentCharIndex) {
      // Already typed
      if (userInput[index] === char) {
        className += 'bg-green-200 text-green-800';
      } else {
        className += 'bg-red-200 text-red-800';
      }
    } else if (index === currentCharIndex) {
      // Current character
      className += 'bg-blue-200 text-blue-800 animate-pulse';
    } else {
      // Not yet typed
      className += 'text-gray-600';
    }
    
    return (
      <span key={index} className={className}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header with stats */}
      <div className="mb-6">
        {/* <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
          Typing Speed Test
        </h1> */}
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-200 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center mb-1">
              <span className="text-blue-600 mr-1">🕐</span>
              <span className="text-sm font-medium text-blue-600">Time</span>
            </div>
            <div className="text-xl font-bold text-blue-800">
              {formatTime(timeElapsed)}
            </div>
          </div>
          
          <div className="bg-green-200 p-3 rounded-lg text-center">
            <div className="text-sm font-medium text-green-600 mb-1">WPM</div>
            <div className="text-xl font-bold text-green-800">{wpm}</div>
          </div>
          
          <div className="bg-purple-200 p-3 rounded-lg text-center">
            <div className="text-sm font-medium text-purple-600 mb-1">Accuracy</div>
            <div className="text-xl font-bold text-purple-800">{accuracy}%</div>
          </div>
          
          <div className="bg-red-200 p-3 rounded-lg text-center">
            <div className="text-sm font-medium text-red-600 mb-1">Errors</div>
            <div className="text-xl font-bold text-red-800">{errors}</div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={togglePause}
            disabled={!isActive || isCompleted}
            className="flex items-center px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="mr-2">{isPaused ? '▶️' : '⏸️'}</span>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          
          <button
            onClick={resetTest}
            className="flex items-center px-4 py-2 bg-gray-500 text-black rounded-lg hover:bg-gray-600 transition-colors"
          >
            <span className="mr-2">🔄</span>
            Reset
          </button>
          
          <button
            onClick={changeText}
            className="px-4 py-2 bg-blue-500 text-black rounded-lg hover:bg-blue-600 transition-colors"
          >
            New Text
          </button>
        </div>
      </div>

      {/* Typing Area */}
      <div className="mb-6">
        {/* Text Display */}
       <div className="bg-gray-50 p-6 rounded-lg mb-4 border-2 border-gray-200 min-h-32 overflow-auto break-words">
  <div className="leading-relaxed font-mono text-lg">
    {currentText.split('').map((char, index) => renderCharacter(char, index))}
  </div>
</div>

        {/* Input Area */}
        <div className="relative">
          <textarea
            ref={inputRef}
            value={userInput}
            onChange={handleInputChange}
            disabled={isCompleted || isPaused}
            placeholder={isPaused ? "Test is paused. Click Resume to continue." : "Start typing here..."}
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-lg font-mono disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows="4"
          />
          
          {/* Progress Bar */}
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentCharIndex / currentText.length) * 100}%` }}
            ></div>
          </div>
          
          <div className="text-sm text-gray-600 mt-1">
            Progress: {currentCharIndex} / {currentText.length} characters
          </div>
        </div>
      </div>

      {/* Completion Message */}
      {isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-2">🎉 Test Completed!</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-green-600">Final WPM</div>
              <div className="text-xl font-bold text-green-800">{wpm}</div>
            </div>
            <div>
              <div className="text-sm text-green-600">Accuracy</div>
              <div className="text-xl font-bold text-green-800">{accuracy}%</div>
            </div>
            <div>
              <div className="text-sm text-green-600">Time Taken</div>
              <div className="text-xl font-bold text-green-800">{formatTime(timeElapsed)}</div>
            </div>
            <div>
              <div className="text-sm text-green-600">Total Errors</div>
              <div className="text-xl font-bold text-green-800">{errors}</div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 text-sm text-gray-600 text-center">
        <p>💡 <strong>Instructions:</strong> Start typing to begin the test. Correct characters are highlighted in green, errors in red. Use the controls above to pause, reset, or try a new text.</p>
      </div>
    </div>
  );
};

export default TypingInterface;