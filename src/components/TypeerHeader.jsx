import { useState } from 'react';

export default function TypeerHeader({onSend}) {
  const [isAudioMode, setIsAudioMode] = useState(false);

  const toggleMode = () => {
    setIsAudioMode(!isAudioMode);
    onSend(isAudioMode);
  };


  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex justify-between items-center w-full">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">Typeer</h1>
            <p className="text-gray-500 text-xs">Smart Typing Assistant</p>
          </div>
        </div>
        
        {/* Toggle Section */}
        <div className="flex items-center space-x-4 bg-gray-50 rounded-full p-2 border border-gray-200">
  {/* Keyboard Label */}
  <span
    className={`text-sm font-medium px-3 py-1 rounded-full transition-all duration-300 ${
      !isAudioMode ? 'bg-gray-100 text-black shadow-sm' : 'text-gray-500'
    }`}
  >
    Keyboard
  </span>

  {/* Toggle Button */}
  <button
    onClick={toggleMode}
    className={`relative w-12 h-6 bg-red rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 ${
      isAudioMode ? 'bg-black' : 'bg-gray-300' 
    }`}
  >
    <div
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
        isAudioMode ? 'translate-x-6' : 'translate-x-0'
      }`}
    />
  </button>

  {/* Voice Label */}
  <span
    className={`text-sm font-medium px-3 py-1 rounded-full transition-all duration-300 ${
      isAudioMode ? 'bg-blue-100 text-black shadow-sm' : 'text-gray-500'
    }`}
  >
    Voice
  </span>
</div>

        
        {/* Status Section */}
        <div className="flex items-center space-x-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
          <div className={`w-2 h-2 rounded-full ${
            isAudioMode ? 'bg-red-500' : 'bg-green-500'
          }`}></div>
          <span className="text-black text-sm font-medium">
            {isAudioMode ? 'Voice Active' : 'Keyboard Active'}
          </span>
        </div>
      </div>
    </header>
  );
}