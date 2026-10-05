# STRIX Search and Rescue Drone Dashboard

STRIX is an autonomous search-and-rescue drone system developed as a senior capstone project. This repository contains the command station dashboard, telemetry API, ROS 2 interfaces, and simulation tools used to monitor and interact with the STRIX drone.

The command station provides operators with a central interface for monitoring the drone, viewing its search route, receiving telemetry, and displaying detected target locations.

## System Architecture

```text
ROS 2 Nodes
    │
    │  /strix/* topics
    ▼
FastAPI Telemetry Bridge
    │
    │  WebSocket / REST
    ▼
React Command Station
    │
    ├── Mission Map
    ├── Camera Feed
    ├── Drone Telemetry
    ├── Mission Status
    ├── Detected Targets
    ├── Mission Alerts
    └── Mission Controls
```

## Technology Stack

### Command Station

- React
- TypeScript
- Vite
- Leaflet
- React Leaflet

### Backend

- Python
- FastAPI
- WebSockets
- ROS 2 Jazzy
- rclpy

### Drone System

- ROS 2
- PX4
- MAVLink / MAVSDK
- OpenCV
- Ultralytics YOLO

## Repository Structure

```text
search-and-rescue-drone-dashboard/
│
├── backend/
│   └── telemetry_api.py
│
├── interfaces/
│   └── topics.py
│
├── simulation/
│   ├── mock_camera.py
│   ├── mock_detection.py
│   ├── mock_drone_battery.py
│   ├── mock_drone_odometry.py
│   ├── mock_drone_position.py
│   ├── mock_drone_telemetry.py
│   ├── mock_mission_status.py
│   ├── mock_route.py
│   └── mock_target_location.py
│
├── tests/
│   └── run_simulation.py
│
├── public/
│   ├── test_images/
│   └── test_images2/
│
├── src/
│   ├── components/
│   │   ├── CameraFeed.tsx
│   │   ├── DetectedTargets.tsx
│   │   ├── DroneMap.tsx
│   │   ├── DroneTelemetry.tsx
│   │   ├── MissionAlerts.tsx
│   │   ├── MissionControls.tsx
│   │   ├── MissionStatus.tsx
│   │   └── SearchAreaControls.tsx
│   │
│   ├── types/
│   │   └── dashboard.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── package.json
└── README.md
```

## Dashboard

The STRIX Command Station is divided into three primary areas:

```text
┌─────────────────┬────────────────────────────────┬─────────────────┐
│ SEARCH AREA     │ MISSION MAP                    │ MISSION STATUS  │
│ CONTROLS        │                                │                 │
│                 │                                │ DRONE TELEMETRY │
├─────────────────┤                        ┌─────┐ │                 │
│                 │                        │ CAM │ │ DETECTED        │
│                 │                        └─────┘ │ TARGETS         │
│ MISSION         ├────────────────────────────────┤                 │
│ CONTROLS        │ MISSION ALERTS                 │                 │
└─────────────────┴────────────────────────────────┴─────────────────┘
```

The React application receives telemetry from the FastAPI backend through a WebSocket connection.

## Telemetry

The dashboard currently receives:

- Drone latitude and longitude
- Altitude
- Speed
- Heading
- Battery percentage
- Battery voltage
- Mission status
- Search route
- Detected target locations

Telemetry is combined by the FastAPI backend and sent to the frontend as a unified dashboard state.

## ROS 2 Topics

The STRIX system uses ROS 2 topics including:

```text
/strix/search_area
/strix/route
/strix/flight_command
/strix/flight_status
/strix/drone_position
/strix/drone_odometry
/strix/drone_battery
/strix/camera/raw_image
/strix/detections
/strix/target_location
/strix/mission_status
/strix/mission_command
```

Not every topic is currently exposed directly to the dashboard.

## Simulation

The `simulation/` directory contains mock ROS 2 nodes that allow the dashboard and telemetry system to be developed without requiring the physical drone.

The simulation can provide mock:

- Drone movement
- Position
- Odometry
- Battery information
- Mission status
- Search routes
- Camera images
- Person detections
- Target locations

## Running the Frontend

Install the frontend dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The dashboard will normally be available at:

```text
http://localhost:5173
```

## Running the Telemetry API

The FastAPI telemetry bridge is located in:

```text
backend/telemetry_api.py
```

From the backend directory, start the API with:

```bash
python -m uvicorn telemetry_api:app --host 127.0.0.1 --port 8000
```

The telemetry WebSocket is available at:

```text
ws://127.0.0.1:8000/ws/telemetry
```

## Current Development Status

The project is currently under active development.

Implemented:

- React command station
- Leaflet mission map
- WebSocket telemetry connection
- FastAPI telemetry bridge
- ROS 2 telemetry subscriptions
- Mock drone telemetry
- Route visualization
- Target visualization
- Mock camera feed

In progress:

- Search-area input
- Mission command controls
- Live camera integration
- PX4 integration
- Full mission execution
- Final command station styling

## Project

STRIX is being developed as a senior capstone project at the University of Houston-Clear Lake.

The system is intended to demonstrate how autonomous aerial systems, computer vision, ROS 2, and a web-based command station can be combined to support search-and-rescue operations.