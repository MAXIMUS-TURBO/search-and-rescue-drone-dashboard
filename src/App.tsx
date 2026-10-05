// Using TypeScript to define the telemetry data structure
// and state management for the drone telemetry dashboard.

import { useEffect, useState } from "react"
import "leaflet/dist/leaflet.css"
import DroneMap from "./components/DroneMap"
import CameraFeed from "./components/CameraFeed"

// Define the structure and data types for drone telemetry.
// This matches the JSON produced by the Python API.
type Telemetry = {
  battery_percent: number
  battery_voltage: number
  altitude_m: number
  speed_mps: number
  heading_deg: number
  latitude_deg: number
  longitude_deg: number
  mission_status: string
  gps_status: string
  drone_online: boolean

  // these match the json structure from the ros2 telemetry nodes and backend telemtry api
  camera_image: string | null

  search_area: {
    corner_1: {
      latitude: number
      longitude: number
    }
    corner_2: {
      latitude: number
      longitude: number
    }
  } | null

  route: {
    waypoints: {
      latitude: number
      longitude: number
      altitude: number
    }[]
  } | null

  flight_status: {
    state: string
    armed: boolean
    ready: boolean
    route_complete: boolean
    detail: string
  } | null

  drone_odometry: {
    position: {
      x: number
      y: number
      z: number
    }
    velocity: {
      x: number
      y: number
      z: number
    }
    orientation: {
      x: number
      y: number
      z: number
      w: number
    }
  } | null

  target_location: {
    latitude: number
    longitude: number
    altitude: number
  } | null
}

