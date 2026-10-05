

import { useEffect, useState } from "react"

// This component is a placeholder for the camera feed
//      It cycles through a set of test images to simulate a live camera feed.import { useEffect, useState } from "react"

// Later, this can be replaced with the real camera stream
// without changing the rest of the dashboard.

const images = [
  "/test_images2/grass.png",
  "/test_images2/grass.png",
  "/test_images2/grass.png",
  "/test_images2/grass.png",
  "/test_images2/grass.png",
  "/test_images2/grass.png",
  "/test_images2/grass.png",
  "/test_images2/person_center.png",
  "/test_images2/grass.png",
  "/test_images2/grass.png",
  "/test_images2/grass.png",
  "/test_images2/grass.png",
  "/test_images2/grass.png",
  "/test_images2/grass.png",
  "/test_images2/grass.png",
  "/test_images2/grass.png",
  "/test_images2/person_right.png",
  "/test_images2/grass.png",
  "/test_images2/grass.png",
  "/test_images2/grass.png",
  "/test_images2/grass.png",
  "/test_images2/multi_persons.png",
]


function CameraFeed() {
  const [imageIndex, setImageIndex] =useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => {
      setImageIndex(
        (currentIndex) =>
          (currentIndex + 1) % images.length
      )
    }, 2000)


    // Stop the timer if the component is removed.
    return () => {window.clearInterval(timer)}
  }, [])


  return (
    <div className="camera-feed">

      <img
        src={images[imageIndex]}
        alt="Simulated drone camera feed"
      />

    </div>
  )
}


export default CameraFeed