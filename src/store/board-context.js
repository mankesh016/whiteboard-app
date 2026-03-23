import { createContext } from "react";
const BoardContext = createContext({
  activeToolItem: "",
  toolActionType: "",
  toolClickHandler: () => {},
});

export default BoardContext;
