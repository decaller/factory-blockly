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
}
