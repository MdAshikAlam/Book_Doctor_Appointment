import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Table = ({ columns, data, pagination = true, emptyMessage = "No data available." }) => {
  return (
    <div className="w-full">
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-slate-50/50">
              {columns.map((column, index) => (
                <th 
                  key={index} 
                  className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-4 py-4 whitespace-nowrap">
                      {column.render ? column.render(row) : (
                        <span className="text-sm font-medium text-slate-700">
                          {row[column.accessor]}
                        </span>
                      )}
                    </td>
                  ))}
                  </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 font-medium">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-white">
          <p className="text-sm text-slate-500 font-medium">
            Showing <span className="text-slate-900">1</span> to <span className="text-slate-900">{data.length}</span> of <span className="text-slate-900">{(data.length * 2.5).toFixed(0)}</span> entries
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-border rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors">
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map(page => (
                <button 
                  key={page}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                    page === 1 ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-slate-100 text-slate-600"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
            <button className="p-2 border border-border rounded-xl hover:bg-slate-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
