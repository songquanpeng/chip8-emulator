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
  console.log(
    "Github repository: https://github.com/songquanpeng/chip8-emulator"
  );
  lastTime = 0;
  fpsInterval = 1000 / fps;
  emulator.speed = 20;
  const params = new URLSearchParams(window.location.search);
  let rom = "BLINKY";
  if (params.has("rom")) {
    rom = params.get("rom");
    rom = rom.toUpperCase();
  }
  emulator.loadRom(`/rom/${rom}`).then(() => {
    window.requestAnimationFrame(step);
  });
}

main(60);
