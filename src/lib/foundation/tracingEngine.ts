export interface TracingMetrics {
  validHits: number;
  outOfBoundsHits: number;
  totalDrawn: number;
  accuracy: number;
  coverage: number;
  isPassed: boolean;
  isFailed: boolean;
}

export class TracingEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private dpr: number;

  private pixelBuffer: Uint8ClampedArray | null = null;
  private totalGlyphPixels = 0;
  private validHits = 0;
  private outOfBoundsHits = 0;
  private hitPixelsMap = new Set<number>();

  constructor(canvas: HTMLCanvasElement, width = 280, height = 280) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not acquire 2D context");
    this.ctx = context;

    this.width = width;
    this.height = height;
    this.dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    this.initResolution();
  }

  /**
   * Sets up proper DPI scaling for high-resolution screens
   */
  private initResolution() {
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);
  }

  /**
   * Initializes the offscreen matrix for alpha extraction and draws the user guideline
   */
  public prepareGlyph(char: string) {
    const symbol = char.trim() || "A";

    // 1. Reset Internal Trackers
    this.validHits = 0;
    this.outOfBoundsHits = 0;
    this.hitPixelsMap.clear();

    // 2. Offscreen Rendering for Alpha Extraction (Solid Black)
    const offscreen = document.createElement("canvas");
    offscreen.width = this.width;
    offscreen.height = this.height;
    const offCtx = offscreen.getContext("2d");

    if (offCtx) {
      offCtx.font = "bold 180px Arial, sans-serif";
      offCtx.fillStyle = "#000000";
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.fillText(symbol, this.width / 2, this.height / 2 + 10);

      const imgData = offCtx.getImageData(0, 0, this.width, this.height);
      this.pixelBuffer = imgData.data;

      // Count total glyph pixels for coverage metric computation
      let count = 0;
      for (let i = 3; i < imgData.data.length; i += 4) {
        if (imgData.data[i] > 100) count++;
      }
      this.totalGlyphPixels = count;
    }

    // 3. Clear Visible Canvas and Draw Visual Guideline
    this.resetCanvas(symbol);
  }

  /**
   * Clears user stroke paths while retaining the background guideline
   */
  public resetCanvas(char = "A") {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.font = "bold 180px Arial, sans-serif";
    this.ctx.fillStyle = "#e2e8f0"; // Soft Slate-200 guideline
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(char, this.width / 2, this.height / 2 + 10);

    this.validHits = 0;
    this.outOfBoundsHits = 0;
    this.hitPixelsMap.clear();
  }

  /**
   * Converts mouse or touch events to Canvas-relative coordinates
   */
  public getCoordinates(e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    return {
      x: Math.floor(clientX - rect.left),
      y: Math.floor(clientY - rect.top),
    };
  }

  /**
   * Evaluates pixel offset against the invisible blueprint matrix
   */
  public verifyCoordinate(x: number, y: number): TracingMetrics {
    if (this.pixelBuffer && x >= 0 && x < this.width && y >= 0 && y < this.height) {
      const pixelIndex = (y * this.width + x) * 4;
      const alphaChannel = this.pixelBuffer[pixelIndex + 3];

      if (alphaChannel > 100) {
        this.validHits += 1;
        this.hitPixelsMap.add(pixelIndex);
      } else {
        this.outOfBoundsHits += 1;
      }
    }

    return this.getMetrics();
  }

  /**
   * Draws a stroke line segment on the active canvas
   */
  public drawStrokeSegment(fromX: number, fromY: number, toX: number, toY: number, color = "#22c55e") {
    this.ctx.lineWidth = 18;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.strokeStyle = color;

    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();
  }

  /**
   * Calculates overall scores and pass/fail state
   */
  public getMetrics(): TracingMetrics {
    const totalDrawn = this.validHits + this.outOfBoundsHits;
    const accuracy = totalDrawn > 0 ? Math.round((this.validHits / totalDrawn) * 100) : 0;
    const coverage =
      this.totalGlyphPixels > 0
        ? Math.min(100, Math.round((this.hitPixelsMap.size / (this.totalGlyphPixels * 0.4)) * 100))
        : 0;

    return {
      validHits: this.validHits,
      outOfBoundsHits: this.outOfBoundsHits,
      totalDrawn,
      accuracy,
      coverage,
      isPassed: accuracy >= 65 && coverage >= 70,
      isFailed: this.outOfBoundsHits > this.validHits && totalDrawn > 30,
    };
  }
}