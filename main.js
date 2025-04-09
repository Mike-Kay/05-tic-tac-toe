import "./src/setGameStart.js";
import { getElement, getLocalStorage } from "./src/utils.js";
import { gameFunctionality } from "./src/setGameStart.js";

let gameStart = getLocalStorage("gameStart");
const homePage = getElement(".home-page");
const gamePage = getElement(".game-page");
const playerTurn = getElement(".player-turn");

const preserveGameState = (gameTiles, mark) => {
  const src = `./assets/icon-${mark}.svg`;
  gameTiles.forEach((tile) => {
    const el = getElement(`.${tile}`);
    el.firstElementChild.src = src;
    el.disabled = true;
    el.style.cursor = "default";
    // console.log(el);
  });
};

window.addEventListener("DOMContentLoaded", () => {
  gamePage.style.display = "none";
  if (gameStart.hasOwnProperty("gameMode")) {
    if (gameStart.gameOn == true) {
      homePage.style.display = "none";
      gamePage.style.display = "grid";
    } else {
      localStorage.removeItem("gameStart");
      return;
    }

    // Player 1
    const player1 = gameStart.player1;
    const player1Tiles = player1.grid;
    const player1Mark = player1.mark;
    const player1Turns = player1.turns;
    // Player 2/CPU
    const player2 = gameStart.player2 ? gameStart.player2 : gameStart.CPU;
    const player2Tiles = player2.grid;
    const player2Mark = player2.mark;
    const player2Turns = player2.turns;

    // preserve player turn on refresh/reload
    if (player1Turns > player2Turns) {
      playerTurn.textContent = player2Mark;
    } else if (player1Mark == "o" && player1Turns < player2Turns) {
      playerTurn.textContent = player1Mark;
    } else if (player1Mark == "o" && player1Turns == player2Turns) {
      playerTurn.textContent = player2Mark;
    } else {
      playerTurn.textContent = player1Mark;
    }

    // disable all tile on refresh when turn == CPU mark
    if (
      gameStart.gameMode == "solo" &&
      gameStart.gameTurn == gameStart.CPU.mark
    ) {
      [...document.querySelectorAll(".game-tile")].forEach((tile) => {
        tile.disabled = true;
        tile.style.cursor = "default";
      });
    }
    preserveGameState(player1Tiles, player1Mark);
    preserveGameState(player2Tiles, player2Mark);
    gameFunctionality();
  }
});
