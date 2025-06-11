import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';

const AudioTypingTest = () => {
  // Speech synthesis state
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [speechVolume, setSpeechVolume] = useState(1);
  
  // Audio control state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  
  // Test state
  const [testText, setTestText] = useState("The quick brown fox jumps over the lazy dog. This is a sample text for audio typing practice.");
  const [userInput, setUserInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [audioOnly, setAudioOnly] = useState(false);
  
  // Background audio state
  const [backgroundNoise, setBackgroundNoise] = useState('none');
  const [backgroundVolume, setBackgroundVolume] = useState(0.3);
  
  // Queue management
  const [audioQueue, setAudioQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  
  // Refs
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);
  const backgroundAudioRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const updateVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
        if (availableVoices.length > 0 && !selectedVoice) {
          setSelectedVoice(availableVoices[0]);
        }
      };

      updateVoices();
      speechSynthesis.addEventListener('voiceschanged', updateVoices);
      
      return () => {
        speechSynthesis.removeEventListener('voiceschanged', updateVoices);
      };
    }
  }, [selectedVoice]);

  // Initialize audio queue
  useEffect(() => {
    const words = testText.split(/\s+/).filter(word => word.length > 0);
    setAudioQueue(words);
  }, [testText]);

  // Background noise generator
  const generateBackgroundNoise = useCallback((type) => {
    if (!backgroundAudioRef.current) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    switch (type) {
      case 'white':
        // White noise
        const bufferSize = 2 * audioContext.sampleRate;
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = audioContext.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        whiteNoise.connect(gainNode);
        gainNode.connect(audioContext.destination);
        gainNode.gain.value = backgroundVolume * 0.1;
        whiteNoise.start();
        break;
      case 'rain':
        // Rain simulation
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 100;
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        gainNode.gain.value = backgroundVolume * 0.05;
        oscillator.start();
        break;
      case 'cafe':
        // Cafe ambience simulation
        oscillator.type = 'sine';
        oscillator.frequency.value = 200;
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        gainNode.gain.value = backgroundVolume * 0.03;
        oscillator.start();
        break;
    }
  }, [backgroundVolume]);

  // Speech synthesis functions
  const speakText = useCallback((text, onEnd = null) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;
      utterance.volume = speechVolume;
      
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        startProgressTracking();
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        stopProgressTracking();
        if (onEnd) onEnd();
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
        stopProgressTracking();
      };
      
      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    }
  }, [selectedVoice, speechRate, speechPitch, speechVolume]);

  const startProgressTracking = () => {
    progressIntervalRef.current = setInterval(() => {
      setAudioProgress(prev => {
        const newProgress = prev + 1;
        return newProgress > 100 ? 0 : newProgress;
      });
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setAudioProgress(0);
  };

  // Audio control functions
  const playAudio = () => {
    if (isPaused && speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      const currentText = audioQueue.slice(queueIndex).join(' ');
      speakText(currentText);
    }
  };

  const pauseAudio = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setAudioProgress(0);
    setQueueIndex(0);
    stopProgressTracking();
  };

  const replayAudio = () => {
    stopAudio();
    setTimeout(() => {
      speakText(testText);
    }, 100);
  };

  const skipForward = () => {
    const newIndex = Math.min(queueIndex + 5, audioQueue.length - 1);
    setQueueIndex(newIndex);
    if (isPlaying) {
      const remainingText = audioQueue.slice(newIndex).join(' ');
      speakText(remainingText);
    }
  };

  const skipBackward = () => {
    const newIndex = Math.max(queueIndex - 5, 0);
    setQueueIndex(newIndex);
    if (isPlaying) {
      const remainingText = audioQueue.slice(newIndex).join(' ');
      speakText(remainingText);
    }
  };

  // Background noise control
  useEffect(() => {
    if (backgroundNoise !== 'none') {
      generateBackgroundNoise(backgroundNoise);
    }
  }, [backgroundNoise, generateBackgroundNoise]);

  // Handle typing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
    
    // Update current word index based on typed words
    const typedWords = value.trim().split(/\s+/).length;
    setCurrentWordIndex(typedWords - 1);
  };

  // Calculate accuracy
  const calculateAccuracy = () => {
    const words = testText.split(/\s+/);
    const typedWords = userInput.trim().split(/\s+/);
    let correct = 0;
    
    typedWords.forEach((word, index) => {
      if (words[index] && word === words[index]) {
        correct++;
      }
    });
    
    return typedWords.length > 0 ? (correct / typedWords.length) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
       

        {/* Audio Controls */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Audio Controls</h2>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={skipBackward}
              className="p-3 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors text-white"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            {!isPlaying ? (
              <button
                onClick={playAudio}
                className="p-4 bg-green-500 rounded-full hover:bg-green-600 transition-colors text-white"
              >
                <Play className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={pauseAudio}
                className="p-4 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors text-white"
              >
                <Pause className="w-6 h-6" />
              </button>
            )}
            
            <button
              onClick={replayAudio}
              className="p-3 bg-purple-500 rounded-full hover:bg-purple-600 transition-colors text-white"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <button
              onClick={skipForward}
              className="p-3 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors text-white"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(audioProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${audioProgress}%` }}
              />
            </div>
          </div>

          {/* Speed Control */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Speed: {speechRate}x</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Volume: {Math.round(speechVolume * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={speechVolume}
                onChange={(e) => setSpeechVolume(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Pitch: {speechPitch}</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechPitch}
                onChange={(e) => setSpeechPitch(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Audio Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Voice Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Voice</label>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = voices.find(v => v.name === e.target.value);
                    setSelectedVoice(voice);
                  }}
                  className="w-full p-2 bg-gray-50 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                >
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Background Noise */}
              <div>
                <label className="block text-sm font-medium mb-2">Background Noise</label>
                <select
                  value={backgroundNoise}
                  onChange={(e) => setBackgroundNoise(e.target.value)}
                  className="w-full p-2 bg-gray-50 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                >
                  <option value="none">None</option>
                  <option value="white">White Noise</option>
                  <option value="rain">Rain</option>
                  <option value="cafe">Cafe Ambience</option>
                </select>
              </div>
            </div>

            {/* Audio Only Mode Toggle */}
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioOnly}
                  onChange={(e) => setAudioOnly(e.target.checked)}
                  className="mr-2"
                />
                Audio-Only Mode (Hide Text Display)
              </label>
            </div>
          </div>
        )}

        {/* Text Display */}
        {!audioOnly && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Reference Text</h3>
            <div className="text-lg leading-relaxed font-mono bg-gray-50 p-4 rounded-lg border border-gray-200">
              {testText.split(/\s+/).map((word, index) => (
                <span
                  key={index}
                  className={`${
                    index === currentWordIndex
                      ? 'bg-blue-500 text-white'
                      : index < currentWordIndex
                      ? 'text-green-600'
                      : 'text-gray-700'
                  } mr-1 px-1 rounded`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Typing Interface */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-xl border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Type What You Hear</h3>
          <textarea
            value={userInput}
            onChange={handleInputChange}
            placeholder="Start typing what you hear..."
            className="w-full h-32 p-4 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-mono text-lg resize-none focus:outline-none focus:border-blue-500 focus:bg-white"
            autoFocus
          />
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {userInput.trim().split(/\s+/).filter(w => w.length > 0).length}
              </div>
              <div className="text-sm text-gray-600">Words Typed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(calculateAccuracy())}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {speechRate}x
              </div>
              <div className="text-sm text-gray-600">Speed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {currentWordIndex + 1}/{audioQueue.length}
              </div>
              <div className="text-sm text-gray-600">Progress</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioTypingTest;