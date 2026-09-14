import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export function useCollabSocket(handlers = {}) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  // Board.jsx passes fresh handler functions on every render (they close
  // over the current `elements`/`setElements`). We only want to connect
  // and register socket.io listeners ONCE, on mount - so instead of
  // re-subscribing every render, we keep the latest handlers in a ref and
  // have the (stable, mount-once) listeners below always call through it.
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("joined", (payload) => handlersRef.current.onJoined?.(payload));
    socket.on("element:add", (element) => handlersRef.current.onElementAdd?.(element));
    socket.on("element:update", (element) => handlersRef.current.onElementUpdate?.(element));
    socket.on("element:delete", (payload) => handlersRef.current.onElementDelete?.(payload));
    socket.on("presence:join", (payload) => handlersRef.current.onPresenceJoin?.(payload));
    socket.on("presence:leave", (payload) => handlersRef.current.onPresenceLeave?.(payload));
    socket.on("cursor", (payload) => handlersRef.current.onCursor?.(payload));

    return () => {
      socket.disconnect();
    };
  }, []);

  const join = (room, name) => {
    socketRef.current?.emit("join", { room, name });
  };

  const emitElementAdd = (element) => {
    socketRef.current?.emit("element:add", element);
  };
  const emitElementUpdate = (element) => {
    socketRef.current?.emit("element:update", element);
  };
  const emitElementDelete = (id) => {
    socketRef.current?.emit("element:delete", { id });
  };
  const emitCursor = (x, y) => {
    socketRef.current?.emit("cursor", { x, y });
  };

  return {
    socketRef,
    isConnected,
    join,
    emitElementAdd,
    emitElementUpdate,
    emitElementDelete,
    emitCursor,
  };
}
