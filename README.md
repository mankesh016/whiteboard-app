# 🖊️ Draw - Whiteboard App

A interactive whiteboard application built with **React.js**, **Vite**, and **Tailwind CSS**. Draw shapes, sketch freehand, customize themes, toggle dark mode, export your work, and **collaborate live with others in real time** — all in a polished, fluid interface.

🔗 **Live Demo:** [https://draw.aftercp.com](https://draw.aftercp.com)

> This repo is the **frontend only**. Live collaboration is powered by a separate real-time backend: [`whiteboard-backend`](https://github.com/mankesh016/whiteboard-backend) (Node.js + Socket.IO).

---

## ✨ Features

- 🎨 **Freehand Drawing** — Smooth, canvas-based sketching experience
- 📐 **Shape Tools** — Draw with precision using geometric shape support
- ↩️ **Per-User Undo / Redo** — Undo only ever removes your own last action, even in a shared room
- 🖌️ **Toolbox Controls** — Customize stroke style, fill style, gap, and roughness per element
- 🤝 **Live Collaboration** — Go live or join a room to draw together in real time, with synced cursors and presence
- 🔗 **Shareable Rooms** — Share a room code or link; opening the link jumps straight into joining
- 💾 **Export** — Save your whiteboard as an image file via the export utility
- ⚡ **Context API State Management** — Decoupled board, toolbox, and collaboration state via React Context + Providers
- 📱 **Responsive & Touch-Friendly** — Adapts to narrow screens, and drawing works with touch/pen input, not just a mouse

---

## 🛠️ Tech Stack

| Technology         | Purpose                                          |
| ------------------ | ------------------------------------------------- |
| React.js            | UI library & component logic                       |
| Vite                | Dev server & production build tool                 |
| Tailwind CSS        | Utility-first responsive styling                   |
| HTML5 Canvas        | Drawing surface & graphics rendering               |
| Rough.js            | Hand-drawn/sketchy geometric shapes                |
| Perfect-Freehand    | Artistic brush strokes                             |
| Socket.IO Client    | Real-time sync with the collaboration backend      |
| React Context API   | Decoupled board, toolbox, and collaboration state  |

The real-time backend (Socket.IO + Express) lives in a separate repo: [`whiteboard-backend`](https://github.com/mankesh016/whiteboard-backend), deployed independently on Render.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or above)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/mankesh016/whiteboard-app.git

# Navigate to the project folder
cd whiteboard-app

# Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

Without a backend running, the app still works fully as a local, single-user whiteboard — only "Go live"/"Join a room" need it. To enable live collaboration locally too:

**1. Clone and start the backend** (in a separate folder, outside `whiteboard-app`):

```bash
git clone https://github.com/mankesh016/whiteboard-backend.git
cd whiteboard-backend
npm install
npm run dev
```

This starts the Socket.IO server on `http://localhost:4000`.

**2. Point the frontend at it** — back in `whiteboard-app`, create a `.env.development` file:

```bash
echo "VITE_SOCKET_URL=http://localhost:4000" > .env.development
```

Restart `npm run dev` if it was already running, so Vite picks up the new environment variable.

### Building for Production

```bash
npm run build
```

The optimized production build will be created in the `dist/` folder. Preview it locally with `npm run preview`.

---

## 📁 Project Structure

```
whiteboard-app/
├── public/
└── src/
    ├── components/
    │   ├── Board.jsx            # Main canvas viewport, drawing, and per-user undo/redo
    │   ├── CollabUI.jsx         # Go Live/Join Room flow, share sheet, roster, toasts
    │   ├── PeerCursors.jsx      # Renders other collaborators' live cursors
    │   ├── DarkModeToggle.jsx   # Dark/light mode toggle button
    │   ├── ThemeSelector.jsx    # Base color theme dropdown menu
    │   ├── Toolbar.jsx          # Toolbar (draw/select tools & download)
    │   ├── Toolbox.jsx          # Options panel (styles, sizes, gap)
    │   └── WelcomeModal.jsx     # First-time visitor onboarding card
    ├── hooks/
    │   └── useCollabSocket.js   # Owns the Socket.IO connection, rooms, presence, reconnect
    ├── icons/
    ├── store/
    │   ├── board-context.js     # Board selection context
    │   ├── BoardProvider.jsx    # Board provider wrapper
    │   ├── toolbox-context.js   # Style selections context
    │   ├── ToolboxProvider.jsx  # Style provider wrapper
    │   ├── collab-context.js    # Collaboration state context
    │   └── CollabProvider.jsx   # Collaboration provider wrapper
    ├── utils/
    │   ├── element.js           # Shape generation, rendering & themes
    │   ├── export.js            # PNG export utility
    │   ├── geometry.js          # Bounds, hit testing & resizing
    │   └── math.js               # Arrowhead calculation & formulas
    ├── App.jsx
    └── constants.js             # Key settings and defaults
```

---

## 🧠 Architecture Highlights

1. **Live Collaboration via Socket.IO** — one shared connection, never two

   ```mermaid
   flowchart TD
       CP["CollabProvider"] -->|owns the one connection| Hook(("useCollabSocket()"))
       Hook --> CC["CollabContext"]
       CC -->|drawing events| Board["Board.jsx"]
       CC -->|room · presence · share| UI["CollabUI.jsx"]
   ```

   Both components read the *same* socket through context — the connection is never opened twice.

2. **Per-User Undo / Redo** — Ctrl+Z can't erase someone else's shape

   ```mermaid
   flowchart LR
       Me["Your action"] --> Log["Your undo log"]
       Peer["Peer's action"] --> Board["Shared board"]
       Log -->|"Ctrl+Z reverses"| Board
       Peer -.->|"never enters"| Log
   ```

   Each client keeps a private log of only its own operations, instead of one shared timeline everyone edits.

3. **Decoupled State via Context API** — three contexts, one job each

   ```mermaid
   flowchart TD
       App --> BC["BoardContext<br/>elements"]
       App --> TC["ToolboxContext<br/>stroke · fill · roughness"]
       App --> CC["CollabContext<br/>room · presence · cursors"]
   ```

4. **Geometry & Math Utils** — hit-testing, element bounds, and resize math live in `geometry.js`/`math.js`, out of component code and independently testable.

5. **Dynamic Element Redrawing** — dark mode swaps colors by regenerating `roughEle` at render time rather than mutating stored elements, so undo history stays intact across theme changes.

6. **Freehand Canvas Rendering** — `perfect-freehand` turns brush stroke points into an SVG path, drawn straight into the HTML5 Canvas via `Path2D`.

7. **Touch & Pointer Support** — drawing runs on Pointer Events, not mouse-only events, so the same code handles mouse, touch, and pen input identically.
