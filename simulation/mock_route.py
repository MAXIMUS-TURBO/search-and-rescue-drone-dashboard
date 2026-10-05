import json
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from interfaces.topics import ROUTE

class MockRoute(Node):
    def __init__(self):
        super().__init__('mock_route')

        self.publisher = self.create_publisher(String, ROUTE, 10)
        self.timer = self.create_timer(1.0, self.publish_route_once)

    def publish_route(self):
        route = {
            "waypoints": [
                {
                    "latitude": 29.576587,
                    "longitude": -95.103713,
                    "altitude": 7.6
                },
                {
                    "latitude": 29.576587,
                    "longitude": -95.103507,
                    "altitude": 7.6
                },
                {
                    "latitude": 29.576497,
                    "longitude": -95.103507,
                    "altitude": 7.6
                },
                {
                    "latitude": 29.576497,
                    "longitude": -95.103713,
                    "altitude": 7.6
                },
                {
                    "latitude": 29.576407,
                    "longitude": -95.103713,
                    "altitude": 7.6
                },
                {
                    "latitude": 29.576407,
                    "longitude": -95.103507,
                    "altitude": 7.6
                }
            ]
        }

        message = String()
        message.data = json.dumps(route)

        self.publisher.publish(message)

        self.get_logger().info(f"Published route: {message.data}")

    def publish_route_once(self):
        self.publish_route()
        self.timer.cancel()

def main(args=None):
    rclpy.init(args=args)
    node = MockRoute()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == "__main__":
    main()
