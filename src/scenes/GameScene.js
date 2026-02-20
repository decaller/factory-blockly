import Phaser from "phaser";
import {
  drawGrid,
  drawConveyorBelts,
  createLevel,
} from "./gameScene/rendering";
import {
  isOnBelt,
  findEmptyDispenserCell,
  spawnCrate,
  getCrateAt,
  destroyCrate,
} from "./gameScene/crates";
import {
  runCommandQueue,
  resetLevel,
  logPositions,
  getForwardXY,
  updateTickStatsUI,
  pauseExecution,
  resumeExecution,
  togglePauseExecution,
  waitIfPaused,
} from "./gameScene/flow";
import { executeCommand } from "./gameScene/commands";

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });

    this.tileSize = 64;
    this.gridSize = 10;
    this.robot = null;
    this.robot2 = null;
    this.carriedCrate = null;
    this.carriedCrate2 = null;
    this.crates = [];
    this.score = 0;
    this.scoreText = null;
    this.ticksAfterLastScoreText = null;
    this.avgTicksAfterLastScoreText = null;
    this.tickCount = 0;
    this.lastScoreTick = 0;
    this.totalTicksAfterScore = 0;
    this.scoreIntervals = 0;
    this.isPaused = false;
    this.isRunning = false;
    this.pauseResumeResolver = null;

    this.dispenserBelt = [
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 0, y: 5 },
    ];
    this.receiverBelt = [
      { x: 9, y: 3 },
      { x: 9, y: 4 },
      { x: 9, y: 5 },
    ];
  }

  preload() {
    // We'll use Graphics for now, so no assets needed yet.
  }

  create() {
    this.drawGrid();
    this.drawConveyorBelts();
    this.createLevel();
  }
}

Object.assign(GameScene.prototype, {
  drawGrid,
  drawConveyorBelts,
  createLevel,
  isOnBelt,
  findEmptyDispenserCell,
  spawnCrate,
  getCrateAt,
  destroyCrate,
  runCommandQueue,
  resetLevel,
  logPositions,
  getForwardXY,
  updateTickStatsUI,
  pauseExecution,
  resumeExecution,
  togglePauseExecution,
  waitIfPaused,
  executeCommand,
});
