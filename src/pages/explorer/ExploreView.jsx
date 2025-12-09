// ============================================================================
// --- FILE: src/pages/explorer/ExploreView.jsx (UPDATED FOR INFINITE SCROLL) ---
// ============================================================================
import { useEffect, useMemo, useState, useCallback } from "react";
import { Menu, Loader2, ChevronRight, Check, CheckCircle, Maximize, Minimize, LayoutGrid } from "lucide-react";
import apiClient from "../../api/apiClient";
import CONFIG from "../../api/config";
import DataTable from "../../components/tables/DataTable";
import ACTIONS from "../../context/actions";
import { useStore } from "../../context/StoreContext";
import DashboardStatsView from "../admin/DashboardStatsView";

const LocationSidebar = ({ state, dispatch, isFullScreen }) => {
  const handleSelectState = (stateName) => {
    dispatch({ type: ACTIONS.SELECT_STATE, payload: stateName });
  };

  const handleToggleDistrict = (districtName) => {
    dispatch({ type: ACTIONS.TOGGLE_DISTRICT, payload: districtName });
  };

  return (
    <>
      <aside className={`flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${state.sidebarOpen && !isFullScreen ? 'w-64 opacity-100' : 'w-0 opacity-0'} overflow-hidden`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" /> Locations
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {Object.keys(state.filters).map((st) => (
            <button
              key={st}
              onClick={() => handleSelectState(st)}
              className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between border-l-4 transition-all ${
                state.selectedState === st 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-600' 
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="truncate">{st}</span>
              {state.selectedState === st && <ChevronRight className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </aside>

      {state.selectedState && !isFullScreen && (
        <aside className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col animate-in slide-in-from-left-10 duration-200">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white">Districts</h3>
            <p className="text-xs text-gray-500 truncate mt-1" title={state.selectedState}>
              {state.selectedState}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            {/* Select All */}
            {(() => {
              const allDistricts = state.filters[state.selectedState] || [];
              const allSelected = allDistricts.length > 0 && allDistricts.every(dist => state.selectedDistricts.includes(dist));
              
              return (
                <div 
                  onClick={() => {
                    if (allSelected) {
                      allDistricts.forEach(dist => {
                        if (state.selectedDistricts.includes(dist)) handleToggleDistrict(dist);
                      });
                    } else {
                      allDistricts.forEach(dist => {
                        if (!state.selectedDistricts.includes(dist)) handleToggleDistrict(dist);
                      });
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer select-none transition-colors border-b-2 border-gray-300 dark:border-gray-700 mb-2 ${allSelected ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 font-medium'}`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${allSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-400 bg-transparent'}`}>
                    {allSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  All Districts ({allDistricts.length})
                </div>
              );
            })()}
            
            {/* Districts */}
            {state.filters[state.selectedState]?.map((dist) => {
              const isSelected = state.selectedDistricts.includes(dist);
              return (
                <div 
                  key={dist}
                  onClick={() => handleToggleDistrict(dist)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer select-none transition-colors ${
                    isSelected 
                    ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400 ring-1 ring-gray-200 dark:ring-gray-700' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                    isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-400 bg-transparent'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="truncate">{dist}</span>
                </div>
              );
            })}
          </div>
        </aside>
      )}
    </>
  );
};

const ExploreView = ({ isAdmin }) => {
  const { state, dispatch } = useStore();
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // --- PAGINATION & DATA STATE ---
  const [dataList, setDataList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const viewMode = useMemo(() => {
    if (!state.selectedState) return "analytics_all";
    if (state.selectedDistricts.length === 0) return "analytics_state";
    return "table";
  }, [state.selectedState, state.selectedDistricts]);

  // Reset Data when Filter Changes
  useEffect(() => {
    if (viewMode === "table") {
        setDataList([]);
        setPage(1);
        setTotalRecords(0);
        setHasMore(true);
        // Trigger initial fetch
        fetchData(1, true);
    }
  }, [state.selectedState, state.selectedDistricts]);

  const fetchData = async (pageNum, isReset = false) => {
    if (!state.selectedState || state.selectedDistricts.length === 0) return;
    
    setIsFetching(true);
    if(isReset) dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      const res = await apiClient.post(`${CONFIG.API_BACKEND}/schools/search`, {
        state: state.selectedState,
        districts: state.selectedDistricts,
        page: pageNum,
        limit: 50 // Fetch batch size
      });

      // Response format: { data: [], total: 123, page: 1, limit: 50 }
      const newRows = res.data || [];
      const total = res.total || 0;

      setTotalRecords(total);
      
      if (isReset) {
          setDataList(newRows);
      } else {
          setDataList(prev => [...prev, ...newRows]);
      }

      setHasMore(dataList.length + newRows.length < total);

    } catch (e) {
      console.error("Fetch error", e);
    } finally {
      setIsFetching(false);
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  const handleLoadMore = () => {
    if (!isFetching && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchData(nextPage, false);
    }
  };

  // Initial Filter Load
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const res = await apiClient.get(`${CONFIG.API_BACKEND}/filters`);
        dispatch({ type: ACTIONS.SET_FILTERS, payload: res });
      } catch(e) { /* fallback */ }
    };
    loadFilters();
  }, [dispatch]);

  const toggleFullScreen = () => {
    setIsFullScreen(prev => {
        const newState = !prev;
        if (newState && state.sidebarOpen) {
            dispatch({ type: ACTIONS.TOGGLE_SIDEBAR });
        }
        return newState;
    });
  };

  const renderContent = () => {
    if (state.loading && viewMode === "table" && dataList.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-blue-600 dark:text-blue-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="font-medium animate-pulse">Retrieving Data...</p>
        </div>
      );
    }
    
    if (viewMode === "analytics_all" || viewMode === "analytics_state") {
        return (
            <div className="p-6">
                <div className="max-h-[70vh] overflow-y-auto custom-scrollbar rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <DashboardStatsView /> 
                </div>
            </div>
        );
    } 

    if (viewMode === "table") {
      return (
        <div className={`h-full ${isFullScreen ? 'p-0' : 'p-6'}`}>
            <DataTable 
                data={dataList} 
                totalRecords={totalRecords} // PASS TOTAL COUNT
                onLoadMore={handleLoadMore} // PASS SCROLL HANDLER
                isFetching={isFetching}
                isFullScreen={isFullScreen}
                toggleFullScreen={toggleFullScreen}
            />
        </div>
      );
    }
  };

  return (
    <div className={`flex ${isFullScreen ? 'h-full' : 'h-[calc(100vh-64px)]'} overflow-hidden`}>
      <LocationSidebar state={state} dispatch={dispatch} isFullScreen={isFullScreen} />

      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900/50">
        <header className={`h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0 ${isFullScreen ? 'hidden' : 'flex'}`}>
          <div className="flex items-center gap-4">
            <button onClick={() => dispatch({ type: ACTIONS.TOGGLE_SIDEBAR })} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><Menu className="w-5 h-5" /></button>
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-white">
                {viewMode === "table" ? "School Registry" : "System Analytics"}
              </h1>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{state.selectedState || "All India"}</span>
                {viewMode === "table" && state.selectedDistricts.length > 0 && 
                  <><ChevronRight className="w-3 h-3" /><span>{state.selectedDistricts.length} District(s)</span></>
                }
                {viewMode === "analytics_state" && <><ChevronRight className="w-3 h-3" /><span>State Summary</span></>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={toggleFullScreen} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
                title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
              >
              {isFullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default ExploreView;