import { useState } from "react";
import { LuX } from "react-icons/lu";
import { WELCOME_MODAL } from "../constants";

function WelcomeModal() {
  const [showWelcome, setShowWelcome] = useState(
    !localStorage.getItem("whiteboard-welcome-dismissed"),
  );

  const handleDismissWelcome = () => {
    localStorage.setItem("whiteboard-welcome-dismissed", "true");
    setShowWelcome(false);
  };

  if (!showWelcome) return null;

  return (
    <div className="welcome-overlay">
      <div className="welcome-card">
        <button
          onClick={handleDismissWelcome}
          className="welcome-close-btn"
          aria-label={WELCOME_MODAL.CLOSE_ARIA_LABEL}
        >
          <LuX />
        </button>
        <h2 className="welcome-title">{WELCOME_MODAL.TITLE}</h2>
        <p className="welcome-subtitle">{WELCOME_MODAL.SUBTITLE}</p>
        <div className="welcome-features">
          {WELCOME_MODAL.FEATURES.map((feature, idx) => (
            <div className="feature-item" key={idx}>
              <span className="feature-emoji">{feature.EMOJI}</span>
              <div>
                <strong>{feature.TITLE}</strong>
                <p>{feature.DESCRIPTION}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleDismissWelcome}
          className="welcome-get-started-btn"
        >
          {WELCOME_MODAL.BUTTON_TEXT}
        </button>
      </div>
    </div>
  );
}

export default WelcomeModal;
