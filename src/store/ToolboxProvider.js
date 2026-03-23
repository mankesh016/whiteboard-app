import { useReducer } from "react";
import ToolboxContext from "./toolbox-context";
import { INITIAL_TOOLBOX_STATE, TOOLBOX_ACTIONS } from "../constants";

const reducer = (state, action) => {
  switch (action.type) {
    case TOOLBOX_ACTIONS.CHANGE_STROKE: {
      return { ...state, stroke: action.payload.value };
    }
    case TOOLBOX_ACTIONS.CHANGE_FILL: {
      return { ...state, fill: action.payload.value };
    }
    case TOOLBOX_ACTIONS.CHANGE_FILL_STYLE: {
      return { ...state, fillStyle: action.payload.value };
    }
    case TOOLBOX_ACTIONS.CHANGE_STROKE_WIDTH: {
      return { ...state, strokeWidth: action.payload.value };
    }
    case TOOLBOX_ACTIONS.CHANGE_ROUGHNESS: {
      return { ...state, roughness: action.payload.value };
    }
    case TOOLBOX_ACTIONS.CHANGE_GAP: {
      return { ...state, hachureGap: action.payload.value };
    }

    default:
      return state;
  }
};

const intialToolboxState = INITIAL_TOOLBOX_STATE;

const ToolboxProvider = ({ children }) => {
  const [toolboxState, dispatchToolboxAction] = useReducer(
    reducer,
    intialToolboxState,
  );

  const changeStroke = (color) => {
    dispatchToolboxAction({
      type: TOOLBOX_ACTIONS.CHANGE_STROKE,
      payload: { value: color },
    });
  };
  const changeFill = (color) => {
    dispatchToolboxAction({
      type: TOOLBOX_ACTIONS.CHANGE_FILL,
      payload: { value: color },
    });
  };
  const changeFillStyle = (fillStyle) => {
    if (fillStyle === "none") {
      dispatchToolboxAction({
        type: TOOLBOX_ACTIONS.CHANGE_FILL,
        payload: { value: undefined },
      });
    }
    dispatchToolboxAction({
      type: TOOLBOX_ACTIONS.CHANGE_FILL_STYLE,
      payload: { value: fillStyle },
    });
  };
  const changeStrokeWidth = (width) => {
    dispatchToolboxAction({
      type: TOOLBOX_ACTIONS.CHANGE_STROKE_WIDTH,
      payload: { value: width },
    });
  };
  const changeRoughness = (roughness) => {
    dispatchToolboxAction({
      type: TOOLBOX_ACTIONS.CHANGE_ROUGHNESS,
      payload: { value: roughness },
    });
  };
  const changeGap = (hachureGap) => {
    dispatchToolboxAction({
      type: TOOLBOX_ACTIONS.CHANGE_GAP,
      payload: { value: hachureGap },
    });
  };

  return (
    <ToolboxContext.Provider
      value={{
        toolboxState,
        changeStroke,
        changeFill,
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
