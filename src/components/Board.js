import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import rough from "roughjs";
import {
  BRUSH_STROKE_MULTIPLYER,
  FONT_FAMILIES,
  TOOL_ACTION_TYPES,
  TOOL_ITEMS,
  ELEMENT_SELECT_THRESHOLD,
} from "../constants";
import BoardContext from "../store/board-context";
import ToolboxContext from "../store/toolbox-context";
import { generateElement, getSvgPathFromStroke } from "../utils/element";
import { getStroke } from "perfect-freehand";
import {
  isPointNearElement,
  getHandleAtPosition,
  getCursorForHandle,
} from "../utils/geometry";
import { useHistory } from "../hooks/useHistory";
import { downloadCanvasDrawing } from "../utils/export";
import { LuRedo, LuUndo } from "react-icons/lu";
import WelcomeModal from "./WelcomeModal";
import classNames from "classnames";
import { getFontSize } from "../utils/math";
import ThemeSelector from "./ThemeSelector";

const getResizedElementDetails = (
  clientX,
  clientY,
  handle,
  selectedElement,
) => {
  const { type, x1, y1, x2, y2, points } = selectedElement;

  if (type === TOOL_ITEMS.LINE || type === TOOL_ITEMS.ARROW) {
    if (handle === "start") {
      return { x1: clientX, y1: clientY, x2, y2 };
    } else if (handle === "end") {
      return { x1, y1, x2: clientX, y2: clientY };
    }
    return { x1, y1, x2, y2 };
  }

  let minX, maxX, minY, maxY;
  if (type === TOOL_ITEMS.BRUSH) {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    minX = Math.min(...xs);
    maxX = Math.max(...xs);
    minY = Math.min(...ys);
    maxY = Math.max(...ys);
  } else {
    minX = Math.min(x1, x2);
    maxX = Math.max(x1, x2);
    minY = Math.min(y1, y2);
    maxY = Math.max(y1, y2);
  }

  const width = maxX - minX;
  const height = maxY - minY;

  let newMinX = minX;
  let newMaxX = maxX;
  let newMinY = minY;
  let newMaxY = maxY;

  switch (handle) {
    case "tl":
      newMinX = clientX;
      newMinY = clientY;
      break;
    case "tr":
      newMaxX = clientX;
      newMinY = clientY;
      break;
    case "bl":
      newMinX = clientX;
      newMaxY = clientY;
      break;
    case "br":
      newMaxX = clientX;
      newMaxY = clientY;
      break;
    case "t":
      newMinY = clientY;
      break;
    case "b":
      newMaxY = clientY;
      break;
    case "l":
      newMinX = clientX;
      break;
    case "r":
      newMaxX = clientX;
      break;
    default:
      break;
  }

  if (type === TOOL_ITEMS.BRUSH) {
    let anchorX, anchorY;
    if (handle.includes("l")) anchorX = maxX;
    else if (handle.includes("r")) anchorX = minX;
    else anchorX = minX;

    if (handle.includes("t")) anchorY = maxY;
    else if (handle.includes("b")) anchorY = minY;
    else anchorY = minY;

    const dragWidth =
      handle === "t" || handle === "b" ? width : newMaxX - newMinX;
    const dragHeight =
      handle === "l" || handle === "r" ? height : newMaxY - newMinY;

    const ratioX = width > 0 ? dragWidth / width : 1;
    const ratioY = height > 0 ? dragHeight / height : 1;

    const scaledPoints = points.map((p) => {
      const newX = anchorX + (p.x - anchorX) * ratioX;
      const newY = anchorY + (p.y - anchorY) * ratioY;
      return { x: newX, y: newY };
    });

    return { points: scaledPoints };
  }

  const resX1 = x1 === minX ? newMinX : newMaxX;
  const resX2 = x2 === minX ? newMinX : newMaxX;
  const resY1 = y1 === minY ? newMinY : newMaxY;
  const resY2 = y2 === minY ? newMinY : newMaxY;

  if (type === TOOL_ITEMS.TEXT) {
    const newHeight = Math.abs(resY2 - resY1);
    const strokeWidth = Math.max(1, Math.round(newHeight / 10 - 2));
    return {
      x1: resX1,
      y1: resY1,
      x2: resX2,
      y2: resY2,
      options: {
        ...selectedElement.options,
        strokeWidth,
      },
    };
  }

  return { x1: resX1, y1: resY1, x2: resX2, y2: resY2 };
};

