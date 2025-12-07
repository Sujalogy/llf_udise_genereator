// ============================================================================
// --- FILE: src/App.jsx ---
// ============================================================================
import AppShell from "./components/layout/AppShell";
import { StoreProvider } from "./context/StoreContext";

export default function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}