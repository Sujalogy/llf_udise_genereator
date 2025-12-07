// ============================================================================
// --- FILE: src/pages/admin/AdminDashboard.jsx ---
// ============================================================================
import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Play,
  Loader2,
  Terminal,
  Users,
  Database,
  LayoutTemplate,
  Square,
  Pause,
  FileSpreadsheet,
  PieChart,
  BarChart3,
  Table2,
} from "lucide-react";
import apiClient from "../../api/apiClient";
import { CONFIG } from "../../api/config";
import { useStore } from "../../context/StoreContext";
import ACTIONS from "../../context/actions";
import UserDashboard from "../user/UserDashboard";
import UserListView from "./UserListView";
import { parseCSV } from "../../utils/csvParser";

// --- 1. COLUMN MAPPING ---
const COLUMN_MAPPING = {
  "search-schools": {
    schoolName: "school_name",
    schoolId: "school_id",
    schMgmtDesc: "school_management",
    schoolStatusName: "is_operational",
    stateName: "state",
    districtName: "district",
    blockName: "block",
    clusterName: "cluster",
    villageName: "village",
    schCatDesc: "school_category",
    schLocDesc: "school_location",
    schTypeDesc: "school_type",
    yearDesc: "ay",
    latitude: "lati",
    longitude: "long",
  },
  profile: {
    headMasterName: "head_master_name",
    mediumOfInstrName1: "medium_of_instruction_1",
    mediumOfInstrName2: "medium_of_instruction_2",
    mediumOfInstrName3: "medium_of_instruction_3",
    mediumOfInstrName4: "medium_of_instruction_4",
    minorityYnDesc: "is_minority_school",
    anganwadiYnDesc: "has_anganwadi",
    anganwadiStuB: "anganwadi_boy_students",
    anganwadiStuG: "anganwadi_girl_students",
    anganwadiTchTrained: "anganwadi_teachers_trained",
    noInspect: "no_academic_inspection",
    noVisitCrc: "no_visit_crc",
    cceYnDesc: "is_cce_implemented",
    instructionalDays: "instructional_days",
    noVisitBrc: "no_visit_brc",
    noVisitDis: "no_vis_dist_st_officers",
    smcYnDesc: "is_sch_manag_comm",
    smdcYnDesc: "is_sch_dev_manag_comm",
    suppMatRecdYnDesc: "received_supplementary_materials",
    spltrgYnDesc: "received_special_training",
    approachRoadYnDesc: "has_approach_road",
    txtbkPriYnDesc: "received_textbooks_primary",
    txtbkUprYnDesc: "received_textbooks_upper_primary",
    shiftSchYnDesc: "is_this_shift_school",
  },
  facility: {
    bldStatus: "building_status",
    bldBlkTot: "total_building_blocks",
    bndrywallType: "boundary_wall_type",
    clsrmsInst: "total_classrooms_in_use",
    othrooms: "other_rooms",
    clsrmsGd: "good_condition_classrooms",
    handwashYnDesc: "has_handwashing_facility",
    toiletb: "total_toilets_boys",
    toiletg: "total_toilets_girls",
    urinalsb: "total_urinals_boys",
    urinalsg: "total_urinals_girls",
    drinkWaterYnDesc: "has_drinking_water_facility",
    electricityYnDesc: "has_electricity",
    solarpanelYnDesc: "has_solar_panel",
    libraryYnDesc: "has_library",
    playgroundYnDesc: "has_playground",
    medchkYnDesc: "has_medical_checkup",
    integratedLabYn: "has_integrated_lab",
    internetYnDesc: "has_internet",
    rainHarvestYnDesc: "has_rainwater_harvesting",
  },
  "report-card": {
    lowClass: "lowest_class",
    highClass: "highest_class",
    tchReg: "total_regular_teachers",
    tchCont: "total_contract_teachers",
    tchPart: "total_part_time_teachers",
    totMale: "total_male_teachers",
    totFemale: "total_female_teachers",
    totalTeachers: "total_teachers",
    tchAbove55: "teachers_above_55_years",
    totTchBelowGraduate: "total_teachers_below_graduate",
    totTchGraduateAbove: "total_teachers_graduate_above",
    totTchPgraduateAbove: "total_teachers_postgraduate_above",
    tchInvlovedNonTchAssign: "teachers_involved_non_teaching_assignments",
    tchRecvdServiceTrng: "teachers_received_service_training",
    partTimeInstructors: "part_time_instructors",
    ftbPr: "total_free_text_book_primary",
    ftbUpr: "total_free_text_book_upper_primary",
    totalGrant: "total_grant_received",
    totalExpediture: "total_expenditure",
    profQual1: "total_diploma_or_certificate_basic_training",
    profQual2: "total_bachelor_of_elementary_education",
    profQual3: "total_bachelor_of_education",
    profQual4: "total_master_of_education_and_above",
    profQual5: "total_other_qualifications",
    profQual6: "total_no_professional_qualification",
    profQual7: "total_diploma_degree_in_special_education",
    profQual8: "total_diploma_in_nursery_teacher_education",
    profQual10: "total_bachelor_of_nursery_teacher_education",
  },
  enrollment: {
    pp1B: "nursery_boy",
    pp1G: "nursery_girl",
    pp2B: "lkg_boy",
    pp2G: "lkg_girl",
    pp3B: "ukg_boy",
    pp3G: "ukg_girl",
    pptB: "total_pre_primary_boy",
    pptG: "total_pre_primary_girl",
    c1B: "class_1_boy",
    c1G: "class_1_girl",
    c2B: "class_2_boy",
    c2G: "class_2_girl",
    c3B: "class_3_boy",
    c3G: "class_3_girl",
    rowBoyTotal: "total_boy",
    rowGirlTotal: "total_girl",
    rowTotal: "total",
    colPryBoyTot: "total_primary_boy",
    colPryGirlTot: "total_primary_girl",
    colPryBoyGirlTot: "total_primary_boy_girl",
    col1BoyTot: "total_class_1_boy",
    col1GirlTot: "total_class_1_girl",
    col1BoyGirlTot: "total_class_1_boy_girl",
    col2BoyTot: "total_class_2_boy",
    col2GirlTot: "total_class_2_girl",
    col2BoyGirlTot: "total_class_2_boy_girl",
    col3BoyTot: "total_class_3_boy",
    col3GirlTot: "total_class_3_girl",
    col3BoyGirlTot: "total_class_3_boy_girl",
    finalTotal: "grand_total",
    enrollmentName: "enrollment_name",
  },
};

