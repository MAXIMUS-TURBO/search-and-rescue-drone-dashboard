import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from interfaces.topics import DETECTIONS
import json

class MockDetectionPublisher(Node):

    def __init__(self):
        super().__init__("mock_detection")

        self.detection_publisher = self.create_publisher(String, DETECTIONS, 10)

        self.timer = self.create_timer(2.0, self.publish_detection)

    def publish_detection(self):
        now = self.get_clock().now()

        detection = {
            "label": "person",
            "confidence": 0.9,
            "x_min": 250,
            "y_min": 150,
            "x_max": 400,
            "y_max": 450,
            "center_x": 325,
            "center_y": 300,
            "image_width": 1280,
            "image_height": 720,
            "timestamp_second": now.nanoseconds // 1_000_000_000,
            "timestamp_nanosec": now.nanoseconds % 1_000_000_000
        }

        message = String()
        message.data = json.dumps(detection)

        self.detection_publisher.publish(message)

        self.get_logger().info(f"Published mock detection: {message.data}")

def main(args=None):
    rclpy.init(args=args)
    node = MockDetectionPublisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == "__main__":
    main()