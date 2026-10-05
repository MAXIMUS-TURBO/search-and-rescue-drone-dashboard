# create a connector that will connect to the telemetry backend and fetch data for the dashboard. 
'''
                ROS 2
                │
                ├── /strix/drone_position ───────┐
                ├── /strix/drone_odometry ──────┤
                ├── /strix/drone_battery ───────┤
                ├── /strix/mission_status ──────┤
                ├── /strix/route ───────────────┤
                └── /strix/target_location ─────┤
                                                ↓
                                        DashboardBridge
                                                │
                                                ↓
                                        latest_state
                                        ↙            ↘
                                GET /api/state    /ws/telemetry
                                        ↘            ↙
                                            React


sources & tutorials:
threading: https://docs.python.org/3/library/threading.html
orientation and more: https://automaticaddison.com/how-to-simulate-a-robot-using-gazebo-and-ros-2/
fastapi lifespan: https://fastapi.tiangolo.com/advanced/events/
cors middleware: https://fastapi.tiangolo.com/tutorial/cors/
websockets: https://fastapi.tiangolo.com/advanced/websockets/
'''


# FastAPI creates the HTTP API for React
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# ROS 2 Python client library
import rclpy 
from rclpy.node import Node

from interfaces.topics import DRONE_POSITION, DRONE_BATTERY, ROUTE, TARGET_LOCATION, DRONE_ODOMETRY, MISSION_STATUS
# ROS 2 message type used by our simulated drone publisher
from sensor_msgs.msg import NavSatFix, BatteryState
from std_msgs.msg import String #for route, search area and flight status
from nav_msgs.msg import Odometry #for orientation and speed of the drone

# Run the ROS subscriber in a background thread
import threading

#json for backend telemetry data
import json

import asyncio #used by websocket connection to send telemetry without blocking fastapi
import math 
from contextlib import asynccontextmanager #to control startup and shutdown for fastapi

# lock makes only one thread access this shared state when it is being modified or copied
state_lock = threading.Lock()


# Store the lastest information received from ROS 2 into empty JSON dictionary called latest state 
# return this information to React when requested

latest_state = {
    "drone": {
        "latitude": None,
        "longitude": None,
        "altitude_m": None,
        "speed_mps": None,
        "heading_deg": None,
        "battery_percent": None,
        "battery_voltage": None,
    },
    "mission": {
        "state": "UNKNOWN",
        "detail": "",
    },
    "route": {
        "waypoints": [],
    },
    "targets": [],
}

# ROS 2 bridge between the whole system and the dashboard backend
class DashboardBridge(Node): 
    def __init__(self):
        super().__init__("dashboard_bridge")
        self.create_subscription(
            NavSatFix,
            DRONE_POSITION,
            self.position_callback,
            10,
        )
        self.create_subscription(
            Odometry,
            DRONE_ODOMETRY,
            self.odometry_callback,
            10,
        )
        self.create_subscription(
            BatteryState,
            DRONE_BATTERY,
            self.battery_callback,
            10,
        )
        self.create_subscription(
            String,
            MISSION_STATUS,
            self.mission_status_callback,
            10,
        )
        self.create_subscription(
            String,
            ROUTE,
            self.route_callback,
            10,
        )
        self.create_subscription(
            NavSatFix,
            TARGET_LOCATION,
            self.target_callback,
            10,
        )

        self.get_logger().info(
            "STRIX Dashboard Bridge started"
        )


