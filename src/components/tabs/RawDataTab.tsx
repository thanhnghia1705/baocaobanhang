import React, { useState, useMemo } from 'react';
import {
  TableProperties,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  AlertTriangle,
  Download,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useSalesData } from '../../context/SalesDataContext';
import { formatVND, formatNumber } from '../../utils/formatters';

export const RawDataTab: React.FC = () => {
  const {
    filteredRecords,
    headers,
    dataQualityAlerts,
    setQualityFilter,
    filterState,
    fileInfo,
  } = useSalesData();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    return headers.slice(0, 15);
  });
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  // Filter raw rows by global search term
  const searchedRecords = useMemo(() => {
    if (!searchTerm.trim()) return filteredRecords;
    const term = searchTerm.toLowerCase();

    return filteredRecords.filter((rec) => {
      for (const key of headers) {
        const val = rec._raw[key];
        if (val !== undefined && val !== null) {
          if (String(val).toLowerCase().includes(term)) {
            return true;
          }
        }
      }
      return false;
    });
  }, [filteredRecords, searchTerm, headers]);

  // Sort rows
  const sortedRecords = useMemo(() => {
    if (!sortColumn) return searchedRecords;

    return [...searchedRecords].sort((a, b) => {
      const valA = a._raw[sortColumn];
      const valB = b._raw[sortColumn];

      if (valA === valB) return 0;
      if (valA === undefined || valA === null || valA === '') return 1;
      if (valB === undefined || valB === null || valB === '') return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA);
      const strB = String(valB);
      return sortDirection === 'asc'
        ? strA.localeCompare(strB, 'vi-VN')
        : strB.localeCompare(strA, 'vi-VN');
    });
  }, [searchedRecords, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
      }
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const toggleColumnVisibility = (col: string) => {
    if (visibleColumns.includes(col)) {
      if (visibleColumns.length > 3) {
        setVisibleColumns(visibleColumns.filter((c) => c !== col));
      }
    } else {
      setVisibleColumns([...visibleColumns, col]);
    }
  };

  const selectAllColumns = () => setVisibleColumns([...headers]);
  const resetDefaultColumns = () => setVisibleColumns(headers.slice(0, 15));

  return (
    <div className="space-y-6">
      {/* Data Quality & Audit Cards Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-200">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">
                Kiểm Toán & Cảnh Báo Chất Lượng Dữ Liệu
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Tự động rà soát sai sót logic không làm thay đổi dữ liệu gốc. Bấm để lọc ngay các dòng vi phạm.
              </p>
            </div>
          </div>

          {filterState.qualityIssueFilter && (
            <button
              onClick={() => setQualityFilter(undefined)}
              className="text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-colors border border-rose-200 shadow-2xs"
            >
              Hủy lọc theo cảnh báo
            </button>
          )}
        </div>

        {/* 5 Quality Check Alert Widgets with Modern Vivid Rounded styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* 1. Missing Delivery Status (Orange / Amber) */}
          <div
            onClick={() => setQualityFilter('missingDeliveryStatus')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterState.qualityIssueFilter === 'missingDeliveryStatus'
                ? 'border-amber-500 bg-gradient-to-b from-amber-100/90 to-amber-50 ring-2 ring-amber-400 shadow-sm scale-102'
                : 'border-amber-200/80 bg-gradient-to-b from-amber-50/60 via-white to-white hover:border-amber-400 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-amber-950">Thiếu tình trạng giao</span>
              <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shadow-2xs">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-amber-950 mt-1.5 tabular-nums">
              {formatNumber(dataQualityAlerts.missingDeliveryStatusCount)}
            </p>
            <p className="text-[10px] text-amber-800/80 mt-1 font-medium">Dòng rỗng trạng thái giao</p>
          </div>

          {/* 2. Missing Actual Delivery Time (Gold / Yellow) */}
          <div
            onClick={() => setQualityFilter('missingActualDelivery')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterState.qualityIssueFilter === 'missingActualDelivery'
                ? 'border-yellow-500 bg-gradient-to-b from-yellow-100/90 to-yellow-50 ring-2 ring-yellow-400 shadow-sm scale-102'
                : 'border-yellow-200/80 bg-gradient-to-b from-yellow-50/60 via-white to-white hover:border-yellow-400 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-yellow-950">Thiếu giờ giao thực tế</span>
              <div className="w-6 h-6 rounded-lg bg-yellow-500 text-white flex items-center justify-center font-bold shadow-2xs">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-yellow-950 mt-1.5 tabular-nums">
              {formatNumber(dataQualityAlerts.missingActualDeliveryCount)}
            </p>
            <p className="text-[10px] text-yellow-800/80 mt-1 font-medium">Chưa cập nhật mốc giờ</p>
          </div>

          {/* 3. Delivery date before order date (Crimson / Rose) */}
          <div
            onClick={() => setQualityFilter('deliveryBeforeOrder')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterState.qualityIssueFilter === 'deliveryBeforeOrder'
                ? 'border-rose-500 bg-gradient-to-b from-rose-100/90 to-rose-50 ring-2 ring-rose-400 shadow-sm scale-102'
                : 'border-rose-200/80 bg-gradient-to-b from-rose-50/60 via-white to-white hover:border-rose-400 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-rose-950">Ngày giao &lt; Ngày đặt</span>
              <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold shadow-2xs">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-rose-700 mt-1.5 tabular-nums">
              {formatNumber(dataQualityAlerts.deliveryBeforeOrderCount)}
            </p>
            <p className="text-[10px] text-rose-700/80 mt-1 font-bold">Lỗi logic thời gian hẹn</p>
          </div>

          {/* 4. Invoiced but missing invoice number (Purple / Violet) */}
          <div
            onClick={() => setQualityFilter('invoicedMissingNumber')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterState.qualityIssueFilter === 'invoicedMissingNumber'
                ? 'border-purple-500 bg-gradient-to-b from-purple-100/90 to-purple-50 ring-2 ring-purple-400 shadow-sm scale-102'
                : 'border-purple-200/80 bg-gradient-to-b from-purple-50/60 via-white to-white hover:border-purple-400 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-purple-950">Đã xuất HD thiếu số</span>
              <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold shadow-2xs">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-purple-950 mt-1.5 tabular-nums">
              {formatNumber(dataQualityAlerts.invoicedMissingNumberCount)}
            </p>
            <p className="text-[10px] text-purple-800/80 mt-1 font-medium">Đánh dấu đã xuất nhưng rỗng số</p>
          </div>

          {/* 5. Conflicting status across lines in same order (Cyan / Sky) */}
          <div
            onClick={() => setQualityFilter('conflictingStatus')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterState.qualityIssueFilter === 'conflictingStatus'
                ? 'border-cyan-500 bg-gradient-to-b from-cyan-100/90 to-cyan-50 ring-2 ring-cyan-400 shadow-sm scale-102'
                : 'border-cyan-200/80 bg-gradient-to-b from-cyan-50/60 via-white to-white hover:border-cyan-400 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-cyan-950">Mâu thuẫn trạng thái</span>
              <div className="w-6 h-6 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold shadow-2xs">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-cyan-950 mt-1.5 tabular-nums">
              {formatNumber(dataQualityAlerts.conflictingStatusOrdersCount)} đơn
            </p>
            <p className="text-[10px] text-cyan-800/80 mt-1 font-medium">Các dòng có trạng thái lệch nhau</p>
          </div>
        </div>
      </div>

      {/* Raw Data Table Container */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Tìm kiếm trong 41 cột..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-64 font-medium"
              />
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Hiển thị <span className="font-bold text-slate-900">{sortedRecords.length.toLocaleString('vi-VN')}</span> dòng dữ liệu
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Column Picker Button & Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColumnPicker(!showColumnPicker)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Ẩn / Hiện cột ({visibleColumns.length}/{headers.length})</span>
              </button>

              {showColumnPicker && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-3.5 space-y-2.5 animate-in fade-in-50">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900">41 Cột nguồn gốc</span>
                    <div className="flex gap-2 text-[11px] text-emerald-700 font-bold">
                      <button onClick={selectAllColumns} className="hover:underline">
                        Tất cả
                      </button>
                      <span>·</span>
                      <button onClick={resetDefaultColumns} className="hover:underline">
                        Mặc định
                      </button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                    {headers.map((col) => {
                      const isVisible = visibleColumns.includes(col);
                      return (
                        <label
                          key={col}
                          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 cursor-pointer text-xs text-slate-800 font-medium"
                        >
                          <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={() => toggleColumnVisibility(col)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                          />
                          <span className="truncate">{col}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-700 shadow-2xs"
            >
              <option value={25}>25 dòng/trang</option>
              <option value={50}>50 dòng/trang</option>
              <option value={100}>100 dòng/trang</option>
              <option value={200}>200 dòng/trang</option>
            </select>
          </div>
        </div>

        {/* Big Table Container */}
        <div className="border border-slate-200 rounded-2xl overflow-x-auto max-h-[560px] overflow-y-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-100/90 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200 backdrop-blur-xs">
              <tr>
                <th className="py-3 px-3 w-12 text-center">STT</th>
                {visibleColumns.map((col) => {
                  const isSorted = sortColumn === col;

                  return (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors select-none font-bold"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col}</span>
                        <ArrowUpDown
                          className={`w-3 h-3 ${
                            isSorted ? 'text-emerald-700 stroke-[2.5]' : 'text-slate-400'
                          }`}
                        />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length + 1}
                    className="py-12 text-center text-slate-400 font-medium"
                  >
                    Không có dòng dữ liệu nào thỏa mãn điều kiện lọc
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;

                  return (
                    <tr key={r._id} className="hover:bg-slate-50/90 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {globalIdx}
                      </td>
                      {visibleColumns.map((col) => {
                        const val = r._raw[col];
                        const isNum = typeof val === 'number';

                        return (
                          <td
                            key={col}
                            className={`py-2.5 px-3 ${
                              isNum ? 'text-right font-mono tabular-nums font-semibold' : ''
                            }`}
                          >
                            {val !== undefined && val !== null && val !== '' ? (
                              isNum ? (
                                col.toLowerCase().includes('tiền') || col.toLowerCase().includes('vat') ? (
                                  <span className="font-bold text-slate-950">{formatVND(val)}</span>
                                ) : (
                                  formatNumber(val)
                                )
                              ) : (
                                String(val)
                              )
                            ) : (
                              <span className="text-slate-300 italic font-mono">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
          <div>
            Trang <span className="font-bold text-slate-900">{currentPage}</span> /{' '}
            <span className="font-bold text-slate-900">{totalPages}</span> (Tổng cộng{' '}
            {sortedRecords.length.toLocaleString('vi-VN')} dòng)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-mono font-bold text-slate-900">{currentPage}</span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
