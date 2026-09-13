import { useMemo } from "react";
import rough from "roughjs/bundled/rough.esm.js";
import { ICON_SIZE } from "../constants";

export const LineStyleIcon = ({
  strokeWidth = 1.5,
  iconSize = ICON_SIZE,
  roughness = 1,
  color = "currentColor",
}) => {
  const pathData = useMemo(() => {
    const generator = rough.generator();
    const x1 = 4;
    const y1 = 12;
    const x2 = 20;
    const y2 = 12;
    const lineShape = generator.line(x1, y1, x2, y2, {
      roughness: roughness,
      strokeWidth: 1,
      disableMultiStroke: roughness < 2,
    });
    return generator
      .toPaths(lineShape)
      .map((p) => p.d)
      .join(" ");
  }, [roughness]);

  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={pathData} />
    </svg>
  );
};
