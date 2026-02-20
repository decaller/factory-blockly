import * as Blockly from "blockly";
import * as En from "blockly/msg/en";
import { defineBlocks } from "./blocks";
import { defineGenerators } from "./generator";
import { javascriptGenerator } from "blockly/javascript";
import { registerContinuousToolbox } from "@blockly/continuous-toolbox";
import {
  ContinuousToolbox,
  ContinuousFlyout,
  ContinuousMetrics,
} from "@blockly/continuous-toolbox";

Blockly.setLocale(En);

export function injectBlockly() {
  console.log("Initializing Blockly...");
  defineBlocks();
  defineGenerators();
  registerContinuousToolbox();

  defineBlocks();
  defineGenerators();

  const blocklyDiv = document.getElementById("blockly-container");
  const workspace = Blockly.inject(blocklyDiv, {
    toolbox: {
      kind: "categoryToolbox",
      contents: [
        {
          kind: "category",
          name: "Robot",
          colour: "120",
          contents: [
            { kind: "block", type: "robot_start" },
            { kind: "block", type: "robot_start_2" },
            { kind: "block", type: "robot_move_forward" },
            { kind: "block", type: "robot_move_backward" },
            { kind: "block", type: "robot_turn_left" },
            { kind: "block", type: "robot_turn_right" },
            { kind: "block", type: "robot_grab" },
            { kind: "block", type: "robot_drop" },
          ],
        },
        {
          kind: "category",
          name: "Control",
          colour: "210",
          contents: [
            {
              kind: "block",
              type: "controls_repeat_ext",
              inputs: {
                TIMES: {
                  shadow: {
                    type: "math_number",
                    fields: { NUM: 5 },
                  },
                  block: {
                    type: "math_infinity",
                  },
                },
              },
            },
            { kind: "block", type: "controls_if" },
            { kind: "block", type: "controls_whileUntil" },
          ],
        },
        {
          kind: "category",
          name: "Logic",
          colour: "210",
          contents: [
            { kind: "block", type: "logic_compare" },
            { kind: "block", type: "logic_operation" },
            { kind: "block", type: "logic_boolean" },
          ],
        },
        {
          kind: "category",
          name: "Math",
          colour: "230",
          contents: [
            { kind: "block", type: "math_number" },
            { kind: "block", type: "math_arithmetic" },
            { kind: "block", type: "math_infinity" },
          ],
        },
        {
          kind: "category",
          name: "Sensors",
          colour: "45",
          contents: [
            { kind: "block", type: "sensor_blocked" },
            { kind: "block", type: "sensor_crate_ahead" },
            { kind: "block", type: "sensor_crate_color" },
          ],
        },
        {
          kind: "category",
          name: "Debug",
          colour: "30",
          contents: [{ kind: "block", type: "debug_log" }],
        },
        {
          kind: "category",
          name: "Variables",
          colour: "330",
          custom: "VARIABLE",
        },
      ],
    },
    plugins: {
      flyoutsVerticalToolbox: "ContinuousFlyout",
      metricsManager: "ContinuousMetrics",
      toolbox: "ContinuousToolbox",
    },
    scrollbars: true,
    trashcan: true,
    media: "https://unpkg.com/blockly/media/",
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2,
      pinch: true,
    },
    plugins: {
      toolbox: ContinuousToolbox,
      flyoutsVerticalToolbox: ContinuousFlyout,
      metricsManager: ContinuousMetrics,
    },
  });

  // Resize handler
  window.addEventListener("resize", () => {
    Blockly.svgResize(workspace);
  });

  // Force initial resize
  setTimeout(() => {
    Blockly.svgResize(workspace);
  }, 0);

  // Load saved workspace
  const savedState = localStorage.getItem("blocklyWorkspace");
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
    if (
      event.type === Blockly.Events.BLOCK_MOVE ||
      event.type === Blockly.Events.BLOCK_CHANGE ||
      event.type === Blockly.Events.BLOCK_DELETE ||
      event.type === Blockly.Events.BLOCK_CREATE ||
      event.type === Blockly.Events.VAR_CREATE ||
      event.type === Blockly.Events.VAR_DELETE ||
      event.type === Blockly.Events.VAR_RENAME
    ) {
      const state = Blockly.serialization.workspaces.save(workspace);
      localStorage.setItem("blocklyWorkspace", JSON.stringify(state));
    }
  });

  return workspace;
}

