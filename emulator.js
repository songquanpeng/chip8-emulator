class Emulator {
  constructor(controller, renderer, speaker, loader) {
    this.controller = controller;
    this.renderer = renderer;
    this.speaker = speaker;
    this.loader = loader;

    // Reference: https://cjting.me/2020/06/07/chip8-emulator/#spec
    // 4KB memory
    this.memory = new Uint8Array(4 * 1024);
    // 0x0 ~ 0x1ff: internal reserved
    // 0x200 ~ 0xe9f: available for program
    // 0xea0 ~ 0xeff: stack
    this.stack = this.memory.subarray(0xea0, 0xf00);
    // 0xf00 ~ 0xfff: video memory
    this.videoMemory = this.memory.subarray(0xf00);
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
    this.waiting = false;
    this.count = 0;

    this.loadSprites();
  }

  loadSprites() {
    const sprites = [
      0xf0,
      0x90,
      0x90,
      0x90,
      0xf0, // 0
      0x20,
      0x60,
      0x20,
      0x20,
      0x70, // 1
      0xf0,
      0x10,
      0xf0,
      0x80,
      0xf0, // 2
      0xf0,
      0x10,
      0xf0,
      0x10,
      0xf0, // 3
      0x90,
      0x90,
      0xf0,
      0x10,
      0x10, // 4
      0xf0,
      0x80,
      0xf0,
      0x10,
      0xf0, // 5
      0xf0,
      0x80,
      0xf0,
      0x90,
      0xf0, // 6
      0xf0,
      0x10,
      0x20,
      0x40,
      0x40, // 7
      0xf0,
      0x90,
      0xf0,
      0x90,
      0xf0, // 8
      0xf0,
      0x90,
      0xf0,
      0x10,
      0xf0, // 9
      0xf0,
      0x90,
      0xf0,
      0x90,
      0x90, // A
      0xe0,
      0x90,
      0xe0,
      0x90,
      0xe0, // B
      0xf0,
      0x80,
      0x80,
      0x80,
      0xf0, // C
      0xe0,
      0x90,
      0x90,
      0x90,
      0xe0, // D
      0xf0,
      0x80,
      0xf0,
      0x80,
      0xf0, // E
      0xf0,
      0x80,
      0xf0,
      0x80,
      0x80, // F
    ];
    for (let i = 0; i < sprites.length; i++) {
      this.memory[i] = sprites[i];
    }
  }

  async loadRom(rom) {
    console.log("Loading rom: ", rom);
    let data = await this.loader.load(rom);
    let program = new Uint8Array(data);
    if (program.length === 0) {
      throw new Error("Program length is zero!");
    }
    if (program.length > 0xea0 - 0x200) {
      throw new Error("Program too large!");
    }
    for (let i = 0; i < program.length; i++) {
      this.memory[0x200 + i] = program[i];
    }
  }

  execute() {
    let opcode = (this.memory[this.pc] << 8) | this.memory[this.pc + 1];
    this.count++;
    // console.log(this.count++, this.pc, "0x" + opcode.toString(16));
    this.pc += 2;
    // *x**
    const x = (opcode >> 8) & 0x0f;
    const vx = this.v[x];
    // **y*
    const y = (opcode >> 4) & 0x0f;
    const vy = this.v[y];
    // ***n
    const n = opcode & 0x000f;
    // **kk
    const kk = opcode & 0x00ff;
    // *nnn
    const nnn = opcode & 0x0fff;
    let temp;
    // Instruction set reference:
    // http://devernay.free.fr/hacks/chip8/C8TECH10.HTM
    // https://github.com/mattmikolay/chip-8/wiki/CHIP%E2%80%908-Instruction-Set
    switch (opcode >> 12) {
      case 0x0:
        switch (opcode) {
          case 0x00e0:
            // Clear the screen.
            this.memory.fill(0, 0xf00);
            break;
          case 0x00ee:
            // Return from a subroutine.
            // The interpreter sets the program counter to the address at the top of the stack,
            // then subtracts 1 from the stack pointer.
            this.pc = this.stack[--this.sp];
            break;
          default:
            // 0x0NNN
            // Execute machine language subroutine at address NNN.
            this.pc = opcode;
            break;
        }
        break;
      case 0x1:
        // 1nnn
        // Jump to location nnn.
        this.pc = opcode & 0x0fff;
        break;
      case 0x2:
        // 2nnn
        // Call subroutine at nnn.
        // The interpreter increments the stack pointer,
        // then puts the current PC on the top of the stack.
        // The PC is then set to nnn.
        this.stack[this.sp++] = this.pc;
        this.pc = opcode & 0x0fff;
        break;
      case 0x3:
        // 3xkk
        // Skip next instruction if Vx = kk.
        if (vx === kk) {
          this.pc += 2;
        }
        break;
      case 0x4:
        // 4xkk
        // Skip next instruction if Vx != kk.
        if (vx !== kk) {
          this.pc += 2;
        }
        break;
      case 0x5:
        // 5xy0
        // Skip next instruction if Vx = Vy.
        if (vx === vy) {
          this.pc += 2;
        }
        break;
      case 0x6:
        // 6xkk
        // Set Vx = kk.
        this.v[x] = kk;
        break;
      case 0x7:
        // 7xkk
        // Set Vx = Vx + kk.
        this.v[x] += kk;
        break;
      case 0x8:
        switch (opcode & 0x000f) {
          case 0x0:
            // 8xy0
            // Set Vx = Vy.
            this.v[x] = vy;
            break;
          case 0x1:
            // 8xy1
            // Set Vx = Vx OR Vy.
            this.v[x] = vx | vy;
            break;
          case 0x2:
            // 8xy2
            // Set Vx = Vx AND Vy.
            this.v[x] = vx & vy;
            break;
          case 0x3:
            // 8xy3
            // Set Vx = Vx XOR Vy.
            this.v[x] = vx ^ vy;
            break;
          case 0x4:
            // 8xy4
            // Set Vx = Vx + Vy, set VF = carry.
            temp = vx + vy;
            this.v[x] = temp & 0xff;
            this.v[0xf] = temp >> 8;
            break;
          case 0x5:
            // 8xy5
            // Set Vx = Vx - Vy, set VF = NOT borrow.
            temp = vx - vy;
            this.v[x] = temp & 0xff;
            this.v[0xf] = vx > vy ? 0x1 : 0x0;
            break;
          case 0x6:
            // 8xy6
            // Set Vx = Vy / 2, set VF = least-significant bit of prior Vy.
            // TODO: conflict! x or y?
            this.v[0xf] = this.v[x] & 0x1;
            this.v[x] = vx >> 1;
            break;
          case 0x7:
            // 8xy7
            // Set Vx = Vy - Vx, set VF = NOT borrow.
            temp = vy - vx;
            this.v[x] = temp & 0xff;
            this.v[0xf] = vx > vy ? 0x0 : 0x1;
            break;
          case 0xe:
            // 8xye
            // Set Vx = Vy * 2, set VF = least-significant bit of prior Vy.
            // TODO: conflict! x or y?
            this.v[0xf] = (this.v[x] >> 7) & 0x1;
            this.v[x] = vx << 1;
            break;
          default:
            console.warn("Unexpected opcode: ", opcode);
            break;
        }
        break;
      case 0x9:
        // 9xy0
        // Skip next instruction if Vx != Vy.
        if (vx !== vy) {
          this.pc += 2;
        }
        break;
      case 0xa:
        // annn
        // Set I = nnn.
        this.i = nnn;
        break;
      case 0xb:
        // bnnn
        // Jump to location nnn + V0.
        this.pc = nnn + this.v[0x0];
        break;
      case 0xc:
        // cxkk
        // Set Vx = random byte AND kk.
        this.v[x] = this.random() & kk;
        break;
      case 0xd:
        // dxyn
        // Display n-byte sprite starting at memory location I at (Vx, Vy),
        // set VF = collision.
        // TODO: make sure nothing wrong here!
        console.log(this.count);
        debugger;
        this.v[0xf] = 0;
        for (let i = 0; i < Math.min(this.renderer.height - vy, n); i++) {
          let spriteByte = this.memory[this.i + i];
          for (let j = 0; j < Math.min(this.renderer.width - vx, 8); j++) {
            if (((spriteByte << j) & 0x80) === 1) {
              let pixelIndex = (vx + j) * this.renderer.width + vy + i;
              let byteIndex = Math.floor(pixelIndex / 8);
              let offset = pixelIndex % 8;
              if ((this.videoMemory[byteIndex] & (0x80 >> offset)) !== 0) {
                // Collision detected.
                this.v[0xf] = 1;
                // Set screen pixel = 0
                this.videoMemory[byteIndex] &= ~(0x80 >> offset);
              } else {
                // Set screen pixel = 1
                this.videoMemory[byteIndex] |= 0x80 >> offset;
              }
            }
          }
        }
        break;
      case 0xe:
        switch (opcode & 0x00ff) {
          case 0x9e:
            // ex9e
            // Skip next instruction if key with the value of Vx is pressed.
            if (this.controller.keystate[vx]) {
              this.pc += 2;
            }
            break;
          case 0xa1:
            // exa1
            // Skip next instruction if key with the value of Vx is not pressed.
            if (!this.controller.keystate[vx]) {
              this.pc += 2;
            }
            break;
          default:
            console.warn("Unexpected opcode: ", opcode);
            break;
        }
        break;
      case 0xf:
        switch (opcode & 0x00ff) {
          case 0x07:
            // fx07
            // Set Vx = delay timer value.
            this.v[x] = this.delayTimer;
            break;
          case 0x0a:
            // fx0a
            // Wait for a key press, store the value of the key in Vx.
            this.waiting = true;
            this.controller.keypressCallback = function (key) {
              this.v[x] = key;
              this.waiting = false;
            }.bind(this);
            break;
          case 0x15:
            // fx15
            // Set delay timer = Vx.
            this.delayTimer = vx;
            break;
          case 0x18:
            // fx18
            // Set sound timer = Vx.
            this.soundTimer = vx;
            break;
          case 0x1e:
            // fx1e
            // Set I = I + Vx.
            this.i += vx;
            break;
          case 0x29:
            // fx29
            // Set I = location of sprite for digit Vx.
            // TODO: why * 5?
            this.i = vx * 5;
            break;
          case 0x33:
            // fx33
            // Store binary-coded decimal (BCD) representation of Vx in memory locations I, I+1, and I+2.
            // T**
            this.memory[this.i] = vx / 100;
            // *T*
            this.memory[this.i + 1] = (vx / 10) % 10;
            // **T
            this.memory[this.i + 2] = vx % 10;
            break;
          case 0x55:
            // fx55
            // Store registers V0 through Vx in memory starting at location I.
            // Notice, conflict here!
            for (let i = 0; i <= x; i++) {
              this.memory[this.i + i] = this.v[this.i];
            }
            break;
          case 0x65:
            // fx55
            // Read registers V0 through Vx from memory starting at location I.
            // Notice, conflict here!
            for (let i = 0; i <= x; i++) {
              this.v[this.i + i] = this.memory[this.i];
            }
            break;
        }
        break;
      default:
        throw new Error("Impossible opcode prefix.");
    }
  }

  step() {
    if (!this.waiting) {
      for (let i = 0; i < this.speed; i++) {
        this.execute();
      }
      if (this.delayTimer > 0) this.delayTimer--;
      if (this.soundTimer > 0) this.soundTimer--;
    }
    this.speaker.play();
    this.renderer.render(this.videoMemory);
  }

  random() {
    return Math.floor(Math.random() * 0xff);
  }
}

export default Emulator;
