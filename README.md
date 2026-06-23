# 🖊️ Draw - Whiteboard App

A interactive whiteboard application built with **React.js** and **Tailwind CSS**. Draw shapes, sketch freehand, customize themes, toggle dark mode, and export your work — all in a polished, fluid interface.

🔗 **Live Demo:** [https://draw.aftercp.com](https://draw.aftercp.com)

---

## ✨ Features

- 🎨 **Freehand Drawing** — Smooth, canvas-based sketching experience
- 📐 **Shape Tools** — Draw with precision using geometric shape support
- ↩️ **Undo / Redo** — Stack-based history system for reliable multi-step undo and redo
- 🖌️ **Toolbox Controls** — Customize stroke style, fill style, gap, and roughness per element
- 💾 **Export** — Save your whiteboard as an image file via the export utility
- ⚡ **Context API State Management** — Decoupled board and toolbox state via React Context + Providers
- 📱 **Responsive UI** — Clean layout that adapts across screen sizes

---

## 🛠️ Tech Stack

| Technology        | Purpose                              |
| ----------------- | ------------------------------------ |
| React.js          | UI library & component logic         |
| Tailwind CSS      | Utility-first responsive styling     |
| HTML5 Canvas      | Drawing surface & graphics rendering |
| Rough.js          | Hand-drawn/sketchy geometric shapes  |
| Perfect-Freehand  | Artistic brush strokes               |
| React Context API | Decoupled board and toolbox state    |

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
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
```

The optimized production build will be created in the `build/` folder.

---

## 📁 Project Structure

```
whiteboard-app/
├── public/
└── src/
    ├── components/
    │   ├── Board.js            # Main canvas viewport and events
    │   ├── DarkModeToggle.js   # Dark/light mode toggle button
    │   ├── ThemeSelector.js    # Base color theme dropdown menu
    │   ├── Toolbar.js          # Toolbar (draw/select tools & download)
    │   ├── Toolbox.js          # Options panel (styles, sizes, gap)
    │   └── WelcomeModal.js     # First-time visitor onboarding card
    ├── hooks/
    │   └── useHistory.js       # Stack-based undo/redo hook
    ├── icons/
    ├── store/
    │   ├── board-context.js    # Board selection context
    │   ├── BoardProvider.js    # Board provider wrapper
    │   ├── toolbox-context.js  # Style selections context
    │   └── ToolboxProvider.js  # Style provider wrapper
    ├── utils/
    │   ├── element.js          # Shape generation, rendering & themes
    │   ├── export.js           # PNG export utility
    │   ├── geometry.js         # Bounds, hit testing & resizing
    │   └── math.js             # Arrowhead calculation & formulas
    ├── App.js
    └── constants.js            # Key settings and defaults
```

---

## 🧠 Architecture Highlights

**Undo / Redo via `useHistory`**
History is managed as a stack inside a custom hook. Each draw action pushes a snapshot onto the stack; undo pops it, and redo re-applies it — giving O(1) state transitions without prop drilling.

**Decoupled State with Context API**
Board state (elements, history) and Toolbox state (stroke, fill, roughness, gap) are managed in separate contexts and providers, keeping concerns cleanly separated.

**Geometry & Math Utils**
Hit detection, element bounds, and drawing math are abstracted into `geometry.js` and `math.js`, keeping component code readable and the logic independently testable.

**Dynamic Element Redrawing**
To support dark mode color inversion without corrupting drawing history, element shapes (`roughEle`) are generated on-the-fly inside the render pipeline based on the theme context, avoiding state mutations and ensuring smooth transitions.

**Freehand Canvas Rendering**
Integrates `perfect-freehand` stroke point generation and transforms it to Path2D svg paths, rendered directly with smooth HTML5 Canvas context calls.
