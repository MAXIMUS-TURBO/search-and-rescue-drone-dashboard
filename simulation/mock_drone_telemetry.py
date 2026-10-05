import json
import math
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from nav_msgs.msg import Odometry
from sensor_msgs.msg import NavSatFix
from interfaces.topics import ROUTE, DRONE_POSITION, DRONE_ODOMETRY


class MockDroneTelemetry(Node):

    def __init__(self):
        super().__init__('mock_drone_telemetry')

        self.position_publisher = self.create_publisher(NavSatFix, DRONE_POSITION, 10)
        self.odometry_publisher = self.create_publisher(Odometry, DRONE_ODOMETRY, 10)
        self.route_subscriber = self.create_subscription(String, ROUTE, self.subscribe_route, 10)



        self.waypoints = []
        self.current_waypoint_index = 0

        self.latitude = 29.5764966
        self.longitude = -95.1036097
        self.altitude = 7.6

        self.x = 0.0
        self.y = 0.0
        self.z = 7.6

        self.speed = 2.0
        self.update_period = 0.1

        #self.route_complete = False
        self.yaw = 0.0

        self.timer = self.create_timer(self.update_period, self.update_drone)

    def subscribe_route(self, msg):
        route = json.loads(msg.data)

        self.waypoints = route["waypoints"]
        self.current_waypoint_index = 0
        #self.route_complete = False

        self.get_logger().info("Received route with {} waypoints".format(len(self.waypoints)))

    def update_drone(self):
        if not self.waypoints:
            return

        waypoint = self.waypoints[self.current_waypoint_index]
        target_latitude = waypoint["latitude"]
        target_longitude = waypoint["longitude"]

        meters_per_degree_lat = 111319.49079327357
        meters_per_degree_lon = meters_per_degree_lat * math.cos(math.radians(self.latitude))

        north_distance = (target_latitude - self.latitude) * meters_per_degree_lat
        east_distance = (target_longitude - self.longitude) * meters_per_degree_lon

        distance = math.hypot(north_distance, east_distance)

        movement = self.speed * self.update_period

        if distance <= movement:
            self.x += east_distance
            self.y += north_distance

            self.latitude = target_latitude
            self.longitude = target_longitude
            self.current_waypoint_index += 1

            if self.current_waypoint_index >= len(self.waypoints):
                #self.route_complete = True
                #self.current_waypoint_index = len(self.waypoints) - 1
                #self.get_logger().info("Route complete")
                self.current_waypoint_index = 0

            self.publish_telemetry(0.0, 0.0)
            return

        east_direction = east_distance / distance
        north_direction = north_distance / distance

        east_movement = movement * east_direction
        north_movement = movement * north_direction

        self.x += east_movement
        self.y += north_movement

        self.latitude += north_movement / meters_per_degree_lat
        self.longitude += east_movement / meters_per_degree_lon

        velocity_x = east_direction * self.speed
        velocity_y = north_direction * self.speed

        self.publish_telemetry(velocity_x, velocity_y)

    def publish_telemetry(self, velocity_x, velocity_y):
        now = self.get_clock().now().to_msg()

        position = NavSatFix()
        position.header.stamp = now
        position.header.frame_id = "gps"

        position.latitude = self.latitude
        position.longitude = self.longitude
        position.altitude = self.altitude

        self.position_publisher.publish(position)

        odometry = Odometry()
        odometry.header.stamp = now
        odometry.header.frame_id = "map"
        odometry.child_frame_id = "base_link"

        odometry.pose.pose.position.x = self.x
        odometry.pose.pose.position.y = self.y
        odometry.pose.pose.position.z = self.z

        odometry.twist.twist.linear.x = velocity_x
        odometry.twist.twist.linear.y = velocity_y
        odometry.twist.twist.linear.z = 0.0

        if velocity_x != 0.0 or velocity_y != 0.0:
            self.yaw = math.atan2(velocity_y, velocity_x)


        odometry.pose.pose.orientation.x = 0.0
        odometry.pose.pose.orientation.y = 0.0
        odometry.pose.pose.orientation.z = math.sin(self.yaw / 2.0)
        odometry.pose.pose.orientation.w = math.cos(self.yaw / 2.0)

        self.odometry_publisher.publish(odometry)

        self.get_logger().info(f"Drone: latitude={self.latitude:.7f}, longitude={self.longitude:.7f}, altitude={self.altitude:.1f}, x={self.x:.1f}, y={self.y:.1f}, WP={self.current_waypoint_index}")

def main(args=None):
    rclpy.init(args=args)
    node = MockDroneTelemetry()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == "__main__":
    main()