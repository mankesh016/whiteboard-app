import { useContext, useEffect, useRef, useState } from "react";
import CollabContext from "../store/collab-context";

const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateRoomCode = () =>
  Array.from({ length: 6 }, () => ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)]).join("");

// Lets people paste a whole share link into the code field instead of
// hunting for just the code. Tries the `?room=` query param first (our own
// share links use that), then falls back to the last path segment (in case
// the link is shaped like `.../r/ABC123`), then finally just treats the
// input as a plain code someone typed by hand.
const extractRoomCode = (raw) => {
  const trimmed = raw.trim();
  try {
    const url = new URL(trimmed);
    const fromQuery = url.searchParams.get("room");
    if (fromQuery) return fromQuery.toUpperCase().slice(0, 6);

    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length) return segments[segments.length - 1].toUpperCase().slice(0, 6);
  } catch {
    // Not a full URL - fall through and treat it as a plain code.
  }
  return trimmed
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
};

function CollabUI() {
  const { roomCode, myUser, peers, toasts, join, leave } = useContext(CollabContext);

  const [modal, setModal] = useState(null); // null | "name" | "code" | "share"
  const [intent, setIntent] = useState(null); // "host" | "join"
  const [pendingRoomCode, setPendingRoomCode] = useState(null);
  const [inputName, setInputName] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const nameInputRef = useRef(null);
  const codeInputRef = useRef(null);

  const isLive = !!roomCode;
  const displayRoomCode = roomCode || pendingRoomCode;
  const allPeople = myUser ? [{ ...myUser, isYou: true }, ...peers] : peers;
  const shown = allPeople.slice(0, 3);
  const overflow = allPeople.length - shown.length;

  const focusSoon = (ref) => setTimeout(() => ref.current?.focus(), 60);

  const startGoLive = () => {
    setIntent("host");
    setModal("name");
    setInputName("");
    focusSoon(nameInputRef);
  };

  const startJoin = () => {
    setIntent("join");
    setModal("code");
    setInputCode("");
    setCodeError("");
    focusSoon(codeInputRef);
  };

  // A share link (`?room=CODE`) has already done the "click Join a room,
  // type the code" part for whoever opens it - so skip straight to asking
  // for their name instead of making them re-enter a code they didn't type.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get("room");
    if (!roomFromUrl) return;

    const code = extractRoomCode(roomFromUrl);

    // Clean the URL immediately so a later refresh doesn't keep re-opening
    // this modal, and the address bar stops advertising the room code the
    // moment we've captured it.
    params.delete("room");
    const query = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (query ? `?${query}` : "") + window.location.hash);

    if (code.length !== 6) return;

    setIntent("join");
    setPendingRoomCode(code);
    setModal("name");
    focusSoon(nameInputRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitCode = () => {
    const code = inputCode.trim().toUpperCase();
    if (code.length < 6) {
      setCodeError("Room codes are 6 characters.");
      return;
    }
    setPendingRoomCode(code);
    setModal("name");
    focusSoon(nameInputRef);
  };

  const submitName = () => {
    const name = inputName.trim();
    if (!name) return;

    if (intent === "host") {
      const code = generateRoomCode();
      setPendingRoomCode(code);
      join(code, name);
      setModal("share");
    } else {
      join(pendingRoomCode, name);
      setModal(null);
    }
  };

  const shareLink = `${window.location.origin}/?room=${displayRoomCode}`;

  const copyCode = () => {
    navigator.clipboard?.writeText(displayRoomCode ?? "").catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(shareLink).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1800);
  };

  return (
    <>
      <div className="collab-bar">
        {!isLive && (
          <>
            <button className="collab-btn-primary" onClick={startGoLive}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
              Go live
            </button>
            <button className="collab-btn-secondary" onClick={startJoin}>
              Join a room
            </button>
          </>
        )}

        {isLive && (
          <div className="collab-live-cluster">
            <span className="collab-live-dot" />
            <span className="collab-live-label">Live</span>
            <div className="collab-divider" />
            <div style={{ display: "flex", alignItems: "center" }}>
              {shown.map((p, i) => (
                <div
                  key={p.id}
                  className="collab-avatar"
                  style={{ background: p.color, marginLeft: i === 0 ? 0 : -6 }}
                  title={p.isYou ? `${p.name} (you)` : p.name}
                >
                  {p.name?.[0]?.toUpperCase()}
                </div>
              ))}
              {overflow > 0 && <div className="collab-avatar-overflow">+{overflow}</div>}
            </div>
            <button className="collab-share-btn" onClick={() => setModal("share")}>
              Share
            </button>
            <button className="collab-menu-btn" title="Room options" onClick={() => setMenuOpen((m) => !m)}>
              <span />
              <span />
              <span />
            </button>
          </div>
        )}
      </div>

      {menuOpen && isLive && (
        <div className="roster-menu">
          <div className="roster-heading">
            <span className="roster-heading-label">In this room</span>
            <span className="roster-heading-count">{allPeople.length}</span>
          </div>
          <div className="roster-list">
            {allPeople.map((p) => (
              <div key={p.id} className="roster-item">
                <div className="roster-item-avatar" style={{ background: p.color }}>
                  {p.name?.[0]?.toUpperCase()}
                </div>
                <span className="roster-item-label">{p.name}</span>
                {p.isYou && <span className="roster-item-tag">YOU</span>}
              </div>
            ))}
          </div>
          <div className="roster-footer">
            <button
              className="roster-leave-btn"
              onClick={() => {
                leave();
                setMenuOpen(false);
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6.2 13.2H3.4a1 1 0 0 1-1-1V3.8a1 1 0 0 1 1-1h2.8" />
                <path d="M10.4 11.2 13.6 8l-3.2-3.2" />
                <path d="M13.6 8H6.2" />
              </svg>
              Leave room
            </button>
          </div>
        </div>
      )}

      <div className="collab-toasts">
        {toasts.map((t) => (
          <div key={t.id} className="collab-toast">
            <div className="collab-toast-avatar" style={{ background: t.color }}>
              {t.initial}
            </div>
            <span className="collab-toast-text">{t.text}</span>
          </div>
        ))}
      </div>

      {modal && (
        <div className="collab-modal-overlay" onClick={() => setModal(null)}>
          <div className="collab-modal-card" onClick={(e) => e.stopPropagation()}>
            {modal === "name" && (
              <>
                <div className="collab-modal-title">{intent === "host" ? "Go live" : "Almost in"}</div>
                <div className="collab-modal-subtitle">
                  {intent === "host"
                    ? "Your name shows on your cursor so collaborators know who is drawing."
                    : `Room ${pendingRoomCode} found. What should we call you?`}
                </div>
                <input
                  ref={nameInputRef}
                  className="collab-modal-input"
                  placeholder="Your name"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitName()}
                />
                <div className="collab-modal-actions">
                  <button className="collab-modal-btn-secondary" onClick={() => setModal(null)}>
                    Cancel
                  </button>
                  <button
                    className="collab-modal-btn-primary"
                    style={{ background: inputName.trim() ? "#2f7f58" : "rgba(44,42,30,0.28)" }}
                    onClick={submitName}
                  >
                    {intent === "host" ? "Create room" : "Join room"}
                  </button>
                </div>
              </>
            )}

            {modal === "code" && (
              <>
                <div className="collab-modal-title">Join a room</div>
                <div className="collab-modal-subtitle">Enter the 6-character code or paste a link of the room.</div>
                <input
                  ref={codeInputRef}
                  className="collab-modal-input collab-modal-code-input"
                  placeholder="ABC123"
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(extractRoomCode(e.target.value));
                    setCodeError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && submitCode()}
                />
                <div className="collab-modal-error">{codeError}</div>
                <div className="collab-modal-actions">
                  <button className="collab-modal-btn-secondary" onClick={() => setModal(null)}>
                    Cancel
                  </button>
                  <button
                    className="collab-modal-btn-primary"
                    style={{ background: inputCode.trim().length === 6 ? "#2f7f58" : "rgba(44,42,30,0.28)" }}
                    onClick={submitCode}
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {modal === "share" && (
              <>
                <div className="collab-share-header">
                  <span className="collab-live-dot" />
                  <span className="collab-live-label">Room is live</span>
                  <button className="collab-share-close" title="Close" onClick={() => setModal(null)}>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    >
                      <path d="M3.2 3.2l7.6 7.6M10.8 3.2l-7.6 7.6" />
                    </svg>
                  </button>
                </div>

                <div className="collab-share-body">
                  <div className="collab-modal-title">Share your board</div>
                  <div className="collab-modal-subtitle">Anyone with the code or link can draw here with you.</div>

                  <div className="collab-share-field-label">Room code</div>
                  <div className="collab-share-code">{displayRoomCode}</div>

                  <div className="collab-share-link">{shareLink}</div>

                  <div className="collab-share-copy-row">
                    <button className={`collab-copy-btn${copiedCode ? " is-copied" : ""}`} onClick={copyCode}>
                      {copiedCode ? "✓ Code copied" : "⧉ Copy code"}
                    </button>
                    <button
                      className={`collab-copy-btn is-primary${copiedLink ? " is-copied" : ""}`}
                      onClick={copyLink}
                    >
                      {copiedLink ? "✓ Link copied" : "⧉ Copy link"}
                    </button>
                  </div>
                </div>

                <button className="collab-share-back-btn" onClick={() => setModal(null)}>
                  Back to the board
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="collab-status-line">
        {isLive
          ? `Live · ${allPeople.length} ${allPeople.length === 1 ? "person" : "people"} in room ${roomCode}`
          : "Offline · drawings stay on this device"}
      </div>
    </>
  );
}

export default CollabUI;
