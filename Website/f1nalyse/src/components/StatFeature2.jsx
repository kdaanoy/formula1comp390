import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

export default function StatFeature2({ laps }) {
  console.log(laps);

  const processedData = [];
  const [visibleDrivers, setVisibleDrivers] = useState(
    Object.fromEntries(laps.map((driver) => [driver.driver, false])),
  );

  function CustomTooltip({ active, payload, label }) {
    return (
      <div className="bg-[#14131a] p-2 rounded shadow-lg border-[2px] border-[white] w-40">
        <p className="font-formula1bold text-sm">{`Lap ${label}`}</p>
        {payload.map((entry) => (
          <p
            key={entry.dataKey}
            className="font-formula1bold text-sm pl-2"
            style={{ color: entry.stroke }}
          >
            {`${entry.dataKey} - ${entry.value}s`}
          </p>
        ))}
      </div>
    );
  }

  const toggleAll = (hide) => {
    const newState = Object.fromEntries(
      laps.map((driver) => [driver.driver, hide]),
    );
    setVisibleDrivers(newState);
  };

  const addDriver = (driver) => {
    setVisibleDrivers((prev) => ({
      ...prev,
      [driver]: !prev[driver],
    }));
  };

  laps.forEach((driver) => {
    driver.laps.forEach((lap, i) => {
      if (!processedData[i]) {
        processedData[i] = { lap: i + 1 };
      }

      processedData[i][driver.driver] = lap.time;
    });
  });

  processedData.sort((a, b) => a.lap - b.lap);

  console.log(processedData);

  return (
    <div className="flex justify-center items-start pt-10 h-400">
      <div className="relative w-320 h-190 bg-[#14131a] brightness-125 shadow-[0_0_10px_#000000] rounded-[20px]">
        <div className="p-5 font-formula1bold text-[30px]">
          <p>Lap Times</p>
        </div>

        <ResponsiveContainer width="100%" height={600}>
          <LineChart
            data={processedData}
            margin={{ top: 20, right: 50, left: 50, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="lap" stroke="grey" fontFamily="formula1bold" />
            <YAxis
              stroke="grey"
              domain={["dataMin-1", "dataMax+1"]}
              fontFamily="formula1bold"
            />
            <Tooltip content={<CustomTooltip />} />

            {laps.map((driver) => (
              <Line
                key={driver.driver}
                type="monotone"
                dataKey={driver.driver}
                stroke={driver.color}
                dot={false}
                strokeWidth={2}
                hide={visibleDrivers[driver.driver]}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        <div className="flex flex-wrap gap-2 justify-center pt-2">
          {laps.map((driver) => (
            <span
              key={driver.driver}
              onClick={() => addDriver(driver.driver)}
              className={`border-[2px] rounded-[13px] p-1 font-formula1bold cursor-pointer select-none transition-colors bg-white 
                        ${visibleDrivers[driver.driver] ? "brightness-50" : ""}
                    }`}
              style={{
                borderColor: driver.color,
                color: driver.color,
              }}
            >
              {driver.driver}
            </span>
          ))}
        </div>

        <div className="absolute top-5 right-5 flex gap-2">
          <button
            onClick={() => toggleAll(false)}
            className="border-[2px] rounded-[13px] p-1 font-formula1bold cursor-pointer select-none transition-colors "
          >
            Show All
          </button>
          <button
            onClick={() => toggleAll(true)}
            className="border-[2px] rounded-[13px] p-1 font-formula1bold cursor-pointer select-none transition-colors "
          >
            Hide All
          </button>
        </div>
      </div>
    </div>
  );
}
