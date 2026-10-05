// DroneMap.tsx
//
// Displays the STRIX drone position, planned search route,
// completed route, waypoints, and detected target locations.
//
// Data is received by App.tsx from the FastAPI telemetry
// WebSocket and passed into this component as props.
//
// Sources & tutorials:
// React Leaflet: https://react-leaflet.js.org/
// Leaflet: https://leafletjs.com/reference.html
// Haversine distance formula:
// https://www.movable-type.co.uk/scripts/latlong.html


import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  CircleMarker,
} from "react-leaflet"

import L from "leaflet"

import "leaflet/dist/leaflet.css"


// ============================================================
// Shared dashboard types
// ============================================================

import type {
  Waypoint,
  Target,
} from "../types/dashboard"


// ============================================================
// Component Props
// ============================================================

type DroneMapProps = {
  latitude: number | null
  longitude: number | null
  altitude: number | null
  battery: number | null

  route: {
    waypoints: Waypoint[]
  }

  targets: Target[]
}


// ============================================================
// Drone Marker Icon
// ============================================================
//
// Leaflet's default marker icon paths sometimes do not resolve
// correctly when Leaflet is used inside a React/Vite project.
// These URLs explicitly provide the standard Leaflet icon files.
//
// Source:
// https://leafletjs.com/reference.html#icon

const droneIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],
})


// ============================================================
// Calculate GPS Distance
// ============================================================
//
// Calculate the distance between two GPS coordinates.
//
// This uses the Haversine formula.
//
// The distance is used to determine which route waypoint is
// currently closest to the drone.
//
// R is the approximate radius of Earth in meters.
//
// Source:
// https://www.movable-type.co.uk/scripts/latlong.html

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {

  const R = 6371000


  // Convert latitude values from degrees to radians.

  const lat1Rad =
    (lat1 * Math.PI) / 180

  const lat2Rad =
    (lat2 * Math.PI) / 180


  // Difference between the two GPS coordinates.

  const deltaLat =
    ((lat2 - lat1) * Math.PI) / 180

  const deltaLon =
    ((lon2 - lon1) * Math.PI) / 180


  // Haversine formula.

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLon / 2) ** 2


  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )


  return R * c
}


// ============================================================
// Drone Map
// ============================================================

