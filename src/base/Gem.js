import * as TWEEN from "@tweenjs/tween.js";
import * as PIXI from "pixi.js";
class Gem {
  #targetPos;
  #needsMove = false;
  #removeGem = false;
  #container;
  constructor(world, gemName, initialPos, container) {
    this.world = world;
    this.#container = container;
    this.sprite = new PIXI.AnimatedSprite(this.#getTexturesFromAsset(gemName));
    this.sprite.scale.set(0.25, 0.25);
    this.sprite.position.set(initialPos.x, initialPos.y);
    this.sprite.animationSpeed = 0.2;
    this.sprite.loop = false;
    this.sprite.onComplete = () => this.#onClearComplete();
    this.#container.addChild(this.sprite);
    this.name = gemName;
    this.needsClear = false;
  }
  #getTexturesFromAsset(gemName) {
    const frames = [];
    for (const gemPath in this.world.assets[gemName].textures) {
      frames.push(this.world.assets[gemName].textures[gemPath]);
    }
    return frames;
  }
  move(duration) {
    if (!this.#needsMove) return;
    const from = this.sprite.position;
    const to = this.#targetPos;
    const moveAnim = new TWEEN.Tween({ x: from.x, y: from.y }).to({ x: to.x, y: to.y }, duration).onComplete(() => {
      this.#needsMove = false;
      if (this.#removeGem) {
        this.#container.removeChild(this.sprite);
      }
    });
    moveAnim.onUpdate(({ x, y }, elapsed) => {
      this.sprite.position.set(x, y);
    });
    moveAnim.start();
  }
  clear() {
    if (!this.needsClear) return;
    this.sprite.play();
    this.needsClear = false;
  }
  set targetPos(pos) {
    this.#targetPos = pos;
    this.#needsMove = true;
  }
  get targetPos() {
    return this.#targetPos;
  }
  set removeGem(value) {
    this.#removeGem = value;
  }
  #onClearComplete() {
    this.sprite.stop();
    if (this.#removeGem) {
      this.#container.removeChild(this.sprite);
    }
  }
}
export default Gem;
