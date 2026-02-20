import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.tileSize = 64;
        this.gridSize = 10;
        this.robot = null;
        this.carriedCrate = null; // reference to the crate currently carried
        this.crates = [];        // all active crates on the grid
        this.score = 0;
        this.scoreText = null;

        // Conveyor belt definitions
        this.dispenserBelt = [
            { x: 0, y: 3 },
            { x: 0, y: 4 },
            { x: 0, y: 5 }
        ];
        this.receiverBelt = [
            { x: 9, y: 3 },
            { x: 9, y: 4 },
            { x: 9, y: 5 }
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

    drawGrid() {
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x555555, 1);

        for (let x = 0; x <= this.gridSize; x++) {
            graphics.moveTo(x * this.tileSize, 0);
            graphics.lineTo(x * this.tileSize, this.gridSize * this.tileSize);
        }

        for (let y = 0; y <= this.gridSize; y++) {
            graphics.moveTo(0, y * this.tileSize);
            graphics.lineTo(this.gridSize * this.tileSize, y * this.tileSize);
        }

        graphics.strokePath();

        // Grid axis numbers
        const labelStyle = { fontSize: '12px', color: '#888888', fontFamily: 'monospace' };
        // X-axis labels (bottom)
        for (let x = 0; x < this.gridSize; x++) {
            this.add.text(
                x * this.tileSize + this.tileSize / 2,
                this.gridSize * this.tileSize + 4,
                `${x}`, labelStyle
            ).setOrigin(0.5, 0);
        }
        // Y-axis labels (left)
        for (let y = 0; y < this.gridSize; y++) {
            this.add.text(
                -4,
                y * this.tileSize + this.tileSize / 2,
                `${y}`, labelStyle
            ).setOrigin(1, 0.5);
        }
    }

    drawConveyorBelts() {
        const g = this.add.graphics();

        // --- Dispenser belt (blue) ---
        this.dispenserBelt.forEach(cell => {
            const px = cell.x * this.tileSize;
            const py = cell.y * this.tileSize;
            // Belt background
            g.fillStyle(0x3a7bd5, 0.45);
            g.fillRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);
            // Belt track lines
            g.lineStyle(2, 0x5a9bf5, 0.7);
            g.strokeRect(px + 6, py + 6, this.tileSize - 12, this.tileSize - 12);
        });

        // Dispenser arrow: points East (→), centered on middle cell
        const dMid = this.dispenserBelt[1];
        const dArrowX = dMid.x * this.tileSize + this.tileSize / 2;
        const dArrowY = dMid.y * this.tileSize + this.tileSize / 2;
        const dArrow = this.add.text(dArrowX, dArrowY, '▶', {
            fontSize: '28px',
            color: '#aaccff'
        }).setOrigin(0.5);
        // Pulse animation
        this.tweens.add({
            targets: dArrow,
            alpha: { from: 0.4, to: 1 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Label
        const dLabel = this.dispenserBelt[0];
        this.add.text(
            dLabel.x * this.tileSize + this.tileSize / 2,
            dLabel.y * this.tileSize - 12,
            'OUT',
            { fontSize: '13px', color: '#5a9bf5', fontStyle: 'bold' }
        ).setOrigin(0.5);

        // --- Receiver belt (green) ---
        this.receiverBelt.forEach(cell => {
            const px = cell.x * this.tileSize;
            const py = cell.y * this.tileSize;
            g.fillStyle(0x2e7d32, 0.45);
            g.fillRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);
            g.lineStyle(2, 0x66bb6a, 0.7);
            g.strokeRect(px + 6, py + 6, this.tileSize - 12, this.tileSize - 12);
        });

        // Receiver arrow: points East (→ into the belt)
        const rMid = this.receiverBelt[1];
        const rArrowX = rMid.x * this.tileSize + this.tileSize / 2;
        const rArrowY = rMid.y * this.tileSize + this.tileSize / 2;
        const rArrow = this.add.text(rArrowX, rArrowY, '▶', {
            fontSize: '28px',
            color: '#a5d6a7'
        }).setOrigin(0.5);
        this.tweens.add({
            targets: rArrow,
            alpha: { from: 0.4, to: 1 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Label
        const rLabel = this.receiverBelt[0];
        this.add.text(
            rLabel.x * this.tileSize + this.tileSize / 2,
            rLabel.y * this.tileSize - 12,
            'IN',
            { fontSize: '13px', color: '#66bb6a', fontStyle: 'bold' }
        ).setOrigin(0.5);
    }

    createLevel() {
        // Robot Container
        const robotX = 1 * this.tileSize + this.tileSize / 2;
        const robotY = 1 * this.tileSize + this.tileSize / 2;

        this.robot = this.add.container(robotX, robotY);

        // Robot Body (Green Rect)
        const body = this.add.rectangle(
            0, 0,
            this.tileSize - 10, this.tileSize - 10,
            0x00ff00
        );

        // Robot Eye/Direction Indicator
        const eye = this.add.rectangle(
            (this.tileSize - 10) / 4, 0,
            10, 10,
            0x000000
        );

        this.robot.add([body, eye]);
        this.robot.setSize(this.tileSize - 10, this.tileSize - 10);

        // Start at (1,1) to avoid spawning on dispenser belt
        this.robot.gridX = 1;
        this.robot.gridY = 1;
        this.robot.direction = 0; // 0: East, 1: South, 2: West, 3: North

        // Score text
        this.score = 0;
        this.scoreText = this.add.text(this.gridSize * this.tileSize - 8, 8, 'Score: 0', {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold',
            backgroundColor: '#00000088',
            padding: { x: 6, y: 4 }
        }).setOrigin(1, 0).setDepth(10);

        // Spawn initial crate on dispenser
        this.crates = [];
        this.carriedCrate = null;
        this.spawnCrate();
    }

    // ---- Conveyor helpers ----

    isOnBelt(gx, gy, belt) {
        return belt.some(c => c.x === gx && c.y === gy);
    }

    findEmptyDispenserCell() {
        for (const cell of this.dispenserBelt) {
            const occupied = this.crates.some(c => c.gridX === cell.x && c.gridY === cell.y);
            if (!occupied) return cell;
        }
        return null;
    }

    spawnCrate() {
        const cell = this.findEmptyDispenserCell();
        if (!cell) {
            console.log('Dispenser full, cannot spawn');
            return null;
        }

        const crate = this.add.rectangle(
            cell.x * this.tileSize + this.tileSize / 2,
            cell.y * this.tileSize + this.tileSize / 2,
            this.tileSize - 20,
            this.tileSize - 20,
            0xffa500
        );
        crate.gridX = cell.x;
        crate.gridY = cell.y;
        crate.isCarried = false;

        // Spawn animation
        crate.setScale(0);
        this.tweens.add({
            targets: crate,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });

        this.crates.push(crate);
        console.log(`Crate spawned at (${cell.x}, ${cell.y})`);
        return crate;
    }

    getCrateAt(gx, gy) {
        return this.crates.find(c => !c.isCarried && c.gridX === gx && c.gridY === gy) || null;
    }

    destroyCrate(crate) {
        const idx = this.crates.indexOf(crate);
        if (idx !== -1) this.crates.splice(idx, 1);
        crate.destroy();
    }

    // ---- Core game flow ----

    async runCommandQueue(commands) {
        this.resetLevel();
        console.log('Executing commands:', commands);

        await new Promise(resolve => setTimeout(resolve, 500));

        for (const command of commands) {
            await this.executeCommand(command);
        }
    }

    resetLevel() {
        this.tweens.killAll();

        // Reset Robot
        this.robot.gridX = 1;
        this.robot.gridY = 1;
        this.robot.direction = 0;
        this.robot.x = 1 * this.tileSize + this.tileSize / 2;
        this.robot.y = 1 * this.tileSize + this.tileSize / 2;
        this.robot.angle = 0;

        // Detach carried crate if any
        if (this.carriedCrate) {
            try { this.robot.remove(this.carriedCrate); } catch(e) {}
            this.carriedCrate = null;
        }

        // Destroy all crates
        this.crates.forEach(c => c.destroy());
        this.crates = [];
        this.carriedCrate = null;

        // Reset score
        this.score = 0;
        if (this.scoreText) this.scoreText.setText('Score: 0');

        // Re-spawn initial crate
        this.spawnCrate();

        console.log('Level reset');
        this.logPositions();
    }

    logPositions() {
        console.log('--- Position Log ---');
        console.log(`Robot: (${this.robot.gridX}, ${this.robot.gridY}) Direction: ${this.robot.direction}`);
        this.crates.forEach((c, i) => {
            console.log(`Crate ${i}: (${c.gridX}, ${c.gridY}) Carried: ${c.isCarried}`);
        });
        console.log(`Score: ${this.score}`);
        console.log('--------------------');
    }

    getForwardXY(x, y, direction) {
        let tx = x;
        let ty = y;
        if (direction === 0) tx++;      // East
        else if (direction === 1) ty++; // South
        else if (direction === 2) tx--; // West
        else if (direction === 3) ty--; // North
        return { x: tx, y: ty };
    }

    executeCommand(command) {
        return new Promise((resolve) => {
            const duration = 500;
            const finish = () => {
                this.logPositions();
                resolve();
            };

            switch (command) {
                case 'MOVE_FORWARD': {
                    console.log('Processing MOVE_FORWARD');

                    const nextRobot = this.getForwardXY(this.robot.gridX, this.robot.gridY, this.robot.direction);
                    let canMove = false;

                    // Bounds check for robot
                    if (nextRobot.x >= 0 && nextRobot.x < this.gridSize && nextRobot.y >= 0 && nextRobot.y < this.gridSize) {
                        canMove = true;

                        // Collision with any non-carried crate
                        const blockingCrate = this.getCrateAt(nextRobot.x, nextRobot.y);
                        if (blockingCrate) {
                            console.log('Blocked by crate');
                            canMove = false;
                        }

                        // Collision logic for carried crate
                        if (canMove && this.carriedCrate) {
                            const nextCrate = this.getForwardXY(nextRobot.x, nextRobot.y, this.robot.direction);

                            // Bounds check for crate
                            if (nextCrate.x < 0 || nextCrate.x >= this.gridSize || nextCrate.y < 0 || nextCrate.y >= this.gridSize) {
                                console.log('Blocked: Crate hitting wall');
                                canMove = false;
                            }

                            // Collision with another crate
                            if (canMove && this.getCrateAt(nextCrate.x, nextCrate.y)) {
                                console.log('Blocked: Crate hitting another crate');
                                canMove = false;
                            }
                        }
                    } else {
                        console.log('Blocked: Robot hitting wall');
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
                            duration: duration,
                            onComplete: finish
                        });

                        if (this.carriedCrate) {
                            const nextCrate = this.getForwardXY(this.robot.gridX, this.robot.gridY, this.robot.direction);
                            this.carriedCrate.gridX = nextCrate.x;
                            this.carriedCrate.gridY = nextCrate.y;
                        }
                    } else {
                        finish();
                    }
                    break;
                }

                case 'TURN_LEFT': {
                    const nextDirLeft = (this.robot.direction + 3) % 4;

                    if (this.carriedCrate) {
                        const nextCratePos = this.getForwardXY(this.robot.gridX, this.robot.gridY, nextDirLeft);
                        if (nextCratePos.x < 0 || nextCratePos.x >= this.gridSize || nextCratePos.y < 0 || nextCratePos.y >= this.gridSize) {
                            console.log('Turn Blocked: Crate would hit wall');
                            finish();
                            return;
                        }
                        if (this.getCrateAt(nextCratePos.x, nextCratePos.y)) {
                            console.log('Turn Blocked: Crate would hit another crate');
                            finish();
                            return;
                        }
                    }

                    console.log('Ref: TURN_LEFT');
                    this.robot.direction = nextDirLeft;
                    this.tweens.add({
                        targets: this.robot,
                        angle: this.robot.angle - 90,
                        duration: duration,
                        onComplete: finish
                    });

                    if (this.carriedCrate) {
                        const nextCrate = this.getForwardXY(this.robot.gridX, this.robot.gridY, this.robot.direction);
                        this.carriedCrate.gridX = nextCrate.x;
                        this.carriedCrate.gridY = nextCrate.y;
                    }
                    break;
                }

                case 'TURN_RIGHT': {
                    const nextDirRight = (this.robot.direction + 1) % 4;

                    if (this.carriedCrate) {
                        const nextCratePos = this.getForwardXY(this.robot.gridX, this.robot.gridY, nextDirRight);
                        if (nextCratePos.x < 0 || nextCratePos.x >= this.gridSize || nextCratePos.y < 0 || nextCratePos.y >= this.gridSize) {
                            console.log('Turn Blocked: Crate would hit wall');
                            finish();
                            return;
                        }
                        if (this.getCrateAt(nextCratePos.x, nextCratePos.y)) {
                            console.log('Turn Blocked: Crate would hit another crate');
                            finish();
                            return;
                        }
                    }

                    console.log('Ref: TURN_RIGHT');
                    this.robot.direction = nextDirRight;
                    this.tweens.add({
                        targets: this.robot,
                        angle: this.robot.angle + 90,
                        duration: duration,
                        onComplete: finish
                    });

                    if (this.carriedCrate) {
                        const nextCrate = this.getForwardXY(this.robot.gridX, this.robot.gridY, this.robot.direction);
                        this.carriedCrate.gridX = nextCrate.x;
                        this.carriedCrate.gridY = nextCrate.y;
                    }
                    break;
                }

                case 'GRAB': {
                    console.log('Ref: GRAB');
                    const grabTarget = this.getForwardXY(this.robot.gridX, this.robot.gridY, this.robot.direction);
                    const targetCrate = this.getCrateAt(grabTarget.x, grabTarget.y);

                    if (!this.carriedCrate && targetCrate) {
                        targetCrate.isCarried = true;
                        this.carriedCrate = targetCrate;
                        targetCrate.setDepth(1);

                        // Attach to robot container
                        this.robot.add(targetCrate);
                        targetCrate.setPosition(this.tileSize, 0);
                        targetCrate.setRotation(0);

                        // Visual lift effect
                        this.tweens.add({
                            targets: targetCrate,
                            scaleX: 1.2,
                            scaleY: 1.2,
                            duration: 200,
                            yoyo: true,
                            onComplete: () => {
                                targetCrate.setScale(1.2);
                            }
                        });

                        console.log('Crate grabbed!');

                        // If picked up from dispenser, spawn a new one after a delay
                        if (this.isOnBelt(grabTarget.x, grabTarget.y, this.dispenserBelt)) {
                            this.time.delayedCall(600, () => {
                                this.spawnCrate();
                            });
                        }
                    } else {
                        console.log('Nothing to grab in front');
                    }
                    setTimeout(finish, duration);
                    break;
                }

                case 'DROP': {
                    console.log('Ref: DROP');
                    if (this.carriedCrate) {
                        const crate = this.carriedCrate;
                        crate.isCarried = false;
                        crate.setDepth(0);
                        crate.setScale(1.0);

                        // Detach from robot container
                        this.robot.remove(crate);
                        this.add.existing(crate);

                        // Set world position
                        const worldX = crate.gridX * this.tileSize + this.tileSize / 2;
                        const worldY = crate.gridY * this.tileSize + this.tileSize / 2;
                        crate.setPosition(worldX, worldY);
                        crate.setRotation(0);

                        this.carriedCrate = null;

                        // Check if dropped on receiver belt
                        if (this.isOnBelt(crate.gridX, crate.gridY, this.receiverBelt)) {
                            console.log('Crate delivered to receiver belt!');
                            this.score++;
                            if (this.scoreText) this.scoreText.setText(`Score: ${this.score}`);

                            // Animate crate sliding off and disappearing
                            this.tweens.add({
                                targets: crate,
                                x: crate.x + this.tileSize,
                                alpha: 0,
                                scaleX: 0.3,
                                scaleY: 0.3,
                                duration: 400,
                                ease: 'Power2',
                                onComplete: () => {
                                    this.destroyCrate(crate);
                                }
                            });

                            // Show +1 feedback
                            const feedbackText = this.add.text(worldX, worldY - 20, '+1', {
                                fontSize: '24px',
                                color: '#66ff66',
                                fontStyle: 'bold',
                                stroke: '#000000',
                                strokeThickness: 3
                            }).setOrigin(0.5).setDepth(20);

                            this.tweens.add({
                                targets: feedbackText,
                                y: worldY - 60,
                                alpha: 0,
                                duration: 800,
                                ease: 'Power2',
                                onComplete: () => feedbackText.destroy()
                            });
                        }

                        console.log('Crate dropped!');
                    } else {
                        console.log('Nothing to drop');
                    }
                    setTimeout(finish, duration);
                    break;
                }

                default:
                    // Handle LOG commands
                    if (typeof command === 'string' && command.startsWith('LOG:')) {
                        const rest = command.substring(4);
                        const colonIdx = rest.indexOf(':');
                        const label = colonIdx !== -1 ? rest.substring(0, colonIdx) : 'value';
                        const logVal = colonIdx !== -1 ? rest.substring(colonIdx + 1) : rest;
                        this.logStep = (this.logStep || 0) + 1;
                        const logOutput = document.getElementById('log-output');
                        if (logOutput) {
                            const entry = document.createElement('div');
                            entry.className = 'log-entry';
                            entry.innerHTML = `<span class="log-step">#${this.logStep}</span><span class="log-label">${label}</span>: <span class="log-value">${logVal}</span>`;
                            logOutput.appendChild(entry);
                            logOutput.scrollTop = logOutput.scrollHeight;
                        }
                        console.log(`[LOG #${this.logStep}] ${label}: ${logVal}`);
                        finish();
                    } else {
                        console.warn('Unknown command:', command);
                        finish();
                    }
            }
        });
    }
}
