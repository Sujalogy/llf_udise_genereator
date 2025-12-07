// src/pages/admin/AnalyticsViews.jsx
import React from "react";
import { BarChart3, PieChart, TrendingUp, Users, Building2 } from "lucide-react";

// Simple CSS-based Bar Chart Component
const SimpleBarChart = ({ data, color = "bg-blue-500" }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-2 h-48 pt-6">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
          <div className="relative w-full flex justify-center h-full items-end">
            <div 
              className={`w-full max-w-[40px] rounded-t-md ${color} opacity-80 group-hover:opacity-100 transition-all relative group-hover:shadow-lg`}
              style={{ height: `${(item.value / max) * 100}%` }}
            >
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.value}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider truncate w-full text-center">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center text-xs font-medium text-green-500">
        <TrendingUp className="w-3 h-3 mr-1" /> {trend} vs last year
      </div>
    )}
  </div>
);

export const AnalyticsDashboard = () => {
  // Mock data - In real app, pass this via props or Context
  const categoryData = [
    { label: "Primary", value: 120 },
    { label: "Upper Pry", value: 85 },
    { label: "Secondary", value: 45 },
    { label: "Higher Sec", value: 30 },
  ];

  const mgmtData = [
    { label: "Govt", value: 150 },
    { label: "Private", value: 90 },
    { label: "Aided", value: 40 },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Building2} label="Total Schools" value="2,450" trend="+12%" color="bg-blue-500" />
        <StatCard icon={Users} label="Total Students" value="1.2L" trend="+5.4%" color="bg-green-500" />
        <StatCard icon={Users} label="Teachers" value="8,400" trend="+2.1%" color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Schools by Category
          </h3>
          <SimpleBarChart data={categoryData} color="bg-indigo-500" />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4" /> Schools by Management
          </h3>
          <SimpleBarChart data={mgmtData} color="bg-emerald-500" />
        </div>
      </div>
    </div>
  );
};

export const SummaryReport = () => {
  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">District Wise Summary Report</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-3">District</th>
                <th className="px-6 py-3 text-right">Schools</th>
                <th className="px-6 py-3 text-right">Boys</th>
                <th className="px-6 py-3 text-right">Girls</th>
                <th className="px-6 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4,5].map(i => (
                <tr key={i} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">District {i}</td>
                  <td className="px-6 py-4 text-right">120</td>
                  <td className="px-6 py-4 text-right">4,500</td>
                  <td className="px-6 py-4 text-right">4,200</td>
                  <td className="px-6 py-4 text-right font-bold">8,700</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};