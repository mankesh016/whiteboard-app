import { useState, useEffect, useRef } from "react";

const THEMES = [
  { id: "theme-yellowish", name: "Yellowish Paper", color: "#faf6eb" },
  { id: "theme-lavender", name: "Lavender Mist", color: "#f2edf7" },
  { id: "theme-sage", name: "Sage Mint", color: "#eef4f0" },
];

function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(
    localStorage.getItem("whiteboard-theme") || "theme-yellowish",
  );
  const menuRef = useRef(null);

  useEffect(() => {
    // Apply active theme class to document body
    THEMES.forEach((t) => document.body.classList.remove(t.id));
    document.body.classList.add(activeTheme);
    localStorage.setItem("whiteboard-theme", activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="theme-selector-container" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="theme-menu-btn"
        aria-label="Select background theme"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {isOpen && (
        <div className="theme-dropdown">
          <div className="theme-dropdown-header">Select Theme</div>
          <div className="theme-options">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  setActiveTheme(theme.id);
                  setIsOpen(false);
                }}
                className={`theme-option ${activeTheme === theme.id ? "active" : ""}`}
              >
                <span
                  className="theme-color-preview"
                  style={{ backgroundColor: theme.color }}
                ></span>
                {theme.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeSelector;
