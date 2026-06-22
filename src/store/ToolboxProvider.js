import { useReducer, useContext } from "react";
import ToolboxContext from "./toolbox-context";
import BoardContext from "./board-context";
import {
  INITIAL_TOOLBOX_STATE,
  TOOLBOX_ACTIONS,
  TOOL_ITEMS,
} from "../constants";

const reducer = (state, action) => {
  const { tool, value } = action.payload;
  const currentToolState = state[tool] || INITIAL_TOOLBOX_STATE;

  switch (action.type) {
    case TOOLBOX_ACTIONS.CHANGE_STROKE: {
      return {
        ...state,
        [tool]: { ...currentToolState, stroke: value },
      };
    }
    case TOOLBOX_ACTIONS.CHANGE_FILL: {
      return {
        ...state,
        [tool]: { ...currentToolState, fill: value },
      };
    }
    case TOOLBOX_ACTIONS.CHANGE_FILL_OPACITY: {
      return {
        ...state,
        [tool]: { ...currentToolState, fillOpacity: value },
      };
    }
    case TOOLBOX_ACTIONS.CHANGE_FILL_STYLE: {
      return {
        ...state,
        [tool]: { ...currentToolState, fillStyle: value },
      };
    }
    case TOOLBOX_ACTIONS.CHANGE_STROKE_WIDTH: {
      return {
        ...state,
        [tool]: { ...currentToolState, strokeWidth: value },
      };
    }
    case TOOLBOX_ACTIONS.CHANGE_ROUGHNESS: {
      return {
        ...state,
        [tool]: { ...currentToolState, roughness: value },
      };
    }
    case TOOLBOX_ACTIONS.CHANGE_GAP: {
      return {
        ...state,
        [tool]: { ...currentToolState, hachureGap: value },
      };
    }

    default:
      return state;
  }
};

const initialToolboxStates = {
  [TOOL_ITEMS.SELECTION]: { ...INITIAL_TOOLBOX_STATE },
  [TOOL_ITEMS.BRUSH]: { ...INITIAL_TOOLBOX_STATE },
  [TOOL_ITEMS.LINE]: { ...INITIAL_TOOLBOX_STATE },
  [TOOL_ITEMS.RECTANGLE]: { ...INITIAL_TOOLBOX_STATE },
  [TOOL_ITEMS.CIRCLE]: { ...INITIAL_TOOLBOX_STATE },
  [TOOL_ITEMS.ARROW]: { ...INITIAL_TOOLBOX_STATE },
  [TOOL_ITEMS.TEXT]: { ...INITIAL_TOOLBOX_STATE },
  [TOOL_ITEMS.ERASER]: { ...INITIAL_TOOLBOX_STATE },
};

const ToolboxProvider = ({ children }) => {
  const { activeToolItem } = useContext(BoardContext);
  const [toolStates, dispatchToolboxAction] = useReducer(
    reducer,
    initialToolboxStates,
  );

  const toolboxState = toolStates[activeToolItem] || INITIAL_TOOLBOX_STATE;

  const changeStroke = (color) => {
    dispatchToolboxAction({
      type: TOOLBOX_ACTIONS.CHANGE_STROKE,
      payload: { tool: activeToolItem, value: color },
    });
  };
  const changeFill = (color) => {
    dispatchToolboxAction({
      type: TOOLBOX_ACTIONS.CHANGE_FILL,
      payload: { tool: activeToolItem, value: color },
    });
  };
  const changeFillOpacity = (opacity) => {
    dispatchToolboxAction({
      type: TOOLBOX_ACTIONS.CHANGE_FILL_OPACITY,
      payload: { tool: activeToolItem, value: opacity },
    });
  };
  const changeFillStyle = (fillStyle) => {
    if (fillStyle === "none") {
      dispatchToolboxAction({
        type: TOOLBOX_ACTIONS.CHANGE_FILL,
        payload: { tool: activeToolItem, value: undefined },
      });
    }
    dispatchToolboxAction({
      type: TOOLBOX_ACTIONS.CHANGE_FILL_STYLE,
      payload: { tool: activeToolItem, value: fillStyle },
    });
  };
  const changeStrokeWidth = (width) => {
    dispatchToolboxAction({
      type: TOOLBOX_ACTIONS.CHANGE_STROKE_WIDTH,
      payload: { tool: activeToolItem, value: width },
    });
  };
  const changeRoughness = (roughness) => {
    dispatchToolboxAction({
      type: TOOLBOX_ACTIONS.CHANGE_ROUGHNESS,
      payload: { tool: activeToolItem, value: roughness },
    });
  };
  const changeGap = (hachureGap) => {
    dispatchToolboxAction({
      type: TOOLBOX_ACTIONS.CHANGE_GAP,
      payload: { tool: activeToolItem, value: hachureGap },
    });
  };

  return (
    <ToolboxContext.Provider
      value={{
        toolboxState,
        changeStroke,
        changeFill,
        changeFillOpacity,
        changeFillStyle,
        changeStrokeWidth,
        changeRoughness,
        changeGap,
      }}
    >
      {children}
    </ToolboxContext.Provider>
  );
};

export default ToolboxProvider;
