import Gem from "./Gem.js";
import * as PIXI from "pixi.js";
class Cell {
  #offsetX = 64;
  #offsetY = 64;
  /**
   * @type {Gem} gem
   */
  #gem;
  constructor(world, i, j) {
    this.world = world;
    this.position = this.#setPosition(i, j);
    this.computed = false;
  }
  #setPosition(i, j) {
    return new PIXI.Point(j * this.#offsetX, i * this.#offsetY);
  }
  createGem(gemName, position) {
    if (gemName) {
      this.#gem = new Gem(this.world, gemName, position);
    } else {
      this.#gem = null;
    }
  }
  set gem(value) {
    this.#gem = value;
  }
  get gem() {
    return this.#gem;
  }
}
export default Cell;
