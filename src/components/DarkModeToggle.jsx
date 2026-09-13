import { LuSun, LuMoon } from "react-icons/lu";

function DarkModeToggle({ isDarkMode, setIsDarkMode }) {
  const handleToggle = () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    localStorage.setItem("whiteboard-dark-mode", newVal ? "true" : "false");
    if (newVal) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="dark-mode-toggle-btn"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {isDarkMode ? <LuSun size={20} /> : <LuMoon size={20} />}
    </button>
  );
}

export default DarkModeToggle;
