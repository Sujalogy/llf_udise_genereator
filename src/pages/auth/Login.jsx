// ============================================================================
// --- FILE: src/pages/auth/Login.jsx ---
// ============================================================================
import { useStore } from "../../context/StoreContext";
import { useState } from "react";
import { Database, Loader2, ArrowRight, Mail } from "lucide-react";
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
      let role = "user";
      const lowerEmail = email.toLowerCase();

      // Specific Role Logic
      if (lowerEmail === "sujal@languageandlearningfoundation.org") {
        role = "super_admin"; // Or 'admin' based on your routing
      } else if (lowerEmail.endsWith("@languageandlearningfoundation.org")) {
        role = "user";
      } else if (lowerEmail.includes("admin")) {
        role = "admin"; // Fallback for demo
      }

      dispatch({ type: ACTIONS.LOGIN, payload: { email, role } });
      setLoading(false);
    }, 800);
  };

  const handleGoogleLogin = () => {
    // Mock Google Login
    setEmail("sujal@languageandlearningfoundation.org");
    // Trigger the form submission logic
    document.getElementById("loginForm").requestSubmit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-[400px] border border-white/20">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-white rounded-2xl mb-4 shadow-lg text-indigo-600">
            <Database className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Welcome Back</h1>
          <p className="text-sm font-medium text-gray-500 mt-2">UDISE Data Intelligence Portal</p>
        </div>

        {/* Google Auth Button */}
        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-3 mb-6 shadow-sm group"
        >
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google" 
            className="w-5 h-5"
          />
          <span className="group-hover:text-gray-900">Continue with Google</span>
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-400">Or continue with email</span>
          </div>
        </div>

        {/* Form */}
        <form id="loginForm" onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5 relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium placeholder:text-gray-400"
              placeholder="name@work-email.com"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-gray-900/20 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        {/* Demo Hints */}
        <div className="mt-8 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Developer Access</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <button 
              onClick={() => setEmail("sujal@languageandlearningfoundation.org")} 
              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors"
            >
              Super Admin
            </button>
            <button 
              onClick={() => setEmail("staff@languageandlearningfoundation.org")} 
              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
            >
              Staff User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;