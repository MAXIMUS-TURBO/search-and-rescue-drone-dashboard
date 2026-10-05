//display the current status of the mission
//only displays information, does not allow for any interaction with the mission

import type {
  DashboardState
} from "../types/dashboard"


type MissionStatusProps = {
  mission: DashboardState["mission"]
}


function MissionStatus({
  mission
}: MissionStatusProps) {
  return (
    <section>

      <h2>
        Mission Status
      </h2>

      <p>
        State: {mission.state}
      </p>

      <p>
        Detail: {mission.detail || "--"}
      </p>

      <p>
        Route:{" "}
        {mission.route_received
          ? "Received"
          : "Waiting"}
      </p>

      <p>
        Target:{" "}
        {mission.target_detected
          ? "Detected"
          : "None"}
      </p>

    </section>
  )
}


export default MissionStatus