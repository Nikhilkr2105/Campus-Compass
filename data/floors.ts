export type RoomType =
  | "lab"
  | "classroom"
  | "office"
  | "hall"
  | "staircase"
  | "lift"
  | "washroom"
  | "corridor"
  | "entrance";

export interface FloorRoom {
  id:       string;
  name:     string;
  type:     RoomType;
  x:        number;
  y:        number;
  w:        number;
  h:        number;
  color?:   string;
}

export interface FloorConnection {
  from:       string;
  to:         string;
  distance:   number;
  type:       "walk" | "stair" | "lift";
}

export interface FloorData {
  buildingId: string;
  floor:      number;
  label:      string;
  rooms:      FloorRoom[];
  connections: FloorConnection[];
}

// ── Color map per room type ──────────────────────────
export const ROOM_COLORS: Record<RoomType, string> = {
  lab:        "#8b5cf6",
  classroom:  "#3b82f6",
  office:     "#0ea5e9",
  hall:       "#10b981",
  staircase:  "#f59e0b",
  lift:       "#00d4ff",
  washroom:   "#6b7280",
  corridor:   "transparent",
  entrance:   "#10b981",
};

// ── Block A — Floor data ─────────────────────────────
const BLOCK_A_F1: FloorData = {
  buildingId: "block-a",
  floor:      1,
  label:      "Ground Floor",
  rooms: [
    { id: "a1-entrance",  name: "Entrance",      type: "entrance",  x: 170, y: 310, w: 60,  h: 40  },
    { id: "a1-corridor",  name: "Main Corridor", type: "corridor",  x: 80,  y: 140, w: 340, h: 30  },
    { id: "a1-101",       name: "CSE Lab 1",     type: "lab",       x: 80,  y: 60,  w: 100, h: 70  },
    { id: "a1-102",       name: "CSE Lab 2",     type: "lab",       x: 200, y: 60,  w: 100, h: 70  },
    { id: "a1-103",       name: "IT Lab",        type: "lab",       x: 320, y: 60,  w: 100, h: 70  },
    { id: "a1-wc1",       name: "Washroom",      type: "washroom",  x: 80,  y: 240, w: 50,  h: 50  },
    { id: "a1-stair1",    name: "Staircase A",   type: "staircase", x: 340, y: 220, w: 50,  h: 50  },
    { id: "a1-lift1",     name: "Lift",          type: "lift",      x: 400, y: 220, w: 40,  h: 50  },
  ],
  connections: [
    { from: "a1-entrance", to: "a1-corridor",  distance: 30,  type: "walk"  },
    { from: "a1-corridor", to: "a1-101",       distance: 20,  type: "walk"  },
    { from: "a1-corridor", to: "a1-102",       distance: 20,  type: "walk"  },
    { from: "a1-corridor", to: "a1-103",       distance: 20,  type: "walk"  },
    { from: "a1-corridor", to: "a1-wc1",       distance: 15,  type: "walk"  },
    { from: "a1-corridor", to: "a1-stair1",    distance: 10,  type: "walk"  },
    { from: "a1-corridor", to: "a1-lift1",     distance: 10,  type: "walk"  },
  ],
};

const BLOCK_A_F2: FloorData = {
  buildingId: "block-a",
  floor:      2,
  label:      "First Floor",
  rooms: [
    { id: "a2-corridor",  name: "Main Corridor", type: "corridor",  x: 80,  y: 140, w: 340, h: 30  },
    { id: "a2-201",       name: "CSE Lab 3",     type: "lab",       x: 80,  y: 60,  w: 100, h: 70  },
    { id: "a2-204",       name: "AI/ML Lab",     type: "lab",       x: 200, y: 60,  w: 100, h: 70  },
    { id: "a2-205",       name: "DS Lab",        type: "lab",       x: 320, y: 60,  w: 100, h: 70  },
    { id: "a2-cr201",     name: "Classroom 201", type: "classroom", x: 80,  y: 180, w: 110, h: 70  },
    { id: "a2-cr202",     name: "Classroom 202", type: "classroom", x: 210, y: 180, w: 110, h: 70  },
    { id: "a2-wc2",       name: "Washroom",      type: "washroom",  x: 340, y: 180, w: 50,  h: 50  },
    { id: "a2-stair1",    name: "Staircase A",   type: "staircase", x: 340, y: 240, w: 50,  h: 50  },
    { id: "a2-lift1",     name: "Lift",          type: "lift",      x: 400, y: 240, w: 40,  h: 50  },
  ],
  connections: [
    { from: "a2-stair1",  to: "a2-corridor",  distance: 10,  type: "walk"  },
    { from: "a2-lift1",   to: "a2-corridor",  distance: 10,  type: "walk"  },
    { from: "a2-corridor", to: "a2-201",      distance: 20,  type: "walk"  },
    { from: "a2-corridor", to: "a2-204",      distance: 20,  type: "walk"  },
    { from: "a2-corridor", to: "a2-205",      distance: 20,  type: "walk"  },
    { from: "a2-corridor", to: "a2-cr201",    distance: 15,  type: "walk"  },
    { from: "a2-corridor", to: "a2-cr202",    distance: 15,  type: "walk"  },
    { from: "a2-corridor", to: "a2-wc2",      distance: 15,  type: "walk"  },
  ],
};

