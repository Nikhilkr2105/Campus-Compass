"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, ZoomIn, ZoomOut, RotateCcw, Accessibility } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { ALL_FLOORS, VERTICAL_LINKS, getBuildingFloors, ROOM_COLORS, FloorRoom, FloorData } from "@/data/floors";
import {
  resolveIndoorRoute, searchRooms, nodeKey,
  IndoorStep, IndoorRoute, VerticalMode,
} from "@/lib/indoor-routing";

// ── Room tooltip ──────────────────────────────────────
function RoomTooltip({ room, x, y }: { room: FloorRoom; x: number; y: number }) {
  return (
    <foreignObject x={x + 4} y={y - 36} width={130} height={34} style={{ overflow: "visible" }}>
      <div
        style={{
          background:    "rgba(6,13,24,0.96)",
          border:        "1px solid rgba(0,212,255,0.3)",
          borderRadius:  8,
          padding:       "4px 8px",
          fontSize:      11,
          color:         "var(--text-1)",
          fontFamily:    "var(--font-body)",
          whiteSpace:    "nowrap",
          backdropFilter:"blur(12px)",
          boxShadow:     "0 4px 16px rgba(0,0,0,0.5)",
          pointerEvents: "none",
        }}
      >
        {room.name}
      </div>
    </foreignObject>
  );
}

// ── Single room rect ──────────────────────────────────
function RoomRect({
  room,
  isOnPath,
  isActive,
  isStart,
  isEnd,
  stepIndex,
  onClick,
}: {
  room:       FloorRoom;
  isOnPath:   boolean;
  isActive:   boolean;
  isStart:    boolean;
  isEnd:      boolean;
  stepIndex:  number;
  onClick:    () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const base    = ROOM_COLORS[room.type];
  const isCorridor = room.type === "corridor";
  const isUtil     = room.type === "staircase" || room.type === "lift" || room.type === "washroom";

  const fill = isCorridor
    ? "rgba(255,255,255,0.025)"
    : isActive  ? `${base}35`
    : isOnPath  ? `${base}22`
    : hovered   ? `${base}18`
    : `${base}0d`;

  const stroke = isCorridor
    ? "rgba(255,255,255,0.06)"
    : isActive  ? base
    : isStart   ? "var(--cyan)"
    : isEnd     ? "var(--purple)"
    : isOnPath  ? `${base}99`
    : hovered   ? `${base}66`
    : `${base}33`;

  const strokeW = isActive || isStart || isEnd ? 2 : 1;

  return (
    <g
      onClick={!isCorridor ? onClick : undefined}
      onMouseEnter={() => !isCorridor && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: isCorridor ? "default" : "pointer" }}
    >
      {/* Glow */}
      {(isActive || isStart || isEnd) && (
        <rect
          x={room.x - 4} y={room.y - 4}
          width={room.w + 8} height={room.h + 8}
          rx={10}
          fill={base}
          opacity={0.08}
          style={{ filter: "blur(6px)" }}
        />
      )}

      {/* Main rect */}
      <rect
        x={room.x} y={room.y}
        width={room.w} height={room.h}
        rx={6}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeW}
        style={{ transition: "all 0.2s ease" }}
      />

      {/* Step number badge */}
      {(isStart || isEnd) && (
        <circle
          cx={room.x + room.w - 8}
          cy={room.y + 8}
          r={8}
          fill={isStart ? "var(--cyan)" : "var(--purple)"}
          style={{ filter: `drop-shadow(0 0 6px ${isStart ? "var(--cyan)" : "var(--purple)"})` }}
        />
      )}
      {(isStart || isEnd) && (
        <text
          x={room.x + room.w - 8}
          y={room.y + 12}
          textAnchor="middle"
          fill="#fff"
          fontSize={8}
          fontWeight={700}
          fontFamily="var(--font-body)"
          style={{ userSelect: "none" }}
        >
          {isStart ? "S" : "E"}
        </text>
      )}

      {/* Room label */}
      {!isCorridor && room.w > 50 && (
        <text
          x={room.x + room.w / 2}
          y={room.y + room.h / 2 + (isUtil ? 4 : 3)}
          textAnchor="middle"
          fill={isOnPath || hovered ? "var(--text-1)" : "rgba(240,244,255,0.45)"}
          fontSize={isUtil ? 9 : 9.5}
          fontFamily="var(--font-body)"
          style={{ userSelect: "none", transition: "fill 0.2s" }}
        >
          {isUtil ? (room.type === "staircase" ? "↕ Stair" : room.type === "lift" ? "⬆ Lift" : "🚻") : room.name}
        </text>
      )}

      {/* Hover tooltip */}
      {hovered && !isCorridor && (
        <RoomTooltip room={room} x={room.x} y={room.y} />
      )}
    </g>
  );
}

