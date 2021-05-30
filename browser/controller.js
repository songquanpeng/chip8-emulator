class Controller {
  constructor() {
    // 1 2 3 C        1 2 3 4
    // 4 5 6 D   ->   Q W E R
    // 7 8 9 E        A S D F
    // A 0 B F        Z X C V
    this.keypressCallback = null;
    this.keystate = [];
    for (let i = 0; i < 16; i++) {
      this.keystate.push(false);
    }
  }
}

export default Controller;
