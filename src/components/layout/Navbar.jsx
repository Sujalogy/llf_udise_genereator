import React from "react";
import { Database, LogOut, Sun, Moon } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import ACTIONS from "../../context/actions";
import CONFIG from "../../api/config";

export default function Navbar() {
  const { state, dispatch } = useStore();

  const toggleTheme = () => {
    const newTheme = state.theme === "light" ? "dark" : "light";
    dispatch({ type: ACTIONS.SET_THEME, payload: newTheme });
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");

    // Call logout API
    try {
      await fetch(`${CONFIG.API_BACKEND}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    // Clear local storage
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenExpiry");

    dispatch({ type: ACTIONS.LOGOUT });
  };

  return (
    <nav className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50">
      {/* Brand / Logo Area */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Database className="w-5 h-5" />
        </div>
        <div className="hidden md:block">
          <h1 className="text-lg font-bold leading-none tracking-tight text-gray-900 dark:text-white">
            UDISE Portal
          </h1>
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
            {/* Update this check */}
            {state.user?.role === "admin" || state.user?.role === "super_admin"
              ? "Admin Console"
              : "Data Explorer"}
          </span>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
          title="Toggle Theme"
        >
          {state.theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

        {/* User Profile Info */}
        <div className="flex items-center gap-3 pl-1">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {state.user?.email}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {state.user?.role}
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold border border-indigo-200 dark:border-indigo-800">
            {state.user?.email?.[0].toUpperCase()}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="ml-2 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
