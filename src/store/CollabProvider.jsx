import CollabContext from "./collab-context";
import { useCollabSocket } from "../hooks/useCollabSocket";

const CollabProvider = ({ children }) => {
  const collab = useCollabSocket();

  return <CollabContext.Provider value={collab}>{children}</CollabContext.Provider>;
};

export default CollabProvider;
