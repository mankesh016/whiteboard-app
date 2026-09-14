import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const TOAST_DURATION_MS = 3800;

export function useCollabSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [myUser, setMyUser] = useState(null); // { id, name, color }
  const [peers, setPeers] = useState([]); // everyone else in the room
  const [cursors, setCursors] = useState({}); // { [userId]: { x, y } }
  const [toasts, setToasts] = useState([]);

  // Remembers the last join() call so a reconnect can re-join automatically
  // (the server forgets us the instant we disconnect - see plan-execute-2.md
  // step 2.8), and so a fresh join() always starts from a clean slate.
  const lastJoinRef = useRef(null);

  const addToast = (text, color, initial) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, text, color, initial }]);
    setTimeout(() => setToasts((t) => t.filter((toast) => toast.id !== id)), TOAST_DURATION_MS);
  };

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      if (lastJoinRef.current) {
        socket.emit("join", lastJoinRef.current);
      }
    });
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("joined", ({ userId, color, peers: initialPeers }) => {
      setMyUser({ id: userId, color, name: lastJoinRef.current?.name });
      setPeers(initialPeers);
      setRoomCode(lastJoinRef.current?.room ?? null);
    });

    socket.on("presence:join", ({ user }) => {
      setPeers((p) => [...p, user]);
      addToast(`${user.name} joined the room`, user.color, user.name[0]?.toUpperCase());
    });

    socket.on("presence:leave", ({ user }) => {
      setPeers((p) => p.filter((u) => u.id !== user.id));
      setCursors((c) => {
        const copy = { ...c };
        delete copy[user.id];
        return copy;
      });
    });

    socket.on("cursor", ({ userId, x, y }) => {
      setCursors((c) => ({ ...c, [userId]: { x, y } }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const join = (room, name) => {
    lastJoinRef.current = { room, name };
    socketRef.current?.emit("join", { room, name });
  };

  // There's no explicit "leave" event on the backend (it only reacts to a
  // real disconnect) - so leaving is done by dropping this connection and
  // opening a fresh one, with lastJoinRef cleared first so the "connect"
  // handler above doesn't immediately auto-rejoin the room we just left.
  const leave = () => {
    lastJoinRef.current = null;
    setRoomCode(null);
    setMyUser(null);
    setPeers([]);
    setCursors({});
    socketRef.current?.disconnect();
    socketRef.current?.connect();
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
    roomCode,
    myUser,
    peers,
    cursors,
    toasts,
    join,
    leave,
    emitElementAdd,
    emitElementUpdate,
    emitElementDelete,
    emitCursor,
  };
}
