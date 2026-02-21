export function isOnBelt(gx, gy, belt) {
  return belt.some((c) => c.x === gx && c.y === gy);
}

export function findEmptyDispenserCell() {
  const beltLength = this.dispenserBelt.length;
  const startIndex = this.dispenserSpawnIndex || 0;

  for (let offset = 0; offset < beltLength; offset++) {
    const idx = (startIndex + offset) % beltLength;
    const cell = this.dispenserBelt[idx];
    const occupied = this.crates.some(
      (c) => c.gridX === cell.x && c.gridY === cell.y,
    );
    if (!occupied) {
      this.dispenserSpawnIndex = (idx + 1) % beltLength;
      return cell;
    }
  }

  return null;
}

export function spawnCrate() {
  const cell = this.findEmptyDispenserCell();
  if (!cell) {
    console.log("Dispenser full, cannot spawn");
    return null;
  }

  const crate = this.add.rectangle(
    cell.x * this.tileSize + this.tileSize / 2,
    cell.y * this.tileSize + this.tileSize / 2,
    this.tileSize - 20,
    this.tileSize - 20,
    0xffa500,
  );
  crate.gridX = cell.x;
  crate.gridY = cell.y;
  crate.isCarried = false;

  crate.setScale(0);
  this.tweens.add({
    targets: crate,
    scaleX: 1,
    scaleY: 1,
    duration: 300,
    ease: "Back.easeOut",
  });

  this.crates.push(crate);
  console.log(`Crate spawned at (${cell.x}, ${cell.y})`);
  return crate;
}

export function getCrateAt(gx, gy) {
  return (
    this.crates.find((c) => !c.isCarried && c.gridX === gx && c.gridY === gy) ||
    null
  );
}

export function destroyCrate(crate) {
  const idx = this.crates.indexOf(crate);
  if (idx !== -1) this.crates.splice(idx, 1);
  crate.destroy();
}
