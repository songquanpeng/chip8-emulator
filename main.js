import Emulator from "./emulator.js";
import Renderer from "./browser/renderer.js";
import Controller from "./browser/controller.js";
import Loader from "./browser/loader.js";
import Speaker from "./browser/speaker.js";

const renderer = new Renderer("canvas");
const controller = new Controller();
const loader = new Loader();
const speaker = new Speaker();
const emulator = new Emulator(controller, renderer, speaker, loader);

let fpsInterval, lastTime;

function step(currentTime) {
  if (currentTime - lastTime < fpsInterval) {
    window.requestAnimationFrame(step);
    return;
  }
  lastTime = currentTime;
  emulator.step();
  window.requestAnimationFrame(step);
}

function main(fps) {
  lastTime = 0;
  fpsInterval = 1000 / fps;
  emulator.speed = 10;
  emulator.loadRom("/rom/BLINKY").then(() => {
    window.requestAnimationFrame(step);
  });
}

main(60);