// ── Animated path line on floor ───────────────────────
function FloorPathLine({
  steps,
  floor,
  rooms,
  animKey,
}: {
  steps:   IndoorStep[];
  floor:   number;
  rooms:   FloorRoom[];
  animKey: string;
}) {
  const floorSteps = steps.filter((s) => s.floor === floor);
  if (floorSteps.length < 2) return null;

  const getCenter = (roomId: string) => {
    const r = rooms.find((rm) => rm.id === roomId);
    if (!r) return null;
    return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  };

  const points = floorSteps
    .map((s) => getCenter(s.roomId))
    .filter(Boolean) as { x: number; y: number }[];

  if (points.length < 2) return null;

  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const approxLen = points.reduce((acc, p, i) => {
    if (i === 0) return 0;
    const prev = points[i - 1];
    return acc + Math.hypot(p.x - prev.x, p.y - prev.y);
  }, 0);

  return (
    <g>
      {/* Shadow */}
      <path
        d={d} fill="none"
        stroke="rgba(0,212,255,0.15)"
        strokeWidth={10} strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: "blur(5px)" }}
      />
      {/* Main path */}
      <path
        key={animKey}
        d={d} fill="none"
        stroke="var(--cyan)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={`${approxLen} ${approxLen}`}
        style={{
          strokeDashoffset: 0,
          filter:           "drop-shadow(0 0 4px rgba(0,212,255,0.8))",
          animation:        `route-draw 0.9s cubic-bezier(0.4,0,0.2,1) both`,
        }}
      />
      {/* Waypoint dots */}
      {points.slice(1, -1).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3}
          fill="var(--cyan)" opacity={0.7}
          style={{ filter: "drop-shadow(0 0 3px #00d4ff)" }}
        />
      ))}
    </g>
  );
}

