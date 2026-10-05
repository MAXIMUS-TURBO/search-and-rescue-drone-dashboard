# this python script runs the drone simulations, used to test on frontend without running multiple terminals
# Starts multiple ROS 2 mock nodes at the same time
# The launcher also shuts down all child processes when Ctrl+C is pressed
#How to run:
# in your command center type:
    # cd C:\pixi_ws
    # pixi shell
    # call C:\pixi_ws\ros2-windows\local_setup.bat
    # call C:\pixi_ws\install\local_setup.bat

    #--- cd to your main dir folder then type
    # python tests\run_simulation.py


#(just like the linux C project from OS but python)

#sources and tutorials:
#  https://docs.python.org/3/library/subprocess.html#subprocess.Popen

import os
import subprocess
import sys
import time

PROJECT_ROOT = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)#root of directories

#list of needed nodes
MOCK_NODES = [
    "simulation/mock_drone_telemetry.py",
    "simulation/mock_drone_battery.py",
    "simulation/mock_route.py",
    "simulation/mock_mission_status.py",
    "simulation/mock_target_location.py",
    # "simulation/mock_camera.py", Camera is temporarily disabled.
]


def main():
    # Store references to all child processes in a list
    # so that they can be shut down when done
    processes = []

    print("===================================")
    print(" STRIX Simulation Launcher")
    print("===================================")
    print()

    # Create a copy of the current environment
    environment = os.environ.copy()
    # allows child processes to find "interfaces/"
    existing_pythonpath = environment.get("PYTHONPATH", "")

    if existing_pythonpath:
        environment["PYTHONPATH"] = (PROJECT_ROOT+os.pathsep+existing_pythonpath)
    else:
        environment["PYTHONPATH"] = PROJECT_ROOT

    print(f"Project root: {PROJECT_ROOT}")
    print()

    # Start every mock node
    for node in MOCK_NODES:
        node_path = os.path.join(PROJECT_ROOT,node)#find each node

        #start nodes as subprocesses, so they can run in parallel
        print(f"Starting {node}...")
        process = subprocess.Popen(
            [sys.executable, node_path],
            cwd=PROJECT_ROOT,
            env=environment
        )
    #  save all processes so we can monitor and terminate later
        processes.append((node, process))

        time.sleep(0.5)

    print()
    print("Simulation nodes started.")
    print("Press Ctrl+C to stop the simulation.")
    print()

    try:
        # Keep the launcher alive while the children run
        while True:
            # Check whether any process has unexpectedly stopped.
            for node, process in processes:
                return_code = process.poll()
                if return_code is not None:
                    print(
                        f"[WARNING] {node} stopped "
                        f"with exit code {return_code}"
                    )
            time.sleep(1)
    except KeyboardInterrupt:
        print()
        print("Stopping simulation...")

        # KILL ALL DA CHILDREN
        for node, process in processes:
            if process.poll() is None:
                print(f"Stopping {node}...")
                process.terminate()

        # wait for them to die
        for node, process in processes: #processes is a list of tuples (node, process)
            process.wait()

        print("Simulation stopped.")


if __name__ == "__main__":
    main()