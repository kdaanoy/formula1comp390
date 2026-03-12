import { useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useState } from "react";
import Papa from "papaparse";

export default function Predict2026({ activatePredict, close }) {

    const [circuitgps, setCircuitGPs] = useState([]);
    const [gpprediction, setGPPrediction] = useState(1);
    const [predictionData, setPredictionData] = useState([]);
    const [teamColors, setTeamColors] = useState({});

    const grandprixes = [{name: "Australian Grand Prix", round: 1, date: "03/08/2026"},
        {name: "Chinese Grand Prix", round: 2, date: "03/15/2026"},
        {name: "Japanese Grand Prix", round: 3, date: "04/29/2026"},
        {name: "Bahrain Grand Prix", round: 4, date: "04/12/2026"},
        {name: "Saudi Arabian Grand Prix", round: 5, date: "04/19/2026"},
        {name: "Miami Grand Prix", round: 6, date: "05/03/2026"},
        {name: "Grand Prix du Canada", round: 7, date: "05/24/2026"},
        {name: "Grand Prix de Monaco", round: 8, date: "06/07/2026"},
        {name: "Barcelona-Catalunya Grand Prix", round: 9, date: "06/14/2026"},
        {name: "Austrian Grand Prix", round: 10, date: "06/28/2026"},
        {name: "British Grand Prix", round: 11, date: "07/05/2026"},
        {name: "Belgian Grand Prix", round: 12, date: "07/19/2026"},
        {name: "Hungarian Grand Prix", round: 13, date: "07/26/2026"},
        {name: "Dutch Grand Prix", round: 14, date: "07/23/2026"},
        {name: "Gran Premio d'Italia", round: 15, date: "09/06/2026"},
        {name: "Azerbaijan Grand Prix", round: 16, date: "09/26/2026"},
        {name: "Singapore Grand Prix", round: 17, date: "10/11/2026"},
        {name: "United States Grand Prix", round: 18, date: "10/25/2026"},
        {name: "Gran Premio de la Cicudad de México", round: 19, date: "11/01/2026"},
        {name: "São Paulo Grand Prix", round: 20, date: "11/08/2026"},
        {name: "Las Vegas Grand Prix", round: 21, date: "11/21/2026"},
        {name: "Qatar Grand Prix", round: 22, date: "11/29/2026"},
        {name: "Abu Dhabi Grand Prix", round: 23, date: "12/06/2026"}
    ]

    useEffect(() => {
        fetch("/data/Circuit.csv").then((res) => res.text())
        .then((data) => {
            const validcircuits = Object.keys(grandprixes);
            const circuits = Papa.parse(data, { header: true }).data;
            const sortedCircuits = circuits
            .filter(circuit => {
                    return validcircuits.some(shortName => 
                        circuit.OfficialName?.includes(shortName)
                    );
                })
                .sort((a, b) => {
                    const nameA = validcircuits.find(shortName => a.OfficialName.includes(shortName));
                    const nameB = validcircuits.find(shortName => b.OfficialName.includes(shortName));
                    return grandprixes[nameA] - grandprixes[nameB];
            });
            setCircuitGPs(sortedCircuits);
        });
    }, []);

    useEffect(() => {
    fetch("/data/Team.csv")
        .then((res) => res.text())
        .then((data) => {
            const result = Papa.parse(data, { header: true, skipEmptyLines: true }).data;
            
            // Convert array to an object: { "Mercedes": "#6CD3BF", "Red Bull": "#3671C6" }
            const colorMap = {};
            result.forEach(row => {
                colorMap[row.TeamName] = row.Color; // Ensure your CSV headers are exactly 'Team' and 'Color'
            });
            setTeamColors(colorMap);
            console.log(colorMap);
        });
}, []);

    

    useEffect(() => {
        if (!gpprediction) return;
        
        fetch(`/data/race${gpprediction}_predictions.csv`).then((res) => res.text())
        .then((data) => {
            const predictions = Papa.parse(data, { header: true }).data;
            setPredictionData(predictions);
            console.log(predictions);
        });
    }, [gpprediction]);

    const today = new Date();
    const accessible = (date) => {
        return (today >= date);
    }

    return (
    <div
        className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/80 transition-all duration-300 ease-in-out
        ${activatePredict ? "opacity-100 visible" : "opacity-0 invisible"}`}
    >

        <div
        className={`p-8  w-[100%] h-[100%] transition-transform duration-300
        ${activatePredict ? "scale-100" : "scale-95"}`}
        >
        
        <div className="flex justify-between items-start w-full h-full ">
            
            <div className="flex flex-col grid-cols-1 gap-5 pl-30 overflow-y-auto pr-5 custom-scrollbar h-full">
                {circuitgps.map((circuit, index) => {
                    const gpData = grandprixes.find(gp => circuit.OfficialName?.includes(gp.name));
                    const showButton = gpData ? accessible(new Date(gpData.date)) : false;
                    
                    return (
                        <button onClick={() => showButton && setGPPrediction(index+1)} key={index} className={`relative w-[400px] h-[150px] border-[1px] rounded-[20px] bg-[#14131a] 
                        border-white/10 flex-shrink-0 ${showButton ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                            <div className="pb-4 pl-3">
                                <div className="font-formula1bold border border-white/10 rounded-full bg-[#ff0800] text-white w-[120px]">
                                    ROUND {index + 1}
                                </div>
                            </div>

                            <h2 className="text-white font-formula1bold text-2xl uppercase tracking-tighter leading-none">
                                {circuit.Name}
                            </h2>
                            <p className="text-gray-500 font-titiliumreg text-sm mt-2">
                                {circuit.OfficialName}
                            </p>
                            {!showButton ? (
                                <div>
                                    Locked Until After Qualifying
                                </div>
                            ) : (null)}
                        </button>
                    )
                    })
                }
            </div>

            <div className="flex flex-col gap-2 items-center">
                <div>
                    <div className="text-white font-formula1bold text-[22px] mt-2 pb-10 flex items-center justify-center">
                        <p>Predicted Finishing Order for the {grandprixes[gpprediction - 1]?.name} Grand Prix 2026</p>
                    </div>
                    <h2 className="flex flex-row flex-wrap gap-3">
                        {predictionData.map((prediction, index) => {
                            const teamColor = teamColors[prediction.Team]
                            const lastName = prediction.Driver?.split(" ").at(-1).toLowerCase();
                            if (index + 1 <=3) {
                                

                                return (
                                    <div 
                                        key={index} 
                                        className="relative flex flex-row w-[350px] h-[110px] rounded-xl"
                                        style={{ backgroundColor: teamColor}}>

                                        <span className="absolute inset-0 flex items-center justify-center text-[90px] font-formula1bold text-white/50 italic">
                                            {index + 1}
                                        </span>

                                        <div className="relative w-25 h-20 overflow-hidden rounded-full translate-y-2.5">
                                            <img 
                                                src={`/photos/${lastName}.avif`} 
                                                alt={prediction.Driver}
                                                className="w-full h-full object-cover object-top scale-150 translate-y-4" 
                                            />
                                        </div>
                                        

                                        <div className="flex flex-col justify-center">
                                            <p className="text-white font-formula1bold text-[20px] uppercase">
                                                {prediction.Driver}
                                            </p>
                                            <p className="font-formula1bold text-sm uppercase">
                                                {prediction.Team}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }
                            
                        })}
                    </h2>
                </div>
                <div className="flex flex-row flex-wrap w-[710px] gap-2 pt-2">
        {predictionData.map((prediction, index) => {
            if (index < 3 || index == 22) return null;
            const teamColor = teamColors[prediction.Team] || "#1c1c24";
            const actualPosition = index + 1; // Keeps numbering correct
            return (
                <div 
                    key={actualPosition} 
                    className="flex justify-between w-[350px] h-[45px] rounded-xl bg-[#14131a] px-4 items-center border border-white/5"
                >
                    <span className="text-gray-500 font-formula1bold text-lg">
                        {actualPosition}
                    </span>
                    <div className="flex items-center gap-3">
                        <p className="text-white font-formula1bold text-xs uppercase">
                            {prediction.Driver} 
                            <span className="text-gray-500 p-1">-</span> 
                            <span style={{color: teamColor}}>{prediction.Team}</span>
                        </p>
                    </div>
                </div>
            );
        })}
    </div>
            </div>

            <button onClick={close}>
                <FaArrowRight className="text-white hover:text-gray-300 cursor-pointer text-[22px]" />
            </button>
        </div>

        </div>

    </div>
    );
}