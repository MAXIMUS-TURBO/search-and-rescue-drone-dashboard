import cv2
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
from interfaces.topics import CAMERA_IMAGE

class MockCamera(Node):

    def __init__(self):
        super().__init__('mock_camera')

        self.publisher = self.create_publisher(Image, CAMERA_IMAGE, 10)
        self.bridge = CvBridge()

        self.image_paths = [
            "vision/test_images2/grass.png",
            "vision/test_images2/grass.png",
            "vision/test_images2/grass.png",
            "vision/test_images2/grass.png",
            "vision/test_images2/grass.png",
            "vision/test_images2/grass.png",
            "vision/test_images2/grass.png",
            "vision/test_images2/person_center.png",
            "vision/test_images2/grass.png",
            "vision/test_images2/grass.png",
            "vision/test_images2/grass.png",
            "vision/test_images2/grass.png",
            "vision/test_images2/grass.png",
            "vision/test_images2/grass.png",
            "vision/test_images2/grass.png",
            "vision/test_images2/grass.png",
            "vision/test_images2/person_right.png",
            "vision/test_images2/grass.png",
            "vision/test_images2/grass.png",
            "vision/test_images2/grass.png",
            "vision/test_images2/grass.png",
            "vision/test_images2/multi_persons.png"
        ]

        self.image_index = 0

        self.timer = self.create_timer(2.0, self.publish_image)

    def publish_image(self):
        image_path = self.image_paths[self.image_index]
        image = cv2.imread(image_path)

        if image is None:
            self.get_logger().error(f"Failed to load image: {image_path}")
            return

        image_msg = self.bridge.cv2_to_imgmsg(image, encoding="bgr8")

        image_msg.header.stamp = self.get_clock().now().to_msg()
        image_msg.header.frame_id = "camera"
        self.publisher.publish(image_msg)
        self.get_logger().info(f"Published image: {image_path}")
        self.image_index = (self.image_index + 1) % len(self.image_paths)

def main(args=None):
    rclpy.init(args=args)
    node = MockCamera()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == "__main__":
    main()