import Board from "./components/Board";
import Toolbar from "./components/Toolbar";
import Toolbox from "./components/Toolbox";
import CollabUI from "./components/CollabUI";
import PeerCursors from "./components/PeerCursors";
import BoardProvider from "./store/BoardProvider";
import ToolboxProvider from "./store/ToolboxProvider";
import CollabProvider from "./store/CollabProvider";

function App() {
  return (
    <>
      <CollabProvider>
        <BoardProvider>
          <ToolboxProvider>
            <Toolbar />
            <Board />
            <Toolbox />
            <CollabUI />
            <PeerCursors />
          </ToolboxProvider>
        </BoardProvider>
      </CollabProvider>
    </>
  );
}

export default App;
