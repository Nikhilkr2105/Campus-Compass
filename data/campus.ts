/** Canonical campus identity and data readiness state. */
export const CAMPUS = {
  name: "Parul University",
  city: "Vadodara",
  state: "Gujarat",
  country: "India",
  displayName: "Parul University Campus",
  dataStatus: "verification-required" as const,
} as const;

export const CAMPUS_DATA_GAPS = [
  "Authoritative coordinates and campus boundaries for every destination",
  "Official building names, IDs, entrances, walkways and accessibility paths",
  "Verified floor counts and official floor labels",
  "Architectural floor plans with room numbers, names, polygons and entrances",
  "Verified corridors, stairs, lifts, ramps and cross-floor connections",
  "Validated pedestrian edge distances and accessibility restrictions",
  "Operating hours, emergency contacts, services and live occupancy feeds",
] as const;
