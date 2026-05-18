const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const pointerPositionDiv = document.getElementById("pointerPosition");
const brushSize = document.getElementById("brushSize");
const brushSizeIncrementer = document.getElementById("brushSizeIncrementer");
const brushSizeDecrementer = document.getElementById("brushSizeDecrementer");

let circleSize = 10;

brushSizeIncrementer.addEventListener("click", () => {
  circleSize += 5;
  updateBrushSizeDisplay();
});

brushSizeDecrementer.addEventListener("click", () => {
  if (circleSize <= 5) {
    return;
  }
  circleSize -= 5;
  updateBrushSizeDisplay();
});

const updateBrushSizeDisplay = () => {
  brushSize.textContent = circleSize;
};

const drawCircleAtMousePosition = (ev) => {
  const x = ev.offsetX;
  const y = ev.offsetY;
  pointerPositionDiv.textContent = `X: ${x}; Y: ${y}`;
  drawCircle(x, y, circleSize, "red");
};

const drawCircle = (x, y, radius, color) => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
};

canvas.addEventListener("click", drawCircleAtMousePosition);

canvas.addEventListener("pointerdown", () => {
  startDrawing();
});

canvas.addEventListener("pointerup", () => {
  stopDrawing();
});

document.addEventListener("pointerup", () => {
  stopDrawing();
});

const startDrawing = () => {
  canvas.addEventListener("pointermove", drawCircleAtMousePosition);
};

const stopDrawing = () => {
  canvas.removeEventListener("pointermove", drawCircleAtMousePosition);
};
