import React from 'react';
import {
  FileSpreadsheet,
  Download,
  RotateCcw,
  Upload,
  Calendar,
  UserCheck,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { useSalesData } from '../context/SalesDataContext';
import { formatDateVN } from '../utils/formatters';

interface HeaderProps {
  onOpenUpload: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenUpload, onOpenExport }) => {
  const {
    fileInfo,
    latestDate,
    earliestDate,
    filterState,
    resetAllFilters,
    filteredRecords,
  } = useSalesData();

  // Count active filters
  const activeFiltersCount =
    (filterState.datePreset !== 'all' ? 1 : 0) +
    filterState.provinces.length +
    filterState.wards.length +
    filterState.channels.length +
    filterState.orderTypes.length +
    filterState.warehouses.length +
    filterState.itemCodes.length +
    filterState.supervisors.length +
    filterState.salesReps.length +
    filterState.orderStatuses.length +
    filterState.deliveryStatuses.length +
    filterState.paymentStatuses.length +
    filterState.invoiceStatuses.length +
    filterState.chartFilters.length +
    (filterState.qualityIssueFilter ? 1 : 0) +
    filterState.advancedFilters.length;

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 shadow-xs">
      {/* Top Banner: Creator Info & System Tagline */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-[11px] font-medium border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300">Hệ thống phân tích kinh doanh đa chiều</span>
          <span className="text-slate-500 hidden md:inline">·</span>
          <span className="text-slate-400 hidden md:inline">Bảo toàn 41 cột dữ liệu nguồn</span>
        </div>

        {/* Creator Info prominently displayed */}
        <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/15 transition-colors">
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300 font-normal">Người tạo:</span>
          <span className="font-bold tracking-wider text-emerald-300 uppercase">
            NGUYENTHANHNGHIA
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-emerald-400 flex items-center justify-center font-bold shadow-md shadow-slate-900/10 border border-slate-800">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-950 uppercase leading-none font-sans">
                BÁO CÁO BÁN HÀNG
              </h1>
              <span className="hidden sm:inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                PRO ANALYTICS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-none truncate max-w-xs md:max-w-md font-medium">
              {fileInfo.fileName}
            </p>
          </div>
        </div>

        {/* Zone 2: Date metadata & status indicators (No pill sandwich) */}
        <div className="hidden xl:flex items-center gap-5 text-xs text-slate-600 bg-slate-50/80 px-4 py-2 rounded-xl border border-slate-200/60">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Kỳ báo cáo:</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {formatDateVN(earliestDate)} — {formatDateVN(latestDate)}
            </span>
          </div>
          <span className="text-slate-300" aria-hidden="true">|</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Dữ liệu mới nhất:</span>
            <span className="font-bold text-emerald-800 tabular-nums bg-emerald-100/70 px-2 py-0.5 rounded text-xs border border-emerald-200/50">
              {formatDateVN(latestDate)}
            </span>
          </div>
          <span className="text-slate-300" aria-hidden="true">|</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Đang hiển thị:</span>
            <span className="font-bold text-slate-900 tabular-nums font-mono">
              {filteredRecords.length.toLocaleString('vi-VN')} / {fileInfo.totalRows.toLocaleString('vi-VN')} dòng
            </span>
          </div>
        </div>

        {/* Zone 3: Global Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {activeFiltersCount > 0 && (
            <button
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all border border-rose-200/80 shadow-2xs hover:shadow-xs"
              title="Xóa toàn bộ các bộ lọc đang áp dụng"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xóa bộ lọc</span>
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            </button>
          )}

          <button
            onClick={onOpenExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-all border border-slate-300 shadow-2xs hover:shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Xuất báo cáo</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 rounded-xl shadow-xs transition-all hover:shadow-md border border-slate-800"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tải file mới</span>
          </button>
        </div>
      </div>
    </header>
  );
};
