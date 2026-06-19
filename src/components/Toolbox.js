import { COLORS, TOOL_ITEMS } from "../constants";
import {
  CrossHatchFillIcon,
  DotsFillIcon,
  HachureFillIcon,
  SolidFillIcon,
} from "../icons/fillStyleIcon";
import { StrokeIcon } from "../icons/strokeIcon";
import { LineStyleIcon } from "../icons/roughnessIcon";
import { GapIcon } from "../icons/gapIcon";
import { useContext } from "react";
import ToolboxContext from "../store/toolbox-context";
import BoardContext from "../store/board-context";
import classNames from "classnames";

const TOOLBOX_SECTIONS = {
  strokeColors: [
    { label: "BLACK", value: COLORS.STROKE_BLACK },
    { label: "BLUE", value: COLORS.STROKE_BLUE },
    { label: "RED", value: COLORS.STROKE_RED },
    { label: "GREEN", value: COLORS.STROKE_GREEN },
  ],
  fillColors: [
    { label: "SKYBLUE", value: COLORS.SKYBLUE },
    { label: "YELLOW", value: COLORS.YELLOW },
    { label: "GREEN", value: COLORS.GREEN },
    { label: "TRANSPARENT", value: "transparent" },
  ],
  fillStyles: [
    { id: "dots", icon: <DotsFillIcon />, value: "dots" },
    { id: "cross-hatch", icon: <CrossHatchFillIcon />, value: "cross-hatch" },
    { id: "hachure", icon: <HachureFillIcon />, value: "hachure" },
    { id: "solid", icon: <SolidFillIcon />, value: "solid" },
  ],
  strokeWidths: [
    { id: "small", icon: <StrokeIcon strokeWidth={1} />, value: 1 },
    { id: "medium", icon: <StrokeIcon strokeWidth={2} />, value: 2 },
    { id: "large", icon: <StrokeIcon strokeWidth={3} />, value: 3 },
    { id: "xl", icon: <StrokeIcon strokeWidth={4} />, value: 4 },
    { id: "xxl", icon: <StrokeIcon strokeWidth={5} />, value: 5 },
  ],
  roughnessOptions: [
    { id: "rough-0", icon: <LineStyleIcon roughness={0} />, value: 0 },
    { id: "rough-1", icon: <LineStyleIcon roughness={1} />, value: 1 },
    { id: "rough-2", icon: <LineStyleIcon roughness={2} />, value: 2 },
    { id: "rough-3", icon: <LineStyleIcon roughness={3} />, value: 3 },
  ],
  gapOptions: [
    { id: "gap-1", icon: <GapIcon gap={3} />, value: 15 },
    { id: "gap-2", icon: <GapIcon gap={4} />, value: 25 },
    { id: "gap-3", icon: <GapIcon gap={5} />, value: 35 },
    { id: "gap-4", icon: <GapIcon gap={7} />, value: 45 },
  ],
};

const ColorPickerSection = ({ title, presets, colorValue, onSelect }) => {
  const isCustom = colorValue && !presets.some((p) => p.value === colorValue);
  return (
    <>
      <div className="heading">{title}</div>
      <div className="item-container">
        <div
          className="color-preview"
          style={
            colorValue === "transparent"
              ? {
                  background:
                    "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%)",
                  backgroundSize: "6px 6px",
                }
              : { background: colorValue }
          }
        ></div>

        {presets.map((color) => (
          <div
            key={color.label}
            className={classNames("color-picker", {
              active: colorValue === color.value,
            })}
            onClick={() => onSelect(color.value)}
            style={
              color.value === "transparent"
                ? {
                    background:
                      "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%)",
                    backgroundSize: "6px 6px",
                  }
                : { background: color.value }
            }
          />
        ))}

        <div
          className={classNames("color-picker", {
            active: isCustom,
          })}
          style={{
            opacity: 0.8,
            background:
              "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
          }}
        >
          <input
            type="color"
            style={{ opacity: 0 }}
            onChange={(e) => onSelect(e.target.value)}
            value={colorValue}
          />
        </div>
      </div>
    </>
  );
};

