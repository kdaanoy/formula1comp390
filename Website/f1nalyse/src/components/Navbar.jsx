import { MdDateRange  } from "react-icons/md";
import { IoIosArrowUp } from "react-icons/io";
import { GiFullMotorcycleHelmet } from "react-icons/gi";
import { FaRoad } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { FaQuestion } from "react-icons/fa";
import { useState, useEffect } from "react";
import MenuYear from "./MenuYear";
import MenuGP from "./MenuGP";
import MenuSession from "./MenuSession";
import Papa from "papaparse";


const yearInfo = ["2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"]

const sessionOrder = {
    "Practice 1": 1,
    "Practice 2": 2,
    "Practice 3": 3,
    "Sprint Shootout": 4,
    "Sprint Qualifying": 5,
    "Sprint": 6,
    "Qualifying": 7,
    "Race": 8 
};

const circuitOrder = {
    "Australian Grand Prix": 1,
    "United States Grand Prix": 18,
    "Bahrain Grand Prix": 4,
    "Azerbaijan Grand Prix": 16,
    "Barcelona-Catalunya Grand Prix": 9,
    "German Grand Prix": 24,
    "Hungarian Grand Prix": 13,
    "São Paulo Grand Prix": 20,
    "Singapore Grand Prix": 17,
    "Grand Prix de Monaco": 8,
    "Gran Premio d'Italia": 15, 
    "Austrian Grand Prix": 10,
    "Grand Prix de France": 25,
    "Gran Premio de la Cicudad de México": 19, 
    "Chinese Grand Prix": 2,
    "British Grand Prix": 11,
    "Russian Grand Prix": 26,
    "Belgian Grand Prix": 12,
    "Japanese Grand Prix": 3,
    "Grand Prix du Canada": 7,
    "Abu Dhabi Grand Prix": 23,
    "Emilia Romagna Grand Prix": 28,
    "Turkish Grand Prix": 27,
    "Tuscan Grand Prix": 29,
    "Nürburgring GP-Strecke": 30,
    "Grande Premio de Portugal": 31,
    "Saudi Arabian Grand Prix": 5,
    "Qatar Grand Prix": 22,
    "Miami Grand Prix": 6,
    "Dutch Grand Prix": 14,
    "Las Vegas Grand Prix": 21
};

