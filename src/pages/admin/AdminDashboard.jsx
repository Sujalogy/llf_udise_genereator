// ============================================================================
// --- FILE: src/pages/admin/AdminDashboard.jsx ---
// ============================================================================
import { useState, useEffect, useRef } from "react";
import { Upload, Play, Loader2, Terminal } from "lucide-react";
import apiClient from "../../api/apiClient";
import { CONFIG } from "../../api/config";

const AdminDashboard = () => {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [file, setFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [processing, setProcessing] = useState(false);
  const logsEndRef = useRef(null);

  useEffect(() => {
    apiClient.get(`${CONFIG.API_PROXY}/master/year`, { year: 0 })
      .then(res => {
        if(res.status && res.data) {
          setYears(res.data);
          if(res.data.length) setSelectedYear(res.data[0].yearId);
        }
      })
      .catch(err => addLog("Failed to connect to UDISE API", "error"));
  }, []);

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const addLog = (msg, type="info") => setLogs(p => [...p, { msg, type, time: new Date().toLocaleTimeString() }]);

  const handleUpload = () => {
    if(!file) return addLog("Please select a file first", "error");
    setProcessing(true);
    addLog(`Reading file: ${file.name}...`, "info");
    
    // Simulate Parsing & Saving
    setTimeout(() => {
      addLog(`Found 150 valid UDISE codes.`, "success");
      addLog(`Fetching details from API...`, "info");
      setTimeout(() => {
        addLog(`Successfully saved 150 records to Database.`, "success");
        setProcessing(false);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Data Fetcher Utility</h2>
          <p className="text-gray-500 dark:text-gray-400">Sync school data from UDISE+</p>
        </div>
        <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold uppercase">Admin Access</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2"><Upload className="w-4 h-4" /> Import Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Academic Year</label>
              <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm dark:text-white outline-none">
                {years.map(y => <option key={y.yearId} value={y.yearId}>{y.yearDesc}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Source File</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer relative">
                <input type="file" onChange={e => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="text-gray-500 dark:text-gray-400 text-sm truncate">{file ? file.name : "Click to Upload CSV/XLSX"}</div>
              </div>
            </div>
            <button onClick={handleUpload} disabled={processing} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50">
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Start Processing
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-4 shadow-inner flex flex-col h-[400px]">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800 mb-2">
            <span className="text-gray-400 text-xs font-mono flex items-center gap-2"><Terminal className="w-3 h-3" /> System Output</span>
            {processing && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"/>}
          </div>
          <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1 pr-2">
            {logs.length === 0 && <div className="text-gray-600 italic pt-10 text-center">Ready...</div>}
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-gray-500 shrink-0">[{log.time}]</span>
                <span className={log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-gray-300'}>{log.msg}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;