export async function runCommandQueue(commands) {
  this.resetLevel();
  console.log("Executing commands:", commands);

  await new Promise((resolve) => setTimeout(resolve, 500));

  for (const command of commands) {
    await this.executeCommand(command);
  }
}

export function resetLevel() {
  this.tweens.killAll();

  this.robot.gridX = 1;
  this.robot.gridY = 1;
  this.robot.direction = 0;
  this.robot.x = this.tileSize + this.tileSize / 2;
  this.robot.y = this.tileSize + this.tileSize / 2;
  this.robot.angle = 0;

  if (this.carriedCrate) {
    try {
      this.robot.remove(this.carriedCrate);
    } catch (e) {
      // Ignore remove failures during reset.
    }
    this.carriedCrate = null;
  }

  this.crates.forEach((c) => c.destroy());
  this.crates = [];
  this.carriedCrate = null;

  this.score = 0;
  if (this.scoreText) this.scoreText.setText("Score: 0");

  this.spawnCrate();

  console.log("Level reset");
  this.logPositions();
}

export function logPositions() {
    console.log('--- Position Log ---');
    console.log(`Robot: (${this.robot.gridX}, ${this.robot.gridY}) Direction: ${this.robot.direction}`);
    this.crates.forEach((c, i) => {
        console.log(`Crate ${i}: (${c.gridX}, ${c.gridY}) Carried: ${c.isCarried}`);
    });
    console.log(`Score: ${this.score}`);
    console.log('--------------------');
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
