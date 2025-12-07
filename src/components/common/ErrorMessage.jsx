import React from 'react';
import { AlertCircle } from "lucide-react";

export default function ErrorMessage({ message = "Something went wrong" }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Error</h3>
      <p className="text-sm text-center max-w-xs mt-2 text-gray-500 dark:text-gray-400">
        {message}
      </p>
    </div>
  );
}