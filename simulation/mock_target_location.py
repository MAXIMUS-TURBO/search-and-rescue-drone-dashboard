import rclpy
from rclpy.node import Node
from sensor_msgs.msg import NavSatFix
from interfaces.topics import TARGET_LOCATION

class MockTargetLocationPublisher(Node):

    def __init__(self):
        super().__init__("mock_target_location")

        self.publisher = self.create_publisher(NavSatFix, TARGET_LOCATION, 10)

        self.timer = self.create_timer(1.0, self.publish_target_location)

        self.latitude = 29.576530
        self.longitude = -95.103580

    def publish_target_location(self):
        target_location = NavSatFix()
        target_location.header.stamp = self.get_clock().now().to_msg()
        target_location.header.frame_id = "gps"
        target_location.latitude = self.latitude
        target_location.longitude = self.longitude
        target_location.altitude = 0.0
        self.publisher.publish(target_location)

        self.get_logger().info(f"Published target location at {target_location.latitude}, {target_location.longitude}")

def main(args=None):
    rclpy.init(args=args)
    node = MockTargetLocationPublisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == "__main__":
    main()