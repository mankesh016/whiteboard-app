# 🖊️ Whiteboard App

A feature-rich, interactive whiteboard application built with **React.js** and **Tailwind CSS** — draw shapes, sketch freehand, and export your work, all in the browser.

🔗 **Live Demo:** [whiteboard-app-henna.vercel.app](https://whiteboard-app-henna.vercel.app)

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

| Technology        | Purpose                        |
| ----------------- | ------------------------------ |
| React.js          | UI framework & component logic |
| Tailwind CSS      | Utility-first styling          |
| HTML5 Canvas      | Drawing surface                |
| React Context API | Global state management        |
| Vercel            | Deployment & hosting           |

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

The optimized production build will be in the `build/` folder.

---

## 📁 Project Structure

```
whiteboard-app/
├── public/
└── src/
    ├── components/
    │   ├── Board.js          # Main canvas drawing surface
    │   ├── Toolbar.js        # Top toolbar (tools & actions)
    │   └── Toolbox.js        # Style controls panel
    ├── hooks/
    │   └── useHistory.js     # Stack-based undo/redo hook
    ├── icons/
    ├── store/
    │   ├── board-context.js       # Board state context
    │   ├── BoardProvider.js       # Board context provider
    │   ├── toolbox-context.js     # Toolbox state context
    │   └── ToolboxProvider.js     # Toolbox context provider
    ├── utils/
    │   ├── element.js        # Element creation & rendering helpers
    │   ├── export.js         # Canvas export logic
    │   ├── geometry.js       # Hit detection & geometric helpers
    │   └── math.js           # Math utility functions
    ├── App.js
    └── constants.js          # App-wide constants
```

---

## 🧠 Architecture Highlights

**Undo / Redo via `useHistory`**
History is managed as a stack inside a custom hook. Each draw action pushes a snapshot onto the stack; undo pops it, and redo re-applies it — giving O(1) state transitions without prop drilling.

**Decoupled State with Context API**
Board state (elements, history) and Toolbox state (stroke, fill, roughness, gap) are managed in separate contexts and providers, keeping concerns cleanly separated.

**Geometry & Math Utils**
Hit detection, element bounds, and drawing math are abstracted into `geometry.js` and `math.js`, keeping component code readable and the logic independently testable.

---

## 🌐 Deployment

Deployed on **Vercel** with automatic deployments on every push to `main`.