const BLOCK_A_F3: FloorData = {
  buildingId: "block-a",
  floor:      3,
  label:      "Second Floor",
  rooms: [
    { id: "a3-corridor",  name: "Main Corridor",    type: "corridor",  x: 80,  y: 140, w: 340, h: 30  },
    { id: "a3-301",       name: "HOD CSE Office",   type: "office",    x: 80,  y: 60,  w: 100, h: 70  },
    { id: "a3-302",       name: "Faculty Room A",   type: "office",    x: 200, y: 60,  w: 100, h: 70  },
    { id: "a3-303",       name: "Faculty Room B",   type: "office",    x: 320, y: 60,  w: 100, h: 70  },
    { id: "a3-cr301",     name: "Classroom 301",    type: "classroom", x: 80,  y: 180, w: 110, h: 70  },
    { id: "a3-cr302",     name: "Classroom 302",    type: "classroom", x: 210, y: 180, w: 110, h: 70  },
    { id: "a3-stair1",    name: "Staircase A",      type: "staircase", x: 340, y: 240, w: 50,  h: 50  },
    { id: "a3-lift1",     name: "Lift",             type: "lift",      x: 400, y: 240, w: 40,  h: 50  },
  ],
  connections: [
    { from: "a3-stair1",   to: "a3-corridor",  distance: 10,  type: "walk"  },
    { from: "a3-lift1",    to: "a3-corridor",  distance: 10,  type: "walk"  },
    { from: "a3-corridor", to: "a3-301",       distance: 20,  type: "walk"  },
    { from: "a3-corridor", to: "a3-302",       distance: 20,  type: "walk"  },
    { from: "a3-corridor", to: "a3-303",       distance: 20,  type: "walk"  },
    { from: "a3-corridor", to: "a3-cr301",     distance: 15,  type: "walk"  },
    { from: "a3-corridor", to: "a3-cr302",     distance: 15,  type: "walk"  },
  ],
};

const BLOCK_A_F4: FloorData = {
  buildingId: "block-a",
  floor:      4,
  label:      "Third Floor",
  rooms: [
    { id: "a4-corridor",  name: "Main Corridor",  type: "corridor",  x: 80,  y: 140, w: 340, h: 30  },
    { id: "a4-401",       name: "Seminar Room A", type: "hall",      x: 80,  y: 50,  w: 160, h: 80  },
    { id: "a4-402",       name: "Project Lab",    type: "lab",       x: 260, y: 50,  w: 160, h: 80  },
    { id: "a4-stair1",    name: "Staircase A",    type: "staircase", x: 340, y: 200, w: 50,  h: 50  },
    { id: "a4-lift1",     name: "Lift",           type: "lift",      x: 400, y: 200, w: 40,  h: 50  },
  ],
  connections: [
    { from: "a4-stair1",   to: "a4-corridor",  distance: 10,  type: "walk" },
    { from: "a4-lift1",    to: "a4-corridor",  distance: 10,  type: "walk" },
    { from: "a4-corridor", to: "a4-401",       distance: 20,  type: "walk" },
    { from: "a4-corridor", to: "a4-402",       distance: 20,  type: "walk" },
  ],
};

// ── Cross-floor vertical connections (stair / lift) ──
export interface VerticalLink {
  buildingId: string;
  nodeA:      string; // roomId on floorA
  floorA:     number;
  nodeB:      string; // roomId on floorB
  floorB:     number;
  type:       "stair" | "lift";
}

export const VERTICAL_LINKS: VerticalLink[] = [
  { buildingId: "block-a", nodeA: "a1-stair1", floorA: 1, nodeB: "a2-stair1", floorB: 2, type: "stair" },
  { buildingId: "block-a", nodeA: "a2-stair1", floorA: 2, nodeB: "a3-stair1", floorB: 3, type: "stair" },
  { buildingId: "block-a", nodeA: "a3-stair1", floorA: 3, nodeB: "a4-stair1", floorB: 4, type: "stair" },
  { buildingId: "block-a", nodeA: "a1-lift1",  floorA: 1, nodeB: "a2-lift1",  floorB: 2, type: "lift"  },
  { buildingId: "block-a", nodeA: "a2-lift1",  floorA: 2, nodeB: "a3-lift1",  floorB: 3, type: "lift"  },
  { buildingId: "block-a", nodeA: "a3-lift1",  floorA: 3, nodeB: "a4-lift1",  floorB: 4, type: "lift"  },
];

// ── All floors indexed ───────────────────────────────
export const ALL_FLOORS: FloorData[] = [
  BLOCK_A_F1, BLOCK_A_F2, BLOCK_A_F3, BLOCK_A_F4,
];

export const getFloor = (buildingId: string, floor: number): FloorData | undefined =>
  ALL_FLOORS.find((f) => f.buildingId === buildingId && f.floor === floor);

export const getBuildingFloors = (buildingId: string): FloorData[] =>
  ALL_FLOORS.filter((f) => f.buildingId === buildingId).sort((a, b) => a.floor - b.floor);