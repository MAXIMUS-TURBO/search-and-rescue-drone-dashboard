import json
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from interfaces.topics import FLIGHT_COMMAND

class MockFlightCommand(Node):

    def __init__(self):
        super().__init__('mock_flight_command')

        self.publisher = self.create_publisher(String, FLIGHT_COMMAND, 10)
        self.timer = self.create_timer(1.0, self.publish_flight_command)

    def publish_flight_command(self):
        flight_command = {
            "command": "START"
        }
        message = String()
        message.data = json.dumps(flight_command)

        self.publisher.publish(message)
        self.get_logger().info(f"Published flight command: {message.data}")

def main(args=None):
    rclpy.init(args=args)
    node = MockFlightCommand()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
