import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.tileSize = 64;
        this.gridSize = 10;
        this.robot = null;
        this.crate = null;
    }

    preload() {
        // We'll use Graphics for now, so no assets needed yet.
    }

    create() {
        this.drawGrid();
        this.createLevel();
        // UI created in DOM now
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
    }

    createLevel() {
        // Robot Container
        const robotX = this.tileSize / 2;
        const robotY = this.tileSize / 2;
        
        this.robot = this.add.container(robotX, robotY);
        
        // Robot Body (Green Rect)
        const body = this.add.rectangle(
            0, 
            0, 
            this.tileSize - 10, 
            this.tileSize - 10, 
            0x00ff00
        );
        
        // Robot Eye/Direction Indicator (Black small rect on the "right" side)
        const eye = this.add.rectangle(
            (this.tileSize - 10) / 4, 
            0, 
            10, 
            10, 
            0x000000
        );

        this.robot.add([body, eye]);
        this.robot.setSize(this.tileSize - 10, this.tileSize - 10);
        
        // Start at 0,0 (grid coordinates)
        this.robot.gridX = 0;
        this.robot.gridY = 0;
        this.robot.direction = 0; // 0: East, 1: South, 2: West, 3: North

        // Crate (Orange Rect)
        this.crate = this.add.rectangle(
            3 * this.tileSize + this.tileSize / 2, 
            3 * this.tileSize + this.tileSize / 2, 
            this.tileSize - 20, 
            this.tileSize - 20, 
            0xffa500
        );
        this.crate.gridX = 3;
        this.crate.gridY = 3;
        this.crate.isCarried = false;
    }

    async runCommandQueue(commands) {
        this.resetLevel();
        console.log("Executing commands:", commands);
        
        // Wait a small delay after reset for visual clarity
        await new Promise(resolve => setTimeout(resolve, 500));

        for (const command of commands) {
            await this.executeCommand(command);
        }
    }

    resetLevel() {
        // Stop any active tweens
        this.tweens.killAll();

        // Reset Robot
        this.robot.gridX = 0;
        this.robot.gridY = 0;
        this.robot.direction = 0;
        this.robot.x = this.tileSize / 2;
        this.robot.y = this.tileSize / 2;
        this.robot.angle = 0;

        // Reset Crate
        // Force detach from any container (e.g. robot) and add back to display list of Scene
        this.add.existing(this.crate);
        
        this.crate.isCarried = false;
        this.crate.gridX = 3;
        this.crate.gridY = 3;
        this.crate.x = 3 * this.tileSize + this.tileSize / 2;
        this.crate.y = 3 * this.tileSize + this.tileSize / 2;
        this.crate.setDepth(0);
        this.crate.setScale(1);
        this.crate.setRotation(0);
        
        console.log("Level reset");
        this.logPositions();
    }

    logPositions() {
        console.log(`--- Position Log ---`);
        console.log(`Robot: (${this.robot.gridX}, ${this.robot.gridY}) Direction: ${this.robot.direction}`);
        console.log(`Crate: (${this.crate.gridX}, ${this.crate.gridY}) Carried: ${this.crate.isCarried}`);
        console.log(`--------------------`);
    }

    // Helper to get coordinates in front of a position
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
                case 'MOVE_FORWARD':
                    console.log("Processing MOVE_FORWARD");
                    
                    const nextRobot = this.getForwardXY(this.robot.gridX, this.robot.gridY, this.robot.direction);
                    
                    let canMove = false;

                    // Bounds check for robot
                    if (nextRobot.x >= 0 && nextRobot.x < this.gridSize && nextRobot.y >= 0 && nextRobot.y < this.gridSize) {
                        canMove = true;
                        
                        // Collision with Crate (if not carried)
                        if (!this.crate.isCarried) {
                            if (nextRobot.x === this.crate.gridX && nextRobot.y === this.crate.gridY) {
                                console.log("Blocked by crate");
                                canMove = false;
                            }
                        }
                        
                        // Collision logic for Carried Crate (Crate is IN FRONT of Robot)
                        if (canMove && this.crate.isCarried) {
                            const nextCrate = this.getForwardXY(nextRobot.x, nextRobot.y, this.robot.direction);
                            
                            // Bounds check for crate
                            if (nextCrate.x < 0 || nextCrate.x >= this.gridSize || nextCrate.y < 0 || nextCrate.y >= this.gridSize) {
                                console.log("Blocked: Crate hitting wall");
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
                            duration: duration,
                            onComplete: finish
                        });

                        // Logic update for crate (visuals handled by container)
                        if (this.crate.isCarried) {
                             const nextCrate = this.getForwardXY(this.robot.gridX, this.robot.gridY, this.robot.direction);
                             this.crate.gridX = nextCrate.x;
                             this.crate.gridY = nextCrate.y;
                             // No tween needed!
                        }
                    } else {
                        finish();
                    }
                    break;

                case 'TURN_LEFT':
                    // Calculate next direction first
                    const nextDirLeft = (this.robot.direction + 3) % 4;

                    // Check if turning causes carried crate to hit a wall
                    if (this.crate.isCarried) {
                         const nextCratePos = this.getForwardXY(this.robot.gridX, this.robot.gridY, nextDirLeft);
                         if (nextCratePos.x < 0 || nextCratePos.x >= this.gridSize || nextCratePos.y < 0 || nextCratePos.y >= this.gridSize) {
                             console.log("Turn Blocked: Crate would hit wall");
                             finish();
                             return;
                         }
                    }

                    console.log("Ref: TURN_LEFT");
                    this.robot.direction = nextDirLeft;
                    this.tweens.add({
                        targets: this.robot,
                        angle: this.robot.angle - 90,
                        duration: duration,
                        onComplete: finish
                    });
                    
                    // Logic update for crate (Visuals orbit automatically)
                    if (this.crate.isCarried) {
                         const nextCrate = this.getForwardXY(this.robot.gridX, this.robot.gridY, this.robot.direction);
                         this.crate.gridX = nextCrate.x;
                         this.crate.gridY = nextCrate.y;
                    }
                    break;

                case 'TURN_RIGHT':
                    // Calculate next direction first
                    const nextDirRight = (this.robot.direction + 1) % 4;

                    // Check if turning causes carried crate to hit a wall
                    if (this.crate.isCarried) {
                         const nextCratePos = this.getForwardXY(this.robot.gridX, this.robot.gridY, nextDirRight);
                         if (nextCratePos.x < 0 || nextCratePos.x >= this.gridSize || nextCratePos.y < 0 || nextCratePos.y >= this.gridSize) {
                             console.log("Turn Blocked: Crate would hit wall");
                             finish();
                             return;
                         }
                    }

                    console.log("Ref: TURN_RIGHT");
                    this.robot.direction = nextDirRight;
                    this.tweens.add({
                        targets: this.robot,
                        angle: this.robot.angle + 90,
                        duration: duration,
                        onComplete: finish
                    });
                    
                    // Logic update for crate (Visuals orbit automatically)
                    if (this.crate.isCarried) {
                         const nextCrate = this.getForwardXY(this.robot.gridX, this.robot.gridY, this.robot.direction);
                         this.crate.gridX = nextCrate.x;
                         this.crate.gridY = nextCrate.y;
                    }
                    break;

                case 'GRAB':
                    console.log("Ref: GRAB");
                    const grabTarget = this.getForwardXY(this.robot.gridX, this.robot.gridY, this.robot.direction);
                    
                    if (!this.crate.isCarried && grabTarget.x === this.crate.gridX && grabTarget.y === this.crate.gridY) {
                        this.crate.isCarried = true;
                        this.crate.setDepth(1);
                        
                        // CONTAINER ATTACHMENT
                        // Remove from scene (implied by adding to container?) 
                        // Phaser Container.add() automatically removes from previous parent (Scene).
                        this.robot.add(this.crate);
                        
                        // Set Local Position (Front of robot)
                        // Robot origin is center (32,32). +X is front.
                        // We want crate center to be at +64 (one tile away).
                        this.crate.setPosition(this.tileSize, 0);
                        
                        // Clear scale/rotation to match local space?
                        this.crate.setRotation(0); 

                        // Visual lift effect (Local tween)
                        this.tweens.add({
                            targets: this.crate,
                            scaleX: 1.2,
                            scaleY: 1.2,
                            duration: 200,
                            yoyo: true, 
                            onComplete: () => {
                                 this.crate.setScale(1.2);
                            }
                        });
                        console.log("Crate grabbed!");
                    } else {
                        console.log("Nothing to grab in front");
                    }
                    setTimeout(finish, duration);
                    break;

                case 'DROP':
                     console.log("Ref: DROP");
                     if (this.crate.isCarried) {
                        this.crate.isCarried = false;
                        this.crate.setDepth(0);
                        this.crate.setScale(1.0);
                        
                        // CONTAINER DETACHMENT
                        // Remove from container
                        this.robot.remove(this.crate);
                        // Add back to Scene (GameScene)
                        this.add.existing(this.crate);
                        
                        // Set World Position based on Grid Logic (which is always up to date)
                        const worldX = this.crate.gridX * this.tileSize + this.tileSize / 2;
                        const worldY = this.crate.gridY * this.tileSize + this.tileSize / 2;
                        this.crate.setPosition(worldX, worldY);
                        this.crate.setRotation(0); // Reset rotation if any

                        console.log("Crate dropped!");
                     } else {
                        console.log("Nothing to drop");
                     }
                     setTimeout(finish, duration);
                     break;

                default:
                    console.warn("Unknown command:", command);
                    finish();
            }
        });
    }
}
