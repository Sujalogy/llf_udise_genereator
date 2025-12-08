import { useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import ACTIONS from "../../context/actions";
import AdminDashboard from "../../pages/admin/AdminDashboard";
import UserDashboard from "../../pages/user/UserDashboard";
import LoginPage from "../../pages/auth/Login";
import Navbar from "./Navbar";

const AppShell = () => {
  const { state, dispatch } = useStore();

  // CHECK TOKEN ON MOUNT
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");
    const expiry = localStorage.getItem("tokenExpiry");

    if (token && user && expiry) {
      const expiryDate = new Date(expiry);
      if (expiryDate > new Date()) {
        dispatch({ type: ACTIONS.LOGIN, payload: JSON.parse(user) });
      } else {
        // Token expired
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        localStorage.removeItem("tokenExpiry");
      }
    }
  }, [dispatch]);

  if (!state.user) {
    return <LoginPage />;
  }

  const isAdmin = state.user.role === 'super_admin' || state.user.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      {isAdmin ? <AdminDashboard /> : <UserDashboard />}
    </div>
  );
};

export default AppShell;