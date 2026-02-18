import StartGame from './game/main';
import { injectBlockly, getWorkspaceCode } from './blockly/workspace';

document.addEventListener('DOMContentLoaded', () => {

    const game = StartGame('game-container');
    
    const blocklyContainer = document.getElementById('blockly-container');
    console.log("Blockly container:", blocklyContainer);
    
    if (blocklyContainer) {
        const workspace = injectBlockly();
        
        document.getElementById('run-button').addEventListener('click', () => {
            const code = getWorkspaceCode(workspace);
            // Access the running scene
            const gameScene = game.scene.getScene('GameScene');
            if (gameScene) {
                gameScene.runCommandQueue(code);
            } else {
                console.error("GameScene not found");
            }
        });
    } else {
        console.error("Blockly container not found!");
    }

});