const BoxPickerSection = ({ title, items, currentValue, onSelect }) => (
  <>
    <div className="heading">{title}</div>
    <div className="item-container">
      {items.map((item) => (
        <div
          key={item.id}
          className={classNames("box-picker", {
            active: currentValue === item.value,
          })}
          onClick={() => onSelect(item.value)}
        >
          {item.icon}
        </div>
      ))}
    </div>
  </>
);

function Toolbox() {
  const { activeToolItem } = useContext(BoardContext);
  const {
    toolboxState,
    changeStroke,
    changeFill,
    changeFillOpacity,
    changeFillStyle,
    changeStrokeWidth,
    changeRoughness,
    changeGap,
  } = useContext(ToolboxContext);

  if (activeToolItem === TOOL_ITEMS.ERASER) {
    return null;
  }

  const isShape =
    activeToolItem === TOOL_ITEMS.RECTANGLE ||
    activeToolItem === TOOL_ITEMS.CIRCLE;
  const isLineOrArrow =
    activeToolItem === TOOL_ITEMS.LINE || activeToolItem === TOOL_ITEMS.ARROW;
  const isBrush = activeToolItem === TOOL_ITEMS.BRUSH;
  const isText = activeToolItem === TOOL_ITEMS.TEXT;

  let strokeTitle = "Stroke";
  let strokeWidthTitle = "Stroke Width";

  if (isBrush) {
    strokeTitle = "Brush Color";
    strokeWidthTitle = "Brush Size";
  } else if (isText) {
    strokeTitle = "Text Color";
    strokeWidthTitle = "Font Size";
  }

  const showFill = isShape;
  const showFillStyle = isShape && toolboxState.fill !== "transparent";
  const showRoughness = isShape || isLineOrArrow;
  const showGap =
    isShape &&
    toolboxState.fillStyle !== "none" &&
    toolboxState.fillStyle !== "solid";

  return (
    <>
      <div className={"toolbox-container max-h-[70vh] overflow-auto "}>
        {/* Color Sections */}

        {/* Stroke Color */}
        <ColorPickerSection
          title={strokeTitle}
          presets={TOOLBOX_SECTIONS.strokeColors}
          colorValue={toolboxState.stroke}
          onSelect={changeStroke}
        />

        {/* Fill Color */}
        {showFill && (
          <ColorPickerSection
            title="Fill"
            presets={TOOLBOX_SECTIONS.fillColors}
            colorValue={toolboxState.fill}
            onSelect={changeFill}
          />
        )}

        {/* Box Sections */}

        {/* Fill Style */}
        {showFillStyle && (
          <BoxPickerSection
            title="Fill Style"
            items={TOOLBOX_SECTIONS.fillStyles}
            currentValue={toolboxState.fillStyle}
            onSelect={changeFillStyle}
          />
        )}

        {/* Stroke Width */}
        <BoxPickerSection
          title={strokeWidthTitle}
          items={TOOLBOX_SECTIONS.strokeWidths}
          currentValue={toolboxState.strokeWidth}
          onSelect={changeStrokeWidth}
        />

        {/* Roughness */}
        {showRoughness && (
          <BoxPickerSection
            title="Roughness"
            items={TOOLBOX_SECTIONS.roughnessOptions}
            currentValue={toolboxState.roughness}
            onSelect={changeRoughness}
          />
        )}

        {/* Fill Gap */}
        {showGap && (
          <BoxPickerSection
            title="Fill Gap"
            items={TOOLBOX_SECTIONS.gapOptions}
            currentValue={toolboxState.hachureGap}
            onSelect={changeGap}
          />
        )}

        {/* Fill Opacity Slider */}
        {showFill && toolboxState.fill !== "transparent" && (
          <div className="my-2">
            <div className="heading flex justify-between items-center text-sm">
              <div>Opacity</div>
              <div className="font-semibold text-xs text-gray-600">
                {toolboxState.fillOpacity !== undefined
                  ? toolboxState.fillOpacity
                  : 60}
                %
              </div>
            </div>
            <div className="flex items-center my-1">
              <input
                type="range"
                min="0"
                max="100"
                value={
                  toolboxState.fillOpacity !== undefined
                    ? toolboxState.fillOpacity
                    : 60
                }
                onChange={(e) => changeFillOpacity(Number(e.target.value))}
                className="w-full cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Toolbox;