const transformData = (data, mapping) => {
  const transformed = {};
  Object.keys(mapping).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      transformed[mapping[key]] = data[key];
    }
  });
  return transformed;
};

// --- Sub-component: Data Sync View ---
const DataSyncView = () => {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [file, setFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

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
      .catch(() =>
        addLog("System ready. Waiting for UDISE API connection...", "info")
      );
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (msg, type = "info") =>
    setLogs((p) => [
      ...p,
      { msg, type, time: new Date().toLocaleTimeString() },
    ]);

  // --- CORE FETCHING LOGIC ---
  const fetchSchoolData = async (udiseCode, yearId) => {
    try {
      const API_BASE = CONFIG.API_PROXY;

      // 1. Search
      const searchRes = await apiClient.get(`${API_BASE}/search-schools`, {
        searchType: 1,
        searchParam: udiseCode,
      });

      if (!searchRes.status)
        throw new Error(searchRes.message || "Search failed");
      if (!searchRes.data?.content?.[0]) throw new Error("School not found");

      const schoolInfo = searchRes.data.content[0];
      const schoolId = schoolInfo.schoolId;

      const result = {
        udise_code: udiseCode,
        ...transformData(schoolInfo, COLUMN_MAPPING["search-schools"]),
      };

      const selectedYearObj = years.find(
        (y) => String(y.yearId) === String(yearId)
      );
      if (selectedYearObj) result.ay = selectedYearObj.yearDesc;

      // 2. Fetch Details (Parallel)
      const fetchSafe = (url) =>
        apiClient.get(url).catch((e) => ({ error: e }));

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
          `${API_BASE}/getSocialData?flag=1&schoolId=${schoolId}&yearId=${yearId}` // Caste
        ),
        fetchSafe(
          `${API_BASE}/getSocialData?flag=2&schoolId=${schoolId}&yearId=${yearId}` // Minority
        ),
        fetchSafe(
          `${API_BASE}/getSocialData?flag=3&schoolId=${schoolId}&yearId=${yearId}` // Age
        ),
        fetchSafe(
          `${API_BASE}/getSocialData?flag=4&schoolId=${schoolId}&yearId=${yearId}` // EWS
        ),
        fetchSafe(
          `${API_BASE}/getSocialData?flag=5&schoolId=${schoolId}&yearId=${yearId}` // RTE + Others
        ),
        fetchSafe(
          `${API_BASE}/school-statistics/enrolment-teacher?schoolId=${schoolId}`
        ),
      ]);

      // 3. Transform Standard Data
      const processResponse = (res, mapping) => {
        if (res?.status && res.data)
          Object.assign(result, transformData(res.data, mapping));
      };

      processResponse(profile, COLUMN_MAPPING["profile"]);
      processResponse(facility, COLUMN_MAPPING["facility"]);
      processResponse(report, COLUMN_MAPPING["report-card"]);

      // 4. ✅ ENROLLMENT PROCESSING - CORRECT FLAG ASSIGNMENTS
      const processEnrollment = (enrollData, flagType) => {
        if (enrollData?.status && enrollData.data) {
          // Helper to determine prefix based on row name
          const getPrefix = (name) => {
            const cleanName = name ? name.toLowerCase().trim() : "";

            if (flagType === "social") return "caste"; // Flag 1
            if (flagType === "age") return "age"; // Flag 3
            if (flagType === "ews") return "ews"; // Flag 4
            if (flagType === "rte") return "rte"; // Flag 5

            if (flagType === "minority") {
              // Flag 2 - Religions only
              return "minority";
            }

            if (flagType === "other") {
              // Flag 5: RTE, BPL, Aadhaar, Repeater, CWSN
              if (
                cleanName.includes("rte") ||
                cleanName.includes("right to education")
              )
                return "rte";
              if (cleanName.includes("bpl")) return "bpl";
              if (cleanName.includes("aadhaar")) return "aadhaar";
              if (cleanName.includes("repeater")) return "repeater";
              if (cleanName.includes("cwsn")) return "cwsn";

              return "other_grp";
            }

            return "other_grp";
          };

          // Handle Totals
          if (enrollData.data.schEnrollmentYearDataTotal) {
            let defaultPrefix = "other_grp";
            if (flagType === "social") defaultPrefix = "caste";
            if (flagType === "minority") defaultPrefix = "minority";
            if (flagType === "age") defaultPrefix = "age";
            if (flagType === "ews") defaultPrefix = "ews";
            if (flagType === "rte") defaultPrefix = "rte";

            const transformed = transformData(
              enrollData.data.schEnrollmentYearDataTotal,
              COLUMN_MAPPING["enrollment"]
            );
            Object.keys(transformed).forEach((key) => {
              if (key !== "enrollment_name") {
                result[`${defaultPrefix}_${key}`] = transformed[key];
              }
            });
          }

          // Handle Individual Rows
          if (enrollData.data.schEnrollmentYearDataDTOS) {
            enrollData.data.schEnrollmentYearDataDTOS.forEach((item, idx) => {
              const transformed = transformData(
                item,
                COLUMN_MAPPING["enrollment"]
              );

              let itemName = item.enrollmentName
                ? item.enrollmentName
                    .toLowerCase()
                    .replace(/\s+/g, "_")
                    .replace(/[^a-z0-9_]/g, "")
                : `${idx + 1}`;

              // Determine prefix dynamically
              const prefix = getPrefix(itemName);

              // Prevent redundant names like bpl_bpl_total
              let finalKeyPrefix = `${prefix}_${itemName}`;
              if (prefix === itemName) {
                finalKeyPrefix = prefix;
              }

              Object.keys(transformed).forEach((key) => {
                if (key !== "enrollment_name") {
                  result[`${finalKeyPrefix}_${key}`] = transformed[key];
                }
              });
            });
          }
        }
      };

      // APPLY ENROLLMENT PROCESSING WITH CORRECT FLAGS
      processEnrollment(enroll1, "social"); // Flag 1: Caste (General, SC, ST, OBC)
      processEnrollment(enroll2, "minority"); // Flag 2: Religions (Muslim, Christian, Sikh, Buddhist, Jain, Parsi)
      processEnrollment(enroll3, "age"); // Flag 3: Age groups
      processEnrollment(enroll4, "ews"); // Flag 4: EWS (Economically Weaker Section)
      processEnrollment(enroll5, "other"); // Flag 5: RTE + Others (BPL, Aadhaar, Repeater, CWSN)

      if (stats?.status && stats.data) {
        result.totalBoyStudents = stats.data.totalBoy;
        result.totalGirlStudents = stats.data.totalGirl;
        result.totalStudents = stats.data.totalCount;
      }

      return { success: true, data: result };
    } catch (error) {
      return { success: false, udiseCode, error: error.message };
    }
  };

  const handleStart = async () => {
    if (!file) return addLog("Please select a file first", "error");

    setProcessing(true);
    setIsPaused(false);
    pausedRef.current = false;
    cancelRef.current = false;
    setProgress(0);
    setLogs([]);

    addLog(`Reading file: ${file.name}...`, "info");

    try {
      const rawData = await parseCSV(file);
      const firstRow = rawData[0];
      const codeKey = Object.keys(firstRow).find(
        (k) =>
          k.toLowerCase().includes("udise") || k.toLowerCase().includes("code")
      );

      if (!codeKey)
        throw new Error("Could not find 'udise_code' column in file.");

      const codes = rawData.map((r) => r[codeKey]).filter(Boolean);
      addLog(`Found ${codes.length} schools to process.`, "success");

      const chunkSize = 5;
      let processed = 0;
      let successCount = 0;

      for (let i = 0; i < codes.length; i += chunkSize) {
        if (cancelRef.current) {
          addLog("Cancelled by user.", "error");
          break;
        }

        while (pausedRef.current) {
          if (cancelRef.current) break;
          await new Promise((r) => setTimeout(r, 500));
        }

        const chunk = codes.slice(i, i + chunkSize);
        const promises = chunk.map((code) =>
          fetchSchoolData(code, selectedYear)
        );
        const results = await Promise.all(promises);

        const validData = results
          .filter((r) => {
            if (!r.success)
              addLog(`Failed ${r.udiseCode}: ${r.error}`, "error");
            return r.success;
          })
          .map((r) => r.data);

        if (validData.length > 0) {
          const saveRes = await apiClient.post(
            `${CONFIG.API_BACKEND}/save-schools`,
            validData
          );
          if (saveRes.success) {
            successCount += validData.length;
            addLog(`Saved batch ${i + 1}-${i + validData.length}`, "success");
          }
        }

        processed += chunk.length;
        setProgress((processed / codes.length) * 100);
      }

      if (!cancelRef.current)
        addLog(
          `Sync Complete. ${successCount}/${codes.length} schools updated.`,
          "success"
        );
    } catch (error) {
      console.error(error);
      addLog(`Error: ${error.message}`, "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full pb-2">
      <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-fit flex flex-col">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4" /> Import Configuration
        </h3>

        <div className="space-y-4 flex-1">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
              Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm dark:text-white outline-none"
            >
              {years.map((y) => (
                <option key={y.yearId} value={y.yearId}>
                  {y.yearDesc}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
              Source File
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer relative transition-colors group">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet className="w-8 h-8 text-green-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="text-gray-500 dark:text-gray-400 text-sm truncate max-w-[200px]">
                  {file ? file.name : "Click to Upload CSV"}
                </div>
              </div>
            </div>
          </div>

          {processing ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  pausedRef.current = !pausedRef.current;
                  setIsPaused(!isPaused);
                }}
                className={`flex-1 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  isPaused
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-amber-500 hover:bg-amber-600"
                }`}
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
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Square className="w-4 h-4" /> Stop
              </button>
            </div>
          ) : (
            <button
              onClick={handleStart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Play className="w-4 h-4" /> Start Processing
            </button>
          )}
        </div>
      </div>

      <div className="lg:col-span-2 bg-gray-950 rounded-xl p-4 shadow-inner flex flex-col h-full border border-gray-800">
        <div className="flex items-center justify-between pb-2 border-b border-gray-800 mb-2">
          <span className="text-gray-400 text-xs font-mono flex items-center gap-2">
            <Terminal className="w-3 h-3" /> System Output
          </span>
          {processing && (
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-400 font-mono">
                {progress.toFixed(1)}%
              </div>
              <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1 pr-2 custom-scrollbar">
          {logs.length === 0 && (
            <div className="text-gray-600 italic pt-20 text-center">
              System Idle. Ready for commands.
            </div>
          )}
          {logs.map((log, i) => (
            <div
              key={i}
              className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300"
            >
              <span className="text-gray-600 shrink-0 select-none">
                [{log.time}]
              </span>
              <span
                className={
                  log.type === "error"
                    ? "text-red-400"
                    : log.type === "success"
                    ? "text-green-400"
                    : "text-gray-300"
                }
              >
                {log.type === "success"
                  ? "✔ "
                  : log.type === "error"
                  ? "✘ "
                  : "> "}
                {log.msg}
              </span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

const DataExplorerView = () => {
  const [activeExplorerTab, setActiveExplorerTab] = useState("table");

  const explorerTabs = [
    { id: "table", icon: Table2, label: "Table View" },
    { id: "charts", icon: BarChart3, label: "Analytics" },
    { id: "summary", icon: PieChart, label: "Summary" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Explorer Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center gap-1">
          {explorerTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveExplorerTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeExplorerTab === tab.id
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Explorer Content */}
      <div className="flex-1 overflow-hidden">
        {activeExplorerTab === "table" && <UserDashboard />}
        {activeExplorerTab === "charts" && (
          <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Visual analytics and charts coming soon
              </p>
            </div>
          </div>
        )}
        {activeExplorerTab === "summary" && (
          <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <PieChart className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Summary Reports
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aggregated summaries and reports coming soon
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Admin Dashboard ---
const AdminDashboard = () => {
  const { state, dispatch } = useStore();
  const activeTab = state.adminTab;

  // If viewing Data Explorer
  if (activeTab === "explorer") {
    return (
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-3 border-b border-blue-200 dark:border-blue-800 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4" /> Data Explorer Mode
            </span>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-0.5">
              Browse and analyze school data with advanced filtering
            </p>
          </div>
          <button
            onClick={() =>
              dispatch({ type: ACTIONS.SET_ADMIN_TAB, payload: "sync" })
            }
            className="text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Back to Admin Console
          </button>
        </div>
        <DataExplorerView />
      </div>
    );
  }

  // Main Admin Console
  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6 overflow-hidden flex flex-col h-[calc(100vh-64px)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Admin Console
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Manage data synchronization, users, and system settings
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 flex shadow-sm">
          {[
            { id: "sync", icon: Database, label: "Data Sync" },
            { id: "users", icon: Users, label: "Users" },
            { id: "explorer", icon: LayoutTemplate, label: "Data Explorer" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                dispatch({ type: ACTIONS.SET_ADMIN_TAB, payload: tab.id })
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden h-full">
        {activeTab === "sync" && <DataSyncView />}
        {activeTab === "users" && <UserListView />}
      </div>
    </div>
  );
};

export default AdminDashboard;
