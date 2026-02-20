import StartGame from "./game/main";
import { injectBlockly, getWorkspaceCode } from "./blockly/workspace";

function clearLog() {
  const logOutput = document.getElementById("log-output");
  if (logOutput) logOutput.innerHTML = "";
}

document.addEventListener("DOMContentLoaded", () => {
  const game = StartGame("game-container");
  const pauseButton = document.getElementById("pause-button");

  const blocklyContainer = document.getElementById("blockly-container");
  console.log("Blockly container:", blocklyContainer);

  if (blocklyContainer) {
    const workspace = injectBlockly();

    document
      .getElementById("run-button")
      .addEventListener("click", async () => {
        clearLog();
        const code = getWorkspaceCode(workspace);
        const gameScene = game.scene.getScene("GameScene");
        if (gameScene) {
          gameScene.logStep = 0;
          if (pauseButton) pauseButton.textContent = "PAUSE";
          await gameScene.runCommandQueue(code);
          if (pauseButton) pauseButton.textContent = "PAUSE";
        } else {
          console.error("GameScene not found");
        }
      });

    document.getElementById("reset-button").addEventListener("click", () => {
      clearLog();
      const gameScene = game.scene.getScene("GameScene");
      if (gameScene) {
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
