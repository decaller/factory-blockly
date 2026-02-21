# Factory Blockly

Factory Blockly is a browser game where you program robots with Blockly blocks to move crates from an `OUT` conveyor to an `IN` conveyor.

The screen is split into two panels:
- Left: Phaser game board (robots, crates, belts, score)
- Right: Blockly workspace (drag-and-drop programming)

## Live Demo

The game is currently running on GitHub Pages:

https://decaller.github.io/factory-blockly/

## Gameplay

- Grid size: `10 x 10`
- Robot 1 starts near the top-left
- Robot 2 starts near the bottom-left
- Crates spawn on the dispenser belt cells in a fixed cycle:
  - `(0,3) -> (0,4) -> (0,5) -> repeat`
- Goal: grab crates, carry them across the map, and drop them on the receiver belt.
- Score increases when a crate is successfully delivered.
- Special animations play on the 1st and 10th delivered crate.

## Controls

- `RUN CODE`
  - Stops any current run
  - Resets the level
  - Executes the current Blockly program
- `PAUSE / PLAY`
  - Pauses or resumes active execution
- `RESET`
  - Stops any current run and resets level state
- Log panel
  - Shows debug output and blocked movement/turning messages
  - `Clear` button resets log output

## Blockly Blocks

- Robot actions: move, turn, grab, drop
- Start hats: `Robot 1`, `Robot 2`
- Control flow: repeat, if, while/until
- Logic: compare, boolean ops, `not`
- Sensors:
  - `is blocked`
  - `crate in front`
  - `is holding crate`
- Debug: `log`
- Variables supported

## Execution Rules

- Robots cannot move into:
  - Walls
  - Other robots
  - Crates
  - Conveyor spawn/despawn belt cells
- Carrying a crate enforces extra collision checks for movement and turning.
- Infinite loop protection is enabled with a max trap count of `1000`.
- Incomplete blocks are detected before run and show a notification.

## Tech Stack

- Phaser 3
- Blockly
- Vite

## Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

No-log variants are also available:

```bash
npm run dev-nolog
npm run build-nolog
```

## Project Structure

- `src/main.js`: app bootstrap, UI button wiring
- `src/blockly/*`: custom blocks, generators, workspace setup
- `src/scenes/GameScene.js`: Phaser scene composition
- `src/scenes/gameScene/*`: runtime logic (commands, flow, crates, rendering)
- `public/style.css`: layout and UI styling

## Contributing

Feel free to:
- Issue reports
- Feature suggestions
- Pull requests
- Forks

## Notice

This project is for educational purposes.

Built with AI assistance.

You are welcome to copy, fork, and learn from this codebase.

## License

MIT License. See `LICENSE`.
