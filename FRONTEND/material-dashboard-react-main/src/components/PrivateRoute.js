import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuthController } from "context";

function PrivateRoute({ children }) {
  const { user } = useAuthController();

  return user ? children : <Navigate to="/authentication/sign-in" />;
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;
