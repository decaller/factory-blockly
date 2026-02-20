function handleLogCommand(command) {
  const rest = command.substring(4);
  const colonIdx = rest.indexOf(":");
  const label = colonIdx !== -1 ? rest.substring(0, colonIdx) : "value";
  const logVal = colonIdx !== -1 ? rest.substring(colonIdx + 1) : rest;

  this.logStep = (this.logStep || 0) + 1;

  const logOutput = document.getElementById("log-output");
  if (logOutput) {
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.innerHTML = `<span class="log-step">#${this.logStep}</span><span class="log-label">${label}</span>: <span class="log-value">${logVal}</span>`;
    logOutput.appendChild(entry);
    logOutput.scrollTop = logOutput.scrollHeight;
  }

  console.log(`[LOG #${this.logStep}] ${label}: ${logVal}`);
}

function getRobotContext(scene, robotId) {
  if (robotId === 2) {
    return {
      robot: scene.robot2 || scene.robot,
      carriedKey: "carriedCrate2",
    };
  }

  return {
    robot: scene.robot,
    carriedKey: "carriedCrate",
  };
}

function isRobotOccupied(scene, gx, gy, excludeRobotId) {
  if (
    excludeRobotId !== 1 &&
    scene.robot &&
    scene.robot.gridX === gx &&
    scene.robot.gridY === gy
  ) {
    return true;
  }
  if (
    excludeRobotId !== 2 &&
    scene.robot2 &&
    scene.robot2.gridX === gx &&
    scene.robot2.gridY === gy
  ) {
    return true;
  }
  return false;
}

