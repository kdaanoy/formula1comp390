import Navbar from "./components/Navbar"
import Session from "./components/Session"
import StatFeature1 from "./components/StatFeature1"
import StatFeature2 from "./components/StatFeature2"
import Predict2026 from "./components/Predict2026"
import { useState, useEffect } from "react";

function App() {
  const [activeYear, setActiveYear] = useState(null);
  const [activeGP, setActiveGP] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [gps, setGPS] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [laps, setLaps] = useState([]);
  const [activatePredict, setActivatePredict] = useState(false);

  return (
    <div className = "pt-25 min-h-screen bg-[#14131a] text-white overflow-hidden">
      <Navbar 
        activeYear={activeYear} setActiveYear={setActiveYear}
        activeGP={activeGP} setActiveGP={setActiveGP}
        activeSession={activeSession} setActiveSession={setActiveSession}
        gps={gps} setGPS={setGPS}
        sessions={sessions} setSessions={setSessions}
        setActivatePredict={setActivatePredict}
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
      <Predict2026 
        activatePredict={activatePredict}
        close={() => setActivatePredict(false)}
      />
    </div>
  )
}

export default App
