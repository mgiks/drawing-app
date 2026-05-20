let brushSize = 10;

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
}

export function getBrushSize() {
  return brushSize;
}
