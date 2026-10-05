//contains the DetectedTargets component, which displays a list of detected targets with their coordinates and altitude

import type {
  Target
} from "../types/dashboard"


type DetectedTargetsProps = {
  targets: Target[]
}


function DetectedTargets({
  targets
}: DetectedTargetsProps) {

  return (
    <section>

      <h2>
        Detected Targets
      </h2>


      {targets.length === 0 ? (

        <p>
          No targets detected.
        </p>

      ) : (

        targets.map(
          (target, index) => (

            <div key={index}>

              <h3>
                Target {index + 1}
              </h3>

              <p>
                Latitude:{" "}
                {target.latitude.toFixed(6)}
              </p>

              <p>
                Longitude:{" "}
                {target.longitude.toFixed(6)}
              </p>

              <p>
                Altitude:{" "}
                {target.altitude_m.toFixed(1)} m
              </p>

            </div>

          )
        )

      )}

    </section>
  )
}


export default DetectedTargets