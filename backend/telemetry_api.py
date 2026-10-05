# create a connector that will connect to the telemetry backend and fetch data for the dashboard. 

# dashboard/telemetry_api.py
#
# ROS 2 simulated drone
#        │
#        │ /strix/drone_position
#        ▼
# dashboard/telemetry_api.py
#        │
#        │ HTTP / JSON
#        ▼
# React dashboard


# FastAPI creates the HTTP API for React
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ROS 2 Python client library
import rclpy
from rclpy.node import Node

# ROS 2 message type used by our simulated drone publisher
from sensor_msgs.msg import NavSatFix, BatteryState
from interfaces.topics import DRONE_POSITION, DRONE_BATTERY, SEARCH_AREA, ROUTE, FLIGHT_STATUS, DETECTIONS, TARGET_LOCATION, DRONE_ODOMETRY
from std_msgs.msg import String #for route, search area and flight status
from nav_msgs.msg import Odometry

# Run the ROS subscriber in a background thread
import threading

#json for backend telemetry data
import json


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


telemetry = {
    "battery_percent": 100.0,
    "battery_voltage": 16.8,
    "altitude_m": 0.0,
    "speed_mps": 0.0,
    "heading_deg": 90.0,
    "latitude_deg": 29.576988,
    "longitude_deg": -95.104195,
    "mission_status": "SEARCHING",
    "gps_status": "LOCKED",
    "drone_online": False,

    # New
    "search_area": None,
    "route": None,
    "flight_status": None,
    "drone_odometry": None,
    "camera_image": None,
    "detections": None,
    "target_location": None,
}


# this subs to the telemetry ros 2 nodes
class TelemetrySubscriber(Node):
    def __init__(self):
        super().__init__("dashboard_telemetry_bridge")

        self.position_subscription = self.create_subscription(
            NavSatFix,
            DRONE_POSITION,
            self.position_callback,
            10
        )

        self.battery_subscription = self.create_subscription(
            BatteryState,
            DRONE_BATTERY,
            self.battery_callback,
            10
        )

        self.search_area_subscription = self.create_subscription(
            String,
            SEARCH_AREA,
            self.search_area_callback,
            10
        )

        self.route_subscription = self.create_subscription(
            String,
            ROUTE,
            self.route_callback,
            10
        )

        self.flight_status_subscription = self.create_subscription(
            String,
            FLIGHT_STATUS,
            self.flight_status_callback,
            10
        )

        self.detections_subscription = self.create_subscription(
            String,
            DETECTIONS,
            self.detections_callback,
            10
        )

        self.target_location_subscription = self.create_subscription(
            NavSatFix,
            TARGET_LOCATION,    
            self.target_location_callback,
            10
        )

        self.drone_odometry_subscription = self.create_subscription(
            Odometry,
            DRONE_ODOMETRY,
            self.drone_odometry_callback,
            10
        )


        self.get_logger().info(
            "Dashboard telemetry bridge connected to ROS topics"
        )

# how it looks on json file

    def position_callback(self, message):
        global telemetry

        telemetry["latitude_deg"] = message.latitude
        telemetry["longitude_deg"] = message.longitude
        telemetry["altitude_m"] = message.altitude
        telemetry["drone_online"] = True
        telemetry["gps_status"] = "LOCKED"
        telemetry["mission_status"] = "SEARCHING"

    def battery_callback(self, message):
        global telemetry

        telemetry["battery_percent"] = message.percentage * 100
        telemetry["battery_voltage"] = message.voltage

    def search_area_callback(self, message):
        global telemetry
        telemetry["search_area"] = json.loads(message.data)

    def route_callback(self, message):
        global telemetry

        telemetry["route"] = json.loads(message.data)
        

    def flight_status_callback(self, message):
        global telemetry

        telemetry["flight_status"] = json.loads(message.data)

    def detections_callback(self, message):
        global telemetry

        telemetry["detections"] = json.loads(message.data)

    def target_location_callback(self, message):
        global telemetry

        telemetry["target_location"] = {
            "latitude": message.latitude,
            "longitude": message.longitude,
            "altitude": message.altitude,
        }

    def drone_odometry_callback(self, message):
        global telemetry

        telemetry["drone_odometry"] = {
            "position": {
                "x": message.pose.pose.position.x,
                "y": message.pose.pose.position.y,
                "z": message.pose.pose.position.z,
            },
            "velocity": {
                "x": message.twist.twist.linear.x,
                "y": message.twist.twist.linear.y,
                "z": message.twist.twist.linear.z,
            },
            "orientation": {
                "x": message.pose.pose.orientation.x,
                "y": message.pose.pose.orientation.y,
                "z": message.pose.pose.orientation.z,
                "w": message.pose.pose.orientation.w,
            },  
            }


#start ros 2 node in background thread
def start_ros():
    rclpy.init()

    node = TelemetrySubscriber()

    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        rclpy.shutdown()


ros_thread = threading.Thread(
    target=start_ros,
    daemon=True
)

ros_thread.start()


@app.get("/telemetry")
def get_telemetry():
    return telemetry