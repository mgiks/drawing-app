import { getBrushSize } from "./brush.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

export function setupCanvas() {
  const drawingManager = {
    currentStrokePoint: {
      parent: null,
      children: [],
      data: [],
    },
    addLineDataToCurrentStrokePoint(fromX, fromY, toX, toY, brushSize, color) {
      const dataPoint = {
        type: "line",
        fromX: fromX,
        fromY: fromY,
        toX: toX,
        toY: toY,
        color: color,
        lineWidth: brushSize,
      };
      this.currentStrokePoint.data.push(dataPoint);
    },
    addCircleDataToCurrentStrokePoint(x, y, color, brushSize) {
      const dataPoint = {
        type: "circle",
        x: x,
        y: y,
        color: color,
        radius: brushSize / 2,
      };
      this.currentStrokePoint.data.push(dataPoint);
    },
    addStrokePoint(type) {
      const child = {
        type: type,
        parent: this.currentStrokePoint,
        children: [],
        data: [],
      };
      this.currentStrokePoint.children.push(child);
      this.currentStrokePoint = child;
    },
    getCurrentDataFromCurrentStrokePoint() {
      const data = this.currentStrokePoint.data;
      if (data.length < 1) {
        return { type: null };
      }
      return data[data.length - 1];
    },
  };

  const drawFunc = draw(drawingManager);

  canvas.addEventListener("pointerdown", () => {
    drawingManager.addStrokePoint("normal");
    canvas.addEventListener("pointermove", drawFunc);
  });

  [canvas, document].forEach((el) => {
    el.addEventListener("pointerup", (ev) => {
      ev.stopPropagation();
      canvas.removeEventListener("pointermove", drawFunc);
    });
  });

  setupClearButton(drawingManager);
  setupUndoButton(drawingManager);
}

function setupClearButton(drawingManager) {
  const clearCanvasButton = document.getElementById("clearCanvasButton");
  clearCanvasButton.addEventListener("click", () => {
    drawingManager.addStrokePoint("clear");
    ctx.reset();
  });
}

const drawLine = (fromX, fromY, toX, toY, lineWidth, color) => {
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
};

const drawCircle = (x, y, radius, color) => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
};

function draw(drawingManager) {
  let prevX,
    prevY = null;

  return (ev) => {
    const x = ev.offsetX;
    const y = ev.offsetY;
    const color = "red";
    const brushSize = getBrushSize();

    const circleRadius = brushSize / 2;

    drawCircle(x, y, circleRadius, color);

    const prevData = drawingManager.getCurrentDataFromCurrentStrokePoint();

    if (prevData.type === "circle") {
      const prevX = prevData.x;
      const prevY = prevData.y;

      drawLine(prevX, prevY, x, y, brushSize, color);

      drawingManager.addLineDataToCurrentStrokePoint(
        prevX,
        prevY,
        x,
        y,
        brushSize,
        color,
      );
    }

    drawingManager.addCircleDataToCurrentStrokePoint(x, y, color, brushSize);
  };
}

function setupUndoButton(drawingManager) {
  const undoButton = document.getElementById("undoButton");
  let undoOffset = 1;

  const undo = () => {
    if (drawingManager.currentStrokePoint.parent === null) {
      return;
    }

    ctx.reset();

    drawingManager.currentStrokePoint =
      drawingManager.currentStrokePoint.parent;

    drawFromStrokePoint(drawingManager.currentStrokePoint);
  };

  undoButton.addEventListener("click", undo);
}

function drawFromStrokePoint(lastLeaf) {
  if (
    lastLeaf === null ||
    lastLeaf.type === "clear" ||
    lastLeaf.parent === null
  ) {
    return;
  }

  for (let dataPoint of lastLeaf.data) {
    switch (dataPoint.type) {
      case "circle":
        drawCircle(dataPoint.x, dataPoint.y, dataPoint.radius, dataPoint.color);
        break;
      case "line":
        drawLine(
          dataPoint.fromX,
          dataPoint.fromY,
          dataPoint.toX,
          dataPoint.toY,
          dataPoint.lineWidth,
          dataPoint.color,
        );
    }
  }

  drawFromStrokePoint(lastLeaf.parent);
}
