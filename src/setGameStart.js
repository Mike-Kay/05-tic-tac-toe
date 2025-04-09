import { getElement, getLocalStorage, setStorageItem } from "../src/utils.js";

let gameStart = getLocalStorage("gameStart");
const homePage = getElement(".home-page");
const gamePage = getElement(".game-page");
const errorMsg = getElement(".error-msg");
const restart = getElement(".restart-icon");
const playerTurn = getElement(".player-turn");
const gameTiles = [...document.querySelectorAll(".game-tile")];
const tilesCon = getElement(".game-tiles");
const modalCon = getElement(".modal-container");

restart.addEventListener("click", () => {
  displayModal(true, true);
  getElement(".win span").style.color = "#a8bfc9";
});

// Choose Player Mark....1
const markIconBtns = [...document.querySelectorAll(".mark-btn")];
markIconBtns.forEach((markIconBtn) => {
  markIconBtn.addEventListener("click", () => {
    markIconBtns.forEach((btn) => btn.classList.remove("active"));
    markIconBtn.classList.add("active");
    errorMsg.style.display = "none";
    const mark1 = markIconBtn.firstElementChild.textContent;
    const nextPlayer = markIconBtn.previousElementSibling
      ? markIconBtn.previousElementSibling
      : markIconBtn.nextElementSibling;
    const mark2 = nextPlayer.firstElementChild.textContent;
    // setup game
    gameStart = {
      player1: { mark: mark1, turns: 0, grid: [], wins: 0, title: "player 1" },
      player2: { mark: mark2, turns: 0, grid: [], wins: 0, title: "player 2" },
      gameMode: "pvp",
      gameTurn: "x",
      nextTurn: "o",
      winPatterns: [
        ["grid-1a", "grid-2a", "grid-3a"],
        ["grid-1b", "grid-2b", "grid-3b"],
        ["grid-1c", "grid-2c", "grid-3c"],
        ["grid-1a", "grid-1b", "grid-1c"],
        ["grid-2a", "grid-2b", "grid-2c"],
        ["grid-3a", "grid-3b", "grid-3c"],
        ["grid-1a", "grid-2b", "grid-3c"],
        ["grid-3a", "grid-2b", "grid-1c"],
      ],
      ties: 0,
    };
    setStorageItem("gameStart", gameStart);
  });
});

// Game Start....2
[...document.querySelectorAll(".btn")].forEach((btn) => {
  btn.addEventListener("click", () => {
    const validate = [...document.querySelectorAll(".mark-btn")].filter(
      (iconBtn) => iconBtn.classList.contains("active")
    );

    // check that player1's mark has been picked
    if (validate.length < 1) {
      errorMsg.style.display = "block";
      localStorage.removeItem("gameStart");
      return;
    } else {
      gameStart = { ...gameStart, gameOn: true };
      // setup game for solo mode
      if (btn.classList.contains("y-btn")) {
        gameStart = {
          ...gameStart,
          gameMode: "solo",
          grids: [
            "grid-1a",
            "grid-2a",
            "grid-3a",
            "grid-1b",
            "grid-2b",
            "grid-3b",
            "grid-1c",
            "grid-2c",
            "grid-3c",
          ],
          CPU: { ...gameStart.player2, title: "cpu" },
        };
        delete gameStart.player2;
        if (gameStart.player1.mark !== "x") {
          gameTiles.forEach((tile) => {
            tile.disabled = true;
            tile.style.cursor = "default";
          });
          cpuPlay(gameStart.grids);
        }
        gameFunctionality();
      } else {
        gameFunctionality();
      }
      homePage.style.display = "none";
      gamePage.style.display = "grid";
    }
    setStorageItem("gameStart", gameStart);
  });
});

export const gameFunctionality = () => {
  gameTiles.forEach((gameTile) => {
    const id = gameTile.dataset.id;

    gameTile.addEventListener("mouseover", () => {
      if (gameTile.disabled === false)
        gameTile.firstElementChild.src = `./assets/icon-${gameStart.gameTurn}-outline.svg`;
    });
    gameTile.addEventListener("mouseout", () => {
      if (gameTile.disabled === false) gameTile.firstElementChild.src = "";
    });

    if (gameStart.gameMode != "solo") gamePlay(gameTile, id);
  });
  if (gameStart.gameMode == "solo") soloMode();
  if (gameStart.winner) confirmWin(gameStart.winner, gameStart.winner.winGrids);
  else if (gameStart.noWinner) gameTied();

  gameFooter();
};

const gamePlay = (tile, id) => {
  tile.addEventListener("click", () => {
    playGrid(tile, id);
    disableGrid(tile);
  });
};

