// ============================================================================
// --- FILE: src/pages/admin/AdminDashboard.jsx (FIXED & FULL) ---
// ============================================================================
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Upload,
  Play,
  Terminal,
  Users,
  Database,
  LayoutTemplate,
  Square,
  Pause,
  FileSpreadsheet,
  Activity,
  CheckCircle2,
  RefreshCw,
  Eye,
  Zap,
  ArrowBigLeft,
  TrendingUp,
  Hash,
  Copy,
  AlertTriangle,
} from "lucide-react";

import apiClient from "../../api/apiClient";
import { CONFIG } from "../../api/config";
import { useStore } from "../../context/StoreContext";
import ACTIONS from "../../context/actions";
import UserDashboard from "../user/UserDashboard";
import UserListView from "./UserListView";
import BulkPreviewModal from "../../components/common/BulkPreviewModal";
import DashboardStatsView from "./DashboardStatsView";
import { parseFile } from "../../utils/fileParser";
import {
  COLUMN_MAPPING,
  transformData,
  getEnrollmentPrefix,
} from "../../utils/udiseHelpers";

// --- STATS BADGE COMPONENT ---
const StatBadge = ({
  icon: Icon,
  label,
  value,
  color = "blue",
  pulse = false,
}) => (
  <div
    className={`flex items-center gap-2 px-4 py-2 bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800 rounded-lg`}
  >
    <div className={`p-1.5 rounded ${pulse ? "animate-pulse" : ""}`}>
      <Icon className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
    </div>
    <div className="flex flex-col">
      <span
        className={`text-xs font-medium text-${color}-600 dark:text-${color}-400 uppercase tracking-wider`}
      >
        {label}
      </span>
      <span
        className={`text-lg font-bold text-${color}-700 dark:text-${color}-300`}
      >
        {typeof value === "number" ? value.toLocaleString("en-IN") : value}
      </span>
    </div>
  </div>
);

