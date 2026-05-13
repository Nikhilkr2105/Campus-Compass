"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building } from "@/data/buildings";

interface BuildingMarkerProps {
  building: Building;
  isSelected: boolean;
  isOnRoute: boolean;
  isRouteStart: boolean;
  isRouteEnd: boolean;
  isCurrentStep: boolean;
  zoom: number;
  onClick: () => void;
}

export function BuildingMarker({
  building,
  isSelected,
  isOnRoute,
  isRouteStart,
  isRouteEnd,
  isCurrentStep,
  zoom,
  onClick,
}: BuildingMarkerProps) {
  const [hovered, setHovered] = useState(false);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (!isSelected && !isCurrentStep) return;
    const id = setInterval(() => setPulse((p) => (p + 1) % 60), 40);
    return () => clearInterval(id);
  }, [isSelected, isCurrentStep]);

  const r = isSelected ? 18 : hovered ? 16 : 13;
  const labelY = building.y + r + 14;
  const ringColor = isRouteStart
    ? "#00d4ff"
    : isRouteEnd
    ? "#8b5cf6"
    : building.color;

  const strokeColor = isSelected
    ? building.color
    : isCurrentStep
    ? "#00d4ff"
    : isOnRoute
    ? `${building.color}cc`
    : hovered
    ? `${building.color}aa`
    : `${building.color}66`;

  return (
    <g
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer" }}
    >
      {/* ── Animated radar rings ── */}
      {(isSelected || isRouteStart || isRouteEnd || isCurrentStep) && (
        <>
          <circle
            cx={building.x}
            cy={building.y}
            r={r + 8 + (pulse % 30) * 0.5}
            fill="none"
            stroke={ringColor}
            strokeWidth={1.2}
            opacity={Math.max(0, 0.6 - (pulse % 30) / 30)}
          />
          <circle
            cx={building.x}
            cy={building.y}
            r={r + 16 + (pulse % 30) * 0.5}
            fill="none"
            stroke={ringColor}
            strokeWidth={0.8}
            opacity={Math.max(0, 0.3 - (pulse % 30) / 60)}
          />
        </>
      )}

      {/* ── Hover glow ── */}
      {(hovered || isSelected) && (
        <circle
          cx={building.x}
          cy={building.y}
          r={r + 10}
          fill={building.color}
          opacity={0.1}
          style={{ filter: "blur(8px)" }}
        />
      )}

      {/* ── Main circle ── */}
      <circle
        cx={building.x}
        cy={building.y}
        r={r}
        fill={
          isSelected
            ? `${building.color}28`
            : hovered
            ? `${building.color}18`
            : "rgba(6,13,24,0.92)"
        }
        stroke={strokeColor}
        strokeWidth={isSelected ? 2.5 : hovered ? 2 : 1.5}
        style={{
          filter: isSelected
            ? `drop-shadow(0 0 10px ${building.color})`
            : hovered
            ? `drop-shadow(0 0 6px ${building.color}88)`
            : "none",
          transition: "all 0.2s ease",
        }}
      />

      {/* ── Icon ── */}
      <text
        x={building.x}
        y={building.y + 5}
        textAnchor="middle"
        fontSize={isSelected ? 14 : hovered ? 12 : 10}
        style={{ userSelect: "none", transition: "font-size 0.2s ease" }}
      >
        {building.icon}
      </text>

      {/* ── Route start / end badge ── */}
      {(isRouteStart || isRouteEnd) && (
        <>
          <circle
            cx={building.x + r - 2}
            cy={building.y - r + 2}
            r={6}
            fill={isRouteStart ? "#00d4ff" : "#8b5cf6"}
            style={{
              filter: `drop-shadow(0 0 4px ${isRouteStart ? "#00d4ff" : "#8b5cf6"})`,
            }}
          />
          <text
            x={building.x + r - 2}
            y={building.y - r + 6}
            textAnchor="middle"
            fill="#fff"
            fontSize={7}
            fontWeight={700}
            fontFamily="var(--font-body)"
            style={{ userSelect: "none" }}
          >
            {isRouteStart ? "S" : "E"}
          </text>
        </>
      )}

      {/* ── Name label ── */}
      <text
        x={building.x}
        y={labelY}
        textAnchor="middle"
        fill={
          isSelected
            ? "#fff"
            : isCurrentStep
            ? "#00d4ff"
            : isOnRoute
            ? "rgba(0,212,255,0.85)"
            : hovered
            ? "rgba(240,244,255,0.9)"
            : "rgba(240,244,255,0.55)"
        }
        fontSize={isSelected ? 9.5 : 8.5}
        fontWeight={isSelected ? 600 : 400}
        fontFamily="var(--font-body)"
        style={{ userSelect: "none", transition: "all 0.2s" }}
      >
        {building.shortName}
      </text>

      {/* ── Floor count (selected only) ── */}
      {isSelected && (
        <text
          x={building.x}
          y={labelY + 12}
          textAnchor="middle"
          fill={building.color}
          fontSize={8}
          fontFamily="var(--font-body)"
          style={{ userSelect: "none" }}
        >
          {building.floors}F
        </text>
      )}
    </g>
  );
}