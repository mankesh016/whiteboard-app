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
} from "../constants";
import BoardContext from "../store/board-context";
import ToolboxContext from "../store/toolbox-context";
import { generateElement, getSvgPathFromStroke } from "../utils/element";
import { getStroke } from "perfect-freehand";
import { isPointNearElement } from "../utils/geometry";
import { useHistory } from "../hooks/useHistory";
import { downloadCanvasDrawing } from "../utils/export";
import { LuRedo, LuUndo } from "react-icons/lu";
import classNames from "classnames";
import { getFontSize } from "../utils/math";

function Board() {
  const { toolboxState } = useContext(ToolboxContext);
  const { activeToolItem } = useContext(BoardContext);
  const canvasRef = useRef();

  const textareaRef = useRef();
  const [actionType, setActionType] = useState(TOOL_ACTION_TYPES.NONE);
  const [elements, setElements, undo, redo, canUndo, canRedo] = useHistory([]);

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
  }, [elements]);

  const handleMouseDown = (event) => {
    const { clientX, clientY } = event;

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

    if (actionType === TOOL_ACTION_TYPES.NONE) return;
    if (actionType === TOOL_ACTION_TYPES.WRITING) return;
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
    const { x1, y1, type, options } = elements[index];
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
        index,
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
    else setActionType(TOOL_ACTION_TYPES.NONE);
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
    </>
  );
}

export default Board;
