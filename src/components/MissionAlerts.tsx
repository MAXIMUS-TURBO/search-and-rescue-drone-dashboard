//this component displays the mission alerts: 
// - the backend is connected
// - a search route has been received
// - how many targets have been detected

type MissionAlertsProps = {
  connected: boolean
  routeReceived: boolean
  targetCount: number
}


function MissionAlerts({
  connected,
  routeReceived,
  targetCount,
}: MissionAlertsProps) {

  return (
    <section>

      <h2>
        Mission Alerts
      </h2>

      <p>
        Backend:{" "}
        {connected
          ? "Connected"
          : "Disconnected"}
      </p>


      {routeReceived && (
        <p>
          Search route received.
        </p>
      )}


      {targetCount > 0 && (
        <p>
          {targetCount} target(s) detected.
        </p>
      )}

    </section>
  )
}


export default MissionAlerts