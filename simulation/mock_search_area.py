import json
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from interfaces.topics import SEARCH_AREA

class MockSearchArea(Node):

    def __init__(self):
        super().__init__("mock_search_area")

        self.publisher = self.create_publisher(String, SEARCH_AREA, 10)
        self.timer = self.create_timer(2.0, self.publish_search_area)

    def publish_search_area(self):
        search_area = {
            "corner_1": {
                "latitude": 29.576587,
                "longitude": -95.103713
            },
            "corner_2": {
                "latitude": 29.576407,
                "longitude": -95.103507
            }
        }

        message = String()
        message.data = json.dumps(search_area)

        self.publisher.publish(message)

        self.get_logger().info(f"Published search area: {message.data}")

def main(args=None):
    rclpy.init(args=args)
    node = MockSearchArea()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == "__main__":
    main()
