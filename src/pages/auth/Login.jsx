// ============================================================================
// --- FILE: src/pages/auth/Login.jsx ---
// ============================================================================
import { useStore } from "../../context/StoreContext";
import { useState } from "react";
import { Database, Loader2, ArrowRight } from "lucide-react";
import ACTIONS from "../../context/actions";

const LoginPage = () => {
  const { dispatch } = useStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setLoading(true);
    
    // Simulate API Login Delay
    setTimeout(() => {
      // Simple Role Logic: "admin" in email -> Admin Role
      const role = email.toLowerCase().includes("admin") ? "admin" : "user";
      dispatch({ type: ACTIONS.LOGIN, payload: { email, role } });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl shadow-blue-900/5 w-full max-w-sm border border-gray-100 dark:border-gray-700">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-500/30 text-white">
            <Database className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome Back</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Sign in to access UDISE Portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="name@organization.com"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        {/* Footer Hints */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-center text-gray-400 mb-2">Demo Credentials:</p>
          <div className="flex gap-2 justify-center text-xs font-mono">
            <span 
              onClick={() => setEmail("admin@org.com")} 
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-blue-50"
            >
              admin@org.com
            </span>
            <span 
              onClick={() => setEmail("user@org.com")} 
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-200"
            >
              user@org.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;