// ============================================================================
// --- FILE: src/components/layout/AppShell.jsx ---
// ============================================================================
import { Database, LogOut, Moon, Sun } from "lucide-react";
import AdminDashboard from "../../pages/admin/AdminDashboard";
import UserDashboard from "../../pages/user/UserDashboard";
import LoginPage from "../../pages/auth/Login";
import ACTIONS from "../../context/actions";
import { useStore } from "../../context/StoreContext";

const AppShell = () => {
  const { state, dispatch } = useStore();

  if (!state.user) return <LoginPage />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors font-sans text-gray-900 dark:text-gray-100">
      <nav className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/20"><Database className="w-5 h-5" /></div>
          <div className="hidden md:block">
            <h1 className="text-lg font-bold leading-none tracking-tight">UDISE Portal</h1>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{state.user.role === 'admin' ? 'Admin Console' : 'Data Explorer'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => dispatch({ type: ACTIONS.SET_THEME, payload: state.theme === 'light' ? 'dark' : 'light' })} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"><div className="w-5 h-5">{state.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}</div></button>
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
          <div className="flex items-center gap-3 pl-1">
            <div className="text-right hidden sm:block"><div className="text-sm font-medium text-gray-700 dark:text-gray-200">{state.user.email}</div><div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{state.user.role}</div></div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold border border-indigo-200 dark:border-indigo-800">{state.user.email[0].toUpperCase()}</div>
          </div>
          <button onClick={() => dispatch({ type: ACTIONS.LOGOUT })} className="ml-2 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><LogOut className="w-5 h-5" /></button>
        </div>
      </nav>
      {state.user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
    </div>
  );
};
export default AppShell;