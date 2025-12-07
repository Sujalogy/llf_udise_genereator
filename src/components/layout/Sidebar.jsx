import React from 'react';
import { LayoutGrid, ChevronRight, Check } from "lucide-react";
// Adjust these import paths based on your actual folder structure
import { useStore } from '../../context/StoreContext';
import ACTIONS from '../../context/actions';

export default function Sidebar() {
  const { state, dispatch } = useStore();

  const handleSelectState = (stateName) => {
    dispatch({ type: ACTIONS.SELECT_STATE, payload: stateName });
  };

  const handleToggleDistrict = (districtName) => {
    dispatch({ type: ACTIONS.TOGGLE_DISTRICT, payload: districtName });
  };

  return (
    <>
      {/* Primary Sidebar (States List) */}
      <aside className={`flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${state.sidebarOpen ? 'w-64' : 'w-0 opacity-0'} overflow-hidden`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" /> Locations
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
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

      {/* Secondary Sidebar (Districts List) - Conditional Rendering */}
      {state.selectedState && (
        <aside className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col animate-in slide-in-from-left-10 duration-200">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white">Districts</h3>
            <p className="text-xs text-gray-500 truncate mt-1" title={state.selectedState}>
              {state.selectedState}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
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
}

