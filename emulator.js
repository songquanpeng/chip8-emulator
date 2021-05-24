class Emulator {
  constructor(controller, renderer, speaker, loader) {
    this.constructor = controller;
    this.renderer = renderer;
    this.speaker = speaker;
    this.loader = loader;

    // Reference: https://cjting.me/2020/06/07/chip8-emulator/#spec
    // 4KB memory
    // 0x0 ~ 0x1ff: internal reserved
    // 0x200 ~ 0xe9f: available for program
    // 0xea0 ~ 0xeff: stack
    // 0xf00 ~ 0xfff: video memory
    this.memory = new Uint8Array(4 * 1024);
    // 16 general registers
    this.v = new Uint8Array(16);
    // 16 bit address register
    this.i = 0x000;
    // 8 bit stack pointer
    this.sp = 0;
    // 16 bit program counter
    this.pc = 0x200;
    // 8 bit sound timer
    this.soundTimer = 0;
    // 8 bit delay timer
    this.delayTimer = 0;

    // instructions per step
    this.speed = 20;
    this.paused = false;

    this.loadSprites();
  }

  loadSprites() {}

  loadRom(rom) {}

  execute(opcode) {
    console.log("Execute: ", opcode);
  }

  step() {
    if (!this.paused) {
      for (let i = 0; i < this.speed; i++) {
        let opcode = (this.memory[this.pc] << 8) | this.memory[this.pc + 1];
        this.execute(opcode);
      }
      if (this.delayTimer > 0) this.delayTimer--;
      if (this.soundTimer > 0) this.soundTimer--;
    }
    this.speaker.play();
    this.renderer.render();
  }
}

export default Emulator;
