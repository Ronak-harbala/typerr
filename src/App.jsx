import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import TypingInterface from './Pages/TypingInterface'
import './App.css'
import TypeerHeader from './components/TypeerHeader'
import AudioTypingTest from './Pages/AudioTypingText'

function App() {
  const [audioMode , setAudioMode] = useState(false);

  const onSend = (isAudioMode) => {
    setAudioMode(isAudioMode);
  }

  return (
    <>
      <TypeerHeader onSend={onSend}/>
      {!audioMode?<TypingInterface/> : <AudioTypingTest/>}
    </>
  )
}

export default App
