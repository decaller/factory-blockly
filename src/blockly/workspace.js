import * as Blockly from 'blockly';
import * as En from 'blockly/msg/en';
import { defineBlocks } from './blocks';
import { defineGenerators } from './generator';
import { javascriptGenerator } from 'blockly/javascript';

Blockly.setLocale(En);

export function injectBlockly() {
    console.log("Initializing Blockly...");
    defineBlocks();
    defineGenerators();

    defineBlocks();
    defineGenerators();

    const blocklyDiv = document.getElementById('blockly-container');
    const workspace = Blockly.inject(blocklyDiv, {
        toolbox: {
            "kind": "flyoutToolbox",
            "contents": [
              {
                "kind": "block",
                "type": "robot_move_forward"
              },
              {
                "kind": "block",
                "type": "robot_turn_left"
              },
              {
                "kind": "block",
                "type": "robot_turn_right"
              },
              {
                "kind": "block",
                "type": "robot_grab"
              },
              {
                "kind": "block",
                "type": "robot_drop"
              },
              {
                "kind": "block",
                "type": "controls_repeat_ext",
                "inputs": {
                    "TIMES": {
                        "shadow": {
                            "type": "math_number",
                            "fields": { "NUM": 5 }
                        }
                    }
                }
              }
            ]
        },
        scrollbars: true,
        trashcan: true,
        media: 'https://unpkg.com/blockly/media/',
        zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2,
            pinch: true
        }
    });

    // Resize handler
    window.addEventListener('resize', () => {
        Blockly.svgResize(workspace);
    });

    // Force initial resize
    setTimeout(() => {
        Blockly.svgResize(workspace);
    }, 0);

    return workspace;
}

export function getWorkspaceCode(workspace) {
    const code = javascriptGenerator.workspaceToCode(workspace);
    console.log("Generated Code:\n", code);

    const commandQueue = [];

    // Define the API functions that the blocks call
    const moveForward = () => commandQueue.push('MOVE_FORWARD');
    const turnLeft = () => commandQueue.push('TURN_LEFT');
    const turnRight = () => commandQueue.push('TURN_RIGHT');
    const grab = () => commandQueue.push('GRAB');
    const drop = () => commandQueue.push('DROP');

    try {
        // Create a function that takes our API as arguments and runs the user code
        const runUserCode = new Function('moveForward', 'turnLeft', 'turnRight', 'grab', 'drop', code);
        
        // Execute it
        runUserCode(moveForward, turnLeft, turnRight, grab, drop);
    } catch (e) {
        console.error("Error executing block code:", e);
    }

    return commandQueue;
}
