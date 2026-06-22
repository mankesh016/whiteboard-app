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
  { id: TOOL_ITEMS.SELECTION, icon: <LuMousePointer /> },
  { id: TOOL_ITEMS.BRUSH, icon: <IoBrush /> },
  { id: TOOL_ITEMS.LINE, icon: <TbSlash /> },
  { id: TOOL_ITEMS.RECTANGLE, icon: <LuRectangleHorizontal /> },
  { id: TOOL_ITEMS.CIRCLE, icon: <FaRegCircle /> },
  { id: TOOL_ITEMS.ARROW, icon: <FaArrowRightLong /> },
  { id: TOOL_ITEMS.TEXT, icon: <PiTextAaBold /> },
  { id: TOOL_ITEMS.ERASER, icon: <FaEraser /> },
];

const handleDownloadClick = () => {
  window.dispatchEvent(new CustomEvent("canvas-download"));
};

function Toolbar() {
  const { activeToolItem, toolClickHandler } = useContext(BoardContext);

  return (
    <>
      <div className="toolbar-container">
        {MAIN_TOOLS.map(({ id, icon }) => (
          <ToolButton
            key={id}
            icon={icon}
            isActive={activeToolItem === id}
            onClick={() => toolClickHandler(id)}
          />
        ))}

        <ToolButton
          icon={<FaDownload />}
          onClick={() => handleDownloadClick()}
        />
      </div>
    </>
  );
}

const ToolButton = ({ icon, onClick, isActive, className = "toolbarItem" }) => (
  <div
    className={classNames(className, { active: isActive })}
    onClick={onClick}
  >
    {icon}
  </div>
);

export default Toolbar;
