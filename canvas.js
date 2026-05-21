import { getBrushSize, getBrushColor } from "./brush.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

export function setupCanvas() {
  const drawingManager = {
    currentStrokePoint: {
      parent: null,
      children: [],
      data: [],
      redoIndex: -1,
    },
    addLineDataToCurrentStrokePoint(fromX, fromY, toX, toY) {
      const dataPoint = {
        type: "line",
        fromX: fromX,
        fromY: fromY,
        toX: toX,
        toY: toY,
        color: getBrushColor(),
        lineWidth: getBrushSize(),
      };
      this.currentStrokePoint.data.push(dataPoint);
    },
    addCircleDataToCurrentStrokePoint(x, y) {
      const dataPoint = {
        type: "circle",
        x: x,
        y: y,
        color: getBrushColor(),
        radius: getBrushSize() / 2,
      };
      this.currentStrokePoint.data.push(dataPoint);
    },
    addStrokePoint(type) {
      const child = {
        type: type,
        parent: this.currentStrokePoint,
        children: [],
        data: [],
        redoIndex: -1,
      };
      this.currentStrokePoint.redoIndex++;
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

  // Drawing handling for mobile devices
  canvas.addEventListener("touchstart", (ev) => {
    ev.preventDefault();

    for (const changedTouch of event.changedTouches) {
      const x = changedTouch.offsetX;
      const y = changedTouch.offsetY;
      const color = getBrushColor();
      const brushSize = getBrushSize();
      drawCircle(x, y, brushSize / 2, color);
    }
  });

  [canvas, document].forEach((el) => {
    el.addEventListener("pointerup", (ev) => {
      ev.stopPropagation();
      canvas.removeEventListener("pointermove", drawFunc);
    });
  });

  setupClearButton(drawingManager);
  setupUndoButton(drawingManager);
  setupRedoButton(drawingManager);
  setupResizeCorner(drawingManager);
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
    const brushSize = getBrushSize();
    const color = getBrushColor();

    const lineWidth = brushSize;
    const radius = brushSize / 2;

    drawCircle(x, y, radius, color);

    const prevData = drawingManager.getCurrentDataFromCurrentStrokePoint();

    if (prevData.type === "circle") {
      const prevX = prevData.x;
      const prevY = prevData.y;

      drawLine(prevX, prevY, x, y, lineWidth, color);

      drawingManager.addLineDataToCurrentStrokePoint(prevX, prevY, x, y);
    }

    drawingManager.addCircleDataToCurrentStrokePoint(x, y);
  };
}

function setupUndoButton(drawingManager) {
  const undoButton = document.getElementById("undoButton");

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

function setupRedoButton(drawingManager) {
  const redoButton = document.getElementById("redoButton");

  const redo = () => {
    const children = drawingManager.currentStrokePoint.children;

    if (children.length === 0) {
      return;
    }

    ctx.reset();

    drawingManager.currentStrokePoint =
      drawingManager.currentStrokePoint.children[
        drawingManager.currentStrokePoint.redoIndex
      ];

    drawFromStrokePoint(drawingManager.currentStrokePoint);
  };

  redoButton.addEventListener("click", redo);
}

const drawFromStrokePoint = (lastLeaf) => {
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
};

function setupResizeCorner(drawingManager) {
  const resizeCorner = document.getElementById("resizeCorner");
  const canvas = document.getElementById("canvas");
  const canvasContainer = document.getElementById("canvasContainer");
  const canvasContainerPosition = canvasContainer.getBoundingClientRect();

  resizeCorner.addEventListener("pointerdown", (ev) => {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const startX = ev.pageX;
    const startY = ev.pageY;

    const drag = (ev) => {
      ev.preventDefault();
      const newWidth = canvasWidth + (ev.pageX - startX);
      const newHeight = canvasHeight + (ev.pageY - startY);

      canvasContainer.style.width = newWidth + 2 + "px";
      canvasContainer.style.height = newHeight + 2 + "px";
      canvas.width = newWidth;
      canvas.height = newHeight;

      drawFromStrokePoint(drawingManager.currentStrokePoint);
    };

    const pointerUp = () => {
      document.removeEventListener("pointermove", drag);
      document.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointerup", pointerUp);
    };

    document.addEventListener("pointermove", drag);
    document.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointerup", pointerUp);
  });
}
