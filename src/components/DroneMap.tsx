import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  Polyline,
  Tooltip,
  CircleMarker,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
//drone map types and props

type SearchArea = {
  corner_1: {
    latitude: number
    longitude: number
  }
  corner_2: {
    latitude: number
    longitude: number
  }
}

type Waypoint = {
  latitude: number
  longitude: number
  altitude: number
}

type Route = {
  waypoints: Waypoint[]
}

type TargetLocation = {
  latitude: number
  longitude: number
  altitude: number
}

type DroneMapProps = {
  latitude: number
  longitude: number
  altitude: number
  battery: number
  searchArea: SearchArea | null
  route: Route | null
  targetLocation: {
    latitude: number
    longitude: number
    altitude: number
  } | null
}

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

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371000

  const lat1Rad = (lat1 * Math.PI) / 180
  const lat2Rad = (lat2 * Math.PI) / 180

  const deltaLat = ((lat2 - lat1) * Math.PI) / 180
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

function DroneMap({
  latitude,
  longitude,
  altitude,
  battery,
  searchArea,
  route,
  targetLocation,
}: DroneMapProps) {


  const searchAreaPolygon = searchArea
    ? [
        [
          searchArea.corner_1.latitude,
          searchArea.corner_1.longitude,
        ],
        [
          searchArea.corner_1.latitude,
          searchArea.corner_2.longitude,
        ],
        [
          searchArea.corner_2.latitude,
          searchArea.corner_2.longitude,
        ],
        [
          searchArea.corner_2.latitude,
          searchArea.corner_1.longitude,
        ],
      ] as [number, number][]
    : []

  const routePositions =
    route?.waypoints.map(
      (waypoint) =>
        [waypoint.latitude, waypoint.longitude] as [
          number,
          number
        ]
    ) ?? []

  // Find the waypoint closest to the drone.
  let currentWaypointIndex = -1

  if (route && route.waypoints.length > 0) {
    let closestDistance = Infinity

    route.waypoints.forEach((waypoint, index) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        waypoint.latitude,
        waypoint.longitude
      )

      if (distance < closestDistance) {
        closestDistance = distance
        currentWaypointIndex = index
      }
    })
  }

  //route completed when the drone is closest to the final waypoint
  const routeComplete =
    route &&
    route.waypoints.length > 0 &&
    currentWaypointIndex === route.waypoints.length - 1

  //route that is already traveled
  const completedRoutePositions =
    currentWaypointIndex >= 0
      ? routePositions.slice(0, currentWaypointIndex + 1)
      : []

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={18}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* SEARCH AREA */}
      {searchArea && (
        <Polygon
          positions={searchAreaPolygon}
          pathOptions={{
            color: "red",
            weight: 3,
            fillOpacity: 0.15,
          }}
        >
          <Tooltip sticky>
            <div>
              <strong>SEARCH AREA</strong>
              <br />
              <br />

              <strong>Corner 1</strong>
              <br />
              Latitude:{" "}
              {searchArea.corner_1.latitude.toFixed(6)}
              <br />
              Longitude:{" "}
              {searchArea.corner_1.longitude.toFixed(6)}

              <br />
              <br />

              <strong>Corner 2</strong>
              <br />
              Latitude:{" "}
              {searchArea.corner_2.latitude.toFixed(6)}
              <br />
              Longitude:{" "}
              {searchArea.corner_2.longitude.toFixed(6)}
            </div>
          </Tooltip>
        </Polygon>
      )}

      {/* PLANNED ROUTE */}
      {route && routePositions.length > 1 && (
        <Polyline
          positions={routePositions}
          pathOptions={{
            color: "blue",
            weight: 4,
          }}
        >
          <Tooltip sticky>
            <strong>PLANNED SEARCH ROUTE</strong>
            <br />
            Waypoints: {route.waypoints.length}
          </Tooltip>
        </Polyline>
      )}

      {/* COMPLETED ROUTE */}
      {completedRoutePositions.length > 1 && (
        <Polyline
          positions={completedRoutePositions}
          pathOptions={{
            color: "lime",
            weight: 6,
          }}
        >
          <Tooltip sticky>
            <strong>COMPLETED ROUTE</strong>
            <br />
            Waypoints completed: {currentWaypointIndex + 1}
          </Tooltip>
        </Polyline>
      )}

      {/* WAYPOINTS */}
      {route?.waypoints.map((waypoint, index) => {
        const isCurrent = index === currentWaypointIndex
        const isCompleted =
          index < currentWaypointIndex

        return (
          <CircleMarker
            key={index}
            center={[
              waypoint.latitude,
              waypoint.longitude,
            ]}
            radius={isCurrent ? 9 : 6}
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
                {waypoint.altitude.toFixed(1)} m
              </div>
            </Tooltip>
          </CircleMarker>
        )
      })}

      {/* DRONE */}
      <Marker
        position={[latitude, longitude]}
        icon={droneIcon}
      >
        <Tooltip>
          <div>
            <strong>DRONE</strong>

            <br />
            <br />

            Latitude: {latitude.toFixed(6)}
            <br />

            Longitude: {longitude.toFixed(6)}
            <br />

            Altitude: {altitude.toFixed(1)} m
            <br />

            Battery: {battery.toFixed(1)}%
          </div>
        </Tooltip>
      </Marker>

      {/* TARGET LOCATION */}
      
      {targetLocation && (
        <CircleMarker
          center={[
            targetLocation.latitude,
            targetLocation.longitude,
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
              <strong>TARGET DETECTED</strong>
              <br /><br />
              Latitude: {targetLocation.latitude.toFixed(6)}
              <br />
              Longitude: {targetLocation.longitude.toFixed(6)}
              <br />
              Altitude: {targetLocation.altitude.toFixed(1)} m
            </div>
          </Tooltip>
        </CircleMarker>
      )}
      {/* ROUTE PROGRESS */}
      {route && route.waypoints.length > 0 && (
        <div className="route-progress-overlay">
          <div className="route-progress-title">
            ROUTE PROGRESS
          </div>

          <div className="route-progress-value">
            {routeComplete
              ? route.waypoints.length
              : Math.max(currentWaypointIndex + 1, 1)}
            {" / "}
            {route.waypoints.length}
          </div>

          <div className="route-progress-status">
            {routeComplete
              ? "ROUTE COMPLETE"
              : `WAYPOINT ${currentWaypointIndex + 1}`}
          </div>
        </div>
      )}
    </MapContainer>
  )
}

export default DroneMap