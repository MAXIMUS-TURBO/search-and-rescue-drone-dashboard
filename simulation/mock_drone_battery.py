
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import BatteryState
from interfaces.topics import DRONE_BATTERY

class MockDroneBattery(Node):

    def __init__(self):
        super().__init__("mock_drone_battery")

        self.battery_publisher = self.create_publisher(BatteryState, DRONE_BATTERY, 10)
        self.timer = self.create_timer(1.0, self.publish_battery)

        self.battery_percentage = 1.0
        self.battery_voltage = 16.8

    def publish_battery(self):
        battery = BatteryState()
        battery.percentage = self.battery_percentage
        battery.voltage = self.battery_voltage
        battery.present = True
        self.battery_publisher.publish(battery)

        self.get_logger().info(f"Battery state published "
                               f"{battery.percentage * 100:.2f}% "
                               f"({battery.voltage:.2f} V)")

        if self.battery_percentage > 0.0:
            self.battery_percentage -= 0.0001
        if self.battery_voltage > 14.0:
            self.battery_voltage -= 0.01

def main(args=None):
    rclpy.init(args=args)
    node = MockDroneBattery()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == "__main__":
    main()