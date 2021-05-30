class Renderer {
  constructor(canvasId) {
    // You cannot change width & height!
    this.width = 64;
    this.height = 32;

    this.scale = 20;
    this.fgColor = "#fff";
    this.bgColor = "#000";
    const canvas = document.getElementById(canvasId);
    this.ctx = canvas.getContext("2d");
    this.ctx.canvas.width = this.width * this.scale;
    this.ctx.canvas.height = this.height * this.scale;
  }

  render(videoMemory) {
    // Clear the screen.
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0, 0, this.width * this.scale, this.height * this.scale);
    // Draw pixels.
    this.ctx.fillStyle = this.fgColor;
    for (let i = 0; i < videoMemory.length * 8; i++) {
      let row = Math.floor(i / this.width);
      let col = i % this.width;
      let byteIndex = Math.floor(i / 8);
      let offset = i % 8;
      if ((videoMemory[byteIndex] & (0x80 >> offset)) !== 0) {
        debugger;
        this.ctx.fillRect(
          col * this.scale,
          row * this.scale,
          this.scale,
          this.scale
        );
      }
    }
  }
}

export default Renderer;
