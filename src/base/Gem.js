import * as TWEEN from "@tweenjs/tween.js";
import * as PIXI from "pixi.js";
class Gem {
  #targetPos;
  #needsMove = false;
  constructor(world, gemName, initialPos) {
    this.world = world;
    this.sprite = new PIXI.AnimatedSprite(this.#getTexturesFromAsset(gemName));
    this.sprite.scale.set(0.27, 0.27);
    this.sprite.position = initialPos;
    this.sprite.animationSpeed = 0.4;
    this.sprite.loop = false;
    this.sprite.onComplete = () => this.#onClearComplete();
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
    const moveAnim = new TWEEN.Tween({ x: from.x, y: from.y })
      .to({ x: to.x, y: to.y }, duration)
      .onComplete(() => (this.#needsMove = false));
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
  #onClearComplete() {
    this.sprite.stop();
  }
}
export default Gem;
