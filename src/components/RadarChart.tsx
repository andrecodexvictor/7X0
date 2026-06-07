import React from 'react';
import * as d3 from 'd3';

interface CompetitorData {
  name: string;
  pace: number;
  consistency: number;
  chuva: number;
  aggressiveness: number;
  reliability: number;
  color?: string;
  sourceTeam?: string;
  sourceSeason?: number | string;
}

interface RadarChartProps {
  competitorA: CompetitorData;
  competitorB: CompetitorData;
  colorA?: string;
  colorB?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  competitorA,
  competitorB,
  colorA = '#FF1801', // Red/Crimson
  colorB = '#00E5FF'  // Cyan/Cyan Spark
}) => {
  const width = 360;
  const height = 360;
  const margin = 50;
  const radius = Math.min(width, height) / 2 - margin;
  const cx = width / 2;
  const cy = height / 2;

  // Features list
  const features = [
    { key: 'pace', name: 'Ritmo (Pace)' },
    { key: 'consistency', name: 'Constância' },
    { key: 'chuva', name: 'Chuva (Wet)' },
    { key: 'aggressiveness', name: 'Agressividade' },
    { key: 'reliability', name: 'Confiabilidade' }
  ];

  const numAxes = features.length;

  // D3 Scale for Radius
  const rScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, radius]);

  // Points mapping function
  const getCoordinates = (competitor: CompetitorData) => {
    return features.map((f, i) => {
      const val = competitor[f.key as keyof CompetitorData] as number || 70;
      const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2; // Offset by -PI/2 to start from top
      const r = rScale(val);
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        val,
        name: f.name
      };
    });
  };

  const pointsA = getCoordinates(competitorA);
  const pointsB = getCoordinates(competitorB);

  // SVG path generator function
  const pathGenerator = d3.line<{ x: number; y: number }>()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveLinearClosed);

  const pathA = pathGenerator(pointsA) || '';
  const pathB = pathGenerator(pointsB) || '';

  // Concentric background rings (e.g. at 20, 40, 60, 80, 100)
  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <div className="flex flex-col items-center select-none bg-black/40 border border-[#222] p-4 rounded-md">
      <div className="relative">
        <svg width={width} height={height} className="overflow-visible">
          {/* Radial Axis lines */}
          {features.map((f, i) => {
            const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
            const lineX = cx + radius * Math.cos(angle);
            const lineY = cy + radius * Math.sin(angle);
            return (
              <g key={`axis-${f.key}`}>
                {/* Guideline */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={lineX}
                  y2={lineY}
                  stroke="#222222"
                  strokeWidth="1.5"
                />
                
                {/* Attribute Axis labels */}
                <text
                  x={cx + (radius + 20) * Math.cos(angle)}
                  y={cy + (radius + 15) * Math.sin(angle)}
                  fill="#888888"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className="font-bold tracking-tight"
                >
                  {f.name.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* Background Concentric Pentagons */}
          {gridLevels.map((lvl) => {
            const lvlRadius = rScale(lvl);
            const ringPoints = features.map((_, i) => {
              const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
              return {
                x: cx + lvlRadius * Math.cos(angle),
                y: cy + lvlRadius * Math.sin(angle)
              };
            });
            const ringPath = pathGenerator(ringPoints) || '';

            return (
              <g key={`grid-lvl-${lvl}`}>
                <path
                  d={ringPath}
                  fill="none"
                  stroke="#1A1A1A"
                  strokeDasharray="2,2"
                  strokeWidth="1"
                />
                {/* Level marker text on the vertical axis (0 angle or top) */}
                <text
                  x={cx + 5}
                  y={cy - lvlRadius}
                  fontSize="8"
                  fontFamily="monospace"
                  fill="#444444"
                  alignmentBaseline="middle"
                >
                  {lvl}
                </text>
              </g>
            );
          })}

          {/* Polygon competitor A */}
          <path
            d={pathA}
            fill={`${colorA}20`} // 20 opacity hex
            stroke={colorA}
            strokeWidth="2.5"
            className="transition-all duration-300"
          />

          {/* Polygon competitor B */}
          <path
            d={pathB}
            fill={`${colorB}20`} // 20 opacity hex
            stroke={colorB}
            strokeWidth="2.5"
            className="transition-all duration-300"
          />

          {/* Anchors for polygon A */}
          {pointsA.map((pt, i) => (
            <g key={`anchorA-${i}`}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                fill="#050505"
                stroke={colorA}
                strokeWidth="2"
              />
              <text
                x={pt.x}
                y={pt.y - 8}
                fill={colorA}
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {pt.val}
              </text>
            </g>
          ))}

          {/* Anchors for polygon B */}
          {pointsB.map((pt, i) => (
            <g key={`anchorB-${i}`}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                fill="#050505"
                stroke={colorB}
                strokeWidth="2"
              />
              <text
                x={pt.x}
                y={pt.y + 13}
                fill={colorB}
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {pt.val}
              </text>
            </g>
          ))}

          {/* Center Point */}
          <circle cx={cx} cy={cy} r="3" fill="#333333" />
        </svg>
      </div>

      {/* Side-by-Side Detailed Breakdown */}
      <div className="w-full mt-4 border-t border-[#222] pt-4 grid grid-cols-2 gap-4 text-xs font-mono">
        {/* Competitor A Details */}
        <div className="space-y-1.5 border-r border-[#1C1C1C] pr-2">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colorA }}></span>
            <span className="font-bold text-white block truncate max-w-full" title={competitorA.name}>
              {competitorA.name}
            </span>
          </div>
          {competitorA.sourceTeam && (
            <span className="text-[9px] text-[#666] uppercase block truncate">
              {competitorA.sourceTeam} ({competitorA.sourceSeason})
            </span>
          )}
          <div className="space-y-1 pt-1.5">
            {features.map(f => {
              const val = competitorA[f.key as keyof CompetitorData] as number || 70;
              return (
                <div key={`statA-${f.key}`} className="flex justify-between text-[10px] text-[#888]">
                  <span>{f.name.split(' ')[0]}:</span>
                  <span className="text-white font-bold">{val}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Competitor B Details */}
        <div className="space-y-1.5 pl-2">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colorB }}></span>
            <span className="font-bold text-white block truncate max-w-full" title={competitorB.name}>
              {competitorB.name}
            </span>
          </div>
          {competitorB.sourceTeam && (
            <span className="text-[9px] text-[#666] uppercase block truncate">
              {competitorB.sourceTeam} ({competitorB.sourceSeason})
            </span>
          )}
          <div className="space-y-1 pt-1.5">
            {features.map(f => {
              const val = competitorB[f.key as keyof CompetitorData] as number || 70;
              return (
                <div key={`statB-${f.key}`} className="flex justify-between text-[10px] text-[#888]">
                  <span>{f.name.split(' ')[0]}:</span>
                  <span className="text-white font-bold">{val}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
