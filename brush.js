let brushSize = 10;
const brushColor = document.getElementById("brushColor");
let color = brushColor.value;

export function setupBrush() {
  const brushSizeDisplay = document.getElementById("brushSize");
  const brushSizeIncrementer = document.getElementById("brushSizeIncrementer");
  const brushSizeDecrementer = document.getElementById("brushSizeDecrementer");

  const updateBrushSizeDisplay = () => {
    brushSizeDisplay.textContent = brushSize;
  };

  brushSizeIncrementer.addEventListener("click", () => {
    brushSize += 5;
    updateBrushSizeDisplay();
  });

  brushSizeDecrementer.addEventListener("click", () => {
    if (brushSize <= 5) return;
    brushSize -= 5;
    updateBrushSizeDisplay();
  });

  brushColor.addEventListener("input", (ev) => {
    color = ev.target.value;
  });
}

export function getBrushSize() {
  return brushSize;
}

export function getBrushColor() {
  return color;
}
