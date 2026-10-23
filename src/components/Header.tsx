import React from 'react';
import {
  Download,
  RotateCcw,
  Upload,
  Calendar,
  UserCheck,
  Sparkles,
  BarChart3,
  Award,
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
      {/* Top Banner: Creator Info & Executive Brand Stripe */}
      <div className="bg-gradient-to-r from-[#0c1427] via-[#112240] to-[#1e1b4b] text-white px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-[11px] font-medium border-b border-indigo-900/40">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-sm shadow-emerald-400"></span>
          </span>
          <span className="text-slate-200 font-semibold tracking-wide">
            HỆ THỐNG BÁO CÁO BÁN HÀNG DOANH NGHIỆP
          </span>
          <span className="text-slate-500 hidden md:inline">|</span>
          <span className="text-cyan-300 font-medium hidden md:inline">
            Tự động bóc tách 41 cột dữ liệu · Giám sát · Nhân viên · Nhà thuốc
          </span>
        </div>

        {/* Creator Info prominently displayed with Gold/Emerald Badge */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 backdrop-blur-md px-3.5 py-1 rounded-full border border-emerald-400/40 shadow-xs transition-all">
          <Award className="w-4 h-4 text-amber-300" />
          <span className="text-slate-300 font-normal">Người tạo:</span>
          <span className="font-extrabold tracking-wider text-emerald-300 uppercase text-xs">
            NGUYENTHANHNGHIA
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark with Rich Gradient Icon */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-teal-900 text-emerald-400 flex items-center justify-center font-bold shadow-md shadow-indigo-950/20 border border-indigo-700/50">
            <BarChart3 className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 bg-clip-text text-transparent uppercase leading-none font-sans">
                BÁO CÁO BÁN HÀNG
              </h1>
              <span className="hidden sm:inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-2xs">
                PRO ANALYTICS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-none truncate max-w-xs md:max-w-md font-semibold">
              {fileInfo.fileName}
            </p>
          </div>
        </div>

        {/* Zone 2: Date metadata & status indicators with Colorful Accents */}
        <div className="hidden xl:flex items-center gap-5 text-xs text-slate-600 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-emerald-50/30 px-4 py-2 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Calendar className="w-3 h-3" />
            </div>
            <span className="text-slate-500 font-medium">Kỳ báo cáo:</span>
            <span className="font-bold text-slate-900 tabular-nums font-mono">
              {formatDateVN(earliestDate)} — {formatDateVN(latestDate)}
            </span>
          </div>
          <span className="text-slate-300" aria-hidden="true">|</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Ngày mới nhất:</span>
            <span className="font-extrabold text-emerald-900 tabular-nums bg-emerald-100 border border-emerald-300/80 px-2.5 py-0.5 rounded-lg text-xs shadow-2xs font-mono">
              {formatDateVN(latestDate)}
            </span>
          </div>
          <span className="text-slate-300" aria-hidden="true">|</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Đang hiển thị:</span>
            <span className="font-extrabold text-indigo-950 tabular-nums font-mono bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
              {filteredRecords.length.toLocaleString('vi-VN')} / {fileInfo.totalRows.toLocaleString('vi-VN')} dòng
            </span>
          </div>
        </div>

        {/* Zone 3: Global Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {activeFiltersCount > 0 && (
            <button
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all border border-rose-200 shadow-2xs hover:shadow-xs"
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-950 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 rounded-xl transition-all border border-indigo-200/80 shadow-2xs hover:shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Xuất báo cáo</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 hover:from-slate-800 hover:to-teal-800 rounded-xl shadow-md shadow-indigo-950/20 transition-all hover:shadow-lg border border-indigo-800/50"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tải file mới</span>
          </button>
        </div>
      </div>
    </header>
  );
};
