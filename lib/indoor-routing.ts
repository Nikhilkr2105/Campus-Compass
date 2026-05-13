import { FloorData, VerticalLink, FloorConnection, VERTICAL_LINKS } from "@/data/floors";

// ── Types ────────────────────────────────────────────
export interface IndoorNode {
  id:       string; // `${buildingId}:${floor}:${roomId}`
  roomId:   string;
  floor:    number;
  buildingId: string;
}

export interface IndoorEdge {
  from:     string;
  to:       string;
  distance: number;
  type:     "walk" | "stair" | "lift";
}

export interface IndoorGraph {
  nodes: Map<string, IndoorNode>;
  edges: Map<string, IndoorEdge[]>;
}

export interface IndoorStep {
  nodeId:     string;
  roomId:     string;
  floor:      number;
  roomName:   string;
  action:     "walk" | "take-stair" | "take-lift" | "arrive";
  floorChange?: { from: number; to: number; via: "stair" | "lift" };
}

export interface IndoorRoute {
  steps:           IndoorStep[];
  totalDistance:   number;
  floorChanges:    number;
  estimatedMinutes: number;
}

export type VerticalMode = "any" | "stair" | "lift";

// ── Node key helper ───────────────────────────────────
export const nodeKey = (buildingId: string, floor: number, roomId: string) =>
  `${buildingId}:${floor}:${roomId}`;

// ── Build multi-floor graph ───────────────────────────
export function buildIndoorGraph(
  floors:        FloorData[],
  verticalLinks: VerticalLink[],
  mode:          VerticalMode = "any"
): IndoorGraph {
  const nodes = new Map<string, IndoorNode>();
  const edges = new Map<string, IndoorEdge[]>();

  const addEdge = (from: string, to: string, distance: number, type: IndoorEdge["type"]) => {
    if (!edges.has(from)) edges.set(from, []);
    if (!edges.has(to))   edges.set(to,   []);
    edges.get(from)!.push({ from, to, distance, type });
    edges.get(to)!.push({ from: to, to: from, distance, type });
  };

  // Register rooms as nodes + intra-floor edges
  floors.forEach(({ buildingId, floor, rooms, connections }) => {
    rooms.forEach((room) => {
      const key = nodeKey(buildingId, floor, room.id);
      nodes.set(key, { id: key, roomId: room.id, floor, buildingId });
    });

    connections.forEach(({ from, to, distance, type }: FloorConnection) => {
      const kA = nodeKey(buildingId, floor, from);
      const kB = nodeKey(buildingId, floor, to);
      addEdge(kA, kB, distance, type);
    });
  });

  // Cross-floor vertical links
  verticalLinks.forEach(({ buildingId, nodeA, floorA, nodeB, floorB, type }) => {
    if (mode === "stair" && type === "lift")  return;
    if (mode === "lift"  && type === "stair") return;

    const kA = nodeKey(buildingId, floorA, nodeA);
    const kB = nodeKey(buildingId, floorB, nodeB);
    // Vertical travel costs more than horizontal
    const dist = type === "lift" ? 15 : 25;
    addEdge(kA, kB, dist, type);
  });

  return { nodes, edges };
}

// ── Dijkstra on indoor graph ─────────────────────────
export function indoorDijkstra(
  graph:  IndoorGraph,
  startId: string,
  endId:   string
): { path: string[]; distance: number; found: boolean } {
  if (startId === endId) return { path: [startId], distance: 0, found: true };
  if (!graph.nodes.has(startId) || !graph.nodes.has(endId)) {
    return { path: [], distance: 0, found: false };
  }

  const dist:    Map<string, number>          = new Map();
  const prev:    Map<string, string | null>   = new Map();
  const visited: Set<string>                  = new Set();

  graph.nodes.forEach((_, id) => { dist.set(id, Infinity); prev.set(id, null); });
  dist.set(startId, 0);

  const pq: [number, string][] = [[0, startId]];

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [cost, u] = pq.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);
    if (u === endId) break;

    for (const edge of graph.edges.get(u) ?? []) {
      if (visited.has(edge.to)) continue;
      const newCost = cost + edge.distance;
      if (newCost < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, newCost);
        prev.set(edge.to, u);
        pq.push([newCost, edge.to]);
      }
    }
  }

  // Reconstruct
  const path: string[] = [];
  let cur: string | null = endId;
  while (cur !== null) {
    path.unshift(cur);
    cur = prev.get(cur) ?? null;
  }

  const found = path[0] === startId && (dist.get(endId) ?? Infinity) !== Infinity;
  return {
    path:     found ? path : [],
    distance: dist.get(endId) ?? Infinity,
    found,
  };
}

