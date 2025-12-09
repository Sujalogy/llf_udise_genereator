// ============================================================================
// --- FILE: src/pages/admin/DashboardStatsView.jsx ---
// ============================================================================
import React, { useState, useEffect } from "react";
import {
  School,
  MapPin,
  Building2,
  Map,
  Users,
  Database,
  Activity,
  BarChart3,
  RefreshCw,
  Download,
  CheckCircle,
  Calendar,
  X,
} from "lucide-react";
import apiClient from "../../api/apiClient";
import CONFIG from "../../api/config";
import { useStore } from "../../context/StoreContext"; // Import Global Store

const StatCard = ({ icon: Icon, label, value, subtext, color, loading }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
            <Icon className={`w-5 h-5 ${color.replace("bg-", "text-")}`} />
          </div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </p>
        </div>
        <div className="mt-3">
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          ) : (
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {typeof value === "number"
                ? value.toLocaleString("en-IN")
                : value}
            </h3>
          )}
          {subtext && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);

const TopItemsList = ({ title, items, loading, icon: Icon, emptyMessage }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-500" />
        {title}
      </h3>
    </div>

    {loading ? (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          </div>
        ))}
      </div>
    ) : items && items.length > 0 ? (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 w-6">
                #{index + 1}
              </span>
              <span className="text-sm font-medium text-gray-400 dark:text-gray-300">
                {item.name}
              </span>
            </div>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {item.count.toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8 text-gray-400">
        <Database className="w-12 h-12 mx-auto mb-2 opacity-20" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )}
  </div>
);

