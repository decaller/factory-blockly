import StartGame from './game/main';
import { injectBlockly, getWorkspaceCode } from './blockly/workspace';

function clearLog() {
    const logOutput = document.getElementById('log-output');
    if (logOutput) logOutput.innerHTML = '';
}

document.addEventListener('DOMContentLoaded', () => {

    const game = StartGame('game-container');
    
    const blocklyContainer = document.getElementById('blockly-container');
    console.log("Blockly container:", blocklyContainer);
    
    if (blocklyContainer) {
        const workspace = injectBlockly();
        
        document.getElementById('run-button').addEventListener('click', () => {
            clearLog();
            const code = getWorkspaceCode(workspace);
            const gameScene = game.scene.getScene('GameScene');
            if (gameScene) {
                gameScene.logStep = 0;
                gameScene.runCommandQueue(code);
            } else {
                console.error("GameScene not found");
            }
        });

        document.getElementById('reset-button').addEventListener('click', () => {
            clearLog();
            const gameScene = game.scene.getScene('GameScene');
            if (gameScene) {
                gameScene.logStep = 0;
                gameScene.resetLevel();
            }
        });

        document.getElementById('log-clear-button').addEventListener('click', () => {
            clearLog();
        });
    } else {
        console.error("Blockly container not found!");
    }

});