const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const brushSizeDisplay = document.getElementById("brushSize");
const brushSizeIncrementer = document.getElementById("brushSizeIncrementer");
const brushSizeDecrementer = document.getElementById("brushSizeDecrementer");

let brushSize = 10;
let prevX;
let prevY;

brushSizeIncrementer.addEventListener("click", () => {
  brushSize += 5;
  updateBrushSizeDisplay();
});

brushSizeDecrementer.addEventListener("click", () => {
  if (brushSize <= 5) {
    return;
  }
  brushSize -= 5;
  updateBrushSizeDisplay();
});

const updateBrushSizeDisplay = () => {
  brushSizeDisplay.textContent = brushSize;
};

const drawCircleAtMousePosition = (ev) => {
  const x = ev.offsetX;
  const y = ev.offsetY;
  drawCircle(x, y, brushSize / 2, "red");

  if (prevX !== undefined && prevY !== undefined) {
    drawLine(prevX, prevY, x, y);
  }

  prevX = x;
  prevY = y;
};

const drawCircle = (x, y, radius, color) => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
};

const drawLine = (fromX, fromY, toX, toY) => {
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.lineWidth = brushSize;
  ctx.strokeStyle = "red";
  ctx.stroke();
};

const startDrawing = () => {
  drawCircleAtMousePosition;
  canvas.addEventListener("pointermove", drawCircleAtMousePosition);
};

const stopDrawing = () => {
  prevX = undefined;
  prevY = undefined;
  canvas.removeEventListener("pointermove", drawCircleAtMousePosition);
};

canvas.addEventListener("pointerdown", startDrawing);
canvas.addEventListener("pointerup", stopDrawing);
document.addEventListener("pointerup", stopDrawing);
