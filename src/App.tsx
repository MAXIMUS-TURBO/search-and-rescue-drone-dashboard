// Using TypeScript to define the telemetry data structure
// and state management for the drone telemetry dashboard.

// What the dashboard looks like:
// ┌─────────────────┬────────────────────────────────┬─────────────────┐
// │ SEARCH AREA     │ MISSION MAP                    │ MISSION STATUS  │
// │ CONTROLS        │                                │                 │
// │                 │                                │ DRONE TELEMETRY │
// ├─────────────────┤                        ┌─────┐ │                 │
// │                 │                        │ CAM │ │ DETECTED        │
// │                 │                        └─────┘ │ TARGETS         │
// │ MISSION         ├────────────────────────────────┤                 │
// │ CONTROLS        │ MISSION ALERTS                 │                 │
// └─────────────────┴────────────────────────────────┴─────────────────┘

// File structure: 
// src/
// ├── App.tsx
// ├── index.css
// │
// ├── types/
// │   └── dashboard.ts
// │
// ├── components/
// │   ├── DroneMap.tsx
// │   ├── CameraFeed.tsx
// │   ├── SearchAreaControls.tsx
// │   ├── MissionControls.tsx
// │   ├── MissionStatus.tsx
// │   ├── DroneTelemetry.tsx
// │   ├── DetectedTargets.tsx
// │   └── MissionAlerts.tsx

// Sources
// websockets: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

import {useEffect,useState} from "react"
import "leaflet/dist/leaflet.css"

import type {DashboardState} from "./types/dashboard"

//components
import DroneMap from "./components/DroneMap"
import CameraFeed from "./components/CameraFeed"
import SearchAreaControls from "./components/SearchAreaControls"
import MissionControls from "./components/MissionControls"
import MissionStatus from "./components/MissionStatus"
import DroneTelemetry from "./components/DroneTelemetry"
import DetectedTargets from "./components/DetectedTargets"
import MissionAlerts from "./components/MissionAlerts"


function App() {

  const [telemetry, setTelemetry] = useState<DashboardState | null>(null)
  const [connected, setConnected] = useState(false)


  // Connect to the FastAPI telemetry WebSocket----------------------------------------------
  useEffect(() => {

    const socket = new WebSocket("ws://127.0.0.1:8000/ws/telemetry")

    socket.onopen = () => {
      setConnected(true)
      console.log("Connected to STRIX telemetry")
    }

    socket.onmessage = (event) => {
      try {
        const data: DashboardState =
          JSON.parse(event.data)
        setTelemetry(data) // Update the telemetry state with the new data
      } catch (error) {console.error("Could not parse telemetry:", error)}
    }

    socket.onerror = (error) => {console.error("Telemetry WebSocket error:",error)} 
    socket.onclose = () => {setConnected(false)}
    return () => {socket.close()}

  }, [])


  // Wait for the first telemetry snapshot-----------------------------------------------
  if (!telemetry) {
    return (
      <main>
        <h1>
          STRIX Command Station
        </h1>
        <p>
          Connecting to telemetry...
        </p>
      </main>
    )
  }
// Render the dashboard once telemetry is available-------------------------------
return (
  <main>

    <h1>STRIX Command Station</h1>

    <div className="dashboard">

      {/* LEFT SIDE */}
      <aside className="dashboard-left">
        <SearchAreaControls />
        <MissionControls />
      </aside>


      {/* CENTER */}
      <section className="dashboard-center">

        <section className="map-section">
          <h2>Mission Map</h2>

          <div className="map-container">
            <DroneMap
              latitude={telemetry.drone.latitude}
              longitude={telemetry.drone.longitude}
              altitude={telemetry.drone.altitude_m}
              battery={telemetry.drone.battery_percent}
              route={telemetry.route}
              targets={telemetry.targets}
            />
          </div>
        </section>

        <section className="camera-section">
          <h2>Camera Feed</h2>
          <CameraFeed />
        </section>

        <MissionAlerts
          connected={connected}
          routeReceived={telemetry.mission.route_received ?? false}
          targetCount={telemetry.targets.length}
        />

      </section>


      {/* RIGHT SIDE */}
      <aside className="dashboard-right">

        <MissionStatus
          mission={telemetry.mission}
        />

        <DroneTelemetry
          drone={telemetry.drone}
        />

        <DetectedTargets
          targets={telemetry.targets}
        />

      </aside>

    </div>

  </main>
)


}


export default App