// ── Floor selector pill ───────────────────────────────
function FloorSelector({
  floors, active, onChange,
}: {
  floors:   FloorData[];
  active:   number;
  onChange: (f: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {[...floors].reverse().map((f) => (
        <motion.button
          key={f.floor}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => onChange(f.floor)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold transition-all"
          style={{
            background: f.floor === active
              ? "rgba(0,212,255,0.18)"
              : "rgba(255,255,255,0.04)",
            border: `1px solid ${f.floor === active
              ? "rgba(0,212,255,0.5)"
              : "rgba(255,255,255,0.08)"}`,
            color:      f.floor === active ? "var(--cyan)" : "var(--text-3)",
            cursor:     "pointer",
            boxShadow:  f.floor === active ? "0 0 12px rgba(0,212,255,0.2)" : "none",
            fontFamily: "var(--font-display)",
          }}
        >
          {f.floor}
        </motion.button>
      ))}
    </div>
  );
}

// ── Step instruction card ─────────────────────────────
function StepCard({ step, index, total }: { step: IndoorStep; index: number; total: number }) {
  const icons: Record<IndoorStep["action"], string> = {
    walk:       "🚶",
    "take-stair": "↕️",
    "take-lift":  "🛗",
    arrive:     "📍",
  };

  return (
    <motion.div
      key={step.nodeId}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0  }}
      className="flex items-start gap-2.5 py-2.5"
      style={{ borderBottom: index < total - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
    >
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
        style={{
          background: step.action === "arrive"
            ? "rgba(139,92,246,0.15)"
            : step.action === "walk"
            ? "rgba(0,212,255,0.1)"
            : "rgba(245,158,11,0.1)",
          border: `1px solid ${
            step.action === "arrive" ? "rgba(139,92,246,0.3)"
            : step.action === "walk" ? "rgba(0,212,255,0.2)"
            : "rgba(245,158,11,0.3)"
          }`,
        }}
      >
        {icons[step.action]}
      </div>
      <div className="min-w-0">
        <div
          className="text-[12px] font-medium truncate"
          style={{ color: step.action === "arrive" ? "var(--purple)" : "var(--text-1)", fontFamily: "var(--font-body)" }}
        >
          {step.roomName}
        </div>
        <div
          className="text-[10px]"
          style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
        >
          {step.floorChange
            ? `${step.action === "take-stair" ? "Take stairs" : "Take lift"} to Floor ${step.floorChange.to}`
            : step.action === "arrive"
            ? "You have arrived"
            : `Floor ${step.floor}`}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main FloorMap component ───────────────────────────
const BUILDING_ID = "block-a";

export function FloorMap() {
  const floors     = getBuildingFloors(BUILDING_ID);
  const [activeFloor,  setActiveFloor]  = useState(1);
  const [zoom,         setZoom]         = useState(1.1);
  const [pan,          setPan]          = useState({ x: 0, y: 0 });
  const [dragging,     setDragging]     = useState(false);
  const [startRoom,    setStartRoom]    = useState("");
  const [endRoom,      setEndRoom]      = useState("");
  const [mode,         setMode]         = useState<VerticalMode>("any");
  const [route,        setRoute]        = useState<IndoorRoute | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [pickMode,     setPickMode]     = useState<"start" | "end" | null>(null);
  const lastPos = useRef({ x: 0, y: 0 });

  const floorData = floors.find((f) => f.floor === activeFloor);

  // Zoom / pan handlers
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.5, Math.min(3.5, z - e.deltaY * 0.001)));
  }, []);
  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan((p) => ({ x: p.x + e.clientX - lastPos.current.x, y: p.y + e.clientY - lastPos.current.y }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, [dragging]);
  const onMouseUp = () => setDragging(false);
  const reset = () => { setZoom(1.1); setPan({ x: 0, y: 0 }); };

  // Room click → pick start or end
  const handleRoomClick = (room: FloorRoom) => {
    if (room.type === "corridor") return;
    const nk = nodeKey(BUILDING_ID, activeFloor, room.id);
    if (pickMode === "start") {
      setStartRoom(nk);
      setPickMode("end");
    } else if (pickMode === "end") {
      setEndRoom(nk);
      setPickMode(null);
    } else {
      setSelectedRoom(selectedRoom === room.id ? null : room.id);
    }
  };

  // Compute route
  const findRoute = () => {
    if (!startRoom || !endRoom) return;
    const result = resolveIndoorRoute(floors, VERTICAL_LINKS, startRoom, endRoom, mode);
    setRoute(result);
  };

  // Which rooms are on the active route path for this floor
  const routeNodeIds = new Set(
    route?.steps
      .filter((s) => s.floor === activeFloor)
      .map((s) => s.roomId) ?? []
  );
  const startRoomId = route?.steps[0]?.floor === activeFloor ? route.steps[0].roomId : null;
  const endRoomId   = route?.steps[route.steps.length - 1]?.floor === activeFloor
    ? route.steps[route.steps.length - 1].roomId : null;

  const stepIndexMap = new Map(route?.steps.map((s, i) => [s.roomId, i]) ?? []);

  return (
    <div className="flex gap-4 h-full">

      {/* ── Left: controls + steps ── */}
      <div
        className="flex-shrink-0 overflow-y-auto flex flex-col gap-3 no-scrollbar"
        style={{ width: 260 }}
      >
        {/* Building header */}
        <GlassCard neon className="p-4">
          <div
            className="text-[10px] font-semibold tracking-[1.5px] mb-1"
            style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}
          >
            INDOOR NAVIGATOR
          </div>
          <div className="text-[14px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            Block A — CSE & IT
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
            {floors.length} floors · Click a room to select
          </div>
        </GlassCard>

        {/* Pick mode + route controls */}
        <GlassCard className="p-4">
          <div
            className="text-[10px] font-semibold tracking-[1.5px] mb-3"
            style={{ color: "var(--text-3)", fontFamily: "var(--font-display)" }}
          >
            SELECT ROUTE
          </div>

          <div className="flex flex-col gap-2 mb-3">
            {/* Start */}
            <button
              onClick={() => setPickMode("start")}
              className="w-full px-3 py-2 rounded-lg text-left text-[12px] transition-all"
              style={{
                background: pickMode === "start" ? "rgba(0,212,255,0.12)" : "rgba(255,255,255,0.03)",
                border:     `1px solid ${pickMode === "start" ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.07)"}`,
                color:      startRoom ? "var(--cyan)" : "var(--text-3)",
                cursor:     "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              {startRoom
                ? `🟢 ${floors.flatMap(f => f.rooms).find(r => startRoom.includes(r.id))?.name ?? "Start"}`
                : pickMode === "start" ? "📍 Click a room on map…" : "📍 Set start room"}
            </button>

            {/* End */}
            <button
              onClick={() => setPickMode("end")}
              className="w-full px-3 py-2 rounded-lg text-left text-[12px] transition-all"
              style={{
                background: pickMode === "end" ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)",
                border:     `1px solid ${pickMode === "end" ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.07)"}`,
                color:      endRoom ? "var(--purple)" : "var(--text-3)",
                cursor:     "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              {endRoom
                ? `🔴 ${floors.flatMap(f => f.rooms).find(r => endRoom.includes(r.id))?.name ?? "End"}`
                : pickMode === "end" ? "📍 Click a room on map…" : "📍 Set destination"}
            </button>
          </div>

          {/* Mode toggle */}
          <div
            className="flex rounded-lg overflow-hidden mb-3"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {(["any", "stair", "lift"] as VerticalMode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className="flex-1 py-1.5 text-[10px] capitalize transition-all"
                style={{
                  background: mode === m ? "rgba(0,212,255,0.1)" : "transparent",
                  color:      mode === m ? "var(--cyan)"          : "var(--text-3)",
                  border:     "none", cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                {m === "any" ? "Any" : m === "stair" ? "↕ Stairs" : "⬆ Lift"}
              </button>
            ))}
          </div>

          <NeonButton
            color="cyan" size="sm" fullWidth
            onClick={findRoute}
            disabled={!startRoom || !endRoom}
          >
            Find Indoor Route
          </NeonButton>

          {(startRoom || endRoom || route) && (
            <button
              onClick={() => { setStartRoom(""); setEndRoom(""); setRoute(null); setPickMode(null); }}
              className="w-full mt-2 py-1.5 rounded-lg text-[11px] transition-colors"
              style={{
                background: "transparent", border: "1px solid rgba(255,255,255,0.06)",
                color: "var(--text-3)", cursor: "pointer", fontFamily: "var(--font-body)",
              }}
            >
              Clear
            </button>
          )}
        </GlassCard>

        {/* Route summary */}
        <AnimatePresence>
          {route && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
            >
              <GlassCard neon className="p-4">
                <div
                  className="text-[10px] font-semibold tracking-[1.5px] mb-3"
                  style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}
                >
                  ROUTE DETAILS
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: "Steps",    value: route.steps.length    },
                    { label: "Floors",   value: route.floorChanges    },
                    { label: "ETA",      value: `${route.estimatedMinutes}m` },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-lg p-2 text-center"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div
                        className="text-[14px] font-bold"
                        style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}
                      >
                        {s.value}
                      </div>
                      <div
                        className="text-[9px]"
                        style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}
                      >
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Step list */}
                <div className="max-h-48 overflow-y-auto no-scrollbar">
                  {route.steps.map((step, i) => (
                    <StepCard
                      key={step.nodeId}
                      step={step}
                      index={i}
                      total={route.steps.length}
                    />
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <GlassCard className="p-4">
          <div
            className="text-[10px] font-semibold tracking-[1.5px] mb-3"
            style={{ color: "var(--text-3)", fontFamily: "var(--font-display)" }}
          >
            LEGEND
          </div>
          <div className="flex flex-col gap-2">
            {[
              { color: ROOM_COLORS.lab,       label: "Lab"          },
              { color: ROOM_COLORS.classroom,  label: "Classroom"    },
              { color: ROOM_COLORS.office,     label: "Office"       },
              { color: ROOM_COLORS.hall,       label: "Hall"         },
              { color: ROOM_COLORS.staircase,  label: "Staircase"    },
              { color: ROOM_COLORS.lift,       label: "Lift"         },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ background: `${l.color}33`, border: `1px solid ${l.color}66` }}
                />
                <span className="text-[11px]" style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ── Right: SVG map ── */}
      <div className="flex-1 relative overflow-hidden rounded-2xl"
        style={{ background: "var(--bg-2)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Floor selector (right side) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
          <GlassCard neon className="p-2">
            <FloorSelector
              floors={floors}
              active={activeFloor}
              onChange={setActiveFloor}
            />
          </GlassCard>
        </div>

        {/* Map controls */}
        <div className="absolute bottom-4 right-16 z-10 flex flex-col gap-2">
          {[
            { icon: ZoomIn,    fn: () => setZoom((z) => Math.min(3.5, z + 0.25)), title: "Zoom in"   },
            { icon: ZoomOut,   fn: () => setZoom((z) => Math.max(0.5, z - 0.25)), title: "Zoom out"  },
            { icon: RotateCcw, fn: reset,                                          title: "Reset"     },
          ].map(({ icon: Icon, fn, title }) => (
            <motion.button
              key={title}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.93 }}
              onClick={fn}
              title={title}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "rgba(2,4,8,0.85)", border: "1px solid rgba(0,212,255,0.2)",
                color: "rgba(0,212,255,0.7)", cursor: "pointer", backdropFilter: "blur(10px)",
              }}
            >
              <Icon className="w-3.5 h-3.5" />
            </motion.button>
          ))}
        </div>

        {/* Floor label */}
        <div
          className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
          style={{
            background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)",
            color: "var(--cyan)", fontFamily: "var(--font-display)",
          }}
        >
          Floor {activeFloor} — {floorData?.label}
        </div>

        {/* Hint */}
        {pickMode && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-xl text-[11px]"
            style={{
              background: "rgba(6,13,24,0.95)", border: "1px solid rgba(0,212,255,0.3)",
              color: "var(--cyan)", fontFamily: "var(--font-body)",
              backdropFilter: "blur(12px)",
            }}
          >
            Click a room to set {pickMode === "start" ? "start point" : "destination"}
          </motion.div>
        )}

        {/* SVG canvas */}
        <div
          className="w-full h-full"
          style={{ cursor: dragging ? "grabbing" : "grab" }}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFloor}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1   }}
              exit={{ opacity: 0, scale: 0.98   }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <svg
                width="100%" height="100%"
                viewBox="0 0 500 360"
                style={{
                  transform:       `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transformOrigin: "center",
                  transition:      dragging ? "none" : "transform 0.08s ease-out",
                }}
              >
                <defs>
                  <pattern id="floor-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,212,255,0.03)" strokeWidth="0.5" />
                  </pattern>
                </defs>

                {/* Background */}
                <rect width="500" height="360" fill="var(--bg-2)" />
                <rect width="500" height="360" fill="url(#floor-grid)" />

                {/* Building outline */}
                <rect x="70" y="40" width="360" height="290" rx="10"
                  fill="rgba(255,255,255,0.015)"
                  stroke="rgba(0,212,255,0.12)"
                  strokeWidth="1.5"
                />

                {/* Floor label inside */}
                <text x="250" y="330" textAnchor="middle"
                  fill="rgba(0,212,255,0.15)" fontSize="9" letterSpacing="2"
                  fontFamily="var(--font-display)"
                >
                  BLOCK A · FLOOR {activeFloor}
                </text>

                {/* Rooms */}
                {floorData?.rooms.map((room) => (
                  <RoomRect
                    key={room.id}
                    room={room}
                    isOnPath={routeNodeIds.has(room.id)}
                    isActive={false}
                    isStart={startRoomId === room.id}
                    isEnd={endRoomId === room.id}
                    stepIndex={stepIndexMap.get(room.id) ?? -1}
                    onClick={() => handleRoomClick(room)}
                  />
                ))}

                {/* Route path overlay */}
                {route && floorData && (
                  <FloorPathLine
                    steps={route.steps}
                    floor={activeFloor}
                    rooms={floorData.rooms}
                    animKey={`${activeFloor}-${route.steps.length}`}
                  />
                )}
              </svg>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}