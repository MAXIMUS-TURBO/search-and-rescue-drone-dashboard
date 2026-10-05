import rclpy
from rclpy.node import Node
from nav_msgs.msg import Odometry
from interfaces.topics import DRONE_ODOMETRY

class MockDroneOdometry(Node):

    def __init__(self):
        super().__init__('mock_drone_odometry')
        self.odometry_publisher = self.create_publisher(Odometry, DRONE_ODOMETRY, 10)
        self.timer = self.create_timer(0.1, self.publish_odometry)

        self.x = 0.0
        self.y = 0.0
        self.z = 7.6

    def publish_odometry(self):
        odometry = Odometry()
        odometry.header.stamp = self.get_clock().now().to_msg()
        odometry.header.frame_id = "map"
        odometry.child_frame_id = "base_link"

        odometry.pose.pose.position.x = self.x
        odometry.pose.pose.position.y = self.y
        odometry.pose.pose.position.z = self.z

        odometry.pose.pose.orientation.x = 0.0
        odometry.pose.pose.orientation.y = 0.0
        odometry.pose.pose.orientation.z = 0.0
        odometry.pose.pose.orientation.w = 1.0

        odometry.twist.twist.linear.x = 1.0
        odometry.twist.twist.linear.y = 0.5
        odometry.twist.twist.linear.z = 0.0


        self.odometry_publisher.publish(odometry)

        self.get_logger().info(f"Published odometry: x={self.x:.1f}, y={self.y:.1f}, z={self.z:.1f}")

        self.x += 1.0
        self.y += 0.5

def main(args=None):
    rclpy.init(args=args)
    node = MockDroneOdometry()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()