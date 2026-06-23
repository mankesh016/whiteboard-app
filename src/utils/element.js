import { TOOL_ITEMS } from "../constants";
import { getArrowHeadsCoordinates } from "./math";

export const getRgbaColor = (color, opacity) => {
  if (!color || color === "transparent") return "transparent";
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    let r, g, b;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else {
      return color;
    }
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  if (color.startsWith("rgba")) {
    const parts = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)/);
    if (parts) {
      return `rgba(${parts[1]}, ${parts[2]}, ${parts[3]}, ${opacity})`;
    }
  }
  return color;
};

export const generateElement = (id, x1, y1, x2, y2, type, options, gen) => {
  const newElement = {
    id,
    x1,
    y1,
    x2,
    y2,
    type,
    options,
  };
  options.seed = id + 1;

  if (options.fill !== "transparent") {
    const opacity =
      options.fillOpacity !== undefined ? options.fillOpacity : 60;
    options.fill = getRgbaColor(options.fill, opacity / 100);
  }

  switch (type) {
    case TOOL_ITEMS.LINE: {
      newElement.roughEle = gen.line(x1, y1, x2, y2, options);
      break;
    }
    case TOOL_ITEMS.RECTANGLE: {
      newElement.roughEle = gen.rectangle(x1, y1, x2 - x1, y2 - y1, options);
      break;
    }
    case TOOL_ITEMS.CIRCLE: {
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      newElement.roughEle = gen.ellipse(cx, cy, x2 - x1, y2 - y1, options);
      break;
    }
    case TOOL_ITEMS.ARROW: {
      const { x3, y3, x4, y4 } = getArrowHeadsCoordinates(x1, y1, x2, y2);
      const path = [
        [x1, y1],
        [x2, y2],
        [x3, y3],
        [x2, y2],
        [x4, y4],
      ];
      newElement.roughEle = gen.linearPath(path, options);
      break;
    }
    default:
      throw new Error(
        `Element type "${type}" is not supported by generateElement`,
      );
  }

  return newElement;
};

export function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"],
  );

  d.push("Z");
  return d.join(" ");
}

export const getThemedColor = (color, isDarkMode) => {
  if (!color || color === "transparent") return color;

  const lower = color.toLowerCase();
  const isBlack =
    lower === "#000" ||
    lower === "#000000" ||
    lower === "#212529" ||
    lower === "currentcolor";
  const isWhite = lower === "#fff" || lower === "#ffffff";

  if (isDarkMode) {
    if (isBlack) return "#ffffff";
    if (isWhite) return "#212529";
  } else {
    if (isBlack) return "#212529";
    if (isWhite) return "#ffffff";
  }
  return color;
};
