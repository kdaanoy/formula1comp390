import { useState, useEffect } from "react";
import Papa from "papaparse";
import React from "react";
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Customized,
} from "recharts";

export default function Session({
  activeYear,
  activeGP,
  activeSession,
  setLaps,
}) {
  const [newData, setData] = useState([]);
  const [newMapdata, setMapData] = useState([]);
  const [fastestTimes, setFastestTimes] = useState({ s1: 0, s2: 0, s3: 0 });
  const [sessionKey, setSessionKey] = useState(null);
  const [fastestDriverHeadshot, setFastestDriverHeadshot] = useState(null);

  const safeYear = activeYear || "2025";
  const safeGP = activeGP || "Yas Marina Circuit";
  const safeSession = activeSession || "Race";

  const displayData = newData;
  const displayMapData = newMapdata;

  useEffect(() => {
    Promise.all([
      fetch("/data/Circuit.csv").then((res) => res.text()),
      fetch("/data/Session.csv").then((res) => res.text()),
      fetch("/data/Results.csv").then((res) => res.text()),
      fetch("/data/Drivers.csv").then((res) => res.text()),
      fetch("/data/Laps.csv").then((res) => res.text()),
      fetch("/data/Team.csv").then((res) => res.text()),
    ]).then(
      async ([
        circuitCsv,
        sessionCsv,
        resultsCsv,
        driversCsv,
        lapsCsv,
        teamsCsv,
      ]) => {
        const circuits = Papa.parse(circuitCsv, { header: true }).data;
        const sessions = Papa.parse(sessionCsv, { header: true }).data;
        const allResults = Papa.parse(resultsCsv, { header: true }).data;
        const allDrivers = Papa.parse(driversCsv, { header: true }).data;
        const allTeams = Papa.parse(teamsCsv, { header: true }).data;
        const allLaps = Papa.parse(lapsCsv, { header: true }).data;

        const circuit = circuits.find((c) => c.Name === safeGP);
        if (!circuit) return;

        const session = sessions.find(
          (s) =>
            s.CircuitID?.toString().trim() === circuit.ID?.toString().trim() &&
            s.DateOfSession.includes(safeYear) &&
            s.Type === safeSession,
        );
        if (!session) return;

        setMapData([
          {
            name: circuit.OfficialName,
            circuit: circuit.Name,
            country: circuit.Country,
            city: circuit.City,
            corners: circuit.Corners,
            length: circuit.Length,
            temperature: session.Temperature,
            date: session.DateOfSession,
            sector1: circuit.Sector1,
            sector2: circuit.Sector2,
            sector3: circuit.Sector3,
          },
        ]);

        const filteredResults = allResults
          .filter((r) => r.SessionID === session.ID)
          .map((r, i) => {
            const driverInfo = allDrivers.find(
              (d) => d.DriverName === r.Driver && safeYear === d.Year,
            );
            const teamInfo = driverInfo
              ? allTeams.find((t) => t.ID === driverInfo.TeamID)
              : null;

            return {
              pos: r.Position,
              driver: driverInfo ? driverInfo.DriverName.trim()
                .split(" ")
                .at(-1)
                .substring(0, 3)
                .toUpperCase()
                : "drivererror",
              team: teamInfo ? teamInfo.TeamName : "teamerror",
              color: teamInfo ? teamInfo.Color : "white",
              gap: r.TimeGap || "0",
              active: i % 2 === 0 ? false : true,
            };
          });

        const parseTime = (timeStr) => {
          const match = timeStr.match(/(\d+):(\d+):(\d+\.\d+)/);
          if (!match) return 99;
          const hours = parseInt(match[1]);
          const minutes = parseInt(match[2]);
          const seconds = parseFloat(match[3]);
          return hours * 3600 + minutes * 60 + seconds;
        };

        console.log("Filtered Results:", filteredResults);

        const sessionLaps = allLaps.filter((l) => l.SessionID === session.ID);
        const driverMap = Object.fromEntries(
          allDrivers.map((d) => [d.ID.toString(), d]),
        );

        const tyreData = {};

        const driverPositionMap = Object.fromEntries(
          filteredResults.map((r) => [r.driver, r.pos, r.color]),
        );

        sessionLaps.forEach((lap) => {
          const driver = driverMap[lap.DriverID];
          if (!driver) return;

          const driverName = driver.DriverName.split(" ")
            .at(-1)
            .substring(0, 3)
            .toUpperCase();

          if (!tyreData[driverName]) {
            tyreData[driverName] = [];
          }

          tyreData[driverName].push({
            lap: Number(lap.LapNumber),
            tyre: lap.TyreCompound,
            time: lap.LapTimeSeconds,
          });
        });

        const chartData = Object.entries(tyreData)
          .map(([driver, laps]) => ({
            driver,
            laps: laps.sort((a, b) => a.lap - b.lap),
            color:
              filteredResults.find((r) => r.driver === driver)?.color ||
              "white",
          }))
          .sort((a, b) => {
            const pos1 = driverPositionMap[a.driver] || Infinity;
            const pos2 = driverPositionMap[b.driver] || Infinity;
            return pos1 - pos2;
          });

        setLaps(chartData);
        console.log(chartData);

        const defaultLap = {
          Sector1Time: "0.0",
          Sector2Time: "0.0",
          Sector3Time: "0.0",
          Driver: "drivererror",
          LapNumber: 0,
          Team: "teamerror",
          Color: "white",
        };

        const fastestS1Lap =
          sessionLaps.length > 0
            ? sessionLaps.reduce(
              (fastest, lap) =>
                parseTime(lap.Sector1Time) <
                  parseTime(fastest.Sector1Time)
                  ? lap
                  : fastest,
              sessionLaps[0],
            )
            : defaultLap;

        const fastestS2Lap =
          sessionLaps.length > 0
            ? sessionLaps.reduce(
              (fastest, lap) =>
                parseTime(lap.Sector2Time) <
                  parseTime(fastest.Sector2Time)
                  ? lap
                  : fastest,
              sessionLaps[0],
            )
            : defaultLap;

        const fastestS3Lap =
          sessionLaps.length > 0
            ? sessionLaps.reduce(
              (fastest, lap) =>
                parseTime(lap.Sector3Time) <
                  parseTime(fastest.Sector3Time)
                  ? lap
                  : fastest,
              sessionLaps[0],
            )
            : defaultLap;

        const fastestLap =
          sessionLaps.length > 0
            ? sessionLaps.reduce(
              (fastest, lap) =>
                parseTime(lap.LapTimeSeconds) <
                  parseTime(fastest.LapTimeSeconds)
                  ? lap
                  : fastest,
              sessionLaps[0],
            )
            : defaultLap;

        const getDriverInfo = (lap) => {
          if (!lap || !lap.DriverID)
            return {
              driver: "drivererror",
              fullname: "driver error",
              team: "teamerror",
              color: "white",
            };

          const driverID = lap.DriverID.toString();
          console.log(driverID);
          const driver = allDrivers.find((d) => d.ID.toString() === driverID);
          console.log(driver);
          const team = driver
            ? allTeams.find((t) => t.ID.toString() === driver.TeamID.toString())
            : null;

          return {
            driver: driver
              ? driver.DriverName.split(" ")
                .at(-1)
                .substring(0, 3)
                .toUpperCase()
              : "drivererror",
            fullname: driver ? driver.DriverName : "driver error",
            team: team ? team.TeamName : "teamerror",
            color: team ? team.Color : "white",
          };
        };

        const s1Info = getDriverInfo(fastestS1Lap);
        console.log(s1Info);
        const s2Info = getDriverInfo(fastestS2Lap);
        console.log(s2Info);
        const s3Info = getDriverInfo(fastestS3Lap);
        console.log(s3Info);
        const fastestLapInfo = getDriverInfo(fastestLap);

        const fetchOpenF1Drivers = async () => {
          console.log("Fetching session key...");

          if (circuit.Country === "UK") {
            circuit.Country = "United Kingdom";
          } else if (circuit.Country === "USA") {
            circuit.Country = "United States";
          } else if (circuit.Country === "UAE") {
            circuit.Country = "United Arab Emirates";
          }

          try {
            const response = await fetch(
              `https://api.openf1.org/v1/sessions?country_Name=${encodeURIComponent(circuit.Country)}&year=${safeYear}&session_name=${encodeURIComponent(safeSession)}`,
            );
            const sessionsData = await response.json();

            if (!sessionsData || sessionsData.length === 0) {
              console.warn("No sessions found from OpenF1 API");
              return;
            }

            const sessionKey = sessionsData[0].session_key;
            console.log("Session key:", sessionKey);

            setSessionKey(sessionKey);

            const driverResponse = await fetch(
              `https://api.openf1.org/v1/drivers?name_acronym=${fastestLapInfo.driver}&session_key=${sessionKey}`,
            );
            const driverData = await driverResponse.json();

            console.log("Fastest driver info:", driverData[0]);
            setFastestDriverHeadshot(driverData[0].headshot_url);
          } catch (error) {
            console.error("Error fetching from OpenF1 API:", error);
            return {
              driver: "drivererror",
              fullname: "driver error",
              team: "teamerror",
              color: "white",
            };
          }
        };

        const fastestDriverInfo = await fetchOpenF1Drivers();
        console.log(fastestDriverInfo);

        let s1Color = s1Info.color;
        let s2Color = s2Info.color;
        let s3Color = s3Info.color;
        let fastestLapColor = fastestLapInfo.color;

        const fadeColor = (hex) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, 0.6)`;
        };

        if (s1Info.team === s2Info.team && s1Info.driver !== s2Info.driver) {
          s2Color = fadeColor(s2Color);
        }

        if (s1Info.team === s3Info.team && s1Info.driver !== s3Info.driver) {
          s3Color = fadeColor(s3Color);
        }

        if (s2Info.team === s3Info.team && s2Info.driver !== s3Info.driver) {
          s3Color = fadeColor(s3Color);
        }

        setFastestTimes({
          s1: parseTime(fastestS1Lap.Sector1Time),
          s2: parseTime(fastestS2Lap.Sector2Time),
          s3: parseTime(fastestS3Lap.Sector3Time),
          fastestLap: parseFloat(fastestLap.LapTimeSeconds),

          s1Driver: s1Info.driver,
          s2Driver: s2Info.driver,
          s3Driver: s3Info.driver,
          fastestLapDriver: fastestLapInfo.fullname,

          s1Lap: fastestS1Lap.LapNumber,
          s2Lap: fastestS2Lap.LapNumber,
          s3Lap: fastestS3Lap.LapNumber,
          fastestLapLap: fastestLap.LapNumber,

          s1Team: s1Info.team,
          s2Team: s2Info.team,
          s3Team: s3Info.team,
          fastestLapTeam: fastestLapInfo.team,

          s1Color: s1Color,
          s2Color: s2Color,
          s3Color: s3Color,
          fastestLapColor: fastestLapColor,
        });

        setData(filteredResults);
      },
    );
  }, [activeYear, activeGP, activeSession]);

  return (
    <div className="flex justify-center items-start h-auto py-3 gap-10">
      <div className="w-full max-w-md space-y-1">
        <div className="grid grid-cols-[3.5rem_1fr_4rem] items-center w-full px-4 pb-2">
          <p className="font-formula1 text-xs text-gray-400">POS</p>
          <p className="font-formula1 text-xs text-gray-400">DRIVER</p>
          <p className="font-formula1 text-xs text-right text-gray-400">GAP</p>
        </div>

        {displayData.map((row, i) => (
          <div
            key={i}
            className={`grid grid-cols-[3.5rem_1fr_4rem] items-center w-full px-4 py-2 ${row.active ? "rounded-md bg-[#2d2d35]" : ""
              }`}
          >
            <div className="flex items-center gap-3">
              <p className="font-formula1bold text-sm min-w-[15px]">
                {row.pos}
              </p>
              <div className="w-[2px] h-3 bg-white"></div>
            </div>

            <div className="flex items-center gap-3">
              <p className="font-formula1bold text-sm uppercase">
                {row.driver}
              </p>
              <div className="flex items-center gap-1.5 opacity-80">
                <div
                  className="w-[3px] h-3 rounded-full"
                  style={{ backgroundColor: row.color }}
                ></div>
                <p className="font-formula1 text-[10px] text-gray-400">
                  {row.team}
                </p>
              </div>
            </div>

            <p className="font-formula1bold text-sm text-right font-formula1">
              {row.gap}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-5">
        <div className="w-[800px] h-auto bg-[#14131a] brightness-125 shadow-[0_0_10px_#000000] rounded-[22px] overflow-hidden flex flex-col border border-white/10">
          {displayMapData.map((row, i) => (
            <div key={i} className="flex flex-col h-full w-full">
              <div className="w-full flex justify-center py-6 gap-2">
                <img
                  className="w-13 h-11 rounded-2xl pl-2"
                  src={`/${row.country.toLowerCase()}.png`}
                ></img>
                <p className="font-formula1bold text-[28px] uppercase tracking-tighter">
                  {row.name}
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full shadow-sm bg-[#2d2d35] px-3">
                  <p className="font-titiliumreg p-0.5">{row.circuit}</p>
                </div>
                <div className="flex gap-2">
                  <div className="rounded-full shadow-sm bg-[#2d2d35] px-3 gap-3 flex items-center">
                    <p className="font-titiliumbold p-0.5">{row.date}</p>
                  </div>
                  <div className="rounded-full shadow-sm bg-[#2d2d35] px-3 gap-3 flex items-center">
                    <p className="font-titiliumbold p-0.5">
                      {row.temperature}°C
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center relative py-1 pb-10">
                <svg
                  viewBox="0 0 400 300"
                  className="w-[500px] translate-x-6"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <filter
                      id="whiteGlow"
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >
                      <feFlood
                        flood-color="white"
                        flood-opacity="0.8"
                        result="white_flood"
                      />
                      <feGaussianBlur
                        stdDeviation="6"
                        in="SourceGraphic"
                        result="blur_white"
                      />
                      <feComposite
                        in="white_flood"
                        in2="blur_white"
                        operator="in"
                        result="strong_white_glow"
                      />

                      <feMerge>
                        <feMergeNode in="strong_white_glow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <path
                    d={`${row.sector1}${row.sector2}${row.sector3}`}
                    stroke="white"
                    strokeWidth="12"
                    fill="none"
                    filter="url(#whiteGlow)"
                    strokeLinecap="round"
                  />

                  <path
                    d={row.sector1}
                    stroke={fastestTimes.s1Color || "#d400ff"}
                    strokeWidth="3"
                    fill="none"
                  />

                  <path
                    d={row.sector2 ? `M ${row.sector2.slice(1)}` : ""}
                    stroke={fastestTimes.s2Color || "#00ffbf"}
                    strokeWidth="3"
                    fill="none"

                  />

                  <path
                    d={row.sector3 ? `M ${row.sector3.slice(1)}` : ""}
                    stroke={fastestTimes.s3Color || "#ffee00"}
                    strokeWidth="3"
                    fill="none"

                  />
                </svg>

                <div className="absolute bottom-5 flex gap-8">
                  <div className="text-center">
                    <p
                      className="text-[10px] font-formula1"
                      style={{ color: fastestTimes.s1Color }}
                    >
                      {fastestTimes.s1Driver}
                    </p>
                    <p className="text-[#b624ff] font-formula1bold">
                      S1: {fastestTimes.s1}
                    </p>
                  </div>
                  <div className="text-center">
                    <p
                      className="text-[10px] font-formula1"
                      style={{ color: fastestTimes.s2Color }}
                    >
                      {fastestTimes.s2Driver}
                    </p>
                    <p className="text-[#b624ff] font-formula1bold">
                      S2: {fastestTimes.s2}
                    </p>
                  </div>
                  <div className="text-center">
                    <p
                      className="text-[10px] font-formula1"
                      style={{ color: fastestTimes.s3Color }}
                    >
                      {fastestTimes.s3Driver}
                    </p>
                    <p className="text-[#b624ff] font-formula1bold">
                      S3: {fastestTimes.s3}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 w-full py-6 px-10 border-t border-white/5">
                <div className="flex flex-col items-center border-r border-white/10">
                  <span className="text-[10px] text-gray-500 font-formula1">
                    COUNTRY
                  </span>
                  <span className="font-formula1bold text-sm uppercase">
                    {row.country}
                  </span>
                </div>
                <div className="flex flex-col items-center border-r border-white/10">
                  <span className="text-[10px] text-gray-500 font-formula1">
                    CITY
                  </span>
                  <span className="font-formula1bold text-sm uppercase">
                    {row.city}
                  </span>
                </div>
                <div className="flex flex-col items-center border-r border-white/10">
                  <span className="text-[10px] text-gray-500 font-formula1">
                    CORNERS
                  </span>
                  <span className="font-formula1bold text-sm">
                    {row.corners}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-500 font-formula1">
                    LENGTH
                  </span>
                  <span className="font-formula1bold text-sm">
                    {row.length} KM
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {displayMapData.map((row, i) => (
          <div
            key={`fastest-${i}`}
            className="relative w-[800px] h-auto shadow-lg rounded-[22px] overflow-hidden flex border border-white/10"
            style={{
              backgroundColor: fastestTimes.fastestLapColor || "#14131a",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center ">
              <p className="text-[140px] font-formula1bold italic text-white/30 tracking-widest select-none">
                FASTEST
              </p>
            </div>

            <div className="relative flex h-full w-full items-end p-1">
              <div
                className="absolute w-32 h-32 translate-x-12"
                style={{
                  backgroundImage: `url(${fastestDriverHeadshot})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              <div className="backdrop-blur-md bg-white/2 border border-white/20 rounded-xl px-3 py-1 shadow-lg">
                <p className="font-formula1bold text-[22px] uppercase tracking-tighter">
                  {fastestTimes.fastestLapDriver || "Unknown Driver"}
                </p>
              </div>
              <div className="flex flex-col justify-center items-center gap-1 pl-50">
                <p className="font-formula1bold text-[30px] text-white">
                  Lap {fastestTimes.fastestLapLap || "-"}
                </p>
                <p className="font-formula1bold text-[53px] text-white">
                  {fastestTimes.fastestLap
                    ? fastestTimes.fastestLap.toFixed(3)
                    : "0.000"}
                  s
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
