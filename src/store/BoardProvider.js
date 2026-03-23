import { useReducer } from "react";
import BoardContext from "./board-context";
import { BOARD_ACTIONS, TOOL_ITEMS } from "../constants";

const boardReducer = (state, action) => {
  switch (action.type) {
    case BOARD_ACTIONS.CHANGE_TOOL: {
      return {
        ...state,
        activeToolItem: action.payload.tool,
      };
    }
    default:
      return state;
  }
};

const initialBoardState = {
  activeToolItem: TOOL_ITEMS.LINE,
  toolClickHandler: () => {},
};

const BoardProvider = ({ children }) => {
  const [boardState, dispatchBoardAction] = useReducer(
    boardReducer,
    initialBoardState,
  );

  const toolClickHandler = (tool) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_TOOL,
      payload: {
        tool: tool,
      },
    });
  };

  return (
    <>
      <BoardContext.Provider
        value={{
          activeToolItem: boardState.activeToolItem,
          toolClickHandler: toolClickHandler,
        }}
      >
        {children}
      </BoardContext.Provider>
    </>
  );
};

export default BoardProvider;
