export function drawGrid() {
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

    const labelStyle = { fontSize: '12px', color: '#888888', fontFamily: 'monospace' };

    for (let x = 0; x < this.gridSize; x++) {
        this.add.text(
            x * this.tileSize + this.tileSize / 2,
            this.gridSize * this.tileSize + 4,
            `${x}`,
            labelStyle
        ).setOrigin(0.5, 0);
    }

    for (let y = 0; y < this.gridSize; y++) {
        this.add.text(
            -4,
            y * this.tileSize + this.tileSize / 2,
            `${y}`,
            labelStyle
        ).setOrigin(1, 0.5);
    }
}

export function drawConveyorBelts() {
    const g = this.add.graphics();

    this.dispenserBelt.forEach((cell) => {
        const px = cell.x * this.tileSize;
        const py = cell.y * this.tileSize;

        g.fillStyle(0x3a7bd5, 0.45);
        g.fillRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);

        g.lineStyle(2, 0x5a9bf5, 0.7);
        g.strokeRect(px + 6, py + 6, this.tileSize - 12, this.tileSize - 12);
    });

    const dMid = this.dispenserBelt[1];
    const dArrowX = dMid.x * this.tileSize + this.tileSize / 2;
    const dArrowY = dMid.y * this.tileSize + this.tileSize / 2;
    const dArrow = this.add.text(dArrowX, dArrowY, '▶', {
        fontSize: '28px',
        color: '#aaccff'
    }).setOrigin(0.5);

    this.tweens.add({
        targets: dArrow,
        alpha: { from: 0.4, to: 1 },
        duration: 800,
        yoyo: true,
        repeat: -1
    });

    const dLabel = this.dispenserBelt[0];
    this.add.text(
        dLabel.x * this.tileSize + this.tileSize / 2,
        dLabel.y * this.tileSize - 12,
        'OUT',
        { fontSize: '13px', color: '#5a9bf5', fontStyle: 'bold' }
    ).setOrigin(0.5);

    this.receiverBelt.forEach((cell) => {
        const px = cell.x * this.tileSize;
        const py = cell.y * this.tileSize;

        g.fillStyle(0x2e7d32, 0.45);
        g.fillRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);

        g.lineStyle(2, 0x66bb6a, 0.7);
        g.strokeRect(px + 6, py + 6, this.tileSize - 12, this.tileSize - 12);
    });

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

    const rLabel = this.receiverBelt[0];
    this.add.text(
        rLabel.x * this.tileSize + this.tileSize / 2,
        rLabel.y * this.tileSize - 12,
        'IN',
        { fontSize: '13px', color: '#66bb6a', fontStyle: 'bold' }
    ).setOrigin(0.5);
}

export function createLevel() {
    const robotX = this.tileSize + this.tileSize / 2;
    const robotY = this.tileSize + this.tileSize / 2;

    this.robot = this.add.container(robotX, robotY);

    const body = this.add.rectangle(
        0,
        0,
        this.tileSize - 10,
        this.tileSize - 10,
        0x00ff00
    );

    const eye = this.add.rectangle(
        (this.tileSize - 10) / 4,
        0,
        10,
        10,
        0x000000
    );

    this.robot.add([body, eye]);
    this.robot.setSize(this.tileSize - 10, this.tileSize - 10);

    this.robot.gridX = 1;
    this.robot.gridY = 1;
    this.robot.direction = 0;

    this.score = 0;
    this.scoreText = this.add.text(this.gridSize * this.tileSize - 8, 8, 'Score: 0', {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
        backgroundColor: '#00000088',
        padding: { x: 6, y: 4 }
    }).setOrigin(1, 0).setDepth(10);

    this.crates = [];
    this.carriedCrate = null;
    this.spawnCrate();
}