export function executeCommand(command, robotId = 1) {
  return new Promise((resolve) => {
    const duration = 500;
    const { robot, carriedKey } = getRobotContext(this, robotId);

    const getCarriedCrate = () => this[carriedKey] || null;
    const setCarriedCrate = (crate) => {
      this[carriedKey] = crate;
    };

    const finish = () => {
      resolve();
    };

    if (!robot) {
      console.warn(`Robot ${robotId} not found`);
      finish();
      return;
    }

    switch (command) {
      case "MOVE_FORWARD": {
        console.log(`Robot ${robotId}: MOVE_FORWARD`);

        const nextRobot = this.getForwardXY(
          robot.gridX,
          robot.gridY,
          robot.direction,
        );
        let canMove = false;

        if (
          nextRobot.x >= 0 &&
          nextRobot.x < this.gridSize &&
          nextRobot.y >= 0 &&
          nextRobot.y < this.gridSize
        ) {
          canMove = true;

          const blockingCrate = this.getCrateAt(nextRobot.x, nextRobot.y);
          if (blockingCrate) {
            console.log("Blocked by crate");
            canMove = false;
          }
          if (
            canMove &&
            isRobotOccupied(this, nextRobot.x, nextRobot.y, robotId)
          ) {
            console.log("Blocked by robot");
            canMove = false;
          }

          const carriedCrate = getCarriedCrate();
          if (canMove && carriedCrate) {
            const nextCrate = this.getForwardXY(
              nextRobot.x,
              nextRobot.y,
              robot.direction,
            );

            if (
              nextCrate.x < 0 ||
              nextCrate.x >= this.gridSize ||
              nextCrate.y < 0 ||
              nextCrate.y >= this.gridSize
            ) {
              console.log("Blocked: Crate hitting wall");
              canMove = false;
            }

            if (canMove && this.getCrateAt(nextCrate.x, nextCrate.y)) {
              console.log("Blocked: Crate hitting another crate");
              canMove = false;
            }
            if (
              canMove &&
              isRobotOccupied(this, nextCrate.x, nextCrate.y, robotId)
            ) {
              console.log("Blocked: Crate hitting robot");
              canMove = false;
            }
          }
        } else {
          console.log("Blocked: Robot hitting wall");
          canMove = false;
        }

        if (canMove) {
          robot.gridX = nextRobot.x;
          robot.gridY = nextRobot.y;

          this.tweens.add({
            targets: robot,
            x: robot.gridX * this.tileSize + this.tileSize / 2,
            y: robot.gridY * this.tileSize + this.tileSize / 2,
            duration,
            onComplete: finish,
          });

          const carriedCrate = getCarriedCrate();
          if (carriedCrate) {
            const nextCrate = this.getForwardXY(
              robot.gridX,
              robot.gridY,
              robot.direction,
            );
            carriedCrate.gridX = nextCrate.x;
            carriedCrate.gridY = nextCrate.y;
          }
        } else {
          finish();
        }
        break;
      }
      case "MOVE_BACKWARD": {
        console.log(`Robot ${robotId}: MOVE_BACKWARD`);

        const backDir = (robot.direction + 2) % 4;
        const nextRobot = this.getForwardXY(robot.gridX, robot.gridY, backDir);
        let canMove = false;

        if (
          nextRobot.x >= 0 &&
          nextRobot.x < this.gridSize &&
          nextRobot.y >= 0 &&
          nextRobot.y < this.gridSize
        ) {
          canMove = true;

          const blockingCrate = this.getCrateAt(nextRobot.x, nextRobot.y);
          if (blockingCrate) {
            console.log("Blocked by crate");
            canMove = false;
          }
          if (
            canMove &&
            isRobotOccupied(this, nextRobot.x, nextRobot.y, robotId)
          ) {
            console.log("Blocked by robot");
            canMove = false;
          }

          const carriedCrate = getCarriedCrate();
          if (canMove && carriedCrate) {
            const nextCrate = this.getForwardXY(
              nextRobot.x,
              nextRobot.y,
              robot.direction,
            );

            if (
              nextCrate.x < 0 ||
              nextCrate.x >= this.gridSize ||
              nextCrate.y < 0 ||
              nextCrate.y >= this.gridSize
            ) {
              console.log("Blocked: Crate hitting wall");
              canMove = false;
            }

            if (canMove && this.getCrateAt(nextCrate.x, nextCrate.y)) {
              console.log("Blocked: Crate hitting another crate");
              canMove = false;
            }
            if (
              canMove &&
              isRobotOccupied(this, nextCrate.x, nextCrate.y, robotId)
            ) {
              console.log("Blocked: Crate hitting robot");
              canMove = false;
            }
          }
        } else {
          console.log("Blocked: Robot hitting wall");
          canMove = false;
        }

        if (canMove) {
          robot.gridX = nextRobot.x;
          robot.gridY = nextRobot.y;

          this.tweens.add({
            targets: robot,
            x: robot.gridX * this.tileSize + this.tileSize / 2,
            y: robot.gridY * this.tileSize + this.tileSize / 2,
            duration,
            onComplete: finish,
          });

          const carriedCrate = getCarriedCrate();
          if (carriedCrate) {
            const nextCrate = this.getForwardXY(
              robot.gridX,
              robot.gridY,
              robot.direction,
            );
            carriedCrate.gridX = nextCrate.x;
            carriedCrate.gridY = nextCrate.y;
          }
        } else {
          finish();
        }
        break;
      }

      case "TURN_LEFT": {
        const nextDirLeft = (robot.direction + 3) % 4;

        const carriedCrate = getCarriedCrate();
        if (carriedCrate) {
          const leftOfHeldCrate = this.getForwardXY(
            carriedCrate.gridX,
            carriedCrate.gridY,
            nextDirLeft,
          );
          if (this.getCrateAt(leftOfHeldCrate.x, leftOfHeldCrate.y)) {
            console.log("Turn Blocked: Crate on left side of held crate");
            finish();
            return;
          }

          const nextCratePos = this.getForwardXY(
            robot.gridX,
            robot.gridY,
            nextDirLeft,
          );
          if (
            nextCratePos.x < 0 ||
            nextCratePos.x >= this.gridSize ||
            nextCratePos.y < 0 ||
            nextCratePos.y >= this.gridSize
          ) {
            console.log("Turn Blocked: Crate would hit wall");
            finish();
            return;
          }
          if (this.getCrateAt(nextCratePos.x, nextCratePos.y)) {
            console.log("Turn Blocked: Crate would hit another crate");
            finish();
            return;
          }
          if (isRobotOccupied(this, nextCratePos.x, nextCratePos.y, robotId)) {
            console.log("Turn Blocked: Crate would hit robot");
            finish();
            return;
          }
        }

        robot.direction = nextDirLeft;
        this.tweens.add({
          targets: robot,
          angle: robot.angle - 90,
          duration,
          onComplete: finish,
        });

        if (carriedCrate) {
          const nextCrate = this.getForwardXY(
            robot.gridX,
            robot.gridY,
            robot.direction,
          );
          carriedCrate.gridX = nextCrate.x;
          carriedCrate.gridY = nextCrate.y;
        }
        break;
      }

      case "TURN_RIGHT": {
        const nextDirRight = (robot.direction + 1) % 4;

        const carriedCrate = getCarriedCrate();
        if (carriedCrate) {
          const rightOfHeldCrate = this.getForwardXY(
            carriedCrate.gridX,
            carriedCrate.gridY,
            nextDirRight,
          );
          if (this.getCrateAt(rightOfHeldCrate.x, rightOfHeldCrate.y)) {
            console.log("Turn Blocked: Crate on right side of held crate");
            finish();
            return;
          }

          const nextCratePos = this.getForwardXY(
            robot.gridX,
            robot.gridY,
            nextDirRight,
          );
          if (
            nextCratePos.x < 0 ||
            nextCratePos.x >= this.gridSize ||
            nextCratePos.y < 0 ||
            nextCratePos.y >= this.gridSize
          ) {
            console.log("Turn Blocked: Crate would hit wall");
            finish();
            return;
          }
          if (this.getCrateAt(nextCratePos.x, nextCratePos.y)) {
            console.log("Turn Blocked: Crate would hit another crate");
            finish();
            return;
          }
          if (isRobotOccupied(this, nextCratePos.x, nextCratePos.y, robotId)) {
            console.log("Turn Blocked: Crate would hit robot");
            finish();
            return;
          }
        }

        robot.direction = nextDirRight;
        this.tweens.add({
          targets: robot,
          angle: robot.angle + 90,
          duration,
          onComplete: finish,
        });

        if (carriedCrate) {
          const nextCrate = this.getForwardXY(
            robot.gridX,
            robot.gridY,
            robot.direction,
          );
          carriedCrate.gridX = nextCrate.x;
          carriedCrate.gridY = nextCrate.y;
        }
        break;
      }

      case "GRAB": {
        const grabTarget = this.getForwardXY(
          robot.gridX,
          robot.gridY,
          robot.direction,
        );
        const targetCrate = this.getCrateAt(grabTarget.x, grabTarget.y);

        if (!getCarriedCrate() && targetCrate) {
          targetCrate.isCarried = true;
          setCarriedCrate(targetCrate);
          targetCrate.setDepth(1);

          robot.add(targetCrate);
          targetCrate.setPosition(this.tileSize, 0);
          targetCrate.setRotation(0);

          this.tweens.add({
            targets: targetCrate,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 200,
            yoyo: true,
            onComplete: () => {
              targetCrate.setScale(1.2);
            },
          });

          if (this.isOnBelt(grabTarget.x, grabTarget.y, this.dispenserBelt)) {
            this.time.delayedCall(600, () => {
              this.spawnCrate();
            });
          }
        }

        setTimeout(finish, duration);
        break;
      }

      case "DROP": {
        const carriedCrate = getCarriedCrate();
        if (carriedCrate) {
          const crate = carriedCrate;
          crate.isCarried = false;
          crate.setDepth(0);
          crate.setScale(1.0);

          robot.remove(crate);
          this.add.existing(crate);

          const worldX = crate.gridX * this.tileSize + this.tileSize / 2;
          const worldY = crate.gridY * this.tileSize + this.tileSize / 2;
          crate.setPosition(worldX, worldY);
          crate.setRotation(0);

          setCarriedCrate(null);

          if (this.isOnBelt(crate.gridX, crate.gridY, this.receiverBelt)) {
            this.score++;
            if (this.scoreText) this.scoreText.setText(`Score: ${this.score}`);
            const ticksAfterLastScore = Math.max(
              0,
              (this.tickCount || 0) - (this.lastScoreTick || 0),
            );
            this.totalTicksAfterScore =
              (this.totalTicksAfterScore || 0) + ticksAfterLastScore;
            this.scoreIntervals = (this.scoreIntervals || 0) + 1;
            this.lastScoreTick = this.tickCount || 0;
            this.updateTickStatsUI();

            this.tweens.add({
              targets: crate,
              x: crate.x + this.tileSize,
              alpha: 0,
              scaleX: 0.3,
              scaleY: 0.3,
              duration: 400,
              ease: "Power2",
              onComplete: () => {
                this.destroyCrate(crate);
              },
            });

            const feedbackText = this.add
              .text(worldX, worldY - 20, "+1", {
                fontSize: "24px",
                color: "#66ff66",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 3,
              })
              .setOrigin(0.5)
              .setDepth(20);

            this.tweens.add({
              targets: feedbackText,
              y: worldY - 60,
              alpha: 0,
              duration: 800,
              ease: "Power2",
              onComplete: () => feedbackText.destroy(),
            });
          }
        }

        setTimeout(finish, duration);
        break;
      }

      default:
        if (typeof command === "string" && command.startsWith("LOG:")) {
          handleLogCommand.call(this, command);
          finish();
        } else {
          console.warn("Unknown command:", command);
          finish();
        }
    }
  });
}