export default function Navbar({activeYear, setActiveYear, activeGP, setActiveGP, activeSession, setActiveSession, gps, setGPS, sessions, setSessions, setActivatePredict }) {
    const [activeYearMenu, setActiveYearMenu] = useState(false);
    const [activeGPMenu, setActiveGPMenu] = useState(false);
    const [activeSessionMenu, setActiveSessionMenu] = useState(false);

    useEffect(() => {
        if (!activeYear) return;

        setActiveGP(null);
        setGPS([]);
        setActiveGPMenu(false);

        fetch(`/data/Session.csv`)
            .then(res => res.text())
            .then(csv => {
                const parsed = Papa.parse(csv, { header: true });
                console.log(parsed.data);
                const gpYears = parsed.data.filter(row => {
                    if (!row.DateOfSession) return false;

                    const [day, month, year] = row.DateOfSession.split(" ")[0].split("/");
                    console.log(year);
                    return parseInt(year) === parseInt(activeYear);
                });

                const distinctGps = [...new Set(gpYears.map(r => r.CircuitID))];

                fetch(`/data/Circuit.csv`)
                    .then(res => res.text())
                    .then(csv => {
                        const circuitParsed = Papa.parse(csv, { header: true });
                        console.log(circuitParsed);
                        const gpName = circuitParsed.data
                            .filter(row => distinctGps.includes(row.ID))
                            .map(row => row.Name);
                        console.log(gpName);

                        const sortedGps = gpName.sort((a, b) => {
                            return (circuitOrder[a] || 100) - (circuitOrder[b] || 100)
                        })

                    setGPS(sortedGps);
                })
                
            });
    }, [activeYear]);

    useEffect(() => {
    if (!activeGP || !activeYear) return;

        setActiveSession={setActiveSession};
        setSessions([]);
        setActiveSessionMenu(false);

        fetch(`/data/Circuit.csv`)
            .then(res => res.text())
            .then(csv => {
                const parsed = Papa.parse(csv, { header: true });
                console.log(parsed.data);
                const gpCircuitID = parsed.data.find(row => row.Name == activeGP).ID;
                console.log(gpCircuitID);

                fetch(`/data/Session.csv`)
                    .then(res => res.text())
                    .then(csv => {
                        const sessionParsed = Papa.parse(csv, { header: true });
                        console.log(sessionParsed.data);
                        const gpSessions = sessionParsed.data.filter(row => {
                            return row.CircuitID === gpCircuitID && row.DateOfSession.includes(activeYear);

                        });
                        console.log(gpSessions);

                        const distinctSessions = [...new Set(gpSessions.map(r => r.Type))];
                        const sortedSessions = distinctSessions.sort((a, b) => {
                            return (sessionOrder[a] || 10) - (sessionOrder[b] || 10)
                        })
                        console.log(sortedSessions);

                        setSessions(sortedSessions);
                        
                    });
                
            });
    }, [activeYear, activeGP]);

    return <nav className = "fixed top-0 w-full z-50 transition-all duration-300 bg-[#14131a] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-14 sm:h-16 md:h-20 gap-2">
                {/* <div className="pr-4">
                    <img src="/kd.png" className="w-8 h-6 sm:w-8 sm:h-8"></img>
                </div> */}

                <div className="relative w-full max-w-[200px]">
                    <button 
                    onClick={() => {
                        setActiveYearMenu(!activeYearMenu);
                    }}
                    className={`${
                        activeYearMenu
                            ? "rounded-br-none rounded-bl-none"
                            : "rounded-br-md rounded-bl-md"
                    } rounded-tl-md rounded-tr-md bg-[#2d2d35] p-1.5 w-full rounded-md text-black hover:bg-[#44444b] duration-200 flex items-center gap-1 cursor-pointer hover:outline-2 hover:outline-white ease-in`}>
                        {activeYear === null ? (
                            <div className="flex items-center w-full text-white">
                                <MdDateRange />
                                <p className="font-formula1bold pl-1">Select Year</p>
                                <IoIosArrowDown className="ml-auto"/>
                            </div>
                        ) : (<div className="flex items-center w-full text-white">
                                <MdDateRange />
                                <p className="font-formula1bold pl-1">{activeYear}</p>
                                <IoIosArrowDown className="ml-auto"/>
                            </div>)}
                        
                    </button> 

                    <div
                        className={`${
                            activeYearMenu ? "top-full" : "top-1/2 opacity-0 pointer-events-none"
                        } w-full bg-[#2d2d35] absolute left-0 duration-200 rounded-bl-md rounded-br-md`}>
                        
                        <ul>
                            {yearInfo.map((item, index) => {
                                return (
                                <MenuYear item={item} key={index} setActiveYear={setActiveYear} setActiveYearMenu={setActiveYearMenu} 
                                />)
                            })}
                        </ul>
                    </div>
                </div>
                
                <div className="relative w-full max-w-[350px]">
                    <button 
                    onClick={() => {
                        setActiveGPMenu(!activeGPMenu);
                    }}
                    className={`${
                        activeGPMenu
                            ? "rounded-br-none rounded-bl-none"
                            : "rounded-br-md rounded-bl-md"
                    } rounded-tl-md rounded-tr-md bg-[#2d2d35] p-1.5 w-full rounded text-black hover:bg-[#44444b] duration-200 flex items-center gap-1 cursor-pointer hover:outline-2 hover:outline-white ease-in`}>
                        {activeGP === null ? (
                            <div className="flex items-center w-full text-white">
                                <FaRoad />
                                <p className="font-formula1bold pl-1">Select GP</p>
                                <IoIosArrowDown className="ml-auto"/>
                            </div>
                        ) : (<div className="flex items-center w-full text-white">
                                <FaRoad />
                                <p className="font-formula1bold pl-1.5 flex-1 text-left truncate">{activeGP}</p>
                                <IoIosArrowDown className="ml-auto"/>
                            </div>)}
                        
                    </button> 

                    <div
                        className={`${
                            activeGPMenu ? "top-full" : "top-1/2 opacity-0 pointer-events-none"
                        } w-full left-0 bg-[#2d2d35] absolute duration-200 rounded-bl-md rounded-br-md overflow-hidden text-white`}>
                        
                        <ul className="max-h-90 overflow-y-auto">
                            {gps.map((item, index) => {
                                return (
                                <MenuGP item={item} key={index} setActiveGP={setActiveGP} setActiveGPMenu={setActiveGPMenu} 
                                />)
                            })}
                        </ul>
                    </div>
                </div>

                <div className="relative w-full max-w-[350px]">
                    <button 
                    onClick={() => {
                        setActiveSessionMenu(!activeSessionMenu);
                    }}
                    className={`${
                        activeSessionMenu
                            ? "rounded-br-none rounded-bl-none"
                            : "rounded-br-md rounded-bl-md"
                    } rounded-tl-md rounded-tr-md bg-[#2d2d35] p-1.5 w-full rounded text-black hover:bg-[#44444b] duration-200 flex items-center gap-1 cursor-pointer hover:outline-2 hover:outline-white ease-in`}>
                        {activeSession === null ? (
                            <div className="flex items-center w-full text-white">
                                <GiFullMotorcycleHelmet />
                                <p className="font-formula1bold pl-1">Select Session</p>
                                <IoIosArrowDown className="ml-auto"/>
                            </div>
                        ) : (<div className="flex items-center w-full text-white">
                                <GiFullMotorcycleHelmet />
                                <p className="font-formula1bold pl-1.5 flex-1 text-left truncate">{activeSession}</p>
                                <IoIosArrowDown className="ml-auto"/>
                            </div>)}
                        
                    </button> 

                    <div
                        className={`${
                            activeSessionMenu ? "top-full" : "top-1/2 opacity-0 pointer-events-none"
                        } w-full left-0 bg-[#2d2d35] absolute duration-200 rounded-bl-md rounded-br-md overflow-hidden text-white`}>
                        
                        <ul className="max-h-90 overflow-y-auto">
                            {sessions.map((item, index) => {
                                return (
                                <MenuSession item={item} key={index} setActiveSession={setActiveSession} setActiveSessionMenu={setActiveSessionMenu} 
                                />)
                            })}
                        </ul>
                    </div>
                </div>

                <div className="relative w-full max-w-[170px]">
                    <button
                    onClick={() => {
                        setActivatePredict(true);
                    }}
                    className={`text-white rounded-md bg-[#e10600] p-1.5 w-full rounded hover:bg-[#e10600]/90 duration-70 flex items-center gap-1 cursor-pointer hover:outline-2 hover:outline-white ease-in`}>
                        <FaQuestion />
                        <p className="font-formula1bold pl-1.5 flex-1 text-left truncate">Predict 2026</p>
                    </button> 
                </div>
            </div>
        </div>
    </nav>
}