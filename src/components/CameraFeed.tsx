import { useEffect, useState } from "react"

// This component is a placeholder for the camera feed
//      It cycles through a set of test images to simulate a live camera feed.
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
  const [imageIndex, setImageIndex] = useState(0)

  useEffect(() => {
    console.log("CameraFeed timer started")

    const timer = window.setInterval(() => {
      setImageIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % images.length

        console.log("Camera image:", nextIndex)

        return nextIndex
      })
    }, 2000)

    return () => {
      console.log("CameraFeed timer stopped")
      window.clearInterval(timer)
    }
  }, [])

  return (
    <div className="camera-feed">
      <img
        src={images[imageIndex]}
        alt="Drone camera feed"
      />
    </div>
  )
}

export default CameraFeed