const disableGrid = (grid) => {
  grid.disabled = true;
  grid.style.cursor = "default";
};

const tileTurnPlayed = (turn, id) => {
  for (const x in gameStart) {
    if (gameStart[x].mark == turn) {
      gameStart[x].turns += 1;
      gameStart[x].grid.push(id);
      setStorageItem("gameStart", gameStart);
      return gameStart[x];
    }
  }
};

const playGrid = (grid, id) => {
  // add current player mark to clicked/played tile
  grid.firstElementChild.src = `./assets/icon-${gameStart.gameTurn}.svg`;
  const currPlayer = tileTurnPlayed(gameStart.gameTurn, id);
  // check for winner
  const checkWin = checkWinPattern(currPlayer.grid);
  if (checkWin) {
    gameStart.winner = {
      mark: currPlayer.mark,
      title: currPlayer.title,
      winGrids: checkWin,
    };
    for (const x in gameStart) {
      if (gameStart[x].mark == currPlayer.mark) gameStart[x].wins += 1;
    }
    confirmWin(currPlayer, checkWin);
    // update game scores
    gameFooter();
  }
  // check for ties and update score board
  if (currPlayer.mark == "x" && currPlayer.turns > 4 && !checkWin) {
    gameStart.ties += 1;
    gameStart.noWinner = true;
    gameTied();
    gameFooter();
    // console.log(currPlayer);
  }
  // switch to next player turn
  playerTurn.textContent = gameStart.nextTurn;
  gameStart = {
    ...gameStart,
    gameTurn: gameStart.nextTurn,
    nextTurn: gameStart.gameTurn,
  };
  setStorageItem("gameStart", gameStart);
};

const soloMode = () => {
  tilesCon.addEventListener("click", (e) => {
    const grid = e.target.classList.contains("game-tile")
      ? e.target
      : e.target.parentElement;

    if (grid.classList.contains("game-tile") && grid.disabled != true) {
      const id = grid.dataset.id;
      playGrid(grid, id);
      disableGrid(grid);

      let availableGrids = gameStart.grids;
      availableGrids = availableGrids.filter((grid) => grid != id);
      availableGrids.forEach((grid) => {
        const el = getElement(`.${grid}`);
        disableGrid(el);
      });
      if (gameStart.winner) return;

      // cpu Proactive Game Play
      let tileBlock;
      if (gameStart.player1.grid.length > 1) {
        const pattern = cpuActivePlay();
        pattern.forEach((pat) => {
          if (!gameStart.CPU.grid.includes(pat))
            tileBlock = getElement(`.${pat}`);
        });
        // console.log(pattern);
      }
      if (gameStart.CPU.grid.length > 1) {
        const pattern = cpuActivePlay(true);
        pattern.forEach((pat) => {
          if (!gameStart.player1.grid.includes(pat))
            tileBlock = getElement(`.${pat}`);
        });
      }
      // console.log(tileBlock);

      cpuPlay(availableGrids, tileBlock);
      gameStart = { ...gameStart, grids: availableGrids };
      setStorageItem("gameStart", gameStart);
    }
  });
};

const cpuPlay = (grids, alt) => {
  if (grids.length > 0) {
    setTimeout(() => {
      const randomNum = Math.ceil(Math.random() * grids.length - 1);
      let cpuGrid = grids[randomNum];
      let el = getElement(`.${cpuGrid}`);
      if (alt) {
        el = alt;
        cpuGrid = alt.dataset.id;
        // console.log(alt);
      }
      let newGrids = grids.filter((grid) => grid != cpuGrid);
      newGrids.forEach((tile) => {
        const el = getElement(`.${tile}`);
        el.disabled = false;
        el.style.cursor = "pointer";
      });
      playGrid(el, cpuGrid);
      gameStart = { ...gameStart, grids: newGrids };
      setStorageItem("gameStart", gameStart);
    }, 100);
  }
};

const gameFooter = () => {
  const player1 = gameStart.player1;
  const player2 = gameStart.player2 ? gameStart.player2 : gameStart.CPU;
  const mark1 = player1.mark;
  const mark2 = player2.mark;

  const firstPlayer = getElement(`.player-${mark1}-score`);
  const secondPlayer = getElement(`.player-${mark2}-score`);
  const ties = getElement(".ties");

  // update players score board
  firstPlayer.firstElementChild.textContent =
    gameStart.gameMode == "solo" ? `${mark1} (YOU)` : `${mark1} (P1)`;
  firstPlayer.children[1].textContent = player1.wins;
  secondPlayer.firstElementChild.textContent =
    gameStart.gameMode == "solo" ? `${mark2} (CPU)` : `${mark2} (P2)`;
  secondPlayer.children[1].textContent = player2.wins;

  ties.children[1].textContent = gameStart.ties;
};

