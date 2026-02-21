import StartGame from "./game/main";
import { injectBlockly, getWorkspaceCode } from "./blockly/workspace";

function clearLog() {
  const logOutput = document.getElementById("log-output");
  if (logOutput) logOutput.innerHTML = "";
}

function findIncompleteBlocks(workspace) {
  const incomplete = new Map();
  const blocks = workspace.getAllBlocks(false);

  for (const block of blocks) {
    for (const input of block.inputList) {
      if (!input.connection) continue;
      const isValueOrStatementInput = input.type === 1 || input.type === 3;
      if (!isValueOrStatementInput) continue;
      const target = block.getInputTargetBlock(input.name);
      if (!target) incomplete.set(block.id, block);
    }
  }

  return [...incomplete.values()];
}

function notifyIncompleteBlocks(workspace) {
  const incompleteBlocks = findIncompleteBlocks(workspace);
  if (incompleteBlocks.length === 0) return false;

  const preview = incompleteBlocks
    .slice(0, 3)
    .map((b) => b.type.replaceAll("_", " "))
    .join(", ");
  const suffix =
    incompleteBlocks.length > 3
      ? ` and ${incompleteBlocks.length - 3} more`
      : "";

  window.alert(`Please complete your blocks first: ${preview}${suffix}.`);
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  const game = StartGame("game-container");
  const pauseButton = document.getElementById("pause-button");
  const runButton = document.getElementById("run-button");

  const blocklyContainer = document.getElementById("blockly-container");
  console.log("Blockly container:", blocklyContainer);

  if (blocklyContainer) {
    const workspace = injectBlockly();

    runButton.addEventListener("click", async () => {
      if (notifyIncompleteBlocks(workspace)) return;

      try {
        clearLog();
        const gameScene = game.scene.getScene("GameScene");
        if (gameScene) {
          if (gameScene.isRunning) {
            gameScene.cancelExecution();
            gameScene.resetLevel();
          }

          const code = getWorkspaceCode(workspace);
          gameScene.logStep = 0;
          if (pauseButton) pauseButton.textContent = "PAUSE";
          await gameScene.runCommandQueue(code);
          if (pauseButton) pauseButton.textContent = "PAUSE";
        } else {
          console.error("GameScene not found");
        }
      } finally {
        if (pauseButton) pauseButton.textContent = "PAUSE";
      }
    });

    document.getElementById("reset-button").addEventListener("click", () => {
      clearLog();
      const gameScene = game.scene.getScene("GameScene");
      if (gameScene) {
        if (gameScene.isRunning) {
          gameScene.cancelExecution();
        }
        gameScene.logStep = 0;
        gameScene.resetLevel();
        if (pauseButton) pauseButton.textContent = "PAUSE";
      }
    });

    if (pauseButton) {
      pauseButton.addEventListener("click", () => {
        const gameScene = game.scene.getScene("GameScene");
        if (!gameScene || !gameScene.isRunning) return;
        const paused = gameScene.togglePauseExecution();
        pauseButton.textContent = paused ? "PLAY" : "PAUSE";
      });
    }

    document
      .getElementById("log-clear-button")
      .addEventListener("click", () => {
        clearLog();
      });
  } else {
    console.error("Blockly container not found!");
  }
});
