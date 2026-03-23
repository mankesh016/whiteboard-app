import { createContext } from "react";
import { INITIAL_TOOLBOX_STATE } from "../constants";

const ToolboxContext = createContext({
  toolboxState: INITIAL_TOOLBOX_STATE,
  changeStroke: () => {},
  changeBackground: () => {},
  changeFill: () => {},
  changeFillStyle: () => {},
  changeStrokeWidth: () => {},
  changeRoughness: () => {},
  changeGap: () => {},
});

export default ToolboxContext;
