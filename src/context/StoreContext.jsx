// ============================================================================
// --- FILE: src/context/StoreContext.jsx ---
// ============================================================================
import { createContext, useContext, useReducer, useEffect } from 'react';
import ACTIONS from './actions';

const initialState = {
  user: null, // { email, role: 'admin' | 'user' }
  theme: 'light',
  
  // --- Cache Layer (Reduces API Load) ---
  filters: {}, // Stores State -> District mapping
  dataCache: {}, // Stores table data by key "State_District1-District2"
  
  // --- User Selection ---
  selectedState: null,
  selectedDistricts: [],
  
  // --- UI State ---
  loading: false,
  error: null,
  sidebarOpen: true,
};

function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOGIN:
      return { ...state, user: action.payload };
    case ACTIONS.LOGOUT:
      return { ...initialState, theme: state.theme };
    case ACTIONS.SET_THEME:
      return { ...state, theme: action.payload };
    case ACTIONS.SET_FILTERS:
      return { ...state, filters: action.payload };
    case ACTIONS.SELECT_STATE:
      return { 
        ...state, 
        selectedState: action.payload, 
        selectedDistricts: [], // Clear districts when state changes
      };
    case ACTIONS.TOGGLE_DISTRICT:
      const district = action.payload;
      const current = state.selectedDistricts;
      const updated = current.includes(district)
        ? current.filter(d => d !== district)
        : [...current, district];
      return { ...state, selectedDistricts: updated };
    case ACTIONS.CACHE_DATA:
      // Store data in cache to avoid refetching
      return { 
        ...state, 
        loading: false,
        dataCache: { ...state.dataCache, [action.key]: action.data } 
      };
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload, error: null };
    case ACTIONS.SET_ERROR:
      return { ...state, loading: false, error: action.payload };
    case ACTIONS.TOGGLE_SIDEBAR:
      return { ...state, sidebarOpen: !state.sidebarOpen };
    default:
      return state;
  }
}

const AppContext = createContext();

const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Persist Theme
  useEffect(() => {
    const root = window.document.documentElement;
    state.theme === "dark" ? root.classList.add("dark") : root.classList.remove("dark");
  }, [state.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

const useStore = () => useContext(AppContext);

export { StoreProvider, useStore };