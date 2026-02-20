import * as Blockly from 'blockly';

export function defineBlocks() {
    Blockly.defineBlocksWithJsonArray([
        {
            "type": "robot_move_forward",
            "message0": "move forward",
            "previousStatement": null,
            "nextStatement": null,
            "colour": 160,
            "tooltip": "Moves the robot one tile forward.",
            "helpUrl": ""
        },
        {
            "type": "robot_turn_left",
            "message0": "turn left ↺",
            "previousStatement": null,
            "nextStatement": null,
            "colour": 160,
            "tooltip": "Turns the robot 90 degrees to the left.",
            "helpUrl": ""
        },
        {
            "type": "robot_turn_right",
            "message0": "turn right ↻",
            "previousStatement": null,
            "nextStatement": null,
            "colour": 160,
            "tooltip": "Turns the robot 90 degrees to the right.",
            "helpUrl": ""
        },
        {
            "type": "robot_grab",
            "message0": "grab crate",
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
            "tooltip": "Grabs a crate if robot is standing on it.",
            "helpUrl": ""
        },
        {
            "type": "robot_drop",
            "message0": "drop crate",
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
            "tooltip": "Drops the carried crate at the current location.",
            "helpUrl": ""
        },
        {
            "type": "robot_start",
            "message0": "Robot 1",
            "nextStatement": null,
            "colour": 120,
            "tooltip": "Start of the program for Robot 1.",
            "helpUrl": "",
            "hat": "cap"
        },
        {
            "type": "math_infinity",
            "message0": "∞",
            "output": "Number",
            "colour": 230,
            "tooltip": "Infinity (capped at 1000 for safety)",
            "helpUrl": ""
        },
        // --- Detection / Sensor blocks ---
        {
            "type": "sensor_robot_x",
            "message0": "robot X position",
            "output": "Number",
            "colour": 45,
            "tooltip": "Returns the robot's current X grid coordinate.",
            "helpUrl": ""
        },
        {
            "type": "sensor_robot_y",
            "message0": "robot Y position",
            "output": "Number",
            "colour": 45,
            "tooltip": "Returns the robot's current Y grid coordinate.",
            "helpUrl": ""
        },
        {
            "type": "sensor_crate_x",
            "message0": "crate X position",
            "output": "Number",
            "colour": 45,
            "tooltip": "Returns the carried crate's X coordinate (or -1 if none).",
            "helpUrl": ""
        },
        {
            "type": "sensor_crate_y",
            "message0": "crate Y position",
            "output": "Number",
            "colour": 45,
            "tooltip": "Returns the carried crate's Y coordinate (or -1 if none).",
            "helpUrl": ""
        },
        {
            "type": "sensor_blocked",
            "message0": "is blocked",
            "output": "Boolean",
            "colour": 45,
            "tooltip": "Returns true if the robot cannot move forward.",
            "helpUrl": ""
        },
        {
            "type": "sensor_crate_ahead",
            "message0": "crate in front",
            "output": "Boolean",
            "colour": 45,
            "tooltip": "Returns true if there is a crate directly in front of the robot.",
            "helpUrl": ""
        },
        {
            "type": "sensor_crate_color",
            "message0": "front crate color",
            "output": "String",
            "colour": 45,
            "tooltip": "Returns the color of the crate in front ('orange', or 'none').",
            "helpUrl": ""
        },
        // --- Debug ---
        {
            "type": "debug_log",
            "message0": "log ▸ %1",
            "args0": [
                {
                    "type": "input_value",
                    "name": "VALUE"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 30,
            "tooltip": "Logs a value to the console panel.",
            "helpUrl": ""
        }
    ]);
}
