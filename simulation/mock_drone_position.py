
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import NavSatFix
from interfaces.topics import DRONE_POSITION


class MockDronePosition(Node):

    def __init__(self):
        super().__init__("mock_drone_position")

        self.position_publisher = self.create_publisher(NavSatFix, DRONE_POSITION, 10)
        self.timer = self.create_timer(1.0, self.publish_position)

        self.latitude = 29.5764966
        self.longitude = -95.1036097
        self.altitude = 7.6

    def publish_position(self):
        position = NavSatFix()
        position.header.stamp = self.get_clock().now().to_msg()
        position.header.frame_id = "gps"
        position.latitude = self.latitude
        position.longitude = self.longitude
        position.altitude = self.altitude
        self.position_publisher.publish(position)

        self.get_logger().info(f"Published drone position: " 
                               f"{position.latitude}, {position.longitude}, {position.altitude} m")

        self.latitude += 0.0001
        self.longitude += 0.0001

def main(args=None):
    rclpy.init(args=args)
    node = MockDronePosition()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == "__main__":
    main()