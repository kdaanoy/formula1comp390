import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const tyreColours = {
  SOFT: "#ff2e2e",
  MEDIUM: "#ffd800",
  HARD: "#ffffff",
  INTERMEDIATE: "#00ff00",
  WET: "#0066ff",
};

const tyreColours2 = {
  HYPERSOFT: "#ffb4c4",
  ULTRASOFT: "#b34aa8",
  SUPERSOFT: "#ff2928",
  SOFT: "#fed311",
  MEDIUM: "#ffffff",
  HARD: "#00a3f3",
  SUPERHARD: "#ff803c",
  INTERMEDIATE: "#3ecc2e",
  WET: "#018dd2",
};

const tyreImages = {
  SOFT: `/soft_tyres.png`,
  MEDIUM: "/medium_tyres.png",
  HARD: "/hard_tyres.png",
  INTERMEDIATE: "/intermediate_tyres.png",
  WET: "/wet_tyres.png",
};

const tyreImages2 = {
  HYPERSOFT: "/hypersoft_tyres.png",
  ULTRASOFT: "/ultrasoft_tyres.png",
  SUPERSOFT: "/supersoft_tyres.png",
  SOFT: "/soft2_tyres.png",
  MEDIUM: "/medium2_tyres.png",
  HARD: "/hard2_tyres.png",
  SUPERHARD: "/superhard_tyres.png",
  INTERMEDIATE: "/intermediate_tyres.png",
  WET: "/wet_tyres.png",
};

function CustomTooltip({ payload, label, active, activeYear }) {
  if (!active || !payload?.length) return null;

  const filteredPayload = payload.filter((entry) => entry.value > 0);
  const imageMap =
    Number(activeYear) > 2019 || activeYear == null ? tyreImages : tyreImages2;

  if (!filteredPayload.length) return null;

  return (
    <div
      style={{
        backgroundColor: "#14131a",
        padding: 7,
        borderRadius: 10,
        color: "#fff",
        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
        zIndex: 999,
      }}
    >
      <p
        style={{ fontWeight: "bold", marginBottom: 5, fontFamily: "formula1" }}
      >
        {label}
      </p>
      {filteredPayload.map((entry) => (
        <div
          key={entry.dataKey}
          style={{ display: "flex", alignItems: "center", marginBottom: 5 }}
        >
          <img
            src={imageMap[entry.dataKey] || "/soft_tyres.png"}
            alt={entry.dataKey}
            style={{ width: 40, height: 40, marginRight: 8 }}
          />
          <span className="font-titiliumbold">
            {entry.dataKey}: {entry.value} Laps
          </span>
        </div>
      ))}
    </div>
  );
}

const renderCustomLabel = (data) => {
  const { value, x, y, width, height } = data;

  if (!value || width <= 0) return null;

  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="#000"
      fontSize={12}
      fontFamily="formula1bold"
      textAnchor="middle"
      dominantBaseline="middle"
    >
      {value}
    </text>
  );
};

export default function StatFeature1({ laps, activeYear }) {
  const compoundColours =
    Number(activeYear) > 2019 || activeYear == null
      ? tyreColours
      : tyreColours2;

  const allCompounds = Object.keys(compoundColours);

  const processedData = laps.map((driver) => {
    const counts = {};
    allCompounds.forEach((compound) => {
      counts[compound] = driver.laps.filter(
        (lap) => lap.tyre === compound,
      ).length;
    });
    return {
      driver: driver.driver,
      ...counts,
    };
  });

  console.log(processedData);

  return (
    <div className="flex justify-center items-start pt-10 h-205">
      <div className="relative w-320 h-190 bg-[#14131a] brightness-125 shadow-[0_0_10px_#000000] rounded-[20px]">
        <div className="p-5 font-formula1bold text-[30px]">
          <p>Tyre Stints</p>
        </div>

        <div>
          <ResponsiveContainer width="98%" height={650}>
            <BarChart
              layout="vertical"
              data={processedData}
              margin={{ top: 10, right: 40, left: 40, bottom: 10 }}
            >
              <XAxis type="number" fontFamily="formula1bold" />
              <YAxis
                dataKey="driver"
                type="category"
                fontFamily="formula1bold"
                tick={({ x, y, payload }) => {
                  const driverEntry = laps.find(
                    (d) => d.driver === payload.value,
                  );
                  const color = driverEntry?.color || "#FFFFFF";

                  return (
                    <text
                      x={x - 10}
                      y={y + 5}
                      textAnchor="end"
                      fill={color}
                      fontFamily="formula1bold"
                      fontSize={12}
                    >
                      {payload.value}
                    </text>
                  );
                }}
              />
              <Tooltip content={<CustomTooltip activeYear={activeYear} />} />

              {allCompounds.map((compound) => (
                <Bar
                  key={compound}
                  dataKey={compound}
                  stackId="a"
                  fill={compoundColours[compound]}
                  label={renderCustomLabel}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
