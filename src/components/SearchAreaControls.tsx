// on the left side of the dashboard, this component will allow the user to set the base location
//  and define the search area for the drone to operate in. 
// The user can either draw the search area on a map or enter coordinates manually. 
// once the search area is defined, the user can confirm it to proceed with the mission.

//temporary placeholder for the search area controls section of the dashboard

function SearchAreaControls() {
  return (
    <section>
      <h2>Search Area Controls</h2>
      <div>
        <h3>Base Location</h3>
        <input
          type="text"
          placeholder="Enter base address"
          disabled
        />

        <button disabled>
          Set Base
        </button>
      </div>

      <div>
        <h3>Search Area</h3>

        <button disabled>
          Draw Area
        </button>

        <button disabled>
          Enter Coordinates
        </button>
      </div>

      <div>
        <input
          type="number"
          placeholder="Latitude"
          disabled
        />

        <input
          type="number"
          placeholder="Longitude"
          disabled
        />
      </div>

      <button disabled>
        Confirm Search Area
      </button>
    </section>
  )
}

export default SearchAreaControls