import Gem from "./Gem.js";
import * as PIXI from "pixi.js";
class Cell {
  #offsetX = 64;
  #offsetY = 64;
  /**
   * @type {Gem} gem
   */
  #gem;
  #mark;
  #permanentMark = false;
  constructor(world, i, j) {
    this.world = world;
    this.position = this.#setPosition(i, j);
    this.computed = false;
    this.#mark = new PIXI.Sprite(this.world.assets.cellMark);
    this.#mark.anchor.set(0.5);
    this.#mark.scale.set(0.23, 0.23);
    this.#mark.position.set(this.position.x + 200 + this.#offsetX / 2, this.position.y + 200 + this.#offsetY / 2);
    this.world.addChild(this.#mark);
    this.#mark.visible = false;
  }
  #setPosition(i, j) {
    return new PIXI.Point(j * this.#offsetX, i * this.#offsetY);
  }
  createGem(gemName, position, container) {
    if (gemName) {
      if (this.#gem) {
        container.removeChild(this.#gem.sprite);
      }
      this.#gem = new Gem(this.world, gemName, position, container);
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
  set mark(value) {
    if (value) {
      this.#mark.visible = value;
    } else {
      if (!this.#permanentMark) this.#mark.visible = value;
    }
  }
  set permanentMark(value) {
    this.#permanentMark = value;
  }
  get permanentMark() {
    return this.#permanentMark;
  }
}
export default Cell;
