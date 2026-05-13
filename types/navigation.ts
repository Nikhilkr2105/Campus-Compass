export type BuildingType =
  | "entry"
  | "academic"
  | "facility"
  | "hostel"
  | "admin"
  | "emergency"
  | "parking";

export interface Building {
  id:          string;
  name:        string;
  short:       string;
  x:           number;
  y:           number;
  type:        BuildingType;
  icon:        string;
  floors:      number;
  color:       string;
  description: string;
  facilities:  string[];
}

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