export function getWorkspaceCode(workspace) {
  javascriptGenerator.init(workspace);
  const commandQueue = [];
  const GRID_SIZE = 10;

  function getForward(x, y, dir) {
    if (dir === 0) return { x: x + 1, y };
    if (dir === 1) return { x, y: y + 1 };
    if (dir === 2) return { x: x - 1, y };
    return { x, y: y - 1 };
  }
  function getBackward(x, y, dir) {
    if (dir === 0) return { x: x - 1, y };
    if (dir === 1) return { x, y: y - 1 };
    if (dir === 2) return { x: x + 1, y };
    return { x, y: y + 1 };
  }

  function getInitialStateForRobot(robotId) {
    return {
      robotX: 1,
      robotY: robotId === 2 ? GRID_SIZE - 2 : 1,
      direction: 0,
      carriedCrate: null,
      crates: [{ x: 0, y: 3, color: "orange" }],
    };
  }

  function runRobotCode(robotId, code) {
    const sim = getInitialStateForRobot(robotId);

    function simCrateAt(gx, gy) {
      return sim.crates.find((c) => c.x === gx && c.y === gy) || null;
    }

    const pushAction = (action) => {
      commandQueue.push({ robotId, action });
    };

    const moveForward = () => {
      pushAction("MOVE_FORWARD");
      const next = getForward(sim.robotX, sim.robotY, sim.direction);
      if (
        next.x >= 0 &&
        next.x < GRID_SIZE &&
        next.y >= 0 &&
        next.y < GRID_SIZE
      ) {
        if (!simCrateAt(next.x, next.y)) {
          sim.robotX = next.x;
          sim.robotY = next.y;
          if (sim.carriedCrate) {
            const nc = getForward(sim.robotX, sim.robotY, sim.direction);
            sim.carriedCrate.x = nc.x;
            sim.carriedCrate.y = nc.y;
          }
        }
      }
    };
    const moveBackward = () => {
      pushAction("MOVE_BACKWARD");
      const next = getBackward(sim.robotX, sim.robotY, sim.direction);
      if (
        next.x >= 0 &&
        next.x < GRID_SIZE &&
        next.y >= 0 &&
        next.y < GRID_SIZE
      ) {
        if (!simCrateAt(next.x, next.y)) {
          sim.robotX = next.x;
          sim.robotY = next.y;
          if (sim.carriedCrate) {
            const nc = getForward(sim.robotX, sim.robotY, sim.direction);
            sim.carriedCrate.x = nc.x;
            sim.carriedCrate.y = nc.y;
          }
        }
      }
    };
    const turnLeft = () => {
      pushAction("TURN_LEFT");
      sim.direction = (sim.direction + 3) % 4;
      if (sim.carriedCrate) {
        const nc = getForward(sim.robotX, sim.robotY, sim.direction);
        sim.carriedCrate.x = nc.x;
        sim.carriedCrate.y = nc.y;
      }
    };
    const turnRight = () => {
      pushAction("TURN_RIGHT");
      sim.direction = (sim.direction + 1) % 4;
      if (sim.carriedCrate) {
        const nc = getForward(sim.robotX, sim.robotY, sim.direction);
        sim.carriedCrate.x = nc.x;
        sim.carriedCrate.y = nc.y;
      }
    };
    const grab = () => {
      pushAction("GRAB");
      if (!sim.carriedCrate) {
        const front = getForward(sim.robotX, sim.robotY, sim.direction);
        const c = simCrateAt(front.x, front.y);
        if (c) {
          sim.carriedCrate = c;
        }
      }
    };
    const drop = () => {
      pushAction("DROP");
      if (sim.carriedCrate) {
        sim.carriedCrate = null;
      }
    };

    const isBlocked = () => {
      const next = getForward(sim.robotX, sim.robotY, sim.direction);
      if (
        next.x < 0 ||
        next.x >= GRID_SIZE ||
        next.y < 0 ||
        next.y >= GRID_SIZE
      ) {
        return true;
      }
      if (simCrateAt(next.x, next.y)) return true;
      return false;
    };
    const isCrateAhead = () => {
      const front = getForward(sim.robotX, sim.robotY, sim.direction);
      return !!simCrateAt(front.x, front.y);
    };
    const getCrateColor = () => {
      const front = getForward(sim.robotX, sim.robotY, sim.direction);
      const c = simCrateAt(front.x, front.y);
      return c ? c.color : "none";
    };

    const logValue = (label, val) => {
      pushAction("LOG:" + label + ":" + String(val));
    };

    try {
      const runUserCode = new Function(
        "moveForward",
        "moveBackward",
        "turnLeft",
        "turnRight",
        "grab",
        "drop",
        "isBlocked",
        "isCrateAhead",
        "getCrateColor",
        "logValue",
        code,
      );
      runUserCode(
        moveForward,
        moveBackward,
        turnLeft,
        turnRight,
        grab,
        drop,
        isBlocked,
        isCrateAhead,
        getCrateColor,
        logValue,
      );
    } catch (e) {
      console.error(`Error executing Robot ${robotId} block code:`, e);
    }
  }

  const startBlocks = [
    ...workspace
      .getBlocksByType("robot_start", false)
      .map((block) => ({ block, robotId: 1 })),
    ...workspace
      .getBlocksByType("robot_start_2", false)
      .map((block) => ({ block, robotId: 2 })),
  ];

  startBlocks.sort((a, b) => {
    const aPos = a.block.getRelativeToSurfaceXY();
    const bPos = b.block.getRelativeToSurfaceXY();
    if (aPos.y !== bPos.y) return aPos.y - bPos.y;
    return aPos.x - bPos.x;
  });

  if (startBlocks.length > 0) {
    console.log(`Found ${startBlocks.length} robot start block(s).`);
    startBlocks.forEach(({ block, robotId }) => {
      const generated = javascriptGenerator.blockToCode(block);
      const blockCode = Array.isArray(generated) ? generated[0] : generated;
      if (blockCode && blockCode.trim()) {
        runRobotCode(robotId, blockCode);
      }
    });
  } else {
    console.log("No robot start block found, generating all code for Robot 1.");
    const code = javascriptGenerator.workspaceToCode(workspace);
    if (code && code.trim()) {
      runRobotCode(1, code);
    }
  }

  return commandQueue;
}
