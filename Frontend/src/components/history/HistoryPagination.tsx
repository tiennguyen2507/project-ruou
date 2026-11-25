"use client";

import React from "react";

interface HistoryPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  filteredCount: number;
  onPageChange: (page: number) => void;
}

export function HistoryPagination({
  currentPage,
  totalPages,
  pageSize,
  filteredCount,
  onPageChange,
}: HistoryPaginationProps) {
  if (filteredCount === 0) return null;

  return (
    <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
      <div>
        Hiển thị {(currentPage - 1) * pageSize + 1} -{" "}
        {Math.min(currentPage * pageSize, filteredCount)} trên tổng số{" "}
        {filteredCount} dòng
      </div>

      <div className="flex items-center gap-1">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="px-2.5 py-1 text-gray-600 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Trước
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold cursor-pointer ${
                currentPage === pageNum
                  ? "bg-[#ea580c] text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        {totalPages > 5 && (
          <>
            <span className="px-1 text-gray-400">...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold cursor-pointer ${
                currentPage === totalPages
                  ? "bg-[#ea580c] text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="px-2.5 py-1 text-gray-600 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
