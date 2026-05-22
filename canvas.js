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
  setupResizers(drawingManager);
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

const drawFromStrokePoint = (lastLeaf, offsetX, offsetY) => {
  if (
    lastLeaf === null ||
    lastLeaf.type === "clear" ||
    lastLeaf.parent === null
  ) {
    return;
  }

  if (!offsetX) {
    offsetX = 0;
  }

  if (!offsetY) {
    offsetY = 0;
  }

  drawFromStrokePoint(lastLeaf.parent, offsetX, offsetY);

  for (let dataPoint of lastLeaf.data) {
    switch (dataPoint.type) {
      case "circle":
        const x = dataPoint.x + offsetX;
        const y = dataPoint.y + offsetY;
        drawCircle(x, y, dataPoint.radius, dataPoint.color);
        break;
      case "line":
        const fromX = dataPoint.fromX + offsetX;
        const fromY = dataPoint.fromY + offsetY;
        const toX = dataPoint.toX + offsetX;
        const toY = dataPoint.toY + offsetY;
        drawLine(fromX, fromY, toX, toY, dataPoint.lineWidth, dataPoint.color);
        break;
    }
  }
};

const offsetFromStrokePoint = (lastLeaf, offsetX, offsetY) => {
  if (
    lastLeaf === null ||
    lastLeaf.type === "clear" ||
    lastLeaf.parent === null
  ) {
    return;
  }

  if (!offsetX) {
    offsetX = 0;
  }

  if (!offsetY) {
    offsetY = 0;
  }

  offsetFromStrokePoint(lastLeaf.parent, offsetX, offsetY);

  console.log(offsetX);

  for (let dataPoint of lastLeaf.data) {
    switch (dataPoint.type) {
      case "circle":
        const x = dataPoint.x + offsetX;
        const y = dataPoint.y + offsetY;
        dataPoint.x = x;
        dataPoint.y = y;
        break;
      case "line":
        const fromX = dataPoint.fromX + offsetX;
        const fromY = dataPoint.fromY + offsetY;
        const toX = dataPoint.toX + offsetX;
        const toY = dataPoint.toY + offsetY;
        dataPoint.fromX = fromX;
        dataPoint.fromY = fromY;
        dataPoint.toX = toX;
        dataPoint.toY = toY;
        break;
    }
  }
};

function setupResizers(drawingManager) {
  const resizeCornerBottomRight = document.getElementById(
    "resizeCornerBottomRight",
  );
  const resizeCornerTopRight = document.getElementById("resizeCornerTopRight");
  const resizeCornerTopLeft = document.getElementById("resizeCornerTopLeft");
  const resizeCornerBottomLeft = document.getElementById(
    "resizeCornerBottomLeft",
  );
  const canvas = document.getElementById("canvas");
  const canvasContainer = document.getElementById("canvasContainer");

  resizeCornerBottomRight.addEventListener("pointerdown", (ev) => {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const startX = ev.pageX;
    const startY = ev.pageY;

    const drag = (ev) => {
      ev.preventDefault();
      const newWidth = Math.max(canvasWidth + (ev.pageX - startX), 100);
      const newHeight = Math.max(canvasHeight + (ev.pageY - startY), 100);

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

  resizeCornerTopRight.addEventListener("pointerdown", (ev) => {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const startX = ev.pageX;
    const startY = ev.pageY;
    let xDiff = startX;
    let yDiff = startY;

    const canvasContainerTop = window.getComputedStyle(canvasContainer).top;

    const drag = (ev) => {
      ev.preventDefault();
      xDiff = ev.pageX - startX;
      yDiff = startY - ev.pageY;

      const newWidth = Math.max(canvasWidth + xDiff, 100);
      const newHeight = Math.max(canvasHeight + yDiff, 100);

      if (newHeight > 100) {
        canvasContainer.style.top =
          Number.parseInt(canvasContainerTop) + -yDiff + "px";
      }

      canvasContainer.style.width = newWidth + 2 + "px";
      canvasContainer.style.height = newHeight + 2 + "px";

      canvas.width = newWidth;
      canvas.height = newHeight;

      drawFromStrokePoint(drawingManager.currentStrokePoint, 0, yDiff);
    };

    const pointerUp = () => {
      offsetFromStrokePoint(drawingManager.currentStrokePoint, 0, yDiff);
      document.removeEventListener("pointermove", drag);
      document.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointerup", pointerUp);
    };

    document.addEventListener("pointermove", drag);
    document.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointerup", pointerUp);
  });

  resizeCornerTopLeft.addEventListener("pointerdown", (ev) => {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const startX = ev.pageX;
    const startY = ev.pageY;
    let xDiff = startX;
    let yDiff = startY;

    const canvasContainerTop = window.getComputedStyle(canvasContainer).top;
    const canvasContainerLeft = window.getComputedStyle(canvasContainer).left;

    const drag = (ev) => {
      ev.preventDefault();
      xDiff = startX - ev.pageX;
      yDiff = startY - ev.pageY;

      const newWidth = Math.max(canvasWidth + xDiff, 100);
      const newHeight = Math.max(canvasHeight + yDiff, 100);

      if (newHeight > 100) {
        canvasContainer.style.top =
          Number.parseInt(canvasContainerTop) + -yDiff + "px";
      }

      if (newWidth > 100) {
        canvasContainer.style.left =
          Number.parseInt(canvasContainerLeft) + -xDiff + "px";
      }

      canvasContainer.style.width = newWidth + 2 + "px";
      canvasContainer.style.height = newHeight + 2 + "px";

      canvas.width = newWidth;
      canvas.height = newHeight;

      drawFromStrokePoint(drawingManager.currentStrokePoint, xDiff, yDiff);
    };

    const pointerUp = () => {
      offsetFromStrokePoint(drawingManager.currentStrokePoint, xDiff, yDiff);
      document.removeEventListener("pointermove", drag);
      document.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointerup", pointerUp);
    };

    document.addEventListener("pointermove", drag);
    document.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointerup", pointerUp);
  });

  resizeCornerBottomLeft.addEventListener("pointerdown", (ev) => {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const startX = ev.pageX;
    const startY = ev.pageY;
    let xDiff = startX;
    let yDiff = startY;

    const canvasContainerLeft = window.getComputedStyle(canvasContainer).left;

    const drag = (ev) => {
      ev.preventDefault();
      xDiff = startX - ev.pageX;
      yDiff = ev.pageY - startY;

      const newWidth = Math.max(canvasWidth + xDiff, 100);
      const newHeight = Math.max(canvasHeight + yDiff, 100);

      if (newWidth > 100) {
        canvasContainer.style.left =
          Number.parseInt(canvasContainerLeft) + -xDiff + "px";
      }

      canvasContainer.style.width = newWidth + 2 + "px";
      canvasContainer.style.height = newHeight + 2 + "px";

      canvas.width = newWidth;
      canvas.height = newHeight;

      drawFromStrokePoint(drawingManager.currentStrokePoint, xDiff, 0);
    };

    const pointerUp = (ev) => {
      offsetFromStrokePoint(drawingManager.currentStrokePoint, xDiff);
      document.removeEventListener("pointermove", drag);
      document.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointerup", pointerUp);
    };

    document.addEventListener("pointermove", drag);
    document.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointerup", pointerUp);
  });
}
