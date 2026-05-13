export type Graph = Record<string, Record<string, number>>;

export interface DijkstraResult {
  path:     string[];
  distance: number;
  found:    boolean;
}

export function dijkstra(
  graph: Graph,
  start: string,
  end:   string
): DijkstraResult {
  if (start === end) return { path: [start], distance: 0, found: true };
  if (!graph[start] || !graph[end]) return { path: [], distance: 0, found: false };

  const dist:    Record<string, number>          = {};
  const prev:    Record<string, string | null>   = {};
  const visited: Set<string>                     = new Set();

  for (const node of Object.keys(graph)) {
    dist[node] = Infinity;
    prev[node] = null;
  }
  dist[start] = 0;

  // Min-priority queue as sorted array
  const pq: [number, string][] = [[0, start]];

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [cost, u] = pq.shift()!;

    if (visited.has(u)) continue;
    visited.add(u);
    if (u === end) break;

    for (const [v, w] of Object.entries(graph[u] ?? {})) {
      if (visited.has(v)) continue;
      const newCost = cost + w;
      if (newCost < dist[v]) {
        dist[v] = newCost;
        prev[v] = u;
        pq.push([newCost, v]);
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let cur: string | null = end;
  while (cur !== null) {
    path.unshift(cur);
    cur = prev[cur] ?? null;
  }

  const found = path[0] === start && dist[end] !== Infinity;
  return { path: found ? path : [], distance: dist[end] ?? Infinity, found };
}

export function buildGraph(
  edges: { from: string; to: string; accessible: boolean }[],
  buildings: { id: string; x: number; y: number }[],
  accessibleOnly = false
): Graph {
  const graph: Graph = {};

  buildings.forEach((b) => { graph[b.id] = {}; });

  edges.forEach(({ from, to, accessible }) => {
    if (accessibleOnly && !accessible) return;
    const bFrom = buildings.find((b) => b.id === from);
    const bTo   = buildings.find((b) => b.id === to);
    if (!bFrom || !bTo) return;
    const dist = Math.hypot(bFrom.x - bTo.x, bFrom.y - bTo.y);
    graph[from][to] = dist;
    graph[to][from] = dist;
  });

  return graph;
}

// SVG pixel distance → approximate walking minutes
// 1 SVG unit ≈ 2m, avg walking speed ~80m/min
export function distToMinutes(d: number): number {
  return Math.max(1, Math.round((d * 2) / 80));
}