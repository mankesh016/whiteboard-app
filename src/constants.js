export const TOOL_ITEMS = {
  SELECTION: "SELECTION",
  BRUSH: "BRUSH",
  LINE: "LINE",
  RECTANGLE: "RECTANGLE",
  CIRCLE: "CIRCLE",
  ARROW: "ARROW",
  TEXT: "TEXT",
  ERASER: "ERASER",
};

export const BOARD_ACTIONS = {
  CHANGE_TOOL: "CHANGE_TOOL",
  UNDO: "UNDO",
  REDO: "REDO",
};

export const TOOL_ACTION_TYPES = {
  NONE: "NONE",
  DRAWING: "DRAWING",
  ERASING: "ERASING",
  WRITING: "WRITING",
  MOVING: "MOVING",
  RESIZING: "RESIZING",
};

export const COLORS = {
  BLACK: "#000000",
  WHITE: "#ffffff",

  STROKE_BLACK: "#212529",
  STROKE_RED: "#e03131",
  STROKE_BLUE: "#1971c2",
  STROKE_GREEN: "#2f9e44",
  NONE_GRAY: "#ddd",

  RED: "#ff8787",
  GREEN: "#69db7c",
  BLUE: "#228be6",
  SKYBLUE: "#4dabf7",
  ORANGE: "#ffa94d",
  YELLOW: "#ffd43b",
  PINK: "#f783ac",
};

export const TOOLBOX_ACTIONS = {
  CHANGE_STROKE: "CHANGE_STROKE",
  CHANGE_FILL: "CHANGE_FILL",
  CHANGE_FILL_OPACITY: "CHANGE_FILL_OPACITY",
  CHANGE_FILL_STYLE: "CHANGE_FILL_STYLE",
  CHANGE_STROKE_WIDTH: "CHANGE_STROKE_WIDTH",
  CHANGE_ROUGHNESS: "CHANGE_ROUGHNESS",
  CHANGE_GAP: "CHANGE_GAP",
};

export const INITIAL_TOOLBOX_STATE = {
  stroke: COLORS.STROKE_BLACK,
  fill: "transparent", // transparent
  fillOpacity: 60,
  fillStyle: "solid", // none dots cross-hatch hachure solid
  strokeWidth: 2, // 1 2 3 4 5
  roughness: 1, // 0 1 2 3
  fillWeight: 3, // fixed
  hachureGap: 25, // 15 25 35 45
};

export const INTIIAL_TOOLBAR_ITEM = TOOL_ITEMS.BRUSH;

export const FONT_FAMILIES = {
  HANDWRITING: "Caveat, cursive",
  INDIE: '"Indie Flower", cursive',
  DAUGHTER: '"Architects Daughter", sans-serif',
};

export const ARROW_LENGTH = 20;
export const ARROW_ANGLE = Math.PI / 6;

export const ICON_SIZE = 24;
export const ELEMENT_ERASE_THRESHOLD = 0.5;
export const POINT_ERASE_THRESHOLD = 5;
export const ELEMENT_SELECT_THRESHOLD = 10;
export const BRUSH_STROKE_MULTIPLYER = 4;
