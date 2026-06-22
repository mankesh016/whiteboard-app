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

export const getHandleAtPosition = (x, y, element) => {
  const { type, x1, y1, x2, y2, points } = element;

  if (type === TOOL_ITEMS.LINE || type === TOOL_ITEMS.ARROW) {
    const isNearStart = distance({ x, y }, { x: x1, y: y1 }) < 8;
    const isNearEnd = distance({ x, y }, { x: x2, y: y2 }) < 8;
    if (isNearStart) return "start";
    if (isNearEnd) return "end";
    return null;
  }

  let minX, maxX, minY, maxY;
  if (type === TOOL_ITEMS.BRUSH) {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    minX = Math.min(...xs);
    maxX = Math.max(...xs);
    minY = Math.min(...ys);
    maxY = Math.max(...ys);
  } else {
    minX = Math.min(x1, x2);
    maxX = Math.max(x1, x2);
    minY = Math.min(y1, y2);
    maxY = Math.max(y1, y2);
  }

  const corners = {
    tl: { x: minX, y: minY },
    tr: { x: maxX, y: minY },
    bl: { x: minX, y: maxY },
    br: { x: maxX, y: maxY },
    t: { x: (minX + maxX) / 2, y: minY },
    b: { x: (minX + maxX) / 2, y: maxY },
    l: { x: minX, y: (minY + maxY) / 2 },
    r: { x: maxX, y: (minY + maxY) / 2 },
  };

  for (const [key, val] of Object.entries(corners)) {
    if (distance({ x, y }, val) < 8) {
      return key;
    }
  }

  return null;
};

export const getCursorForHandle = (handle) => {
  switch (handle) {
    case "tl":
    case "br":
      return "nwse-resize";
    case "tr":
    case "bl":
      return "nesw-resize";
    case "t":
    case "b":
      return "ns-resize";
    case "l":
    case "r":
      return "ew-resize";
    case "start":
    case "end":
      return "move";
    default:
      return "default";
  }
};
