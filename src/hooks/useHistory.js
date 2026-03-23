import { useState } from "react";

export const useHistory = (initialState) => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState([initialState]);

  const setElements = (newState, overwrite = false) => {
    if (overwrite) {
      setHistory((prev) => {
        const copy = [...prev];
        copy[index] = newState;
        return copy;
      });
    } else {
      const updatedHistory = [...history.slice(0, index + 1), newState];
      setHistory(updatedHistory);
      setIndex(updatedHistory.length - 1);
    }
  };

  const undo = () => index > 0 && setIndex((prev) => prev - 1);
  const redo = () => index + 1 < history.length && setIndex((prev) => prev + 1);

  const canUndo = () => index > 0;
  const canRedo = () => index + 1 < history.length;

  return [history[index], setElements, undo, redo, canUndo, canRedo];
};
