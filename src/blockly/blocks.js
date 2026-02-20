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
        }
    ]);
}
