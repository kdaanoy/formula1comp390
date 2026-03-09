import Navbar from "./components/Navbar"
import Session from "./components/Session"
import StatFeature1 from "./components/StatFeature1"
import StatFeature2 from "./components/StatFeature2"
import StatFeature3 from "./components/StatFeature3"
import { useState, useEffect } from "react";

function App() {
  const [activeYear, setActiveYear] = useState(null);
  const [activeGP, setActiveGP] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [gps, setGPS] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [laps, setLaps] = useState([]);

  return (
    <div className = "pt-25 min-h-screen bg-[#14131a] text-white overflow-hidden">
      <Navbar 
        activeYear={activeYear} setActiveYear={setActiveYear}
        activeGP={activeGP} setActiveGP={setActiveGP}
        activeSession={activeSession} setActiveSession={setActiveSession}
        gps={gps} setGPS={setGPS}
        sessions={sessions} setSessions={setSessions}
      />
      
      <Session 
        activeYear={activeYear}
        activeGP={activeGP}
        activeSession={activeSession}
        setLaps={setLaps}
      />
      <StatFeature1 
        laps={laps}
        activeYear={activeYear}
      />
      <StatFeature2 
        laps={laps}
      />
      <StatFeature3 />
    </div>
  )
}

export default App