// Main function
function App() {
  // Store telemetry received from the Python API.
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null)

  // Track whether the mission status overlay is collapsed.
  const [missionCollapsed, setMissionCollapsed] = useState(false)

  // Fetch telemetry from the Python API.
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/telemetry"
        )

        const data: Telemetry = await response.json()

        setTelemetry(data)
      } catch (error) {
        console.error(
          "Could not connect to telemetry API:",
          error
        )
      }
    }

    fetchTelemetry()

    const interval = setInterval(fetchTelemetry, 1000)

    return () => clearInterval(interval)
  }, [])

  // Show loading message until telemetry is received.
  if (!telemetry) {
    return (
      <div className="dashboard">
        <header className="header">
          <div>
            <h1>STRIX Mission Control</h1>
            <p>Autonomous Search & Rescue System</p>
          </div>
        </header>

        <main>
          <p>Connecting to drone telemetry...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="dashboard">

      {/* Header */}
      <header className="header">
        <div>
          <h1>STRIX Mission Control</h1>
          <p>Autonomous Search & Rescue System</p>
        </div>

        <div className="drone-status">
          <span className="status-dot"></span>

          {telemetry.drone_online
            ? "DRONE ONLINE"
            : "DRONE OFFLINE"}
        </div>
      </header>

      <main>

        {/* Telemetry Cards */}
        <section className="telemetry-grid">

          <div className="card">
            <span className="label">BATTERY</span>
            <span className="value">
              {telemetry.battery_percent.toFixed(1)}%
            </span>
          </div>

          <div className="card">
            <span className="label">BATTERY VOLTAGE</span>
            <span className="value">
              {telemetry.battery_voltage.toFixed(1)} V
            </span>
          </div>

          <div className="card">
            <span className="label">ALTITUDE</span>
            <span className="value">
              {telemetry.altitude_m.toFixed(1)} m
            </span>
          </div>

          <div className="card">
            <span className="label">SPEED</span>
            <span className="value">
              {telemetry.drone_odometry
                ? Math.sqrt(
                    telemetry.drone_odometry.velocity.x ** 2 +
                    telemetry.drone_odometry.velocity.y ** 2 +
                    telemetry.drone_odometry.velocity.z ** 2
                  ).toFixed(1) + " m/s"
                : "--"}
            </span>
          </div>

          <div className="card">
            <span className="label">HEADING</span>
            <span className="value">
              {telemetry.heading_deg.toFixed(0)}°
            </span>
          </div>

          <div className="card">
            <span className="label">GPS LATITUDE</span>
            <span className="value">
              {telemetry.latitude_deg.toFixed(6)}
            </span>
          </div>

          <div className="card">
            <span className="label">GPS LONGITUDE</span>
            <span className="value">
              {telemetry.longitude_deg.toFixed(6)}
            </span>
          </div>

          {/* Odometry X */}
          <div className="card">
            <span className="label">ODOMETRY X</span>
            <span className="value">
              {telemetry.drone_odometry
                ? telemetry.drone_odometry.position.x.toFixed(1)
                : "--"}
            </span>
          </div>

          {/* Odometry Y */}
          <div className="card">
            <span className="label">ODOMETRY Y</span>
            <span className="value">
              {telemetry.drone_odometry
                ? telemetry.drone_odometry.position.y.toFixed(1)
                : "--"}
            </span>
          </div>

          {/* Odometry Z */}
          <div className="card">
            <span className="label">ODOMETRY Z</span>
            <span className="value">
              {telemetry.drone_odometry
                ? `${telemetry.drone_odometry.position.z.toFixed(1)} m`
                : "--"}
            </span>
          </div>

          {/* Odometry Status */}
          <div className="card">
            <span className="label">ODOMETRY</span>
            <span className="value">
              {telemetry.drone_odometry
                ? "ACTIVE"
                : "--"}
            </span>
          </div>

        </section>


        {/* Target Location */}
        {telemetry.target_location && (
          <section className="mission-panel">

            <div>
              <span className="label">TARGET DETECTED</span>
              <h2>PERSON</h2>
            </div>

            <div>
              <span className="label">TARGET LATITUDE</span>
              <h2>
                {telemetry.target_location.latitude.toFixed(6)}
              </h2>
            </div>

            <div>
              <span className="label">TARGET LONGITUDE</span>
              <h2>
                {telemetry.target_location.longitude.toFixed(6)}
              </h2>
            </div>

            <div>
              <span className="label">TARGET ALTITUDE</span>
              <h2>
                {telemetry.target_location.altitude.toFixed(1)} m
              </h2>
            </div>

          </section>
        )}


        {/* Map + Camera */}
        <section className="mission-visuals">

          {/* Map Panel */}
          <div className="map-panel">

            <div className="panel-header">
              <span className="label">SEARCH AREA</span>

              <span className="panel-status">
                LIVE MAP
              </span>
            </div>

            <div className="map-container">

              <DroneMap
                latitude={telemetry.latitude_deg}
                longitude={telemetry.longitude_deg}
                altitude={telemetry.altitude_m}
                battery={telemetry.battery_percent}
                searchArea={telemetry.search_area}
                route={telemetry.route}
                targetLocation={telemetry.target_location}
              />


              {/* Mission Status Overlay */}
              {telemetry.flight_status && (
                <div
                  className={`mission-overlay ${
                    missionCollapsed ? "collapsed" : ""
                  }`}
                >

                  {/* Clickable Header */}
                  <div
                    className="mission-overlay-header"
                    onClick={() =>
                      setMissionCollapsed(!missionCollapsed)
                    }
                  >

                    <div className="mission-title">

                      <span className="status-dot"></span>

                      <strong>
                        {telemetry.flight_status.state}
                      </strong>

                    </div>

                    <span className="collapse-arrow">
                      {missionCollapsed
                        ? "▼"
                        : "▲"}
                    </span>

                  </div>


                  {/* Collapsible Content */}
                  <div className="mission-overlay-content">

                    <div className="mission-overlay-row">

                      <span>FLIGHT</span>

                      <strong>
                        {telemetry.flight_status.armed
                          ? "ARMED"
                          : "DISARMED"}
                      </strong>

                    </div>


                    <div className="mission-overlay-row">

                      <span>SYSTEM</span>

                      <strong>
                        {telemetry.flight_status.ready
                          ? "READY"
                          : "NOT READY"}
                      </strong>

                    </div>


                    <div className="mission-overlay-row">

                      <span>ROUTE</span>

                      <strong>
                        {telemetry.flight_status.route_complete
                          ? "COMPLETE"
                          : "IN PROGRESS"}
                      </strong>

                    </div>


                    <div className="mission-overlay-detail">
                      {telemetry.flight_status.detail}
                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>


          {/* Camera Panel */}
          <div className="camera-panel">
            <CameraFeed />
          </div>

        </section>


        {/* Mission Information */}
        <section className="mission-panel">

          <div>
            <span className="label">MISSION STATUS</span>
            <h2>{telemetry.mission_status}</h2>
          </div>
                //adding test ros 2 nodes
          <div>
            <span className="label">GPS STATUS</span>
            <h2>{telemetry.gps_status}</h2>
          </div> 


          {/* Flight Status */}
          {telemetry.flight_status && (
            <>

              <div>
                <span className="label">
                  FLIGHT STATE
                </span>

                <h2>
                  {telemetry.flight_status.state}
                </h2>
              </div>


              <div>
                <span className="label">ARMED</span>

                <h2>
                  {telemetry.flight_status.armed
                    ? "YES"
                    : "NO"}
                </h2>
              </div>


              <div>
                <span className="label">READY</span>

                <h2>
                  {telemetry.flight_status.ready
                    ? "YES"
                    : "NO"}
                </h2>
              </div>


              <div>
                <span className="label">
                  ROUTE STATUS
                </span>

                <h2>
                  {telemetry.flight_status.route_complete
                    ? "COMPLETE"
                    : "IN PROGRESS"}
                </h2>
              </div>


              <div>
                <span className="label">DETAIL</span>

                <h2>
                  {telemetry.flight_status.detail}
                </h2>
              </div>

            </>
          )}

        </section>


        {/* Search Area + Route Information */}
        <section className="mission-panel">

          {/* Search Area */}
          <div>

            <span className="label">
              SEARCH AREA
            </span>

            {telemetry.search_area ? (
              <>

                <p>
                  Corner 1:{" "}
                  {telemetry.search_area.corner_1.latitude.toFixed(6)}
                  {", "}
                  {telemetry.search_area.corner_1.longitude.toFixed(6)}
                </p>

                <p>
                  Corner 2:{" "}
                  {telemetry.search_area.corner_2.latitude.toFixed(6)}
                  {", "}
                  {telemetry.search_area.corner_2.longitude.toFixed(6)}
                </p>

              </>
            ) : (
              <p>No search area received</p>
            )}

          </div>


          {/* Route */}
          <div>

            <span className="label">
              ROUTE
            </span>

            {telemetry.route ? (
              <p>
                {telemetry.route.waypoints.length} waypoints
              </p>
            ) : (
              <p>No route received</p>
            )}

          </div>

        </section>

      </main>

    </div>
  )
}

export default App