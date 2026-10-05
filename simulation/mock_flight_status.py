import json
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from interfaces.topics import FLIGHT_STATUS


class MockFlightStatus(Node):

    def __init__(self):
        super().__init__('mock_flight_status')

        self.publisher = self.create_publisher(String, FLIGHT_STATUS, 10)
        self.timer = self.create_timer(1.0, self.publish_flight_status)

    def publish_flight_status(self):
        flight_status = {
            "state": "SEARCHING",
            "armed": True,
            "ready": True,
            "route_complete": False,
            "detail": "Following search route"
        }

        message = String()
        message.data = json.dumps(flight_status)

        self.publisher.publish(message)

        self.get_logger().info(f"Published flight status: {message.data}")

def main(args=None):
    rclpy.init(args=args)
    node = MockFlightStatus()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()