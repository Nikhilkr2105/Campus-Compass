import type { Building, BuildingCategory } from "@/data/buildings";

export type BuildingType = BuildingCategory;
export type { Building };

export interface PathEdge {
  from:       string;
  to:         string;
  accessible: boolean;
}

export interface NavigationRoute {
  path:             string[];
  buildings:        Building[];
  totalDistance:    number;
  estimatedMinutes: number;
  accessible:       boolean;
}

export interface NavState {
  source:          string;
  destination:     string;
  route:           NavigationRoute | null;
  currentStep:     number;
  isNavigating:    boolean;
  selectedBuilding: Building | null;
  accessibleOnly:  boolean;
}
