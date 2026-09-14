import { useContext } from "react";
import CollabContext from "../store/collab-context";

function PeerCursors() {
  const { peers, cursors } = useContext(CollabContext);

  return (
    <>
      {peers.map((peer) => {
        const pos = cursors[peer.id];
        if (!pos) return null;
        return (
          <div key={peer.id} className="peer-cursor" style={{ left: pos.x, top: pos.y }}>
            <div className="peer-cursor-arrow" style={{ borderLeft: `9px solid ${peer.color}` }} />
            <div className="peer-cursor-label" style={{ background: peer.color }}>
              {peer.name}
            </div>
          </div>
        );
      })}
    </>
  );
}

export default PeerCursors;
