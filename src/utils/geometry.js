import {
  ELEMENT_ERASE_THRESHOLD,
  POINT_ERASE_THRESHOLD,
  TOOL_ITEMS,
} from "../constants";

const distance = (a, b) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

export const isPointNearElement = (x, y, element, threshold) => {
  const { type, x1, y1, x2, y2, points } = element;

  switch (type) {
    case TOOL_ITEMS.RECTANGLE:
    case TOOL_ITEMS.CIRCLE:
    case TOOL_ITEMS.TEXT: {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    }

    case TOOL_ITEMS.LINE:
    case TOOL_ITEMS.ARROW: {
      const a = { x: x1, y: y1 };
      const b = { x: x2, y: y2 };
      const c = { x, y };
      const diff = distance(a, b) - (distance(a, c) + distance(b, c));
      const tolerance =
        threshold !== undefined ? threshold : ELEMENT_ERASE_THRESHOLD;
      return Math.abs(diff) < tolerance;
    }

    case TOOL_ITEMS.BRUSH: {
      const tolerance =
        threshold !== undefined ? threshold : POINT_ERASE_THRESHOLD;
      return points.some((p) => distance(p, { x, y }) < tolerance);
    }

    default:
      return false;
  }
};