// ── Build human-readable step list ───────────────────
export function buildIndoorSteps(
  path:    string[],
  floors:  FloorData[],
  graph:   IndoorGraph
): IndoorStep[] {
  if (path.length === 0) return [];

  const steps: IndoorStep[] = [];

  path.forEach((nodeId, i) => {
    const node = graph.nodes.get(nodeId);
    if (!node) return;

    const floorData = floors.find(
      (f) => f.buildingId === node.buildingId && f.floor === node.floor
    );
    const room = floorData?.rooms.find((r) => r.id === node.roomId);
    if (!room) return;

    const isLast = i === path.length - 1;

    // Determine action
    let action: IndoorStep["action"] = isLast ? "arrive" : "walk";
    let floorChange: IndoorStep["floorChange"] | undefined;

    if (!isLast) {
      const nextNodeId = path[i + 1];
      const nextNode   = graph.nodes.get(nextNodeId);
      if (nextNode && nextNode.floor !== node.floor) {
        const edgeList = graph.edges.get(nodeId) ?? [];
        const edge     = edgeList.find((e) => e.to === nextNodeId);
        if (edge?.type === "stair" || edge?.type === "lift") {
          action      = edge.type === "stair" ? "take-stair" : "take-lift";
          floorChange = { from: node.floor, to: nextNode.floor, via: edge.type };
        }
      }
    }

    steps.push({
      nodeId,
      roomId:    node.roomId,
      floor:     node.floor,
      roomName:  room.name,
      action,
      floorChange,
    });
  });

  return steps;
}

// ── Full indoor route resolver ────────────────────────
export function resolveIndoorRoute(
  floors:        FloorData[],
  verticalLinks: VerticalLink[],
  startNodeId:   string,
  endNodeId:     string,
  mode:          VerticalMode = "any"
): IndoorRoute | null {
  const graph  = buildIndoorGraph(floors, verticalLinks, mode);
  const result = indoorDijkstra(graph, startNodeId, endNodeId);

  if (!result.found) return null;

  const steps         = buildIndoorSteps(result.path, floors, graph);
  const floorChanges  = steps.filter((s) => s.floorChange).length;
  // ~1m per distance unit, avg walk 80m/min, lift ~15s flat, stair ~20s/floor
  const liftPenalty   = steps.filter((s) => s.action === "take-lift").length  * 0.25;
  const stairPenalty  = steps.filter((s) => s.action === "take-stair").length * 0.33;
  const estimatedMinutes = Math.max(1,
    Math.round(result.distance / 80) + liftPenalty + stairPenalty
  );

  return { steps, totalDistance: result.distance, floorChanges, estimatedMinutes };
}

// ── Utility: find rooms matching a query ─────────────
export function searchRooms(floors: FloorData[], query: string) {
  const q = query.toLowerCase();
  const results: { floor: number; buildingId: string; roomId: string; name: string; nodeId: string }[] = [];
  floors.forEach(({ buildingId, floor, rooms }) => {
    rooms.forEach((room) => {
      if (room.name.toLowerCase().includes(q)) {
        results.push({
          floor, buildingId,
          roomId: room.id,
          name:   room.name,
          nodeId: nodeKey(buildingId, floor, room.id),
        });
      }
    });
  });
  return results;
}