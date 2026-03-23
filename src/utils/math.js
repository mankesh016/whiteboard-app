import { ARROW_ANGLE, ARROW_LENGTH } from "../constants";

export function getArrowHeadsCoordinates(x1, y1, x2, y2) {
  const angle = Math.atan2(y2 - y1, x2 - x1);

  const x3 = x2 - ARROW_LENGTH * Math.cos(angle - ARROW_ANGLE);
  const y3 = y2 - ARROW_LENGTH * Math.sin(angle - ARROW_ANGLE);

  const x4 = x2 - ARROW_LENGTH * Math.cos(angle + ARROW_ANGLE);
  const y4 = y2 - ARROW_LENGTH * Math.sin(angle + ARROW_ANGLE);

  return { x3, y3, x4, y4 };
}

export function getFontSize(strokeSize) {
  return (strokeSize + 2) * 10;
}
