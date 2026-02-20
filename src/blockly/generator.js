import { javascriptGenerator } from "blockly/javascript";

export function defineGenerators() {
  javascriptGenerator.forBlock["robot_move_forward"] = function (block) {
    return "moveForward();\n";
  };
  javascriptGenerator.forBlock["robot_move_backward"] = function (block) {
    return "moveBackward();\n";
  };

  javascriptGenerator.forBlock["robot_turn_left"] = function (block) {
    return "turnLeft();\n";
  };

  javascriptGenerator.forBlock["robot_turn_right"] = function (block) {
    return "turnRight();\n";
  };

  javascriptGenerator.forBlock["robot_grab"] = function (block) {
    return "grab();\n";
  };

  javascriptGenerator.forBlock["robot_drop"] = function (block) {
    return "drop();\n";
  };

  javascriptGenerator.forBlock["robot_start"] = function (block) {
    // ... (existing code, compacted for brevity) ...
    return "";
  };
  javascriptGenerator.forBlock["robot_start_2"] = function (block) {
    return "";
  };

  javascriptGenerator.forBlock["math_infinity"] = function (block) {
    return ["1000", javascriptGenerator.ORDER_ATOMIC];
  };

  // --- Sensor generators ---
  javascriptGenerator.forBlock["sensor_blocked"] = function (block) {
    return ["isBlocked()", javascriptGenerator.ORDER_FUNCTION_CALL];
  };
  javascriptGenerator.forBlock["sensor_crate_ahead"] = function (block) {
    return ["isCrateAhead()", javascriptGenerator.ORDER_FUNCTION_CALL];
  };
  javascriptGenerator.forBlock["sensor_crate_color"] = function (block) {
    return ["getCrateColor()", javascriptGenerator.ORDER_FUNCTION_CALL];
  };

  // --- Debug generators ---
  javascriptGenerator.forBlock["debug_log"] = function (block) {
    const value =
      javascriptGenerator.valueToCode(
        block,
        "VALUE",
        javascriptGenerator.ORDER_NONE,
      ) || "''";

    // Detect a label from the connected block
    let label = "value";
    const inputBlock = block.getInputTargetBlock("VALUE");
    if (inputBlock) {
      const labelMap = {
        sensor_blocked: "is blocked",
        sensor_crate_ahead: "crate in front",
        sensor_crate_color: "front crate color",
        math_number: "number",
        math_infinity: "infinity",
        math_arithmetic: "math result",
        logic_boolean: "boolean",
        logic_compare: "comparison",
        logic_operation: "logic result",
      };
      if (labelMap[inputBlock.type]) {
        label = labelMap[inputBlock.type];
      } else if (inputBlock.type === "variables_get") {
        label = inputBlock.getFieldValue("VAR") || "variable";
      }
    }

    return `logValue('${label}', ${value});\n`;
  };
}
