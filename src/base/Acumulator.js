import * as PIXI from "pixi.js";
import * as TWEEN from "@tweenjs/tween.js";
class Acumulator {
  #lastProgress = 1;
  constructor(world) {
    this.world = world;
    this.container = new PIXI.Container();
    this.bg = new PIXI.Sprite(this.world.assets.acumulatorBg);
    this.fill = new PIXI.Sprite(this.world.assets.acumulatorFill);
    this.progress = 0;
    this.mask = new PIXI.Graphics();
    this.mask.beginFill(0xffffff);
    this.mask.drawRect(0, 0, this.fill.width, this.fill.height);
    this.mask.endFill();
    this.fill.mask = this.mask;
    this.container.addChild(this.bg);
    this.container.addChild(this.fill);
    this.container.addChild(this.mask);
    this.world.addChild(this.container);
    this.updateProgress(0);
    this.container.pivot.set(0.5, 0.5);
    this.container.position.set(100, 175);
  }
  reset() {
    //todo limpia todo el acumulador
  }

  // updateProgress(progress) {
  //   this.mask.clear();
  //   const progressHeight = this.bg.height - (this.bg.height * progress) / 100;
  //   this.mask.beginFill(0xffffff);
  //   this.mask.drawRect(1, 1, this.fill.width - 3, progressHeight - 3);
  //   this.mask.endFill();
  // }
  updateProgress(progress) {
    const changeAnim = new TWEEN.Tween({ y: this.#lastProgress }).to({ y: progress }, 400).onComplete(() => {
      console.log("COMPLETE");
      this.#lastProgress = progress;
    });
    changeAnim.onUpdate(({ y }, elapsed) => {
      this.mask.clear();
      const progressHeight = this.bg.height - (this.bg.height * y) / 100;
      this.mask.beginFill(0xffffff);
      this.mask.drawRect(1, 1, this.fill.width - 3, progressHeight - 3);
      this.mask.endFill();
    });
    changeAnim.start();
  }
}
export default Acumulator;
