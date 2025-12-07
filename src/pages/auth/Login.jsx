// ============================================================================
// --- FILE: src/pages/auth/Login.jsx ---

import { useStore } from "../../context/StoreContext";
import { useState } from "react";
import { Database, Loader2 } from "lucide-react";
import ACTIONS from "../../context/actions";

// ============================================================================
const LoginPage = () => {
  const { dispatch } = useStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setLoading(true);
    // Simple Role Logic based on email domain/text
    const role = email.toLowerCase().includes("admin") ? "admin" : "user";
    setTimeout(() => {
      dispatch({ type: ACTIONS.LOGIN, payload: { email, role } });
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-4">
            <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Sign in to UDISE Portal</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="admin@org.com"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
          </button>
        </form>
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-400">Use <span className="font-mono text-blue-500">admin@org.com</span> for Admin.</p>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;