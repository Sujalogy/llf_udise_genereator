// ============================================================================
// --- FILE: src/pages/admin/AnalyticsViews.jsx ---
// ============================================================================
import React, { useMemo } from "react";
import { BarChart3, PieChart, TrendingUp, Users, Building2, School } from "lucide-react";

// --- Helper Components ---
const StatCard = ({ icon: Icon, label, value, subtext, color }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start gap-4">
    <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</p>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  </div>
);

const ProgressBar = ({ label, value, max, color = "bg-blue-500" }) => (
  <div className="mb-4">
    <div className="flex justify-between text-xs font-medium mb-1">
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
      <span className="text-gray-500">{value}</span>
    </div>
    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min((value / max) * 100, 100)}%` }}></div>
    </div>
  </div>
);

// --- Analytics Dashboard ---
export const AnalyticsDashboard = ({ data = [] }) => {
  // Real-time calculation from props
  const stats = useMemo(() => {
    const totalSchools = data.length;
    const totalStudents = data.reduce((acc, curr) => acc + (Number(curr.totalstudents) || Number(curr.total_students) || 0), 0);
    const totalBoys = data.reduce((acc, curr) => acc + (Number(curr.total_boy) || 0), 0);
    const totalGirls = data.reduce((acc, curr) => acc + (Number(curr.total_girl) || 0), 0);

    // Grouping for Charts
    const byCategory = {};
    const byManagement = {};

    data.forEach(school => {
      const cat = school.school_category || "Unknown";
      const mgmt = school.school_management || "Unknown";
      byCategory[cat] = (byCategory[cat] || 0) + 1;
      byManagement[mgmt] = (byManagement[mgmt] || 0) + 1;
    });

    return { totalSchools, totalStudents, totalBoys, totalGirls, byCategory, byManagement };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <BarChart3 className="w-16 h-16 opacity-20 mb-4" />
        <p>No data loaded for analysis.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 custom-scrollbar">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={School} label="Total Schools" value={stats.totalSchools.toLocaleString()} color="bg-blue-500" />
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents.toLocaleString()} color="bg-green-500" />
        <StatCard icon={Users} label="Boys" value={stats.totalBoys.toLocaleString()} subtext={`${((stats.totalBoys/stats.totalStudents)*100).toFixed(1)}%`} color="bg-indigo-500" />
        <StatCard icon={Users} label="Girls" value={stats.totalGirls.toLocaleString()} subtext={`${((stats.totalGirls/stats.totalStudents)*100).toFixed(1)}%`} color="bg-pink-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" /> Schools by Category
          </h3>
          {Object.entries(stats.byCategory).map(([key, val]) => (
            <ProgressBar key={key} label={key} value={val} max={stats.totalSchools} color="bg-blue-500" />
          ))}
        </div>

        {/* Management Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-500" /> Schools by Management
          </h3>
          {Object.entries(stats.byManagement).slice(0, 6).map(([key, val]) => (
            <ProgressBar key={key} label={key} value={val} max={stats.totalSchools} color="bg-emerald-500" />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Summary Report ---
export const SummaryReport = ({ data = [] }) => {
  const summary = useMemo(() => {
    const districts = {};
    data.forEach(s => {
      const d = s.district || "Unknown";
      if (!districts[d]) districts[d] = { count: 0, students: 0, boys: 0, girls: 0 };
      districts[d].count++;
      districts[d].students += (Number(s.totalstudents) || Number(s.total_students) || 0);
      districts[d].boys += (Number(s.total_boy) || 0);
      districts[d].girls += (Number(s.total_girl) || 0);
    });
    return Object.entries(districts).sort((a,b) => b[1].count - a[1].count);
  }, [data]);

  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 custom-scrollbar">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">District Wise Summary</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{summary.length} Districts Found</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-3">District Name</th>
                <th className="px-6 py-3 text-right">Schools</th>
                <th className="px-6 py-3 text-right">Students</th>
                <th className="px-6 py-3 text-right hidden sm:table-cell">Avg. Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {summary.map(([name, stats], i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{name}</td>
                  <td className="px-6 py-4 text-right font-mono">{stats.count}</td>
                  <td className="px-6 py-4 text-right font-mono">{stats.students.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-mono hidden sm:table-cell">
                    {Math.round(stats.students / stats.count)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};