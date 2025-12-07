// ============================================================================
// --- FILE: src/pages/user/UserDashboard.jsx ---
// ============================================================================
import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, Menu, Loader2, ChevronRight, CheckCircle } from "lucide-react";
import apiClient from "../../api/apiClient";
import CONFIG from "../../api/config";
import DataTable from "../../components/tables/DataTable";
import Sidebar from "../../components/layout/Sidebar"; // Separated Sidebar
import ACTIONS from "../../context/actions";
import { useStore } from "../../context/StoreContext";

const UserDashboard = () => {
  const { state, dispatch } = useStore();
  const [dataLoading, setDataLoading] = useState(false);

  // 1. Initial Load: Fetch Filters (Only if empty)
  useEffect(() => {
    if(Object.keys(state.filters).length > 0) return;

    const loadFilters = async () => {
      try {
        const res = await apiClient.get(`${CONFIG.API_BACKEND}/filters`);
        dispatch({ type: ACTIONS.SET_FILTERS, payload: res });
      } catch (e) {
        // Fallback
        const mock = { "Maharashtra": ["Pune", "Mumbai", "Nagpur"], "Karnataka": ["Bangalore", "Mysore"] };
        dispatch({ type: ACTIONS.SET_FILTERS, payload: mock });
      }
    };
    loadFilters();
  }, [dispatch, state.filters]);

  // 2. Data Fetching Strategy (Memoized + Cached)
  const cacheKey = useMemo(() => {
    if (!state.selectedState || state.selectedDistricts.length === 0) return null;
    return `${state.selectedState}_${state.selectedDistricts.slice().sort().join("-")}`;
  }, [state.selectedState, state.selectedDistricts]);

  const activeData = useMemo(() => {
    return cacheKey && state.dataCache[cacheKey] ? state.dataCache[cacheKey] : [];
  }, [cacheKey, state.dataCache]);

  // Fetch Effect
  useEffect(() => {
    if (!cacheKey || state.dataCache[cacheKey]) return;

    const fetchData = async () => {
      setDataLoading(true);
      try {
        const res = await apiClient.post(`${CONFIG.API_BACKEND}/schools/search`, {
          state: state.selectedState,
          districts: state.selectedDistricts,
        });
        dispatch({ type: ACTIONS.CACHE_DATA, key: cacheKey, data: res });
      } catch (e) {
        // Mock Data for Demo
        const mockData = Array.from({ length: 50 }).map((_, i) => ({
          udise_code: `27210${1000 + i}`,
          school_name: `Government High School ${i + 1}`,
          district: state.selectedDistricts[i % state.selectedDistricts.length],
          block: `Block-${String.fromCharCode(65 + (i % 5))}`,
          school_category: "Secondary",
          school_management: "Dept of Education",
          totalstudents: Math.floor(Math.random() * 500) + 50,
        }));
        // Simulate network delay
        setTimeout(() => {
          dispatch({ type: ACTIONS.CACHE_DATA, key: cacheKey, data: mockData });
          setDataLoading(false);
        }, 600);
      } finally {
        if(CONFIG.API_BACKEND.includes('localhost')) setDataLoading(false); 
      }
    };

    const timer = setTimeout(fetchData, 500); // Debounce
    return () => clearTimeout(timer);
  }, [cacheKey, state.dataCache, dispatch, state.selectedState, state.selectedDistricts]);

  // Loading State Wrapper
  const isFetching = dataLoading && activeData.length === 0;

  return (
    <div className="flex h-full overflow-hidden bg-gray-50 dark:bg-gray-900/50">
      
      {/* Reusable Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header Section */}
        <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => dispatch({ type: ACTIONS.TOGGLE_SIDEBAR })}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wide">
                School Registry
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>{state.selectedState || "All India"}</span>
                {state.selectedDistricts.length > 0 && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span>{state.selectedDistricts.length} District(s)</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {activeData.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium border border-green-100 dark:border-green-800">
              <CheckCircle className="w-3 h-3" />
              {activeData.length} Records
            </div>
          )}
        </header>

        {/* Data Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-hidden relative">
          {isFetching ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10">
              <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin mb-3" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Fetching School Data...</p>
            </div>
          ) : null}

          {!state.selectedState ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <LayoutGrid className="w-16 h-16 opacity-20 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No Location Selected</h3>
              <p className="text-sm">Please select a State from the sidebar to begin.</p>
            </div>
          ) : (
            <DataTable data={activeData} />
          )}
        </div>
      </main>
    </div>
  );
};
export default UserDashboard;