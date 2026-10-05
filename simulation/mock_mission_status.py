import json
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from interfaces.topics import MISSION_STATUS

class MockMissionStatus(Node):

    def __init__(self):
        super().__init__('mock_mission_status')

        self.publisher = self.create_publisher(String, MISSION_STATUS, 10)
        self.timer = self.create_timer(1.0, self.publish_mission_status)


    def publish_mission_status(self):
        mission_status = {
            "state": "SEARCHING",
            "route_received": True,
            "target_detected": False,
            "detail": "Search in progress"
        }

        message = String()
        message.data = json.dumps(mission_status)

        self.publisher.publish(message)

        self.get_logger().info(f"Published mission status: {message.data}")

def main(args=None):
    rclpy.init(args=args)
    node = MockMissionStatus()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()