// app/components/MonthTable.tsx
"use client";

import type { LabParameter } from "@/lib/parameter-types";
import type { RowsJson } from "@/lib/rows";
import { useState } from "react";

interface MonthTableProps {
  parameters: LabParameter[];
  rows: RowsJson;
  days: number;
  isAdmin: boolean;
  onChange: (parameterId: string, dayIndex: number, value: string) => void;
  onDeleteParameter?: (parameter: LabParameter) => void;
}

export default function MonthTable({
  parameters,
  rows,
  days,
  isAdmin,
  onChange,
  onDeleteParameter,
}: MonthTableProps) {
  const dayHeaders = Array.from({ length: days }, (_, i) => i + 1);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const rowCount = parameters.length;

  return (
    <div className="overflow-auto print:overflow-visible">
      <table className="w-full border-collapse" role="grid" style={{ tableLayout: "auto" }}>
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
                  sticky top-0 z-10 text-white p-2.5 min-w-[70px] max-w-[200px] w-auto font-semibold text-sm
                  border-2 border-slate-600
                  ${day % 5 === 0 ? "bg-indigo-600" : "bg-slate-600"}
                  ${hoveredCol === day - 1 ? "bg-blue-500 shadow-lg" : ""}
                  transition-all duration-150
                `}
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parameters.map((parameter, rowIndex) => (
            <tr
              key={parameter.id}
              onMouseEnter={() => setHoveredRow(rowIndex)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td
                className={`
                  sticky left-0 z-10 
                  border-2 border-slate-300
                  p-3 font-semibold text-sm
                  ${rowIndex % 2 === 0 ? "bg-slate-50 text-slate-800" : "bg-white text-slate-700"}
                  ${hoveredRow === rowIndex ? "bg-blue-100 text-blue-900" : ""}
                  transition-colors duration-150
                `}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{parameter.name}</span>
                  {isAdmin && onDeleteParameter && (
                    <button
                      type="button"
                      onClick={() => onDeleteParameter(parameter)}
                      className="print:hidden text-slate-400 hover:text-red-600 p-1 rounded"
                      title="Parametreyi kaldır"
                      aria-label={`${parameter.name} parametresini kaldır`}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </td>

              {dayHeaders.map((day, dayIndex) => (
                <td
                  key={`${parameter.id}-${day}`}
                  className={`
                    p-0
                    border border-slate-200
                    ${day % 5 === 0 ? "border-r-2 border-r-indigo-300" : ""}
                    ${(rowIndex + 1) % 5 === 0 ? "border-b-2 border-b-indigo-200" : ""}
                    ${hoveredRow === rowIndex ? "bg-blue-50" : rowIndex % 2 === 0 ? "bg-slate-50/30" : "bg-white"}
                    ${hoveredCol === dayIndex ? "bg-blue-50" : ""}
                    ${hoveredRow === rowIndex && hoveredCol === dayIndex ? "bg-blue-100" : ""}
                    transition-colors duration-150
                  `}
                >
                  <input
                    type="text"
                    inputMode="decimal"
                    value={rows[parameter.id]?.[dayIndex] || ""}
                    onChange={(e) => {
                      onChange(parameter.id, dayIndex, e.target.value);
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

                      if (e.key === "Enter" || e.key === "ArrowDown") {
                        e.preventDefault();
                        nextRow = Math.min(currentRow + 1, rowCount - 1);
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        nextRow = Math.max(currentRow - 1, 0);
                      } else if (e.key === "Tab" || e.key === "ArrowRight") {
                        e.preventDefault();
                        nextCol = Math.min(currentCol + 1, days - 1);
                      } else if ((e.key === "Tab" && e.shiftKey) || e.key === "ArrowLeft") {
                        e.preventDefault();
                        nextCol = Math.max(currentCol - 1, 0);
                      } else {
                        return;
                      }

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
                    style={{ minWidth: "70px" }}
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
