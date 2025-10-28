// app/components/MonthTable.tsx
"use client";

import { ROW_LABELS, RowsJson } from "@/lib/rows";
import { useState } from "react";

interface MonthTableProps {
  rows: RowsJson;
  days: number;
  onChange: (rowLabel: string, dayIndex: number, value: string) => void;
}

export default function MonthTable({ rows, days, onChange }: MonthTableProps) {
  const dayHeaders = Array.from({ length: days }, (_, i) => i + 1);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  return (
    <div className="overflow-auto print:overflow-visible">
      <table className="w-full border-collapse" role="grid">
        <thead>
          <tr>
            <th className="sticky left-0 top-0 z-20 bg-slate-700 text-white border-2 border-slate-600 p-3 min-w-[200px] font-bold text-sm">
              Parametre
            </th>
            {dayHeaders.map((day) => (
              <th
                key={day}
                onMouseEnter={() => setHoveredCol(day - 1)}
                onMouseLeave={() => setHoveredCol(null)}
                className={`
                  sticky top-0 z-10 text-white p-2.5 min-w-[90px] w-[90px] font-semibold text-sm
                  border-2 border-slate-600
                  ${day % 5 === 0 ? 'bg-indigo-600' : 'bg-slate-600'}
                  ${hoveredCol === day - 1 ? 'bg-blue-500 shadow-lg' : ''}
                  transition-all duration-150
                `}
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROW_LABELS.map((label, rowIndex) => (
            <tr 
              key={label}
              onMouseEnter={() => setHoveredRow(rowIndex)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td 
                className={`
                  sticky left-0 z-10 
                  border-2 border-slate-300
                  p-3 font-semibold text-sm
                  ${rowIndex % 2 === 0 ? 'bg-slate-50 text-slate-800' : 'bg-white text-slate-700'}
                  ${hoveredRow === rowIndex ? 'bg-blue-100 text-blue-900' : ''}
                  transition-colors duration-150
                `}
              >
                {label}
              </td>
              
              {dayHeaders.map((day, dayIndex) => (
                <td 
                  key={`${label}-${day}`} 
                  className={`
                    p-0
                    border border-slate-200
                    ${day % 5 === 0 ? 'border-r-2 border-r-indigo-300' : ''}
                    ${(rowIndex + 1) % 5 === 0 ? 'border-b-2 border-b-indigo-200' : ''}
                    ${hoveredRow === rowIndex ? 'bg-blue-50' : rowIndex % 2 === 0 ? 'bg-slate-50/30' : 'bg-white'}
                    ${hoveredCol === dayIndex ? 'bg-blue-50' : ''}
                    ${hoveredRow === rowIndex && hoveredCol === dayIndex ? 'bg-blue-100' : ''}
                    transition-colors duration-150
                  `}
                >
                  <input
                    type="text"
                    inputMode="decimal"
                    value={rows[label]?.[dayIndex] || ""}
                    onChange={(e) => {
                      onChange(label, dayIndex, e.target.value);
                    }}
                    onFocus={() => {
                      setHoveredRow(rowIndex);
                      setHoveredCol(dayIndex);
                    }}
                    onKeyDown={(e) => {
                      const currentRow = rowIndex;
                      const currentCol = dayIndex;
                      let nextRow = currentRow;
                      let nextCol = currentCol;

                      // Enter veya Aşağı ok: bir satır aşağı
                      if (e.key === 'Enter' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        nextRow = Math.min(currentRow + 1, ROW_LABELS.length - 1);
                      }
                      // Yukarı ok: bir satır yukarı
                      else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        nextRow = Math.max(currentRow - 1, 0);
                      }
                      // Tab veya Sağ ok: bir kolon sağa
                      else if (e.key === 'Tab' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        nextCol = Math.min(currentCol + 1, days - 1);
                      }
                      // Shift+Tab veya Sol ok: bir kolon sola
                      else if ((e.key === 'Tab' && e.shiftKey) || e.key === 'ArrowLeft') {
                        e.preventDefault();
                        nextCol = Math.max(currentCol - 1, 0);
                      }
                      else {
                        return; // Diğer tuşlar için normal davranış
                      }

                      // Bir sonraki hücreyi seç
                      const nextInput = document.querySelector(
                        `input[data-row="${nextRow}"][data-col="${nextCol}"]`
                      ) as HTMLInputElement;
                      if (nextInput) {
                        nextInput.focus();
                        nextInput.select();
                      }
                    }}
                    data-row={rowIndex}
                    data-col={dayIndex}
                    className={`
                      w-full min-h-[44px] px-2 py-2.5 
                      focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-amber-50
                      bg-transparent font-medium text-sm text-center
                      border-0
                    `}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
