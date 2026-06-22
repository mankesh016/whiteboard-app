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

export const getResizedElementDetails = (
  clientX,
  clientY,
  handle,
  selectedElement,
) => {
  const { type, x1, y1, x2, y2, points } = selectedElement;

  if (type === TOOL_ITEMS.LINE || type === TOOL_ITEMS.ARROW) {
    if (handle === "start") {
      return { x1: clientX, y1: clientY, x2, y2 };
    } else if (handle === "end") {
      return { x1, y1, x2: clientX, y2: clientY };
    }
    return { x1, y1, x2, y2 };
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

  const width = maxX - minX;
  const height = maxY - minY;

  let newMinX = minX;
  let newMaxX = maxX;
  let newMinY = minY;
  let newMaxY = maxY;

  switch (handle) {
    case "tl":
      newMinX = clientX;
      newMinY = clientY;
      break;
    case "tr":
      newMaxX = clientX;
      newMinY = clientY;
      break;
    case "bl":
      newMinX = clientX;
      newMaxY = clientY;
      break;
    case "br":
      newMaxX = clientX;
      newMaxY = clientY;
      break;
    case "t":
      newMinY = clientY;
      break;
    case "b":
      newMaxY = clientY;
      break;
    case "l":
      newMinX = clientX;
      break;
    case "r":
      newMaxX = clientX;
      break;
    default:
      break;
  }

  if (type === TOOL_ITEMS.BRUSH) {
    let anchorX, anchorY;
    if (handle.includes("l")) anchorX = maxX;
    else if (handle.includes("r")) anchorX = minX;
    else anchorX = minX;

    if (handle.includes("t")) anchorY = maxY;
    else if (handle.includes("b")) anchorY = minY;
    else anchorY = minY;

    const dragWidth =
      handle === "t" || handle === "b" ? width : newMaxX - newMinX;
    const dragHeight =
      handle === "l" || handle === "r" ? height : newMaxY - newMinY;

    const ratioX = width > 0 ? dragWidth / width : 1;
    const ratioY = height > 0 ? dragHeight / height : 1;

    const scaledPoints = points.map((p) => {
      const newX = anchorX + (p.x - anchorX) * ratioX;
      const newY = anchorY + (p.y - anchorY) * ratioY;
      return { x: newX, y: newY };
    });

    return { points: scaledPoints };
  }

  const resX1 = x1 === minX ? newMinX : newMaxX;
  const resX2 = x2 === minX ? newMinX : newMaxX;
  const resY1 = y1 === minY ? newMinY : newMaxY;
  const resY2 = y2 === minY ? newMinY : newMaxY;

  if (type === TOOL_ITEMS.TEXT) {
    const newHeight = Math.abs(resY2 - resY1);
    const strokeWidth = Math.max(1, Math.round(newHeight / 10 - 2));
    return {
      x1: resX1,
      y1: resY1,
      x2: resX2,
      y2: resY2,
      options: {
        ...selectedElement.options,
        strokeWidth,
      },
    };
  }

  return { x1: resX1, y1: resY1, x2: resX2, y2: resY2 };
};