const DashboardStatsView = ({ initialFilters = {} }) => {
  const { state: globalState } = useStore(); // Get Global Store
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filters, setFilters] = useState({
    state: initialFilters.state || "",
    district: "",
    block: "",
    ay: "",
  });
  const [filterOptions, setFilterOptions] = useState({
    states: [],
    districts: [],
    blocks: [],
    academicYears: [],
  });

  const token = localStorage.getItem("authToken");

  // 1. Initial Load
  useEffect(() => {
    fetchFilterOptions();
    fetchStats(filters);
  }, []);

  // 2. Sync with Global Sidebar Selection (ExploreView)
  useEffect(() => {
    // If global state has a selected state, and it differs from our local filter
    if (globalState.selectedState !== undefined && globalState.selectedState !== filters.state) {
      const newState = globalState.selectedState || "";
      
      // Update local state
      setFilters(prev => ({
        ...prev,
        state: newState,
        district: "", // Reset district when state changes via sidebar
        block: ""
      }));

      // Trigger Fetch immediately for the new state
      const newFilters = { ...filters, state: newState, district: "", block: "" };
      fetchStats(newFilters);

      // Fetch district options for the new state
      if (newState) {
        fetchDistrictOptions(newState);
      } else {
        // If cleared, reset district options
        setFilterOptions(prev => ({ ...prev, districts: [], blocks: [] }));
      }
    }
  }, [globalState.selectedState]);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(`${CONFIG.API_BACKEND}/filter-options`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setFilterOptions({
          states: data.states || [],
          districts: [],
          blocks: [],
          academicYears: data.academicYears || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch filter options:", error);
    }
  };

  // Helper to fetch districts specifically (used when syncing with sidebar)
  const fetchDistrictOptions = async (stateName) => {
    try {
        const response = await fetch(`${CONFIG.API_BACKEND}/filter-options`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setFilterOptions((prev) => ({
            ...prev,
            districts: data.districtsByState?.[stateName] || [],
            blocks: [],
        }));
    } catch (error) {
        console.error("Failed to fetch districts:", error);
    }
  };

  const fetchStats = async (appliedFilters = {}) => {
    setLoading(true);
    try {
      // Remove empty keys
      const cleanFilters = Object.fromEntries(
        Object.entries(appliedFilters).filter(([_, v]) => v != null && v !== "")
      );
      
      const params = new URLSearchParams(cleanFilters).toString();
      const response = await fetch(
        `${CONFIG.API_BACKEND}/dashboard/stats?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setStats(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Internal Filter Handlers (for the dropdowns inside the Stats View)
  const handleStateChange = async (state) => {
    setFilters({ ...filters, state, district: "", block: "" });
    if (state) {
        fetchDistrictOptions(state);
    } else {
        setFilterOptions(prev => ({ ...prev, districts: [], blocks: [] }));
    }
  };

  const handleDistrictChange = async (district) => {
    setFilters({ ...filters, district, block: "" });
    if (filters.state && district) {
      try {
        const response = await fetch(
          `${CONFIG.API_BACKEND}/filter-options`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        const key = `${filters.state}|${district}`;
        setFilterOptions((prev) => ({
          ...prev,
          blocks: data.blocksByStateDistrict?.[key] || [],
        }));
      } catch (error) {
        console.error("Failed to fetch blocks:", error);
      }
    }
  };

  const exportReport = () => {
    if (!stats) return;

    const reportData = {
      generated_at: new Date().toISOString(),
      summary: {
        total_records: stats.totalRecords,
        unique_udise_codes: stats.uniqueUdise,
        unique_states: stats.uniqueStates,
        unique_districts: stats.uniqueDistricts,
        unique_blocks: stats.uniqueBlocks,
        unique_clusters: stats.uniqueClusters,
        unique_villages: stats.uniqueVillages,
        total_students: stats.totalStudents,
      },
      top_states: stats.topStates,
      top_districts: stats.topDistricts,
      top_blocks: stats.topBlocks,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `dashboard-report-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
  };

  const applyFilters = () => {
    fetchStats(filters);
  };

  const resetFilters = () => {
    const emptyFilters = { state: "", district: "", block: "", ay: "" };
    setFilters(emptyFilters);
    setFilterOptions((prev) => ({ ...prev, districts: [], blocks: [] }));
    fetchStats(emptyFilters);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* FILTER PANEL */}
        <div className="dark:bg-gray-900 custom-scrollbar rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Map className="w-5 h-5 text-blue-600" />
            Filter Dashboard
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <Map className="w-4 h-4 inline mr-1" />
                State
              </label>
              <select
                value={filters.state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">All States</option>
                {filterOptions.states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                District
              </label>
              <select
                value={filters.district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!filters.state}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:opacity-50"
              >
                <option value="">All Districts</option>
                {filterOptions.districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Block
              </label>
              <select
                value={filters.block}
                onChange={(e) =>
                  setFilters({ ...filters, block: e.target.value })
                }
                disabled={!filters.district}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:opacity-50"
              >
                <option value="">All Blocks</option>
                {filterOptions.blocks.map((block) => (
                  <option key={block} value={block}>
                    {block}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Academic Year
              </label>
              <select
                value={filters.ay}
                onChange={(e) => setFilters({ ...filters, ay: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">All Years</option>
                {filterOptions.academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              System Dashboard
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time statistics and analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Updated {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={() => fetchStats(filters)}
              disabled={loading}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={exportReport}
              disabled={loading || !stats}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Database}
            label="Total Records"
            value={stats?.totalRecords || 0}
            color="bg-blue-500"
            loading={loading}
          />
          <StatCard
            icon={School}
            label="Unique Schools"
            value={stats?.uniqueUdise || 0}
            subtext="UDISE Codes"
            color="bg-green-500"
            loading={loading}
          />
          <StatCard
            icon={Users}
            label="Total Students"
            value={stats?.totalStudents || 0}
            subtext={
              stats?.totalBoyStudents && stats?.totalGirlStudents
                ? `${stats.totalBoyStudents.toLocaleString(
                    "en-IN"
                  )} Boys | ${stats.totalGirlStudents.toLocaleString(
                    "en-IN"
                  )} Girls`
                : undefined
            }
            color="bg-purple-500"
            loading={loading}
          />
          <StatCard
            icon={Activity}
            label="Data Coverage"
            value={stats?.uniqueStates || 0}
            subtext="States"
            color="bg-orange-500"
            loading={loading}
          />
        </div>

        {/* Geographic Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={Map}
            label="States"
            value={stats?.uniqueStates || 0}
            color="bg-indigo-500"
            loading={loading}
          />
          <StatCard
            icon={MapPin}
            label="Districts"
            value={stats?.uniqueDistricts || 0}
            color="bg-cyan-500"
            loading={loading}
          />
          <StatCard
            icon={Building2}
            label="Blocks"
            value={stats?.uniqueBlocks || 0}
            color="bg-teal-500"
            loading={loading}
          />
          <StatCard
            icon={MapPin}
            label="Villages"
            value={stats?.uniqueVillages || 0}
            color="bg-emerald-500"
            loading={loading}
          />
        </div>

        {/* Top Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TopItemsList
            title="Top 5 States"
            items={stats?.topStates}
            loading={loading}
            icon={Map}
            emptyMessage="No state data available"
          />
          <TopItemsList
            title="Top 5 Districts"
            items={stats?.topDistricts}
            loading={loading}
            icon={MapPin}
            emptyMessage="No district data available"
          />
          <TopItemsList
            title="Top 5 Blocks"
            items={stats?.topBlocks}
            loading={loading}
            icon={Building2}
            emptyMessage="No block data available"
          />
        </div>

        {/* Category & Management Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Schools by Category
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
                  ></div>
                ))}
              </div>
            ) : stats?.schoolsByCategory &&
              stats.schoolsByCategory.length > 0 ? (
              <div className="space-y-3">
                {stats.schoolsByCategory.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {item.category || "Unknown"}
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {item.count.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            (item.count /
                              Math.max(
                                ...stats.schoolsByCategory.map((s) => s.count)
                              )) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No category data available</p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <School className="w-5 h-5 text-green-500" />
              Schools by Management
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
                  ></div>
                ))}
              </div>
            ) : stats?.schoolsByManagement &&
              stats.schoolsByManagement.length > 0 ? (
              <div className="space-y-3">
                {stats.schoolsByManagement.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {item.management || "Unknown"}
                      </span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {item.count.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            (item.count /
                              Math.max(
                                ...stats.schoolsByManagement.map((s) => s.count)
                              )) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <School className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No management data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStatsView;