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

export function executeCommand(command) {
    return new Promise((resolve) => {
        const duration = 500;
        const finish = () => {
            this.logPositions();
            resolve();
        };

    switch (command) {
      case "MOVE_FORWARD": {
        console.log("Processing MOVE_FORWARD");

        const nextRobot = this.getForwardXY(
          this.robot.gridX,
          this.robot.gridY,
          this.robot.direction,
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

          if (canMove && this.carriedCrate) {
            const nextCrate = this.getForwardXY(
              nextRobot.x,
              nextRobot.y,
              this.robot.direction,
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
          }
        } else {
          console.log("Blocked: Robot hitting wall");
          canMove = false;
        }

        if (canMove) {
          this.robot.gridX = nextRobot.x;
          this.robot.gridY = nextRobot.y;

          console.log(`Moving to ${this.robot.gridX},${this.robot.gridY}`);

          this.tweens.add({
            targets: this.robot,
            x: this.robot.gridX * this.tileSize + this.tileSize / 2,
            y: this.robot.gridY * this.tileSize + this.tileSize / 2,
            duration,
            onComplete: finish,
          });

          if (this.carriedCrate) {
            const nextCrate = this.getForwardXY(
              this.robot.gridX,
              this.robot.gridY,
              this.robot.direction,
            );
            this.carriedCrate.gridX = nextCrate.x;
            this.carriedCrate.gridY = nextCrate.y;
          }
        } else {
          finish();
        }
        break;
      }

      case "TURN_LEFT": {
        const nextDirLeft = (this.robot.direction + 3) % 4;

        if (this.carriedCrate) {
          const nextCratePos = this.getForwardXY(
            this.robot.gridX,
            this.robot.gridY,
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
        }

        console.log("Ref: TURN_LEFT");
        this.robot.direction = nextDirLeft;
        this.tweens.add({
          targets: this.robot,
          angle: this.robot.angle - 90,
          duration,
          onComplete: finish,
        });

        if (this.carriedCrate) {
          const nextCrate = this.getForwardXY(
            this.robot.gridX,
            this.robot.gridY,
            this.robot.direction,
          );
          this.carriedCrate.gridX = nextCrate.x;
          this.carriedCrate.gridY = nextCrate.y;
        }
        break;
      }

      case "TURN_RIGHT": {
        const nextDirRight = (this.robot.direction + 1) % 4;

        if (this.carriedCrate) {
          const nextCratePos = this.getForwardXY(
            this.robot.gridX,
            this.robot.gridY,
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
        }

        console.log("Ref: TURN_RIGHT");
        this.robot.direction = nextDirRight;
        this.tweens.add({
          targets: this.robot,
          angle: this.robot.angle + 90,
          duration,
          onComplete: finish,
        });

        if (this.carriedCrate) {
          const nextCrate = this.getForwardXY(
            this.robot.gridX,
            this.robot.gridY,
            this.robot.direction,
          );
          this.carriedCrate.gridX = nextCrate.x;
          this.carriedCrate.gridY = nextCrate.y;
        }
        break;
      }

      case "GRAB": {
        console.log("Ref: GRAB");
        const grabTarget = this.getForwardXY(
          this.robot.gridX,
          this.robot.gridY,
          this.robot.direction,
        );
        const targetCrate = this.getCrateAt(grabTarget.x, grabTarget.y);

        if (!this.carriedCrate && targetCrate) {
          targetCrate.isCarried = true;
          this.carriedCrate = targetCrate;
          targetCrate.setDepth(1);

          this.robot.add(targetCrate);
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

          console.log("Crate grabbed!");

          if (this.isOnBelt(grabTarget.x, grabTarget.y, this.dispenserBelt)) {
            this.time.delayedCall(600, () => {
              this.spawnCrate();
            });
          }
        } else {
          console.log("Nothing to grab in front");
        }
        setTimeout(finish, duration);
        break;
      }

      case "DROP": {
        console.log("Ref: DROP");
        if (this.carriedCrate) {
          const crate = this.carriedCrate;
          crate.isCarried = false;
          crate.setDepth(0);
          crate.setScale(1.0);

          this.robot.remove(crate);
          this.add.existing(crate);

          const worldX = crate.gridX * this.tileSize + this.tileSize / 2;
          const worldY = crate.gridY * this.tileSize + this.tileSize / 2;
          crate.setPosition(worldX, worldY);
          crate.setRotation(0);

          this.carriedCrate = null;

          if (this.isOnBelt(crate.gridX, crate.gridY, this.receiverBelt)) {
            console.log("Crate delivered to receiver belt!");
            this.score++;
            if (this.scoreText) this.scoreText.setText(`Score: ${this.score}`);

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

          console.log("Crate dropped!");
        } else {
          console.log("Nothing to drop");
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
