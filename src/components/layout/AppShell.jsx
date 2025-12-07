// ============================================================================
// --- FILE: src/components/layout/AppShell.jsx ---
// ============================================================================
import { useStore } from "../../context/StoreContext";
import AdminDashboard from "../../pages/admin/AdminDashboard";
import UserDashboard from "../../pages/user/UserDashboard";
import LoginPage from "../../pages/auth/Login";
import Navbar from "./Navbar";

const AppShell = () => {
  const { state } = useStore();

  // 1. Authentication Check
  if (!state.user) {
    return <LoginPage />;
  }

  // 2. Main Layout
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors font-sans text-gray-900 dark:text-gray-100 flex flex-col">
      <Navbar />
      
      {/* 3. Role Based Routing */}
      {state.user.role === 'admin' ? (
        <AdminDashboard />
      ) : (
        <UserDashboard />
      )}
    </div>
  );
};
export default AppShell;