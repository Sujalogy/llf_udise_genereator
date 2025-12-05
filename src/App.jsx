import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  XCircle,
  Sun,
  Moon,
  Pause,
  Play,
  Square,
  Terminal,
} from "lucide-react";

const API_BASE = "https://kys.udiseplus.gov.in/webapp/api";
const CHUNK_SIZE_PERCENT = 10;

// Complete column mapping based on your JSON file
const COLUMN_MAPPING = {
  "search-schools": {
    // udiseschCode: "udise_code",
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
    pp1B: "pre_primary_boy_1",
    pp1G: "pre_primary_girl_1",
    pp2B: "pre_primary_boy_2",
    pp2G: "pre_primary_girl_2",
    pp3B: "pre_primary_boy_3",
    pp3G: "pre_primary_girl_3",
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

function App() {
  const [theme, setTheme] = useState("light"); // Default to light mode (Red/White)
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // UI State for pause
  const [logs, setLogs] = useState([]);
  const [errors, setErrors] = useState([]); // Kept for CSV export
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });
  
  const fileInputRef = useRef(null);
  const pausedRef = useRef(false); // Ref for immediate pause control in loops
  const cancelRef = useRef(false); // Ref for immediate cancellation
  const logsEndRef = useRef(null); // Ref for auto-scrolling logs
  const hasFetchedYears = useRef(false); // Ref to prevent double fetching

  useEffect(() => {
    // Only fetch if we haven't fetched yet
    if (!hasFetchedYears.current) {
      hasFetchedYears.current = true;
      fetchYears();
    }
  }, []);

  // Effect to toggle class on the HTML root element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const addLog = (message, type = "info") => {
    setLogs((prev) => [
      ...prev,
      { message, type, timestamp: new Date().toLocaleTimeString() },
    ]);
  };

  const addError = (udiseCode, stage, errorMessage) => {
    // Add to logs for display
    addLog(`✗ Failed ${udiseCode} [${stage}]: ${errorMessage}`, "error");
    
    // Add to errors for CSV export
    setErrors((prev) => [
      ...prev,
      {
        udiseCode,
        stage,
        error: errorMessage,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handlePauseResume = () => {
    pausedRef.current = !pausedRef.current;
    setIsPaused(pausedRef.current);
    addLog(pausedRef.current ? "|| Process paused by user" : "▶ Process resumed by user", "info");
  };

  const handleCancel = () => {
    cancelRef.current = true;
    pausedRef.current = false; // Ensure loop doesn't get stuck in pause while cancelling
    setIsPaused(false);
    addLog("■ Cancelling process...", "error");
  };

  const fetchYears = async () => {
    try {
      addLog("Fetching available years...", "info");
      const response = await fetch(`${API_BASE}/master/year?year=0`);
      const data = await response.json();

      if (data.status && data.data) {
        setYears(data.data);
        if (data.data.length > 0) {
          // Explicitly convert to string to ensure type match with select value
          setSelectedYear(String(data.data[0].yearId));
        }
        addLog(`Loaded ${data.data.length} years`, "success");
      }
    } catch (error) {
      addLog(`Error fetching years: ${error.message}`, "error");
      // Intentionally not calling addError here to avoid cluttering specific school errors
    }
  };

  const parseFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          let data = [];

          if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
            try {
              const XLSX = await import(
                "https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs"
              );

              const workbook = XLSX.read(content, { type: "array" });
              const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
              const jsonData = XLSX.utils.sheet_to_json(firstSheet);

              if (jsonData.length === 0) {
                reject(new Error("Excel file is empty"));
                return;
              }

              const firstRow = jsonData[0];
              const udiseKey = Object.keys(firstRow).find(
                (k) =>
                  k.toLowerCase().includes("udise") &&
                  k.toLowerCase().includes("code")
              );

              if (!udiseKey) {
                const availableCols = Object.keys(firstRow).join(", ");
                reject(
                  new Error(
                    `Column "udise_code" not found. Available: ${availableCols}`
                  )
                );
                return;
              }

              data = jsonData.map((row) => row[udiseKey]).filter(Boolean);
              addLog(
                `Found column "${udiseKey}" with ${data.length} codes`,
                "success"
              );
            } catch (xlsxError) {
              reject(new Error("Excel parse error: " + xlsxError.message));
              return;
            }
          } else if (file.name.endsWith(".csv") || file.name.endsWith(".tsv")) {
            const delimiter = file.name.endsWith(".tsv") ? "\t" : ",";
            const textContent =
              typeof content === "string"
                ? content
                : new TextDecoder().decode(content);
            const lines = textContent.split("\n").filter((line) => line.trim());
            const headers = lines[0]
              .split(delimiter)
              .map((h) => h.trim().replace(/"/g, ""));

            const udiseIndex = headers.findIndex(
              (h) =>
                h.toLowerCase().includes("udise") &&
                h.toLowerCase().includes("code")
            );

            if (udiseIndex === -1) {
              reject(
                new Error(`Column not found. Available: ${headers.join(", ")}`)
              );
              return;
            }

            for (let i = 1; i < lines.length; i++) {
              const values = lines[i]
                .split(delimiter)
                .map((v) => v.trim().replace(/"/g, ""));
              if (values[udiseIndex]) {
                data.push(values[udiseIndex]);
              }
            }
          } else if (file.name.endsWith(".json")) {
            const textContent =
              typeof content === "string"
                ? content
                : new TextDecoder().decode(content);
            const jsonData = JSON.parse(textContent);
            const array = Array.isArray(jsonData) ? jsonData : [jsonData];

            data = array
              .map((item) => {
                const key = Object.keys(item).find(
                  (k) =>
                    k.toLowerCase().includes("udise") &&
                    k.toLowerCase().includes("code")
                );
                return item[key];
              })
              .filter(Boolean);
          }

          if (data.length === 0) {
            reject(new Error("No UDISE codes found in file"));
            return;
          }

          // DEDUPLICATION STEP: Remove duplicate UDISE codes
          data = [...new Set(data)];

          resolve(data);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));

      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
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

  const fetchSchoolData = async (udiseCode, yearId) => {
    try {
      // Step 1: Search school
      const searchRes = await fetch(
        `${API_BASE}/search-schools?searchType=1&searchParam=${udiseCode}`
      );

      if (!searchRes.ok) {
        throw new Error(`Search API failed: ${searchRes.status}`);
      }

      const searchData = await searchRes.json();

      if (!searchData.status) {
        throw new Error(searchData.message || "API returned error status");
      }

      if (!searchData.data?.content?.[0]) {
        throw new Error("School not found in database");
      }

      const schoolInfo = searchData.data.content[0];
      const schoolId = schoolInfo.schoolId;

      const result = {
        udise_code: udiseCode,
        ...transformData(schoolInfo, COLUMN_MAPPING["search-schools"]),
      };

      // OVERRIDE: Enforce selected academic year in output
      const selectedYearObj = years.find(y => String(y.yearId) === String(yearId));
      if (selectedYearObj) {
        result.ay = selectedYearObj.yearDesc;
      }

      // Step 2: Fetch all data in parallel
      const [
        profileRes,
        facilityRes,
        reportRes,
        enroll1Res,
        enroll2Res,
        enroll3Res,
        enroll4Res,
        enroll5Res,
        statsRes,
      ] = await Promise.all([
        fetch(
          `${API_BASE}/school/profile?schoolId=${schoolId}&yearId=${yearId}`
        ).catch((e) => ({ error: e })),
        fetch(
          `${API_BASE}/school/facility?schoolId=${schoolId}&yearId=${yearId}`
        ).catch((e) => ({ error: e })),
        fetch(
          `${API_BASE}/school/report-card?schoolId=${schoolId}&yearId=${yearId}`
        ).catch((e) => ({ error: e })),
        fetch(
          `${API_BASE}/getSocialData?flag=1&schoolId=${schoolId}&yearId=${yearId}`
        ).catch((e) => ({ error: e })),
        fetch(
          `${API_BASE}/getSocialData?flag=2&schoolId=${schoolId}&yearId=${yearId}`
        ).catch((e) => ({ error: e })),
        fetch(
          `${API_BASE}/getSocialData?flag=3&schoolId=${schoolId}&yearId=${yearId}`
        ).catch((e) => ({ error: e })),
        fetch(
          `${API_BASE}/getSocialData?flag=4&schoolId=${schoolId}&yearId=${yearId}`
        ).catch((e) => ({ error: e })),
        fetch(
          `${API_BASE}/getSocialData?flag=5&schoolId=${schoolId}&yearId=${yearId}`
        ).catch((e) => ({ error: e })),
        fetch(
          `${API_BASE}/school-statistics/enrolment-teacher?schoolId=${schoolId}`
        ).catch((e) => ({ error: e })),
      ]);

      // Process responses with error handling
      const processResponse = async (res, name) => {
        if (res.error) {
          addError(udiseCode, name, res.error.message);
          return null;
        }
        try {
          return await res.json();
        } catch (e) {
          addError(udiseCode, name, "JSON parse error");
          return null;
        }
      };

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
        processResponse(profileRes, "Profile"),
        processResponse(facilityRes, "Facility"),
        processResponse(reportRes, "Report Card"),
        processResponse(enroll1Res, "Enrollment Flag 1"),
        processResponse(enroll2Res, "Enrollment Flag 2"),
        processResponse(enroll3Res, "Enrollment Flag 3"),
        processResponse(enroll4Res, "Enrollment Flag 4"),
        processResponse(enroll5Res, "Enrollment Flag 5"),
        processResponse(statsRes, "Statistics"),
      ]);

      // Merge profile data
      if (profile?.status && profile.data) {
        Object.assign(
          result,
          transformData(profile.data, COLUMN_MAPPING["profile"])
        );
      } else if (profile) {
        addError(udiseCode, "Profile", "No data available");
      }

      // Merge facility data
      if (facility?.status && facility.data) {
        Object.assign(
          result,
          transformData(facility.data, COLUMN_MAPPING["facility"])
        );
      } else if (facility) {
        addError(udiseCode, "Facility", "No data available");
      }

      // Merge report card data
      if (report?.status && report.data) {
        Object.assign(
          result,
          transformData(report.data, COLUMN_MAPPING["report-card"])
        );
      } else if (report) {
        addError(udiseCode, "Report Card", "No data available");
      }

      // Process enrollment flags
      const processEnrollment = (enrollData, flag) => {
        if (enrollData?.status && enrollData.data) {
          let enrollmentPrefix = null;

          if (
            enrollData.data.schEnrollmentYearDataDTOS &&
            enrollData.data.schEnrollmentYearDataDTOS.length > 0 &&
            enrollData.data.schEnrollmentYearDataDTOS[0].enrollmentName
          ) {
            const rawName =
              enrollData.data.schEnrollmentYearDataDTOS[0].enrollmentName;
            if (rawName && rawName.trim() !== "") {
              enrollmentPrefix = rawName
                .toLowerCase()
                .replace(/\s+/g, "_")
                .replace(/[^a-z0-9_]/g, "");
            }
          }

          if (!enrollmentPrefix) {
            // addLog(`Skipping enrollment flag ${flag} for ${udiseCode}`, "info");
            return;
          }

          if (enrollData.data.schEnrollmentYearDataTotal) {
            const transformed = transformData(
              enrollData.data.schEnrollmentYearDataTotal,
              COLUMN_MAPPING["enrollment"]
            );
            Object.keys(transformed).forEach((key) => {
              if (key !== "enrollment_name") {
                result[`${enrollmentPrefix}_${key}`] = transformed[key];
              }
            });
          }

          if (enrollData.data.schEnrollmentYearDataDTOS) {
            enrollData.data.schEnrollmentYearDataDTOS.forEach((item, idx) => {
              const transformed = transformData(
                item,
                COLUMN_MAPPING["enrollment"]
              );

              // Get item specific name or fallback to index
              let itemName = item.enrollmentName
                ? item.enrollmentName
                    .toLowerCase()
                    .replace(/\s+/g, "_")
                    .replace(/[^a-z0-9_]/g, "")
                : `${idx + 1}`;

              Object.keys(transformed).forEach((key) => {
                if (key !== "enrollment_name") {
                  result[`${enrollmentPrefix}_${itemName}_${key}`] =
                    transformed[key];
                }
              });
            });
          }
        } else if (enrollData) {
          addError(udiseCode, `Enrollment Flag ${flag}`, "No data available");
        }
      };
      processEnrollment(enroll1, 1);
      processEnrollment(enroll2, 2);
      processEnrollment(enroll3, 3);
      processEnrollment(enroll4, 4);
      processEnrollment(enroll5, 5);

      // Merge statistics
      if (stats?.status && stats.data) {
        result.totalBoyStudents = stats.data.totalBoy;
        result.totalGirlStudents = stats.data.totalGirl;
        result.totalStudents = stats.data.totalCount;
      } else if (stats) {
        addError(udiseCode, "Statistics", "No data available");
      }

      addLog(`✓ Completed ${udiseCode}`, "success");
      return { success: true, data: result };
    } catch (error) {
      addLog(`✗ Failed ${udiseCode}: ${error.message}`, "error");
      addError(udiseCode, "General", error.message);
      return { success: false, udiseCode, error: error.message };
    }
  };

  const processChunk = async (codes, yearId, chunkIndex, totalChunks) => {
    addLog(
      `Processing chunk ${chunkIndex + 1}/${totalChunks} (${
        codes.length
      } codes)`,
      "info"
    );

    const chunkResults = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < codes.length; i++) {
      // Check for cancellation
      if (cancelRef.current) {
        return [];
      }

      // Check for pause
      while (pausedRef.current) {
        if (cancelRef.current) return [];
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      const result = await fetchSchoolData(codes[i], yearId);

      if (result.success) {
        chunkResults.push(result.data);
        successCount++;
      } else {
        failCount++;
      }

      const overallProgress =
        ((chunkIndex * codes.length + i + 1) / (totalChunks * codes.length)) *
        100;
      setProgress(overallProgress);

      setStats((prev) => ({
        total: prev.total,
        success: prev.success + (result.success ? 1 : 0),
        failed: prev.failed + (result.success ? 0 : 1),
      }));

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if (!cancelRef.current) {
      addLog(
        `Chunk ${
          chunkIndex + 1
        } done: ${successCount} success, ${failCount} failed`,
        "success"
      );
    }
    return chunkResults;
  };

  const handleFileUpload = async () => {
    if (!file || !selectedYear) {
      addLog("Please select a file and year", "error");
      return;
    }

    setProcessing(true);
    setIsPaused(false);
    pausedRef.current = false;
    cancelRef.current = false;
    
    setLogs([]);
    setErrors([]);
    setProgress(0);
    setResults([]);
    setStats({ total: 0, success: 0, failed: 0 });

    try {
      addLog(`Parsing file: ${file.name}`, "info");
      const udiseCodes = await parseFile(file);

      addLog(`Found ${udiseCodes.length} UDISE codes`, "success");
      setStats({ total: udiseCodes.length, success: 0, failed: 0 });

      const chunkSize = Math.max(
        1,
        Math.ceil(udiseCodes.length * (CHUNK_SIZE_PERCENT / 100))
      );
      const chunks = [];

      for (let i = 0; i < udiseCodes.length; i += chunkSize) {
        chunks.push(udiseCodes.slice(i, i + chunkSize));
      }

      addLog(
        `Processing in ${chunks.length} chunks of ~${chunkSize} codes each`,
        "info"
      );

      const allResults = [];
      for (let i = 0; i < chunks.length; i++) {
        if (cancelRef.current) {
            addLog("■ Processing Cancelled by User", "error");
            break;
        }

        const chunkResults = await processChunk(
          chunks[i],
          selectedYear,
          i,
          chunks.length
        );
        allResults.push(...chunkResults);
        setResults(allResults);
      }

      if (!cancelRef.current) {
        addLog(`✓ Complete! ${allResults.length} schools processed`, "success");
      }
    } catch (error) {
      addLog(`Error: ${error.message}`, "error");
      addLog(`System Error: ${error.message}`, "error");
    } finally {
      setProcessing(false);
      setIsPaused(false);
      pausedRef.current = false;
      cancelRef.current = false;
    }
  };

  const getTimestamp = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
  };

  const getSelectedYearDesc = () => {
    // Find the year object that matches the selectedYear ID
    // We compare as strings to avoid type mismatch issues
    const year = years.find(y => String(y.yearId) === String(selectedYear));
    return year ? year.yearDesc : selectedYear;
  };

  const downloadResults = () => {
    if (results.length === 0) return;

    const csv = [
      Object.keys(results[0]).join(","),
      ...results.map((row) =>
        Object.values(row)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `udise_data_${getSelectedYearDesc()}_${getTimestamp()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadErrors = () => {
    if (errors.length === 0) return;

    const csv = [
      "Timestamp,UDISE Code,Stage,Error",
      ...errors.map(
        (e) => `"${e.timestamp}","${e.udiseCode}","${e.stage}","${e.error}"`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `errors_${getTimestamp()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark" ? "dark" : ""
      } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
    >
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Database className="w-8 h-8 text-[#e22a3f] dark:text-blue-400" />
              UDISE Data Fetcher System
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Automated school data extraction and processing
            </p>
          </div>

          {/* Theme Toggle Radio */}
          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-4 shadow-sm">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2">
              Theme:
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="theme"
                value="light"
                checked={theme === "light"}
                onChange={() => setTheme("light")}
                className="w-4 h-4 text-[#e22a3f] accent-[#e22a3f] focus:ring-[#e22a3f] border-gray-300"
              />
              <div className="flex items-center gap-1">
                <Sun className="w-4 h-4 text-[#e22a3f]" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Light
                </span>
              </div>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={theme === "dark"}
                onChange={() => setTheme("dark")}
                className="w-4 h-4 text-blue-500 accent-blue-500 focus:ring-blue-500 border-gray-600 bg-gray-700"
              />
              <div className="flex items-center gap-1">
                <Moon className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Dark
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Academic Year
              </label>
              <select
                value={selectedYear ? String(selectedYear) : ""}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-[#e22a3f] dark:focus:border-blue-500 transition-colors"
                disabled={processing}
              >
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year.yearId} value={String(year.yearId)}>
                    {year.yearDesc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Upload File (CSV, TSV, JSON, XLSX)
              </label>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setFile(e.target.files[0])}
                  accept=".csv,.tsv,.json,.xlsx,.xls"
                  className="hidden"
                  disabled={processing}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors flex items-center justify-center gap-2"
                  disabled={processing}
                >
                  <Upload className="w-4 h-4" />
                  {file ? file.name : "Choose File"}
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Buttons: Processing Control vs Start Button */}
          {processing ? (
            <div className="flex gap-3">
                <button
                    onClick={handlePauseResume}
                    className={`flex-1 ${isPaused ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-500 hover:bg-amber-600'} text-white text-sm font-medium py-2 rounded-md transition-colors flex items-center justify-center gap-2 shadow-sm`}
                >
                    {isPaused ? (
                        <>
                            <Play className="w-4 h-4" />
                            Resume
                        </>
                    ) : (
                        <>
                            <Pause className="w-4 h-4" />
                            Pause
                        </>
                    )}
                </button>
                <button
                    onClick={handleCancel}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-md transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    <Square className="w-4 h-4" />
                    Stop
                </button>
            </div>
          ) : (
              <button
                  onClick={handleFileUpload}
                  disabled={!file || !selectedYear || processing}
                  className="w-full bg-[#e22a3f] hover:bg-[#c92538] dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-400 disabled:dark:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                  <Database className="w-5 h-5" />
                  Start Processing
              </button>
          )}
        </div>

        {/* Stats */}
        {(processing || stats.total > 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#e22a3f] dark:text-blue-400">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.success}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Success
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.failed}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Failed
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500 dark:text-purple-400">
                  {progress.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Progress
                </div>
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${isPaused ? 'bg-yellow-500' : 'bg-gradient-to-r from-[#e22a3f] to-orange-500 dark:from-blue-500 dark:to-purple-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            {isPaused && (
                <div className="text-center text-xs text-yellow-600 mt-1 font-semibold">
                    PAUSED
                </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Activity Log (Merged Logs & Errors) */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Terminal className="w-5 h-5 text-[#e22a3f] dark:text-blue-400" />
                System Activity Log
              </h2>
              {errors.length > 0 && (
                <button
                  onClick={downloadErrors}
                  className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 px-2 py-1 rounded transition-colors"
                >
                  Export Errors CSV
                </button>
              )}
            </div>
            <div className="bg-gray-100 dark:bg-gray-900 rounded p-3 h-96 overflow-y-auto font-mono text-xs border border-gray-200 dark:border-gray-800 no-scrollbar">
              {logs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Waiting to start...
                </div>
              ) : (
                <>
                  {logs.map((log, idx) => (
                    <div key={idx} className="mb-1 leading-relaxed">
                      <span className="text-gray-400 dark:text-gray-500 select-none mr-2">
                        [{log.timestamp}]
                      </span>
                      <span
                        className={
                          log.type === "error"
                            ? "text-red-600 dark:text-red-400 font-semibold"
                            : log.type === "success"
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-700 dark:text-gray-300"
                        }
                      >
                        {log.message}
                      </span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              Results
            </h2>
            <div className="space-y-3">
              {results.length > 0 && (
                <>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {results.length} schools processed
                  </div>
                  <button
                    onClick={downloadResults}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download CSV
                  </button>
                  <div className="bg-gray-100 dark:bg-gray-900 rounded p-3 max-h-80 overflow-y-auto text-xs border border-gray-200 dark:border-gray-800">
                    {results.slice(0, 5).map((result, idx) => (
                      <div
                        key={idx}
                        className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-700"
                      >
                        <div className="font-semibold text-[#e22a3f] dark:text-blue-400">
                          {result.udise_code}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {result.school_name}
                        </div>
                      </div>
                    ))}
                    {results.length > 5 && (
                      <div className="text-gray-500 text-center mt-2">
                        ... and {results.length - 5} more
                      </div>
                    )}
                  </div>
                </>
              )}
              {results.length === 0 && !processing && (
                <div className="text-gray-500 text-center py-8 text-sm">
                  No results yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;