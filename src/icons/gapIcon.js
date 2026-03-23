import rough from "roughjs";
import { ICON_SIZE } from "../constants";
import { useMemo } from "react";

const RECT_PROPS = { x: 4, y: 4, width: 16, height: 16 };

const GapIconBase = ({
  fillStyle,
  iconSize = ICON_SIZE,
  hachureGap = 1,
  roughness = 0,
}) => {
  const pathData = useMemo(() => {
    const gen = rough.generator();
    const shape = gen.rectangle(
      RECT_PROPS.x,
      RECT_PROPS.y,
      RECT_PROPS.width,
      RECT_PROPS.height,
      {
        roughness: roughness,
        stroke: "currentColor",
        strokeWidth: 1.2,
        fill: fillStyle === "none" ? undefined : "currentColor",
        fillStyle: fillStyle === "solid" ? "solid" : fillStyle,
        fillWeight: fillStyle === "dots" ? 1 : 0.5,
        hachureGap: hachureGap,
      },
    );

    return gen
      .toPaths(shape)
      .map((p) => ({ d: p.d, fill: p.fill, stroke: p.stroke }));
  }, [fillStyle, hachureGap, roughness]);

  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
      {pathData.map((path, i) => (
        <path
          key={i}
          d={path.d}
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
};

export const GapIcon = ({ gap }) => (
  <GapIconBase fillStyle="dots" hachureGap={gap} />
);
