//this component displays the telemetry data for the drone, 
// altitude, speed, battery status, voltage, heading, and position
// It takes a "drone" object as a prop, which contains the relevant telemetry information

import type {
  DashboardState
} from "../types/dashboard"


type DroneTelemetryProps = {
  drone: DashboardState["drone"]
}


function DroneTelemetry({
  drone
}: DroneTelemetryProps) {

  return (
    <section>

      <h2>
        Drone Telemetry
      </h2>


      <p>
        Altitude:{" "}

        {drone.altitude_m !== null
          ? `${drone.altitude_m.toFixed(1)} m`
          : "--"}
      </p>


      <p>
        Ground Speed:{" "}

        {drone.speed_mps !== null
          ? `${drone.speed_mps.toFixed(1)} m/s`
          : "--"}
      </p>


      <p>
        Battery:{" "}

        {drone.battery_percent !== null
          ? `${drone.battery_percent.toFixed(1)}%`
          : "--"}
      </p>


      <p>
        Voltage:{" "}

        {drone.battery_voltage !== null
          ? `${drone.battery_voltage.toFixed(1)} V`
          : "--"}
      </p>


      <p>
        Heading:{" "}

        {drone.heading_deg !== null
          ? `${drone.heading_deg.toFixed(0)}°`
          : "--"}
      </p>


      <p>
        Position:{" "}

        {drone.latitude !== null &&
        drone.longitude !== null
          ? `${drone.latitude.toFixed(6)}, ${drone.longitude.toFixed(6)}`
          : "--"}
      </p>

    </section>
  )
}


export default DroneTelemetry