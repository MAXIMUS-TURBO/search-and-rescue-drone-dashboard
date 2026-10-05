import json
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from interfaces.topics import DETECTIONS

class DetectionListener(Node):
    def __init__(self):
        super().__init__("mock_detection_listener")

        self.subscription = self.create_subscription(
            String,
            DETECTIONS,
            self.subscribe_detection,
            10
        )

    def subscribe_detection(self, msg):
        detection = json.loads(msg.data)
        self.get_logger().info(f"Received detection: {detection}")

def main(args=None):
    rclpy.init(args=args)
    node = DetectionListener()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == "__main__":
    main()