function Board() {
  const { toolboxState } = useContext(ToolboxContext);
  const { activeToolItem } = useContext(BoardContext);
  const canvasRef = useRef();

  const textareaRef = useRef();
  const [actionType, setActionType] = useState(TOOL_ACTION_TYPES.NONE);
  const [elements, setElements, undo, redo, canUndo, canRedo] = useHistory([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [resizeHandle, setResizeHandle] = useState(null);
  const hasMovedRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        if (event.shiftKey) redo();
        else undo();
      } else if ((event.ctrlKey || event.metaKey) && event.key === "y") {
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (actionType === TOOL_ACTION_TYPES.WRITING) {
      setTimeout(() => {
        textarea.focus();
      }, 0);
    }
  }, [actionType]);

  useEffect(() => {
    const handleDownload = () => {
      if (canvasRef.current) {
        downloadCanvasDrawing(canvasRef.current);
      }
    };
    window.addEventListener("canvas-download", handleDownload);
    return () => window.removeEventListener("canvas-download", handleDownload);
  }, []);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const roughCanvas = rough.canvas(canvas);

    context.clearRect(0, 0, canvas.width, canvas.height);
    elements.forEach((el) => {
      if (el.type === TOOL_ITEMS.BRUSH) {
        const stroke = getStroke(el.points, {
          size: el.options.strokeWidth * BRUSH_STROKE_MULTIPLYER,
          thinning: 0.5,
          smoothing: 0.5,
          streamline: 0.5,
        });
        const pathData = getSvgPathFromStroke(stroke);
        const myPath = new Path2D(pathData);
        context.fillStyle = el.options.stroke;
        context.fill(myPath);
      } else if (el.type === TOOL_ITEMS.TEXT) {
        context.textBaseline = "top";
        context.font = `${getFontSize(el.options.strokeWidth)}px ${FONT_FAMILIES.HANDWRITING}`;
        context.fillStyle = el.options.stroke;
        context.fillText(el.text, el.x1, el.y1 + 3);
      } else {
        roughCanvas.draw(el.roughEle);
      }
    });

    if (selectedElementId) {
      const el = elements.find((e) => e.id === selectedElementId);
      if (el) {
        let minX, maxX, minY, maxY;
        if (el.type === TOOL_ITEMS.BRUSH) {
          const xs = el.points.map((p) => p.x);
          const ys = el.points.map((p) => p.y);
          minX = Math.min(...xs);
          maxX = Math.max(...xs);
          minY = Math.min(...ys);
          maxY = Math.max(...ys);
        } else {
          minX = Math.min(el.x1, el.x2);
          maxX = Math.max(el.x1, el.x2);
          minY = Math.min(el.y1, el.y2);
          maxY = Math.max(el.y1, el.y2);
        }

        context.strokeStyle = "#1971c2";
        context.lineWidth = 1.5;
        context.setLineDash([4, 4]);
        context.strokeRect(
          minX - 4,
          minY - 4,
          maxX - minX + 8,
          maxY - minY + 8,
        );
        context.setLineDash([]);

        context.fillStyle = "#ffffff";
        context.strokeStyle = "#1971c2";
        context.lineWidth = 1.5;

        const drawHandle = (x, y) => {
          context.fillRect(x - 4, y - 4, 8, 8);
          context.strokeRect(x - 4, y - 4, 8, 8);
        };

        if (el.type === TOOL_ITEMS.LINE || el.type === TOOL_ITEMS.ARROW) {
          drawHandle(el.x1, el.y1);
          drawHandle(el.x2, el.y2);
        } else {
          const corners = [
            { x: minX, y: minY },
            { x: maxX, y: minY },
            { x: minX, y: maxY },
            { x: maxX, y: maxY },
            { x: (minX + maxX) / 2, y: minY },
            { x: (minX + maxX) / 2, y: maxY },
            { x: minX, y: (minY + maxY) / 2 },
            { x: maxX, y: (minY + maxY) / 2 },
          ];
          corners.forEach((c) => drawHandle(c.x, c.y));
        }
      }
    }
  }, [elements, selectedElementId]);

  const handleMouseDown = (event) => {
    const { clientX, clientY } = event;

    if (activeToolItem === TOOL_ITEMS.SELECTION) {
      if (selectedElementId) {
        const selEl = elements.find((el) => el.id === selectedElementId);
        if (selEl) {
          const handle = getHandleAtPosition(clientX, clientY, selEl);
          if (handle) {
            setActionType(TOOL_ACTION_TYPES.RESIZING);
            setResizeHandle(handle);
            setSelectedElement({
              ...selEl,
              startX: clientX,
              startY: clientY,
            });
            hasMovedRef.current = false;
            return;
          }
        }
      }

      const element = [...elements]
        .reverse()
        .find((el) =>
          isPointNearElement(clientX, clientY, el, ELEMENT_SELECT_THRESHOLD),
        );
      if (element) {
        setSelectedElementId(element.id);
        setSelectedElement({
          ...element,
          startX: clientX,
          startY: clientY,
        });
        setActionType(TOOL_ACTION_TYPES.MOVING);
        hasMovedRef.current = false;
      } else {
        setSelectedElementId(null);
        setSelectedElement(null);
        setActionType(TOOL_ACTION_TYPES.NONE);
      }
      return;
    }

    if (activeToolItem === TOOL_ITEMS.ERASER) {
      setActionType(TOOL_ACTION_TYPES.ERASING);
      const deleteElement = [...elements]
        .reverse()
        .find((element) => isPointNearElement(clientX, clientY, element));

      if (deleteElement) {
        const newState = elements.filter((el) => el.id !== deleteElement.id);
        setElements(newState);
      }
      return;
    }
    if (actionType === TOOL_ACTION_TYPES.WRITING) return;

    const roughCanvas = rough.canvas(canvasRef.current);
    const options = {
      stroke: toolboxState.stroke,
      fill: toolboxState.fill,
      fillOpacity: toolboxState.fillOpacity,
      fillStyle: toolboxState.fillStyle,
      fillWeight: toolboxState.fillWeight,
      hachureGap: toolboxState.hachureGap,
      strokeWidth: toolboxState.strokeWidth,
      roughness: toolboxState.roughness,
    };

    if (activeToolItem === TOOL_ITEMS.TEXT) {
      setActionType(TOOL_ACTION_TYPES.WRITING);
      const newElement = {
        id: Date.now(),
        type: activeToolItem,
        x1: clientX,
        y1: clientY,
        x2: clientX,
        y2: clientY,
        text: "",
        options,
      };
      setElements([...elements, newElement]);
      return;
    }
    setActionType(TOOL_ACTION_TYPES.DRAWING);

    if (activeToolItem === TOOL_ITEMS.BRUSH) {
      const newElement = {
        id: Date.now(),
        type: activeToolItem,
        points: [{ x: clientX, y: clientY }],
        options,
      };
      setElements([...elements, newElement]);
    } else {
      const newElement = generateElement(
        Date.now(),
        clientX,
        clientY,
        clientX,
        clientY,
        activeToolItem,
        options,
        roughCanvas.generator,
      );
      setElements([...elements, newElement]);
    }
  };

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;

    if (
      activeToolItem === TOOL_ITEMS.SELECTION &&
      actionType === TOOL_ACTION_TYPES.NONE
    ) {
      let cursor = "default";
      let hoverElement = null;

      if (selectedElementId) {
        const selEl = elements.find((el) => el.id === selectedElementId);
        if (selEl) {
          const handle = getHandleAtPosition(clientX, clientY, selEl);
          if (handle) {
            cursor = getCursorForHandle(handle);
            hoverElement = selEl;
          } else if (
            isPointNearElement(
              clientX,
              clientY,
              selEl,
              ELEMENT_SELECT_THRESHOLD,
            )
          ) {
            cursor = "move";
            hoverElement = selEl;
          }
        }
      }

      if (!hoverElement) {
        const element = [...elements]
          .reverse()
          .find((el) =>
            isPointNearElement(clientX, clientY, el, ELEMENT_SELECT_THRESHOLD),
          );
        if (element) {
          cursor = "grab";
        }
      }

      event.target.style.cursor = cursor;
    }

    if (actionType === TOOL_ACTION_TYPES.NONE) return;
    if (actionType === TOOL_ACTION_TYPES.WRITING) return;

    if (actionType === TOOL_ACTION_TYPES.RESIZING && selectedElement) {
      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        setElements(elements); // Push current state onto the history stack before resizing
      }

      const resizedDetails = getResizedElementDetails(
        clientX,
        clientY,
        resizeHandle,
        selectedElement,
      );

      const updatedElement = {
        ...selectedElement,
        ...resizedDetails,
      };

      if (
        selectedElement.type !== TOOL_ITEMS.BRUSH &&
        selectedElement.type !== TOOL_ITEMS.TEXT
      ) {
        const roughCanvas = rough.canvas(canvasRef.current);
        const tempElement = generateElement(
          selectedElement.id,
          updatedElement.x1,
          updatedElement.y1,
          updatedElement.x2,
          updatedElement.y2,
          selectedElement.type,
          selectedElement.options,
          roughCanvas.generator,
        );
        updatedElement.roughEle = tempElement.roughEle;
      }

      const copy = [...elements];
      const index = copy.findIndex((el) => el.id === selectedElement.id);
      if (index !== -1) {
        copy[index] = updatedElement;
        setElements(copy, true);
      }
      return;
    }

    if (actionType === TOOL_ACTION_TYPES.MOVING && selectedElement) {
      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        setElements(elements); // Push current state onto the history stack before movement starts
      }

      const dx = clientX - selectedElement.startX;
      const dy = clientY - selectedElement.startY;

      const updatedElement = {
        ...selectedElement,
        x1: selectedElement.x1 + dx,
        y1: selectedElement.y1 + dy,
        x2: selectedElement.x2 + dx,
        y2: selectedElement.y2 + dy,
      };

      if (selectedElement.type === TOOL_ITEMS.BRUSH) {
        updatedElement.points = selectedElement.points.map((p) => ({
          x: p.x + dx,
          y: p.y + dy,
        }));
      } else if (selectedElement.type !== TOOL_ITEMS.TEXT) {
        const roughCanvas = rough.canvas(canvasRef.current);
        const tempElement = generateElement(
          selectedElement.id,
          updatedElement.x1,
          updatedElement.y1,
          updatedElement.x2,
          updatedElement.y2,
          selectedElement.type,
          selectedElement.options,
          roughCanvas.generator,
        );
        updatedElement.roughEle = tempElement.roughEle;
      }

      const copy = [...elements];
      const index = copy.findIndex((el) => el.id === selectedElement.id);
      if (index !== -1) {
        copy[index] = updatedElement;
        setElements(copy, true);
      }
      return;
    }

    if (actionType === TOOL_ACTION_TYPES.ERASING) {
      const deleteElement = [...elements]
        .reverse()
        .find((element) => isPointNearElement(clientX, clientY, element));

      if (deleteElement) {
        const newState = elements.filter((el) => el.id !== deleteElement.id);
        setElements(newState);
      }
      return;
    }

    const index = elements.length - 1;
    const { id, x1, y1, type, options } = elements[index];
    const roughCanvas = rough.canvas(canvasRef.current);

    if (activeToolItem === TOOL_ITEMS.BRUSH) {
      const copy = [...elements];
      copy[index] = {
        ...copy[index],
        points: [...copy[index].points, { x: clientX, y: clientY }],
      };

      setElements(copy, true);
    } else {
      const updatedElement = generateElement(
        id,
        x1,
        y1,
        clientX,
        clientY,
        type,
        options,
        roughCanvas.generator,
      );

      const copy = [...elements];
      copy[index] = updatedElement;

      setElements(copy, true);
    }
  };

  const handleMouseUp = () => {
    if (actionType === TOOL_ACTION_TYPES.WRITING) return;
    else {
      setActionType(TOOL_ACTION_TYPES.NONE);
      setSelectedElement(null);
      setResizeHandle(null);
    }
  };

  const handleOnBlur = (event) => {
    const index = elements.length - 1;
    const text = event.target.value;
    if (text.trim().length > 0) {
      const copy = [...elements];
      copy[index].text = text;

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.textBaseline = "top";
      context.font = `${getFontSize(toolboxState.strokeWidth)}px ${FONT_FAMILIES.HANDWRITING}`;

      const textWidth = context.measureText(text).width;
      const textHeight = getFontSize(toolboxState.strokeWidth);
      copy[index].x2 += textWidth;
      copy[index].y2 += textHeight;
      setElements(copy, true);
    } else {
      setElements(elements.slice(0, -1), true);
    }
    setActionType(TOOL_ACTION_TYPES.NONE);
  };

  const getCursor = () => {
    if (actionType === TOOL_ACTION_TYPES.MOVING) return "move";
    if (actionType === TOOL_ACTION_TYPES.RESIZING && resizeHandle) {
      return getCursorForHandle(resizeHandle);
    }
    if (activeToolItem === TOOL_ITEMS.TEXT) return "text";
    if (activeToolItem === TOOL_ITEMS.ERASER) return "crosshair";
    if (activeToolItem === TOOL_ITEMS.SELECTION) return "default";
    return "crosshair";
  };

  return (
    <>
      {actionType === TOOL_ACTION_TYPES.WRITING && (
        <textarea
          ref={textareaRef}
          placeholder="type something..."
          onBlur={handleOnBlur}
          className="textarea m-0 p-0 outline-none border-none"
          style={{
            position: "fixed",
            top: elements[elements.length - 1]?.y1,
            left: elements[elements.length - 1]?.x1,
            font: `${getFontSize(toolboxState.strokeWidth)}px ${FONT_FAMILIES.HANDWRITING}`,
            resize: "both",
            overflow: "hidden",
            whiteSpace: "pre",
            background: "transparent",
            color: toolboxState.stroke,
            zIndex: 10,
          }}
        />
      )}

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: getCursor() }}
      ></canvas>

      <div className="undo-container">
        <div
          className={classNames("undoItem", { disabled: !canUndo() })}
          onClick={() => undo()}
          disabled={!canUndo}
        >
          <LuUndo />
        </div>
        <div
          className={classNames("undoItem", { disabled: !canRedo() })}
          onClick={() => redo()}
          disabled={!canRedo}
        >
          <LuRedo />
        </div>
      </div>

      <WelcomeModal />
      <ThemeSelector />
    </>
  );
}

export default Board;