function DroneMap({
  latitude,
  longitude,
  altitude,
  battery,
  route,
  targets,
}: DroneMapProps) {


  // ----------------------------------------------------------
  // Wait for drone GPS data
  // ----------------------------------------------------------
  //
  // Leaflet cannot create a map center using null coordinates.
  // The backend starts with null values until the first ROS 2
  // position message is received.

  if (
    latitude === null ||
    longitude === null
  ) {

    return (
      <div className="map-loading">

        Waiting for drone GPS...

      </div>
    )
  }


  // ----------------------------------------------------------
  // Convert route waypoints into Leaflet coordinates
  // ----------------------------------------------------------

  const routePositions =
    route.waypoints.map(
      (waypoint) =>
        [
          waypoint.latitude,
          waypoint.longitude,
        ] as [number, number]
    )


  // ----------------------------------------------------------
  // Find the waypoint closest to the drone
  // ----------------------------------------------------------
  //
  // This is currently used to estimate the drone's progress
  // through the simulated search route.

  let currentWaypointIndex = -1


  if (route.waypoints.length > 0) {

    let closestDistance = Infinity


    route.waypoints.forEach(
      (waypoint, index) => {

        const distance =
          calculateDistance(
            latitude,
            longitude,
            waypoint.latitude,
            waypoint.longitude
          )


        if (distance < closestDistance) {

          closestDistance = distance

          currentWaypointIndex = index
        }
      }
    )
  }


  // ----------------------------------------------------------
  // Determine whether the route is complete
  // ----------------------------------------------------------
  //
  // For the current simulator, the route is considered complete
  // when the drone is closest to the final waypoint.

  const routeComplete =
    route.waypoints.length > 0 &&
    currentWaypointIndex ===
      route.waypoints.length - 1


  // ----------------------------------------------------------
  // Route already traveled
  // ----------------------------------------------------------
  //
  // Everything before the current waypoint is displayed as the
  // completed portion of the route.

  const completedRoutePositions =
    currentWaypointIndex >= 0
      ? routePositions.slice(
          0,
          currentWaypointIndex + 1
        )
      : []


  // ==========================================================
  // Map UI
  // ==========================================================

  return (

    // This wrapper allows normal React HTML elements to be
    // positioned over the Leaflet map.

    <div
      className="drone-map"
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
      }}
    >


      <MapContainer
        center={[
          latitude,
          longitude,
        ]}

        zoom={18}

        style={{
          height: "100%",
          width: "100%",
        }}
      >


        {/* ====================================================
            OpenStreetMap Map Tiles
            ==================================================== */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"

          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* ====================================================
            Planned Route
            ==================================================== */}

        {routePositions.length > 1 && (

          <Polyline
            positions={routePositions}

            pathOptions={{
              color: "blue",
              weight: 4,
            }}
          >

            <Tooltip sticky>

              <strong>
                PLANNED SEARCH ROUTE
              </strong>

              <br />

              Waypoints:{" "}
              {route.waypoints.length}

            </Tooltip>

          </Polyline>

        )}


        {/* ====================================================
            Completed Route
            ==================================================== */}

        {completedRoutePositions.length > 1 && (

          <Polyline
            positions={
              completedRoutePositions
            }

            pathOptions={{
              color: "lime",
              weight: 6,
            }}
          >

            <Tooltip sticky>

              <strong>
                COMPLETED ROUTE
              </strong>

              <br />

              Waypoints completed:{" "}
              {currentWaypointIndex + 1}

            </Tooltip>

          </Polyline>

        )}


        {/* ====================================================
            Route Waypoints
            ==================================================== */}

        {route.waypoints.map(
          (waypoint, index) => {

            const isCurrent =
              index === currentWaypointIndex


            const isCompleted =
              index < currentWaypointIndex


            return (

              <CircleMarker
                key={index}

                center={[
                  waypoint.latitude,
                  waypoint.longitude,
                ]}

                radius={
                  isCurrent ? 9 : 6
                }

                pathOptions={{

                  color: isCurrent
                    ? "yellow"
                    : isCompleted
                      ? "lime"
                      : "blue",

                  fillColor: isCurrent
                    ? "yellow"
                    : isCompleted
                      ? "lime"
                      : "blue",

                  fillOpacity: 0.9,

                  weight: 2,
                }}
              >

                <Tooltip>

                  <div>

                    <strong>
                      WAYPOINT {index + 1}
                    </strong>

                    <br />
                    <br />

                    <strong>

                      {isCurrent
                        ? "CURRENT"
                        : isCompleted
                          ? "COMPLETED"
                          : "UPCOMING"}

                    </strong>

                    <br />
                    <br />

                    Latitude:{" "}

                    {waypoint.latitude.toFixed(6)}

                    <br />

                    Longitude:{" "}

                    {waypoint.longitude.toFixed(6)}

                    <br />

                    Altitude:{" "}

                    {waypoint.altitude !== undefined
                      ? `${waypoint.altitude.toFixed(1)} m`
                      : "--"}

                  </div>

                </Tooltip>

              </CircleMarker>
            )
          }
        )}


        {/* ====================================================
            Drone Position
            ==================================================== */}

        <Marker
          position={[
            latitude,
            longitude,
          ]}

          icon={droneIcon}
        >

          <Tooltip>

            <div>

              <strong>
                DRONE
              </strong>

              <br />
              <br />

              Latitude:{" "}

              {latitude.toFixed(6)}

              <br />

              Longitude:{" "}

              {longitude.toFixed(6)}

              <br />

              Altitude:{" "}

              {altitude !== null
                ? `${altitude.toFixed(1)} m`
                : "--"}

              <br />

              Battery:{" "}

              {battery !== null
                ? `${battery.toFixed(1)}%`
                : "--"}

            </div>

          </Tooltip>

        </Marker>


        {/* ====================================================
            Detected Targets
            ====================================================
            
            The backend stores detected target locations in an
            array, so every target can be displayed on the map.
        */}

        {targets.map(
          (target, index) => (

            <CircleMarker
              key={`target-${index}`}

              center={[
                target.latitude,
                target.longitude,
              ]}

              radius={12}

              pathOptions={{
                color: "orange",
                fillColor: "orange",
                fillOpacity: 0.9,
                weight: 3,
              }}
            >

              <Tooltip sticky>

                <div>

                  <strong>
                    TARGET {index + 1} DETECTED
                  </strong>

                  <br />
                  <br />

                  Latitude:{" "}

                  {target.latitude.toFixed(6)}

                  <br />

                  Longitude:{" "}

                  {target.longitude.toFixed(6)}

                  <br />

                  Altitude:{" "}

                  {target.altitude_m.toFixed(1)} m

                </div>

              </Tooltip>

            </CircleMarker>

          )
        )}

      </MapContainer>


      {/* ======================================================
          Route Progress Overlay
          ======================================================
          
          This is regular React HTML rather than a Leaflet map
          layer, so it stays outside MapContainer and is placed
          over the map using CSS.
      */}

      {route.waypoints.length > 0 && (

        <div className="route-progress-overlay">

          <div className="route-progress-title">

            ROUTE PROGRESS

          </div>


          <div className="route-progress-value">

            {routeComplete
              ? route.waypoints.length
              : Math.max(
                  currentWaypointIndex + 1,
                  1
                )}

            {" / "}

            {route.waypoints.length}

          </div>


          <div className="route-progress-status">

            {routeComplete

              ? "ROUTE COMPLETE"

              : currentWaypointIndex >= 0

                ? `WAYPOINT ${
                    currentWaypointIndex + 1
                  }`

                : "WAITING FOR ROUTE"}

          </div>

        </div>

      )}

    </div>
  )
}


export default DroneMap 