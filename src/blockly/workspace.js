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
            "kind": "categoryToolbox",
            "contents": [
                {
                    "kind": "category",
                    "name": "Robot",
                    "colour": "120",
                    "contents": [
                        { "kind": "block", "type": "robot_start" },
                        { "kind": "block", "type": "robot_move_forward" },
                        { "kind": "block", "type": "robot_turn_left" },
                        { "kind": "block", "type": "robot_turn_right" },
                        { "kind": "block", "type": "robot_grab" },
                        { "kind": "block", "type": "robot_drop" }
                    ]
                },
                {
                    "kind": "category",
                    "name": "Control",
                    "colour": "210",
                    "contents": [
                        {
                            "kind": "block",
                            "type": "controls_repeat_ext",
                            "inputs": {
                                "TIMES": {
                                    "shadow": {
                                        "type": "math_number",
                                        "fields": { "NUM": 5 }
                                    },
                                    "block": {
                                        "type": "math_infinity"
                                    }
                                }
                            }
                        },
                        { "kind": "block", "type": "controls_if" },
                        { "kind": "block", "type": "controls_whileUntil" }
                    ]
                },
                {
                    "kind": "category",
                    "name": "Logic",
                    "colour": "210",
                    "contents": [
                        { "kind": "block", "type": "logic_compare" },
                        { "kind": "block", "type": "logic_operation" },
                        { "kind": "block", "type": "logic_boolean" }
                    ]
                },
                {
                    "kind": "category",
                    "name": "Math",
                    "colour": "230",
                    "contents": [
                         { "kind": "block", "type": "math_number" },
                         { "kind": "block", "type": "math_arithmetic" },
                         { "kind": "block", "type": "math_infinity" }
                    ]
                },
                {
                    "kind": "category",
                    "name": "Variables",
                    "colour": "330",
                    "custom": "VARIABLE"
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

    // Load saved workspace
    const savedState = localStorage.getItem('blocklyWorkspace');
    if (savedState) {
        try {
            Blockly.serialization.workspaces.load(JSON.parse(savedState), workspace);
        } catch (e) {
            console.error("Failed to load saved workspace:", e);
        }
    }

    // Save workspace on change
    workspace.addChangeListener((event) => {
        // specific events that should trigger save (optional, but good practice to filter)
        if (event.type === Blockly.Events.BLOCK_MOVE || 
            event.type === Blockly.Events.BLOCK_CHANGE ||
            event.type === Blockly.Events.BLOCK_DELETE ||
            event.type === Blockly.Events.BLOCK_CREATE ||
            event.type === Blockly.Events.VAR_CREATE ||
            event.type === Blockly.Events.VAR_DELETE ||
            event.type === Blockly.Events.VAR_RENAME) {
                
            const state = Blockly.serialization.workspaces.save(workspace);
            localStorage.setItem('blocklyWorkspace', JSON.stringify(state));
        }
    });

    return workspace;
}

export function getWorkspaceCode(workspace) {
    javascriptGenerator.init(workspace);
    
    let code = '';
    const startBlocks = workspace.getBlocksByType('robot_start', false); // false = only top level? No, checking hierarchy is expensive, just finding all is fine.
    
    if (startBlocks.length > 0) {
        // If start blocks exist, generate code ONLY for them
        console.log(`Found ${startBlocks.length} 'Robot 1' blocks.`);
        // Just take the first one for now? Or concatenate all?
        // Usually there's only one start block allowed/intended.
        // Let's iterate all just in case user duplicated it.
        startBlocks.forEach(block => {
            const blockCode = javascriptGenerator.blockToCode(block);
            // blockToCode returns String for statement blocks
            code += blockCode;
        });
    } else {
        // Fallback: Generate all code if no start block (Legacy behavior)
        console.log("No 'Robot 1' block found, generating all code.");
        code = javascriptGenerator.workspaceToCode(workspace);
    }

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
