import { javascriptGenerator } from 'blockly/javascript';

export function defineGenerators() {
    javascriptGenerator.forBlock['robot_move_forward'] = function(block) {
        return 'moveForward();\n';
    };

    javascriptGenerator.forBlock['robot_turn_left'] = function(block) {
        return 'turnLeft();\n';
    };

    javascriptGenerator.forBlock['robot_turn_right'] = function(block) {
        return 'turnRight();\n';
    };

    javascriptGenerator.forBlock['robot_grab'] = function(block) {
        return 'grab();\n';
    };

    javascriptGenerator.forBlock['robot_drop'] = function(block) {
        return 'drop();\n';
    };

    javascriptGenerator.forBlock['robot_start'] = function(block) {
        // ... (existing code, compacted for brevity) ...
        return '';
    };

    javascriptGenerator.forBlock['math_infinity'] = function(block) {
        // We return a safe large number to prevent browser crashes from infinite loops
        // in the current synchronous generation architecture.
        return ['1000', javascriptGenerator.ORDER_ATOMIC];
    };
}
