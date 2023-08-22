import * as PIXI from "pixi.js";
import Cell from "./Cell";
import gemNames from "./gemNames";
import PixiApp from "./PixiApp";
class BoardManager {
  #gemChances = [];
  #rows = 7;
  #cols = 7;
  #boardHeight = 64 * this.#rows;
  #tickers = {};
  #elapsed = 0;
  #dropTick = 50;
  #lastDrop = 0;
  //$----
  #movingGems = [];
  #gemsToRemove = [];

  constructor(world) {
    /**
     * @type {PixiApp} world
     */
    this.world = world;
    /**
     *@type {Cell[][]} board
     */
    this.board = [];
    this.boardContainer = new PIXI.Container();
    this.boardContainer.position = new PIXI.Point(200, 200);
    this.world.addChild(this.boardContainer);
    // this.#tickers.update = this.world.app.ticker.add((delta) => this.#update(delta));
    // this.#tickers.drop = this.world.app.ticker.add((delta) => this.#drop(delta));
    this.#start();
  }
  #start() {
    this.#generateGemChances();
    this.#createBoard();
  }
  #createBoard() {
    for (let i = 0; i < this.#rows; i++) {
      this.board[i] = [];
    }
    let index = 1;
    for (let i = 0; i < this.#rows; i++) {
      for (let j = 0; j < this.#cols; j++) {
        this.board[i][j] = new Cell(this.world, i, j);
        this.board[i][j].createGem(
          gemNames[index],
          new PIXI.Point(this.board[i][j].position.x, this.board[i][j].position.y - this.#boardHeight)
        );
        this.board[i][j].gem.targetPos = new PIXI.Point(this.board[i][j].position.x, this.board[i][j].position.y);
        this.boardContainer.addChild(this.board[i][j].gem.sprite);
        index = index === gemNames.length - 1 ? 1 : index + 1;
      }
    }
    this.#drop(() => {});
    // this.#drop(() => {
    // //!ATENTO ACA
    // for (let i = 0; i < this.#rows; i++) {
    //   for (let j = 0; j < this.#cols; j++) {
    //     this.board[i][j].gem.needsClear = true;
    //     this.board[i][j].gem.clear();
    //   }
    // }
    // });
  }
  #drop(onComplete) {
    for (let i = 0; i < this.#rows; i++) {
      for (let j = 0; j < this.#cols; j++) {
        const gem = this.board[i][j].gem;
        this.#movingGems.push(gem);
        gem.move(500);
      }
    }
    setTimeout(() => onComplete(), 500);
  }
  spin(onComplete) {
    this.#resetBoard();
    for (let i = 0; i < this.#rows; i++) {
      for (let j = 0; j < this.#cols; j++) {
        const cell = this.board[i][j];
        //? -1  -  limpiar gemas anteriores -> insertarlas en un array
        this.#gemsToRemove.push(cell.gem);
        cell.gem.targetPos = new PIXI.Point(cell.position.x, cell.position.y + this.#boardHeight);
      }
    }
    this.#drop(() => {
      //? 0   -  rollear nuevas gemas -> insertarlas en board
      this.#newBoard();
      //todo refactoriazar y aislar funcion para poder llamarla recursiva
      //todo rehacer el spawn wilds para que dependa de cada cell la chance de mutacion
      //? 1   -  dropearlas
      this.#solver(this.board.flat(), onComplete);
      this.#removeGems(this.#gemsToRemove);
    });
  }
  #solver(playableCells, onComplete) {
    this.#drop(() => {
      this.#spawnWild(playableCells, () => {
        //? 2 - matchear SI matchea goto 3 - NO matchea goto 4
        const wildCells = this.#getWildCells();
        const matches = this.#findMatches(wildCells);
        console.log("matches.length", matches.length);
        if (matches.length) {
          //? 3 - setear gem con needsClear = true y eliminar duplicados -> animar clear
          this.#clearAndAnimateGems(matches, () => {
            //? 4 - recalcular posiciones y agregar nuevas -> goto 1
            this.#recalculatePositions();
            const newCells = this.#fillBoard();
            this.#resetBoard();
            this.#solver(newCells, onComplete);
          });
        }
        onComplete();
        //? 5 - END
      });
    });
  }
  #resetBoard() {
    for (let i = 0; i < this.#rows; i++) {
      for (let j = 0; j < this.#cols; j++) {
        this.board[i][j].computed = false;
      }
    }
  }
  #recalculatePositions() {
    for (let j = 0; j < this.#cols; j++) {
      let baseIndex = 0;
      for (let i = this.#rows - 1; i >= 0; i--) {
        if (this.board[i][j].gem === null) {
          baseIndex = i;
          break;
        }
      }
      //todo seguir
      const gems = [];
      for (let i = baseIndex; i >= 0; i--) {
        if (this.board[i][j].gem) {
          gems.push(this.board[i][j].gem);
        }
      }
      for (let i = baseIndex; i >= 0; i--) {
        if (gems.length) {
          const cell = this.board[i][j];
          cell.gem = gems.shift();
          cell.gem.targetPos = new PIXI.Point(cell.position.x, cell.position.y);
        } else this.board[i][j].gem = null;
      }
      // for (let i = 0; i < gems.length; i++) {
      //   const cell = this.board[baseIndex + i][j];
      //   cell.gem = gems[i];
      //   cell.gem.targetPos = new PIXI.Point(cell.position.x, cell.position.y);
      // }
      // for (let i = baseIndex + gems.length; i < this.#rows; i++) {
      //   this.board[i][j].gem = null;
      // }
    }
  }
  #findMatches(wildCells) {
    let result = [];
    for (let i = 0; i < this.#rows; i++) {
      for (let j = 0; j < this.#cols; j++) {
        wildCells.forEach((cell) => (cell.computed = false));
        const cell = this.board[i][j];
        const gemName = this.board[i][j].gem.name;
        const matchedCells = [];
        if (!cell.computed && gemName !== "wildGem") {
          this.#matchCells(i, j, gemName, matchedCells);
          //console.log("gemName:", gemName, "matchedCells:", matchedCells);
          if (matchedCells.length >= 5) {
            //?pushear a un array de matchings un obj = {gemName,data}
            result = [...result, { gemName, data: [...matchedCells] }];
          }
        }
      }
    }
    return result;
  }
  #matchCells(i, j, gemName, matchedCells) {
    if (i < 0 || i >= this.#rows || j < 0 || j >= this.#cols) return;
    if (this.board[i][j].computed || (this.board[i][j].gem.name !== gemName && this.board[i][j].gem.name !== "wildGem"))
      return;
    matchedCells.push(this.board[i][j]);
    this.board[i][j].computed = true;
    this.#matchCells(i - 1, j, gemName, matchedCells);
    this.#matchCells(i, j + 1, gemName, matchedCells);
    this.#matchCells(i + 1, j, gemName, matchedCells);
    this.#matchCells(i, j - 1, gemName, matchedCells);
  }
  #clearAndAnimateGems(matches, onComplete) {
    //? 3 - eliminar duplicados
    const flatMatches = matches.map((obj) => obj.data).flat();
    const uniqueFlatMatches = [];
    const uniqueRefs = new Set();
    for (let i = 0; i < flatMatches.length; i++) {
      const cell = flatMatches[i];
      if (!uniqueRefs.has(cell)) {
        uniqueFlatMatches.push(cell);
        uniqueRefs.add(cell);
      }
    }
    //? setear gem con needsClear = true y -> animar clear
    uniqueFlatMatches.forEach((cell) => {
      cell.gem.needsClear = true;
      cell.gem.clear();
    });
    //? eliminar cells
    setTimeout(() => {
      this.#removeGems(uniqueFlatMatches.map((cell) => cell.gem));
      uniqueFlatMatches.forEach((cell) => (cell.gem = null));
      onComplete();
    }, 220);
  }
  #getWildCells() {
    const wildCells = [];
    for (let i = 0; i < this.#rows; i++) {
      for (let j = 0; j < this.#cols; j++) {
        const cell = this.board[i][j];
        if (cell.gem.name === "wildGem") wildCells.push(this.board[i][j]);
      }
    }
    return wildCells;
  }
  #addGem(i, j, top) {
    this.board[i][j].createGem(this.#getRndGem(), new PIXI.Point(this.board[i][j].position.x, 64 * top));
    this.board[i][j].gem.targetPos = new PIXI.Point(this.board[i][j].position.x, this.board[i][j].position.y);
    this.boardContainer.addChild(this.board[i][j].gem.sprite);
  }
  #newBoard() {
    for (let j = 0; j < this.#cols; j++) {
      let currentY = -1;
      for (let i = this.#rows - 1; i >= 0; i--) {
        this.#addGem(i, j, currentY);
        currentY--;
      }
    }
  }
  #fillBoard() {
    const newCells = [];
    for (let j = 0; j < this.#cols; j++) {
      let currentY = -1;
      for (let i = this.#rows - 1; i >= 0; i--) {
        if (this.board[i][j].gem === null) {
          this.#addGem(i, j, currentY);
          newCells.push(this.board[i][j]);
          currentY--;
        }
      }
    }
    return newCells;
  }
  #spawnWild(playableCells, onComplete) {
    let wildCount = 0;
    for (let i = 0; i < playableCells.length; i++) {
      const rnd = Math.floor(Math.random() * 100);
      if (rnd < 10) wildCount++;
    }
    wildCount = Math.min(wildCount, 6);
    while (wildCount > 0) {
      const index = Math.floor(Math.random() * playableCells.length);
      if (playableCells[index].gem.name !== "wildGem") {
        wildCount--;
        this.boardContainer.removeChild(playableCells[index].gem.sprite);
        playableCells[index].createGem(
          "wildGem",
          new PIXI.Point(playableCells[index].position.x, playableCells[index].position.y)
        );
        this.boardContainer.addChild(playableCells[index].gem.sprite);
      }
    }
    onComplete();
  }
  #removeGems(gems) {
    for (let i = 0; i < gems.length; i++) {
      this.boardContainer.removeChild(gems[i].sprite);
    }
  }
  #getRndGem() {
    //?rollear en base a la tabla de probabilidades y retornar el name
    return gemNames[this.#gemChances[Math.floor(Math.random() * 100)]];
  }
  #generateGemChances() {
    //GEM = 12 + 9 + 6 + 3
    //CHIP = 26 + 20 + 15 + 9
    for (let i = 0; i < 100; i++) {
      if (i < 26) {
        this.#gemChances.push(1);
      } else if (i < 46) {
        this.#gemChances.push(2);
      } else if (i < 61) {
        this.#gemChances.push(3);
      } else if (i < 70) {
        this.#gemChances.push(4);
      } else if (i < 82) {
        this.#gemChances.push(5);
      } else if (i < 91) {
        this.#gemChances.push(6);
      } else if (i < 97) {
        this.#gemChances.push(7);
      } else {
        this.#gemChances.push(8);
      }
    }
  }
  #update() {}
}
export default BoardManager;
