# Parul University data requirements

Campus Compass is now identified as Parul University, Vadodara, Gujarat. The
navigation, search, filters, Dijkstra routing and indoor-routing code remain
available, but the existing `data/buildings.ts` and `data/floors.ts` topology
is synthetic demo data and is not verified Parul University data.

No Parul building coordinates, floor plans, room locations, routes, node
positions or edge distances were invented during this migration. Before this
application is used for real navigation, replace the demo topology with an
authoritative campus data export or survey containing:

- Building names, stable IDs, categories, entrances, boundaries and coordinates.
- Building floor counts and official floor labels.
- Room numbers/names, room polygons or anchor points, and floor-plan data.
- Corridors, stairs, lifts, ramps, entrances and verified indoor connections.
- Outdoor pedestrian paths, edge distances, accessibility restrictions and closures.
- Verified emergency, parking, dining, hostel, academic and administrative locations.
- Current operating hours, emergency contacts and live occupancy/closure feeds.

The application marks this state as `verification-required` in
`data/campus.ts`. Until the data is supplied, the map is a non-production
demonstration rather than a reliable Parul campus guide.
