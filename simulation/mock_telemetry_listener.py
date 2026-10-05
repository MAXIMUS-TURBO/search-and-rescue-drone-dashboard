
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import NavSatFix, BatteryState
from interfaces.topics import DRONE_POSITION, DRONE_BATTERY

class MockTelemetryListener(Node):

    def __init__(self):
        super().__init__("mock_telemetry_listener")

        self.create_subscription(NavSatFix, DRONE_POSITION, self.subscribe_position, 10)
        self.create_subscription(BatteryState, DRONE_BATTERY, self.subscribe_battery, 10)

    def subscribe_position(self, position):
        self.get_logger().info(f"Received telemetry: {position.latitude}, {position.longitude}, {position.altitude} m")

    def subscribe_battery(self, battery):
        self.get_logger().info(f"Received battery state: {battery.percentage * 100:.2f}% ({battery.voltage:.2f} V)")

def main(args=None):
    rclpy.init(args=args)
    node = MockTelemetryListener()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == "__main__":
    main()