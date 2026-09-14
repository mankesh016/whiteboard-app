import { createContext } from "react";

const CollabContext = createContext({
  socketRef: { current: null },
  isConnected: false,
  roomCode: null,
  myUser: null,
  peers: [],
  cursors: {},
  toasts: [],
  join: () => {},
  leave: () => {},
  emitElementAdd: () => {},
  emitElementUpdate: () => {},
  emitElementDelete: () => {},
  emitCursor: () => {},
});

export default CollabContext;
