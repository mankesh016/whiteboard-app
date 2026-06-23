import { useContext } from "react";
import classNames from "classnames";
import { LuMousePointer, LuRectangleHorizontal } from "react-icons/lu";
import { FaDownload, FaEraser, FaRegCircle } from "react-icons/fa";
import { FaArrowRightLong } from "react-icons/fa6";
import { TbSlash } from "react-icons/tb";
import { PiTextAaBold } from "react-icons/pi";
import { IoBrush } from "react-icons/io5";

import { TOOL_ITEMS } from "../constants";
import BoardContext from "../store/board-context";

const MAIN_TOOLS = [
  { id: TOOL_ITEMS.SELECTION, icon: <LuMousePointer />, title: "Selection" },
  { id: TOOL_ITEMS.BRUSH, icon: <IoBrush />, title: "Brush" },
  { id: TOOL_ITEMS.LINE, icon: <TbSlash />, title: "Line" },
  // prettier-ignore
  { id: TOOL_ITEMS.RECTANGLE, icon: <LuRectangleHorizontal />, title: "Rectangle" },
  { id: TOOL_ITEMS.CIRCLE, icon: <FaRegCircle />, title: "Circle" },
  { id: TOOL_ITEMS.ARROW, icon: <FaArrowRightLong />, title: "Arrow" },
  { id: TOOL_ITEMS.TEXT, icon: <PiTextAaBold />, title: "Text" },
  { id: TOOL_ITEMS.ERASER, icon: <FaEraser />, title: "Eraser" },
];

const handleDownloadClick = () => {
  window.dispatchEvent(new CustomEvent("canvas-download"));
};

function Toolbar() {
  const { activeToolItem, toolClickHandler } = useContext(BoardContext);

  return (
    <>
      <div className="toolbar-container">
        {MAIN_TOOLS.map(({ id, icon, title }) => (
          <ToolButton
            key={id}
            icon={icon}
            isActive={activeToolItem === id}
            onClick={() => toolClickHandler(id)}
            title={title}
          />
        ))}

        <ToolButton
          icon={<FaDownload />}
          onClick={() => handleDownloadClick()}
          title="Download"
        />
      </div>
    </>
  );
}

// prettier-ignore
const ToolButton = ({ icon, onClick, isActive, title, className = "toolbarItem" }) => (
  <div
    className={classNames(className, { active: isActive })}
    onClick={onClick}
    title={title}
  >
    {icon}
  </div>
);

export default Toolbar;
