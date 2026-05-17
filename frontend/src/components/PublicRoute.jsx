import { Navigate } from "react-router-dom";
import { getLocalUser } from "../utils/auth";

const PublicRoute = ({ children }) => {
  const user = getLocalUser();

  if (user) {
    return <Navigate to="/chat" replace />;
  }

  return children;
};

export default PublicRoute;