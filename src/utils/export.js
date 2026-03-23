import { COLORS } from "../constants";

export const downloadCanvasDrawing = (canvas) => {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCanvas.height = canvas.height;
  tempCanvas.width = canvas.width;

  tempCtx.fillStyle = COLORS.WHITE;
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  tempCtx.drawImage(canvas, 0, 0);

  const btn = document.createElement("a");
  btn.download = "my-drawing";
  btn.href = tempCanvas.toDataURL("image/jpg", 1.0);
  btn.click();
};
