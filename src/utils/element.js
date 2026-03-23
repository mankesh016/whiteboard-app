import { TOOL_ITEMS } from "../constants";
import { getArrowHeadsCoordinates } from "./math";

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
