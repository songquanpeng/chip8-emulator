class Controller {
  constructor() {
    this.keyMapping = new Map();
    this.setUpKeyMapping();
    this.keypressCallback = null;
    this.keystate = [];
    for (let i = 0; i < 16; i++) {
      this.keystate.push(false);
    }

    document.addEventListener("keydown", (e) => {
      this.keyHandler(e, true);
    });

    document.addEventListener("keyup", (e) => {
      this.keyHandler(e, false);
    });
  }

  setUpKeyMapping() {
    // Basic key mapping
    // 1 2 3 C        1 2 3 4
    // 4 5 6 D   ->   Q W E R
    // 7 8 9 E        A S D F
    // A 0 B F        Z X C V
    this.keyMapping.set("1", 0);
    this.keyMapping.set("2", 1);
    this.keyMapping.set("3", 2);
    this.keyMapping.set("4", 3);
    this.keyMapping.set("q", 4);
    this.keyMapping.set("w", 5);
    this.keyMapping.set("e", 6);
    this.keyMapping.set("r", 7);
    this.keyMapping.set("a", 8);
    this.keyMapping.set("s", 9);
    this.keyMapping.set("d", 10);
    this.keyMapping.set("f", 11);
    this.keyMapping.set("z", 12);
    this.keyMapping.set("x", 13);
    this.keyMapping.set("c", 14);
    this.keyMapping.set("v", 15);
  }

  adjustKeyMapping(rom) {
    switch (rom) {
      case "BLINKY":
        this.keyMapping.set("ArrowUp", 3);
        this.keyMapping.set("ArrowDown", 6);
        this.keyMapping.set("ArrowLeft", 7);
        this.keyMapping.set("ArrowRight", 8);
        break;
      case "TETRIS":
        this.keyMapping.set(" ", 4);
        this.keyMapping.set("ArrowUp", 4);
        this.keyMapping.set("ArrowDown", 7);
        this.keyMapping.set("ArrowLeft", 5);
        this.keyMapping.set("ArrowRight", 6);
        break;
      case "TANK":
        this.keyMapping.set(" ", 5);
        this.keyMapping.set("ArrowUp", 8);
        this.keyMapping.set("ArrowDown", 2);
        this.keyMapping.set("ArrowLeft", 4);
        this.keyMapping.set("ArrowRight", 6);
        break;
    }
  }

  keyHandler(e, value) {
    let i = this.keyMapping.get(e.key);
    if (i) {
      this.keystate[i] = value;
      if (this.keypressCallback) {
        this.keypressCallback(i);
      }
    }
  }
}

export default Controller;
