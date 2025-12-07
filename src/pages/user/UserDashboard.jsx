// ============================================================================
// --- FILE: src/pages/user/UserDashboard.jsx ---
// ============================================================================
import { useEffect, useMemo } from "react";
import {
  LayoutGrid,
  Menu,
  Loader2,
  ChevronRight,
  Check,
  CheckCircle,
} from "lucide-react";
import apiClient from "../../api/apiClient";
import CONFIG from "../../api/config";
import DataTable from "../../components/tables/DataTable";
import ACTIONS from "../../context/actions";
import { useStore } from "../../context/StoreContext";

const UserDashboard = () => {
  const { state, dispatch } = useStore();

  // 1. Initial Load: Fetch Filters
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const res = await apiClient.get(`${CONFIG.API_BACKEND}/filters`);
        dispatch({ type: ACTIONS.SET_FILTERS, payload: res });
      } catch (e) {
        // Mock filters if backend offline
        const mock = {
          Maharashtra: ["Pune", "Mumbai", "Nagpur"],
          Karnataka: ["Bangalore", "Mysore"],
        };
        dispatch({ type: ACTIONS.SET_FILTERS, payload: mock });
      }
    };
    loadFilters();
  }, []);

  // 2. Data Fetching with Caching
  const activeData = useMemo(() => {
    if (!state.selectedState || state.selectedDistricts.length === 0) return [];
    // Key used for caching
    const cacheKey = `${state.selectedState}_${state.selectedDistricts
      .sort()
      .join("-")}`;
    return state.dataCache[cacheKey] || [];
  }, [state.selectedState, state.selectedDistricts, state.dataCache]);

  useEffect(() => {
    const fetchData = async () => {
      if (!state.selectedState || state.selectedDistricts.length === 0) return;
      const cacheKey = `${state.selectedState}_${state.selectedDistricts
        .sort()
        .join("-")}`;

      // CACHE HIT: Return early
      if (state.dataCache[cacheKey]) return;

      // CACHE MISS: Fetch from API
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      try {
        const res = await apiClient.post(
          `${CONFIG.API_BACKEND}/schools/search`,
          {
            state: state.selectedState,
            districts: state.selectedDistricts,
          }
        );
        dispatch({ type: ACTIONS.CACHE_DATA, key: cacheKey, data: res });
      } catch (e) {
        // Fallback Mock Data
        const mockData = Array(50)
          .fill(0)
          .map((_, i) => ({
            udise_code: `27210${1000 + i}`,
            school_name: `Government High School ${i + 1}`,
            district:
              state.selectedDistricts[i % state.selectedDistricts.length],
            block: `Block-${String.fromCharCode(65 + (i % 5))}`,
            school_category: "Secondary",
            school_management: "Dept of Education",
            totalstudents: Math.floor(Math.random() * 500) + 50,
          }));
        setTimeout(
          () =>
            dispatch({
              type: ACTIONS.CACHE_DATA,
              key: cacheKey,
              data: mockData,
            }),
          800
        );
      }
    };

    // Debounce API calls
    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, [state.selectedState, state.selectedDistricts]);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Primary Sidebar (States) */}
      <aside
        className={`flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${
          state.sidebarOpen ? "w-64" : "w-0 opacity-0"
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" /> Locations
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {Object.keys(state.filters).map((st) => (
            <button
              key={st}
              onClick={() =>
                dispatch({ type: ACTIONS.SELECT_STATE, payload: st })
              }
              className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between border-l-4 transition-all ${
                state.selectedState === st
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-600"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {st}{" "}
              {state.selectedState === st && (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Secondary Sidebar (Districts) */}
      {state.selectedState && (
        <aside className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col animate-in slide-in-from-left-10 duration-200">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              Districts
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {state.selectedState}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {state.filters[state.selectedState]?.map((dist) => {
              const isSelected = state.selectedDistricts.includes(dist);
              return (
                <div
                  key={dist}
                  onClick={() =>
                    dispatch({ type: ACTIONS.TOGGLE_DISTRICT, payload: dist })
                  }
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer select-none transition-colors ${
                    isSelected
                      ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400 ring-1 ring-gray-200 dark:ring-gray-700"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-400 bg-transparent"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {dist}
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900/50">
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => dispatch({ type: ACTIONS.TOGGLE_SIDEBAR })}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-white">
                School Registry
              </h1>
              <div className="flex items-center gap-2 text-xs text-gray-500">
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
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium border border-green-100 dark:border-green-800">
              <CheckCircle className="w-3 h-3" />
              {activeData.length} Records
            </div>
          )}
        </header>

        <div className="flex-1 p-6 overflow-hidden">
          {state.loading ? (
            <div className="h-full flex flex-col items-center justify-center text-blue-600 dark:text-blue-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-medium animate-pulse">Retrieving Data...</p>
            </div>
          ) : !state.selectedState ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <LayoutGrid className="w-20 h-20 opacity-20 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">
                No Location Selected
              </h3>
              <p className="text-sm">Please select a State from the sidebar.</p>
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
