"use client";

import { motion } from "framer-motion";
import { Building } from "@/data/buildings";

interface FloorSelectorProps {
  building: Building;
  activeFloor: number;
  onFloorChange: (floor: number) => void;
}

export function FloorSelector({
  building,
  activeFloor,
  onFloorChange,
}: FloorSelectorProps) {
  const floors = Array.from({ length: building.floors }, (_, i) => i + 1);

  if (building.floors <= 1) return null;

  return (
    <div
      className="absolute right-5 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2"
    >
      <div
        className="text-[9px] font-semibold tracking-[1.5px] text-center mb-1"
        style={{ color: "var(--text-3)", fontFamily: "var(--font-display)" }}
      >
        FLOOR
      </div>

      {[...floors].reverse().map((floor) => {
        const active = floor === activeFloor;
        return (
          <motion.button
            key={floor}
            onClick={() => onFloorChange(floor)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.93 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold"
            style={{
              background:  active ? `${building.color}22` : "rgba(6,13,24,0.9)",
              border:      `1.5px solid ${active ? building.color : "rgba(255,255,255,0.1)"}`,
              color:       active ? building.color : "var(--text-3)",
              cursor:      "pointer",
              boxShadow:   active ? `0 0 14px ${building.color}44` : "none",
              fontFamily:  "var(--font-display)",
              backdropFilter: "blur(12px)",
              transition:  "all 0.2s ease",
            }}
          >
            {floor}
          </motion.button>
        );
      })}

      {/* Ground indicator */}
      <div
        className="text-[8px] text-center mt-0.5"
        style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
      >
        G→{building.floors}
      </div>
    </div>
  );
}