// --- LOG ENTRY COMPONENT ---
const LogEntry = ({ log, index }) => {
  const getLogIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "error":
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case "info":
        return <Terminal className="w-3.5 h-3.5" />;
      default:
        return <Terminal className="w-3.5 h-3.5" />;
    }
  };

  const getLogStyle = (type) => {
    switch (type) {
      case "success":
        return "text-green-400 bg-green-500/10";
      case "error":
        return "text-red-400 bg-red-500/10";
      case "info":
        return "text-blue-400 bg-blue-500/10";
      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  return (
    <div
      className={`flex gap-3 items-start p-2 rounded-md hover:bg-gray-800/50 transition-colors animate-in slide-in-from-left-2 duration-200`}
      style={{ animationDelay: `${index * 20}ms` }}
    >
      <span className="text-gray-600 text-[10px] font-mono shrink-0 w-20 pt-1">
        [{log.time}]
      </span>
      <div className={`p-1 rounded ${getLogStyle(log.type)}`}>
        {getLogIcon(log.type)}
      </div>
      <span
        className={`flex-1 text-sm leading-relaxed ${
          log.type === "error"
            ? "text-red-400 font-medium"
            : log.type === "success"
            ? "text-green-400"
            : "text-gray-300"
        }`}
      >
        {log.msg}
      </span>
    </div>
  );
};

// --- DATA SYNC VIEW COMPONENT ---
const DataSyncView = () => {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [file, setFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("idle");
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [newEntriesCount, setNewEntriesCount] = useState(0);
  const [sampleData, setSampleData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [allCodes, setAllCodes] = useState([]);

  // NEW: State to store ONLY the codes that need processing
  const [codesToProcess, setCodesToProcess] = useState([]);

  const logsEndRef = useRef(null);
  const pausedRef = useRef(false);
  const cancelRef = useRef(false);

  useEffect(() => {
    apiClient
      .get(`${CONFIG.API_PROXY}/master/year`, { year: 0 })
      .then((res) => {
        if (res.status && res.data) {
          setYears(res.data);
          if (res.data.length) setSelectedYear(res.data[0].yearId);
        }
      })
      .catch(() => addLog("Waiting for UDISE API connection...", "info"));
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (msg, type = "info") =>
    setLogs((p) => [
      ...p,
      { msg, type, time: new Date().toLocaleTimeString() },
    ]);

  // 1. UPDATE: Accept yearString to force 'ay' value
  const fetchSingleBatch = async (codesChunk, yearId, yearString) => {
    const promises = codesChunk.map(async (udiseCode) => {
      try {
        const API_BASE = CONFIG.API_PROXY;
        const searchRes = await apiClient.get(`${API_BASE}/search-schools`, {
          searchType: 1,
          searchParam: udiseCode,
        });
        if (!searchRes.status || !searchRes.data?.content?.[0]) return null;

        const schoolInfo = searchRes.data.content[0];
        const schoolId = schoolInfo.schoolId;
        
        // 2. FORCE 'ay' to ensure consistent DB unique check
        const result = {
          udise_code: udiseCode,
          ay: yearString,
          ...transformData(schoolInfo, COLUMN_MAPPING["search-schools"]),
        };
        // Explicitly overwrite in case transformData mapped something else
        result.ay = yearString; 

        const fetchSafe = (url) => apiClient.get(url).catch(() => ({}));
        const [
          profile,
          facility,
          report,
          enroll1,
          enroll2,
          enroll3,
          enroll4,
          enroll5,
          stats,
        ] = await Promise.all([
          fetchSafe(
            `${API_BASE}/school/profile?schoolId=${schoolId}&yearId=${yearId}`
          ),
          fetchSafe(
            `${API_BASE}/school/facility?schoolId=${schoolId}&yearId=${yearId}`
          ),
          fetchSafe(
            `${API_BASE}/school/report-card?schoolId=${schoolId}&yearId=${yearId}`
          ),
          fetchSafe(
            `${API_BASE}/getSocialData?flag=1&schoolId=${schoolId}&yearId=${yearId}`
          ),
          fetchSafe(
            `${API_BASE}/getSocialData?flag=2&schoolId=${schoolId}&yearId=${yearId}`
          ),
          fetchSafe(
            `${API_BASE}/getSocialData?flag=3&schoolId=${schoolId}&yearId=${yearId}`
          ),
          fetchSafe(
            `${API_BASE}/getSocialData?flag=4&schoolId=${schoolId}&yearId=${yearId}`
          ),
          fetchSafe(
            `${API_BASE}/getSocialData?flag=5&schoolId=${schoolId}&yearId=${yearId}`
          ),
          fetchSafe(
            `${API_BASE}/school-statistics/enrolment-teacher?schoolId=${schoolId}`
          ),
        ]);

        const process = (res, key) => {
          if (res?.status && res.data)
            Object.assign(result, transformData(res.data, COLUMN_MAPPING[key]));
        };
        process(profile, "profile");
        process(facility, "facility");
        process(report, "report-card");

        const processEnrollment = (res, flag) => {
          if (res?.status && res.data) {
            if (res.data.schEnrollmentYearDataTotal) {
              let prefix =
                flag === "social"
                  ? "caste"
                  : flag === "minority"
                  ? "minority"
                  : flag === "age"
                  ? "age"
                  : flag === "ews"
                  ? "ews"
                  : flag === "rte"
                  ? "rte"
                  : "other_grp";
              const t = transformData(
                res.data.schEnrollmentYearDataTotal,
                COLUMN_MAPPING["enrollment"]
              );
              Object.keys(t).forEach(
                (k) =>
                  k !== "enrollment_name" && (result[`${prefix}_${k}`] = t[k])
              );
            }
            res.data.schEnrollmentYearDataDTOS?.forEach((item, idx) => {
              const t = transformData(item, COLUMN_MAPPING["enrollment"]);
              const rawName = item.enrollmentName || `${idx + 1}`;
              const cleanName = rawName
                .toLowerCase()
                .replace(/\s+/g, "_")
                .replace(/[^a-z0-9_]/g, "");
              const prefix = getEnrollmentPrefix(rawName, flag);
              const finalPrefix =
                prefix === cleanName ? prefix : `${prefix}_${cleanName}`;
              Object.keys(t).forEach(
                (k) =>
                  k !== "enrollment_name" &&
                  (result[`${finalPrefix}_${k}`] = t[k])
              );
            });
          }
        };

        processEnrollment(enroll1, "social");
        processEnrollment(enroll2, "minority");
        processEnrollment(enroll3, "age");
        processEnrollment(enroll4, "ews");
        processEnrollment(enroll5, "other");

        if (stats?.status && stats.data) {
          result.totalBoyStudents = stats.data.totalBoy;
          result.totalGirlStudents = stats.data.totalGirl;
          result.totalStudents = stats.data.totalCount;
        }
        return result;
      } catch (e) {
        return null;
      }
    });

    const results = await Promise.all(promises);
    return results.filter(Boolean);
  };

  const handleAnalyzeFile = async () => {
    if (!file) return addLog("Select file first", "error");
    setStatus("analyzing");
    addLog(`📂 Reading ${file.name}...`, "info");

    try {
      const rawData = await parseFile(file);
      const codes = rawData.map((r) => r.udise_code).filter(Boolean);

      if (codes.length === 0) throw new Error("No valid UDISE codes found.");

      setAllCodes(codes);
      setTotalRecords(codes.length);

      addLog(
        `✅ Extracted ${codes.length.toLocaleString("en-IN")} UDISE codes`,
        "success"
      );

      // --- NEW LOGIC: FILTER BY YEAR ---
      // 1. Get Year String
      const selectedYearObj = years.find((y) => y.yearId == selectedYear);
      const yearString = selectedYearObj ? selectedYearObj.yearDesc : "";

      addLog(`🔍 Checking DB for existing records in ${yearString}...`, "info");

      // 2. Call API with Year
      const existingRes = await apiClient.post(
        `${CONFIG.API_BACKEND}/check-existing`,
        {
          codes,
          ay: yearString,
        }
      );

      const existingSet = new Set(existingRes.existing || []);

      // 3. Filter LOCALLY
      const pending = codes.filter((c) => !existingSet.has(c));
      setCodesToProcess(pending); // Store ONLY the ones we will fetch

      const duplicates = codes.length - pending.length;
      setDuplicateCount(duplicates);
      setNewEntriesCount(pending.length);

      addLog(`📊 Analysis Complete:`, "success");
      addLog(
        `   • New Records to Fetch: ${pending.length.toLocaleString("en-IN")}`,
        "info"
      );
      addLog(
        `   • Existing in DB (Skipped): ${duplicates.toLocaleString("en-IN")}`,
        "info"
      );

      if (pending.length > 0) {
        addLog(`🎯 Fetching sample data from NEW records...`, "info");
        const sampleBatch = await fetchSingleBatch(
          pending.slice(0, 10),
          selectedYear,
          yearString // Pass yearString to sample fetch
        );
        setSampleData(sampleBatch);
        setShowPreview(true);
        setStatus("ready_to_sync");
      } else {
        addLog(
          `🎉 All records already exist for this year! Nothing to do.`,
          "success"
        );
        setStatus("idle");
      }
    } catch (e) {
      console.error(e);
      addLog(`❌ File Error: ${e.message || e}`, "error");
      setStatus("idle");
    }
  };

  const handleStartStreamSync = async () => {
    setShowPreview(false);
    setStatus("syncing");
    setIsPaused(false);
    pausedRef.current = false;
    cancelRef.current = false;
    setSuccessCount(0);
    setProgress(0);
    setLogs([]);
    setDuplicateCount(0); // Reset for visual consistency

    // IMPORTANT: Use filtered list
    const totalToSync = codesToProcess.length;

    if (totalToSync === 0) {
      addLog("✅ No new records to sync.", "success");
      setStatus("idle");
      return;
    }

    addLog(
      `🚀 Starting Batch Sync for ${totalToSync.toLocaleString(
        "en-IN"
      )} NEW records...`,
      "info"
    );
    
    // Get yearString again for the loop
    const selectedYearObj = years.find((y) => y.yearId == selectedYear);
    const yearString = selectedYearObj ? selectedYearObj.yearDesc : "";

    const CHUNK_SIZE = 20;
    const BATCH_SIZE = 100;

    let buffer = [];
    let processed = 0;
    let saved = 0;

    try {
      // Loop ONLY through codesToProcess
      for (let i = 0; i < totalToSync; i += CHUNK_SIZE) {
        if (cancelRef.current) {
          addLog("⛔ Sync Cancelled by User", "error");
          break;
        }
        while (pausedRef.current) {
          await new Promise((r) => setTimeout(r, 500));
          if (cancelRef.current) break;
        }

        const chunkCodes = codesToProcess.slice(i, i + CHUNK_SIZE);
        
        // Pass yearString here
        const fetchedData = await fetchSingleBatch(chunkCodes, selectedYear, yearString);
        buffer = [...buffer, ...fetchedData];

        if (buffer.length >= BATCH_SIZE || i + CHUNK_SIZE >= totalToSync) {
          if (buffer.length > 0) {
            const saveRes = await apiClient.post(
              `${CONFIG.API_BACKEND}/save-schools`,
              buffer
            );
            if (saveRes.success) {
              const actualSaved = saveRes.count || 0;
              saved += actualSaved;
              setSuccessCount(saved);

              if (saved % 100 === 0) {
                addLog(
                  `💾 Progress: ${saved.toLocaleString("en-IN")} saved`,
                  "success"
                );
              }
            }
            buffer = [];
          }
        }

        processed += chunkCodes.length;
        setProgress((processed / totalToSync) * 100);
      }

      addLog(`🎉 Sync Complete!`, "success");
      addLog(
        `   • Total Fetched & Saved: ${saved.toLocaleString("en-IN")}`,
        "success"
      );
      addLog(
        `   • Pre-Skipped Duplicates: ${duplicateCount.toLocaleString(
          "en-IN"
        )}`,
        "info"
      );
    } catch (e) {
      addLog(`💥 Critical Failure: ${e.message}`, "error");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <>
      <BulkPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        data={sampleData}
        onConfirm={handleStartStreamSync}
        isProcessing={status === "syncing"}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* LEFT PANEL - Configuration */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-fit flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
              Import Configuration
            </h3>
          </div>

          <div className="space-y-5 flex-1">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Academic Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              >
                {years.map((y) => (
                  <option key={y.yearId} value={y.yearId}>
                    {y.yearDesc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Source File
              </label>
              <label className="block border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer transition-all group">
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls, .json"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 text-sm font-semibold truncate max-w-[200px]">
                    {file ? file.name : "Click to Upload File"}
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    CSV, Excel, JSON supported
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              {status === "syncing" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <StatBadge
                      icon={CheckCircle2}
                      label="Saved"
                      value={successCount}
                      color="green"
                      pulse={true}
                    />
                    <StatBadge
                      icon={Copy}
                      label="Skipped"
                      value={duplicateCount}
                      color="amber"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        pausedRef.current = !pausedRef.current;
                        setIsPaused(!isPaused);
                      }}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg"
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-4 h-4" /> Resume
                        </>
                      ) : (
                        <>
                          <Pause className="w-4 h-4" /> Pause
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        cancelRef.current = true;
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg"
                    >
                      <Square className="w-4 h-4" /> Stop
                    </button>
                  </div>
                </div>
              ) : status === "ready_to_sync" ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <StatBadge
                      icon={TrendingUp}
                      label="New"
                      value={newEntriesCount}
                      color="green"
                    />
                    <StatBadge
                      icon={Copy}
                      label="Duplicate"
                      value={duplicateCount}
                      color="gray"
                    />
                  </div>

                  <button
                    onClick={() => setShowPreview(true)}
                    className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" /> Preview Sample Data
                  </button>
                  <button
                    onClick={handleStartStreamSync}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-xl shadow-green-500/30 transition-all transform active:scale-[0.98]"
                  >
                    <Zap className="w-5 h-5" /> Start Bulk Sync (
                    {newEntriesCount.toLocaleString("en-IN")})
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAnalyzeFile}
                  disabled={status === "analyzing"}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-500/30 disabled:opacity-70 transition-all transform active:scale-[0.98]"
                >
                  {status === "analyzing" ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />{" "}
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" /> Analyze & Start
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - System Stream - FIXED HEIGHT */}
        <div className="lg:col-span-2 bg-gray-950 rounded-xl shadow-inner flex flex-col max-h-[calc(100vh-280px)] border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-blue-500/20 rounded">
                <Terminal className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-gray-300 text-sm font-bold tracking-wider">
                SYSTEM STREAM
              </span>
            </div>

            {(status === "analyzing" || status === "syncing") && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono">
                    {progress.toFixed(1)}%
                  </span>
                  <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            {logs.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-600">
                <Terminal className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm font-medium">
                  System ready. Awaiting input...
                </p>
              </div>
            )}
            {logs.map((log, i) => (
              <LogEntry key={i} log={log} index={i} />
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </>
  );
};

const DataExplorerView = () => {
  const [activeExplorerTab, setActiveExplorerTab] = useState("table");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { state, dispatch } = useStore();

  const cacheKey = useMemo(() => {
    if (!state.selectedState || state.selectedDistricts.length === 0)
      return null;
    return `${state.selectedState}_${state.selectedDistricts
      .slice()
      .sort()
      .join("-")}`;
  }, [state.selectedState, state.selectedDistricts]);

  const activeData = useMemo(() => {
    return cacheKey && state.dataCache[cacheKey]
      ? state.dataCache[cacheKey]
      : [];
  }, [cacheKey, state.dataCache]);

  const explorerTabs = [
    { id: "table", icon: Database, label: "Table View" },
    { id: "charts", icon: Activity, label: "Analytics" },
  ];

  const handleRefresh = useCallback(async () => {
    if (!state.selectedState) return;
    setRefreshing(true);
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const res = await apiClient.post(`${CONFIG.API_BACKEND}/schools/search`, {
        state: state.selectedState,
        districts: state.selectedDistricts,
      });
      dispatch({ type: ACTIONS.CACHE_DATA, key: cacheKey, data: res });
      setRefreshKey((prev) => prev + 1);
    } catch (e) {
      console.error("Refresh failed", e);
    } finally {
      setRefreshing(false);
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [state.selectedState, state.selectedDistricts, cacheKey, dispatch]);

  return (
    <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-1">
          {explorerTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveExplorerTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeExplorerTab === tab.id
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm ring-1 ring-blue-200 dark:ring-blue-800"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh Data from Server"
          className={`p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors ${
            refreshing ? "animate-spin text-blue-500" : ""
          }`}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative flex flex-col">
        {activeExplorerTab === "table" && <UserDashboard key={refreshKey} />}
        {activeExplorerTab === "charts" && (
          <DashboardStatsView key={refreshKey} />
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { state, dispatch } = useStore();
  const activeTab = state.adminTab;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden relative">
      {activeTab === "explorer" && (
        <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900 z-10 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 py-2 border-b border-blue-200 dark:border-blue-800 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                Data Explorer Mode
              </span>
            </div>
            <button
              className="text-sm text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline px-3 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              onClick={() =>
                dispatch({ type: ACTIONS.SET_ADMIN_TAB, payload: "sync" })
              }
            >
              <ArrowBigLeft className="w-4 h-4" /> Back to Admin
            </button>
          </div>
          <DataExplorerView />
        </div>
      )}

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
          <div>
            <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Console
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">
              Manage data synchronization, users, and system configuration
            </p>
          </div>

          {/* Modern Tab Navigation */}
          <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 flex shadow-sm flex-shrink-0">
            {[
              { id: "sync", icon: Database, label: "Data Sync" },
              { id: "dashboard", icon: Activity, label: "Dashboard" },
              { id: "users", icon: Users, label: "Users" },
              { id: "explorer", icon: LayoutTemplate, label: "Explorer" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  dispatch({ type: ACTIONS.SET_ADMIN_TAB, payload: tab.id })
                }
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div
            className={`h-full w-full ${
              activeTab === "sync" ? "block" : "hidden"
            }`}
          >
            <DataSyncView />
          </div>
          {activeTab === "dashboard" && (
            <div className="h-full overflow-hidden">
              <DashboardStatsView />
            </div>
          )}
          {activeTab === "users" && (
            <div className="h-full overflow-hidden">
              <UserListView />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;