const checkWinPattern = (grids) => {
  const patterns = gameStart.winPatterns;
  let win;
  patterns.forEach((pattern) => {
    const isWin = pattern.every((tile) => grids.includes(tile));
    if (isWin) win = [...pattern];
  });
  return win;
};

const confirmWin = (currPlayer, winGrids) => {
  const iconImg = `<img src="./assets/icon-${currPlayer.mark}.svg" alt="winner-icon" class="winner-img" />`;
  let text = gameStart.gameMode != "solo" ? `${currPlayer.title} wins!` : "";
  if (gameStart.gameMode == "solo" && currPlayer.title != "cpu") {
    text = "you won";
  } else if (gameStart.gameMode == "solo") {
    text = "oh no, you lost...";
  }
  displayModal(false, false, text, iconImg);
  if (currPlayer.mark == "o") {
    getElement(".win span").style.color = "#f2b137";
  }
  winGrids.forEach((grid) => {
    const el = getElement(`.${grid}`);
    el.firstElementChild.src = `./assets/icon-${currPlayer.mark}-outlineWin.svg`;
    currPlayer.mark == "x"
      ? el.classList.add("x-wins")
      : el.classList.add("o-wins");
  });
};

const displayModal = (filter1, filter2, text, img) => {
  const pageHeight = gamePage.getBoundingClientRect().height;
  modalCon.style.display = "grid";
  modalCon.style.height = `${pageHeight}px`;
  modalCon.innerHTML = `<div class="modal">
        <span>${filter1 ? "" : text}</span>
        <div class="win">
          ${filter1 ? "" : img}
          <span>${filter1 ? "restart game?" : "takes the round"}</span>
        </div>
        <div class="modal-btn-con">
          <button class="modal-btn neg ${filter2 ? "no" : ""}" data-id="quit">
          ${filter2 ? "no, cancel" : "quit"}
          </button>
          <button class="modal-btn pos ${filter2 ? "yes" : ""}" data-id="next">
          ${filter2 ? "yes, restart" : "next round"}
          </button>
        </div>
      </div>`;

  modalCon.querySelector(".pos").addEventListener("click", setBackToDefault);
  modalCon.querySelector(".neg").addEventListener("click", (e) => {
    if (e.currentTarget.classList.contains("no"))
      modalCon.style.display = "none";
    else quitGame();
  });
};

const gameTied = () => {
  displayModal(true, false);
  getElement(".win span").textContent = "round tied";
  getElement(".win span").style.color = "#a8bfc9";
};

const quitGame = () => {
  localStorage.removeItem("gameStart");
  window.location.reload();
  modalCon.style.display = "none";
  homePage.style.display = "grid";
  gamePage.style.display = "none";
  iconBtns.forEach((btn) => btn.classList.remove("active"));
  gameStart = undefined;
};

const setBackToDefault = () => {
  if (gameStart.gameMode == "solo") {
    gameStart.grids = [
      ...gameStart.grids,
      ...new Set(gameStart.CPU.grid),
      ...new Set(gameStart.player1.grid),
    ];
    // console.log(gameStart.grids);
  }
  for (const x in gameStart) {
    if (gameStart[x].mark) {
      gameStart[x].grid = [];
      gameStart[x].turns = 0;
    }
  }
  gameStart.gameTurn = "x";
  gameStart.nextTurn = "o";
  playerTurn.textContent = "x";
  modalCon.style.display = "none";
  gameTiles.forEach((tile) => {
    tile.firstElementChild.src = "";
    tile.classList.remove("x-wins", "o-wins");
    tile.disabled = false;
    tile.style.cursor = "pointer";
  });
  if (gameStart.player1.mark != "x" && gameStart.gameMode == "solo") {
    gameTiles.forEach((tile) => {
      tile.disabled = true;
      // tile.style.cursor = "pointer";
    });
    cpuPlay(gameStart.grids);
  }
  delete gameStart.noWinner;
  delete gameStart.winner;
  setStorageItem("gameStart", gameStart);
};

const cpuActivePlay = (filter) => {
  let playTile = [];
  for (let i = 0; i < gameStart.winPatterns.length; i++) {
    const blockTile = gameStart.winPatterns[i].filter(
      (grid) => !gameStart.player1.grid.includes(grid)
    );
    if (blockTile.length < 2 && !filter) playTile = [...playTile, ...blockTile];

    const winTile = gameStart.winPatterns[i].filter(
      (grid) => !gameStart.CPU.grid.includes(grid)
    );
    if (filter && winTile.length < 2) playTile = [...playTile, ...winTile];
  }
  return playTile;
};

console.log(gameStart);
