export async function runCommandQueue(commands) {
  const runVersion = (this.executionVersion || 0) + 1;
  this.executionVersion = runVersion;

  this.resetLevel();
  this.isRunning = true;
  this.isPaused = false;
  console.log("Executing commands:", commands);

  await new Promise((resolve) => setTimeout(resolve, 500));

  const robotQueues = new Map();

  for (const item of commands) {
    const robotId =
      typeof item === "object" && item !== null ? item.robotId || 1 : 1;
    const command =
      typeof item === "object" && item !== null ? item.action : item;
    if (!robotQueues.has(robotId)) robotQueues.set(robotId, []);
    robotQueues.get(robotId).push(command);
  }

  try {
    while ([...robotQueues.values()].some((q) => q.length > 0)) {
      if (this.executionVersion !== runVersion) return;
      await this.waitIfPaused();
      if (this.executionVersion !== runVersion) return;
      this.tickCount = (this.tickCount || 0) + 1;
      this.updateTickStatsUI();
      const step = [];

      for (const [robotId, queue] of robotQueues.entries()) {
        if (queue.length === 0) continue;
        const command = queue.shift();
        step.push(this.executeCommand(command, robotId));
      }

      if (step.length > 0) {
        await Promise.all(step);
      }
      if (this.executionVersion !== runVersion) return;

      if (this.tickCount % 5 === 0 && this.findEmptyDispenserCell()) {
        this.spawnCrate();
      }
    }
  } finally {
    if (this.executionVersion === runVersion) {
      this.isRunning = false;
      this.isPaused = false;
    }
  }
}

export async function waitIfPaused() {
  while (this.isPaused) {
    await new Promise((resolve) => {
      this.pauseResumeResolver = resolve;
    });
  }
}

export function pauseExecution() {
  this.isPaused = true;
}

export function resumeExecution() {
  this.isPaused = false;
  if (this.pauseResumeResolver) {
    const resolve = this.pauseResumeResolver;
    this.pauseResumeResolver = null;
    resolve();
  }
}

export function togglePauseExecution() {
  if (this.isPaused) this.resumeExecution();
  else this.pauseExecution();
  return this.isPaused;
}

export function resetLevel() {
  this.tweens.killAll();
  this.tickCount = 0;
  this.resumeExecution();
  this.dispenserSpawnIndex = 0;
  this.lastScoreTick = 0;
  this.totalTicksAfterScore = 0;
  this.scoreIntervals = 0;

  this.robot.gridX = 1;
  this.robot.gridY = 1;
  this.robot.direction = 0;
  this.robot.x = this.tileSize + this.tileSize / 2;
  this.robot.y = this.tileSize + this.tileSize / 2;
  this.robot.angle = 0;

  if (this.robot2) {
    this.robot2.gridX = 1;
    this.robot2.gridY = this.gridSize - 2;
    this.robot2.direction = 0;
    this.robot2.x = this.robot2.gridX * this.tileSize + this.tileSize / 2;
    this.robot2.y = this.robot2.gridY * this.tileSize + this.tileSize / 2;
    this.robot2.angle = 0;
  }

  if (this.carriedCrate) {
    try {
      this.robot.remove(this.carriedCrate);
    } catch (e) {
      // Ignore remove failures during reset.
    }
    this.carriedCrate = null;
  }
  if (this.carriedCrate2 && this.robot2) {
    try {
      this.robot2.remove(this.carriedCrate2);
    } catch (e) {
      // Ignore remove failures during reset.
    }
    this.carriedCrate2 = null;
  }

  this.crates.forEach((c) => c.destroy());
  this.crates = [];
  this.carriedCrate = null;
  this.carriedCrate2 = null;

  this.score = 0;
  if (this.scoreText) this.scoreText.setText("Score: 0");
  this.updateTickStatsUI();

  this.spawnCrate();

  console.log("Level reset");
  this.logPositions();
}

export function cancelExecution() {
  this.executionVersion = (this.executionVersion || 0) + 1;
  this.isRunning = false;
  this.resumeExecution();
}

export function updateTickStatsUI() {
  const ticksAfterLastScore = Math.max(
    0,
    (this.tickCount || 0) - (this.lastScoreTick || 0),
  );
  const avgTicksAfterLastScore =
    this.scoreIntervals > 0
      ? this.totalTicksAfterScore / this.scoreIntervals
      : 0;

  if (this.ticksAfterLastScoreText) {
    this.ticksAfterLastScoreText.setText(
      `Ticks after last score: ${ticksAfterLastScore}`,
    );
  }
  if (this.avgTicksAfterLastScoreText) {
    this.avgTicksAfterLastScoreText.setText(
      `Average ticks after last score: ${avgTicksAfterLastScore.toFixed(2)}`,
    );
  }
}

export function logPositions() {
  console.log("--- Position Log ---");
  console.log(
    `Robot: (${this.robot.gridX}, ${this.robot.gridY}) Direction: ${this.robot.direction}`,
  );
  this.crates.forEach((c, i) => {
    console.log(`Crate ${i}: (${c.gridX}, ${c.gridY}) Carried: ${c.isCarried}`);
  });
  console.log(`Score: ${this.score}`);
  console.log("--------------------");
}

export function getForwardXY(x, y, direction) {
  let tx = x;
  let ty = y;

  if (direction === 0) tx++;
  else if (direction === 1) ty++;
  else if (direction === 2) tx--;
  else if (direction === 3) ty--;

  return { x: tx, y: ty };
}
