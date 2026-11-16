import React from "react";
import type { RiasecScore } from "../types/eduguide";

interface RiasecChartProps {
  scores: RiasecScore[];
}

export const RiasecChart: React.FC<RiasecChartProps> = ({ scores }) => {
  // Đảm bảo thứ tự cố định R-I-A-S-E-C cho biểu đồ radar lục giác
  const orderedCodes = ["R", "I", "A", "S", "E", "C"] as const;
  const ordered = orderedCodes.map(
    (code) =>
      scores.find((s) => s.code === code) || {
        code,
        nameVi: code,
        score: 0,
        maxScore: 18,
        percentage: 0,
      }
  );

  const size = 260;
  const center = size / 2;
  const radius = 92;
  const levels = [0.25, 0.5, 0.75, 1];

  const getPoint = (index: number, ratio: number) => {
    const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
    return {
      x: center + Math.cos(angle) * radius * ratio,
      y: center + Math.sin(angle) * radius * ratio,
    };
  };

  const polygonPoints = ordered
    .map((item, idx) => {
      const ratio = item.maxScore > 0 ? Math.max(0.06, item.score / item.maxScore) : 0.06;
      const pt = getPoint(idx, ratio);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      <div className="lg:col-span-5 flex justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[260px] h-auto"
          role="img"
          aria-label="Biểu đồ lục giác sở thích Holland RIASEC"
        >
          {levels.map((lvl) => {
            const ringPts = orderedCodes
              .map((_, idx) => {
                const p = getPoint(idx, lvl);
                return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
              })
              .join(" ");
            return (
              <polygon
                key={lvl}
                points={ringPts}
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1"
                strokeDasharray={lvl < 1 ? "3 3" : undefined}
              />
            );
          })}

          {orderedCodes.map((code, idx) => {
            const outer = getPoint(idx, 1);
            const labelPt = getPoint(idx, 1.18);
            return (
              <g key={code}>
                <line
                  x1={center}
                  y1={center}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                />
                <text
                  x={labelPt.x}
                  y={labelPt.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-[#0F172A] text-[12px] font-bold font-mono"
                >
                  {code}
                </text>
              </g>
            );
          })}

          <polygon
            points={polygonPoints}
            fill="rgba(29, 78, 216, 0.16)"
            stroke="#1D4ED8"
            strokeWidth="2"
          />

          {ordered.map((item, idx) => {
            const ratio = item.maxScore > 0 ? Math.max(0.06, item.score / item.maxScore) : 0.06;
            const pt = getPoint(idx, ratio);
            return (
              <circle
                key={item.code}
                cx={pt.x}
                cy={pt.y}
                r="4"
                fill="#1D4ED8"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>

      <div className="lg:col-span-7 space-y-3">
        {scores.map((item, rankIdx) => (
          <div key={item.code} className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="font-medium text-[#0F172A]">
                <span className="font-mono-tabular font-semibold text-[#1D4ED8] mr-2">
                  #{rankIdx + 1} · {item.code}
                </span>
                {item.nameVi}
              </span>
              <span className="font-mono-tabular text-xs font-semibold text-[#334155] shrink-0">
                {item.score}/{item.maxScore} điểm ({item.percentage}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-[#E2E8F0] rounded-sm overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  rankIdx < 3 ? "bg-[#1D4ED8]" : "bg-[#64748B]"
                }`}
                style={{ width: `${Math.min(100, item.percentage)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
