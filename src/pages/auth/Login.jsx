import { useState, useEffect } from "react";
import { Database, Loader2, Shield } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import ACTIONS from "../../context/actions";

const GOOGLE_CLIENT_ID = "744649436990-ao0of92288tsqgjar4vcfr42p46npc44.apps.googleusercontent.com"; // REPLACE THIS

const LoginPage = () => {
  const { dispatch } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load Google Sign-In SDK
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInButton"),
        { theme: "outline", size: "large", width: 350 }
      );
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    setLoading(true);
    setError(null);

    try {
      const userInfo = parseJwt(response.credential);
      
      const authResponse = await fetch("http://localhost:3000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleToken: response.credential,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          googleId: userInfo.sub
        })
      });

      const data = await authResponse.json();

      if (data.success) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("tokenExpiry", data.expiresAt);
        
        dispatch({ type: ACTIONS.LOGIN, payload: data.user });
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to authenticate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return {};
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-4">
      <div className="bg-white/95 backdrop-blur-sm p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
        
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-5 shadow-xl">
            <Database className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
            UDISE Portal
          </h1>
          <p className="text-sm font-medium text-gray-600">
            Secure Authentication with Google
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          {loading ? (
            <div className="flex items-center justify-center py-3 bg-gray-100 rounded-xl">
              <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
              <span className="ml-2 text-gray-600 font-medium">Authenticating...</span>
            </div>
          ) : (
            <div id="googleSignInButton" className="flex justify-center"></div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-start gap-3 text-xs text-gray-500">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
            <p className="leading-relaxed">
              Your data is protected with enterprise-grade security. Authentication is handled securely through Google OAuth 2.0.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 mb-2">Authorized Email Domain</p>
          <span className="text-[10px] px-2 py-1 bg-purple-50 text-purple-700 rounded font-mono">
            @languageandlearningfoundation.org
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;