# callbacks--------------------------------------------------------
    
    def position_callback(self, msg: NavSatFix):
        # Protect shared state while the ROS callback modifies it.
        with state_lock:
            latest_state["drone"]["latitude"] = msg.latitude
            latest_state["drone"]["longitude"] = msg.longitude
            latest_state["drone"]["altitude_m"] = msg.altitude

    # used to calculate speed and orientation
    def odometry_callback(self, msg: Odometry):
        #speed
        vx = msg.twist.twist.linear.x
        vy = msg.twist.twist.linear.y
        speed = math.sqrt(vx ** 2 + vy ** 2)

        #orientation is represented as a quaternion in ROS, so we need to convert it to yaw to get the heading

        # if you imagine the drone as a 3D object, the quaternion describes how it is rotated in space. 
        # The yaw angle is the rotation around the vertical axis, which tells us which direction the drone is facing horizontally

        q = msg.pose.pose.orientation

        # These formulas calculate values corresponding to the sine and cosine of the yaw angle
        siny_cosp = 2.0 * (
            q.w * q.z +
            q.x * q.y
        )
        cosy_cosp = 1.0 - 2.0 * (
            q.y ** 2 +
            q.z ** 2
        )

        yaw = math.atan2(siny_cosp,cosy_cosp)
        # atan2 returns the angle in radians, but degrees are easier to read
        heading = math.degrees(yaw)
        if heading < 0:
            heading += 360

        # Store the calculated telemetry
        with state_lock:
            latest_state["drone"]["speed_mps"] = round(speed,2)
            latest_state["drone"]["heading_deg"] = round(heading,1)


    def battery_callback(self, msg: BatteryState):
        percentage = msg.percentage
        if percentage >= 0:
            percentage *= 100
        with state_lock:
            latest_state["drone"]["battery_percent"] = round(percentage,1)
            latest_state["drone"]["battery_voltage"] = round(msg.voltage,2)

    def mission_status_callback(self, msg: String):
        try:
            data = json.loads(msg.data)
            with state_lock:
                latest_state["mission"] = {
                    "state": data.get("state","UNKNOWN"),
                    "detail": data.get("detail",""),
                    "route_received": data.get("route_received",False),
                    "target_detected": data.get("target_detected",False),
                }


        # DO NOT CRASH the dashboard bridge if another ROS node publishes malformed JSON
        except json.JSONDecodeError:
            self.get_logger().warning("Invalid JSON received on mission status")


    def route_callback(self, msg: String):
        try:
            data = json.loads(msg.data)
            with state_lock:
                latest_state["route"] = {
                    "waypoints": data.get("waypoints",[])
                }

        except json.JSONDecodeError:
            self.get_logger().warning("Invalid JSON received on route")


    def target_callback(self, msg: NavSatFix):
        target = {
            "latitude": msg.latitude,
            "longitude": msg.longitude,
            "altitude_m": msg.altitude,
        }
        with state_lock:
            latest_state["targets"].append(target)

            # During testing, the mock target publisher may send
            # targets repeatedly. Keep only the 50 newest entries
            # so the list cannot grow forever
            latest_state["targets"] = (latest_state["targets"][-50:])


# ROS runner-------------------------------------------------------------

ros_node = None
ros_thread = None

def run_ros():
    global ros_node
    rclpy.init()
    ros_node = DashboardBridge()
    try:
        rclpy.spin(ros_node)
    finally:
        ros_node.destroy_node()

        if rclpy.ok():
            rclpy.shutdown()


# FastAPI -----------------------------------------------------

# this code runs when the FastAPI application starts up

@asynccontextmanager
async def lifespan(app: FastAPI):
    # start a background thread that runs the ROS 2 as loop
    global ros_thread 
    ros_thread = threading.Thread(target=run_ros,daemon=True,)
    ros_thread.start()
    
    yield

     #shutdown the ROS 2 loop when the FastAPI application is shutting down
    if rclpy.ok():
        rclpy.shutdown()


# Create the FastAPI application.
app = FastAPI(
    title="STRIX Dashboard API",
    lifespan=lifespan,
)


# CORS--------------------------------------------------------
# CORS middleware allows the React development server to make requests to this API since they use different ports

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://127.0.0.1:5173",],
    allow_credentials=True,
    allow_methods=["*"], #all http methods are allowed (GET, POST, etc.)
    allow_headers=["*"], #all headers allowed
)


# REST API-----------------------------------------------------
# to make requests to the backend

@app.get("/")
def root():
    # Simple health-check endpoint.
    return {
        "service": "STRIX Dashboard API",
        "status": "online",
    }

@app.get("/api/state")
def get_state(): # copy before returning the state to prevent FastAPI from working directly with the dictionary that ROS callbacks are modifying
    with state_lock:
        snapshot = json.loads(json.dumps(latest_state))
    return snapshot

# WebSocket-----------------------------------------------------

# WebSocket stays connected unlike get_state
# so backend continuously push new telemetry to React without it repeatedly sending HTTP requests

@app.websocket("/ws/telemetry")
async def telemetry_websocket(
    websocket: WebSocket
):
    await websocket.accept()

    try:
        while True:
            with state_lock: 
                snapshot = json.loads(json.dumps(latest_state))
            await websocket.send_json(snapshot)
            await asyncio.sleep(0.1) # Wait 0.1 seconds before sending the next update

    # closed page or react disconnected
    except WebSocketDisconnect:
        pass