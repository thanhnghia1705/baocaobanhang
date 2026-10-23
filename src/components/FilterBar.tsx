import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  Filter,
  ChevronDown,
  X,
  Search,
  Check,
  SlidersHorizontal,
  AlertTriangle,
} from 'lucide-react';
import { useSalesData } from '../context/SalesDataContext';
import { DateFilterPreset } from '../types/sales';

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Tìm kiếm...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    (opt || '(Trống)').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((item) => item !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
          selected.length > 0
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-1 ring-emerald-400 shadow-xs'
            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50 shadow-2xs'
        }`}
      >
        <span className="truncate max-w-[125px]">
          {label} {selected.length > 0 ? `(${selected.length})` : ''}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-68 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-3 space-y-2.5 animate-in fade-in-50 duration-150">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 font-medium">
            <button
              onClick={handleSelectAll}
              className="hover:text-slate-900 hover:underline transition-colors"
            >
              {selected.length === options.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
            {selected.length > 0 && (
              <button
                onClick={() => onChange([])}
                className="text-rose-600 hover:text-rose-700 hover:underline transition-colors"
              >
                Xóa chọn
              </button>
            )}
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
            {filteredOptions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-3">Không tìm thấy kết quả</p>
            ) : (
              filteredOptions.map((opt) => {
                const isChecked = selected.includes(opt);
                return (
                  <button
                    key={opt || '__empty__'}
                    onClick={() => toggleOption(opt)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="truncate pr-2 text-slate-800 font-medium">
                      {opt || <span className="italic text-slate-400">(Trống)</span>}
                    </span>
                    <span
                      className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface FilterBarProps {
  onOpenAdvancedFilter: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ onOpenAdvancedFilter }) => {
  const {
    filterState,
    setFilterState,
    uniqueValues,
    removeChartFilter,
    setQualityFilter,
    filteredRecords,
  } = useSalesData();

  // If a supervisor is selected, narrow sales reps to only reps under that supervisor
  const availableSalesReps = React.useMemo(() => {
    if (filterState.supervisors.length === 0) {
      return uniqueValues.salesReps;
    }
    const repsSet = new Set<string>();
    filteredRecords.forEach((r) => {
      if (r.supervisor && filterState.supervisors.includes(r.supervisor) && r.salesRep) {
        repsSet.add(r.salesRep);
      }
    });
    return Array.from(repsSet).sort();
  }, [filterState.supervisors, filteredRecords, uniqueValues.salesReps]);

  const datePresets: { id: DateFilterPreset; label: string }[] = [
    { id: 'all', label: 'Toàn bộ' },
    { id: '7d', label: '7 ngày' },
    { id: '14d', label: '14 ngày' },
    { id: '30d', label: '30 ngày' },
    { id: 'this_month', label: 'Tháng này' },
    { id: 'custom', label: 'Tùy chọn' },
  ];

  return (
    <div className="bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-3.5 space-y-3 shadow-2xs">
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Date presets with modern styling */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 shadow-inner shrink-0">
          <div className="px-2 text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          {datePresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setFilterState((prev) => ({ ...prev, datePreset: preset.id }))}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 ${
                filterState.datePreset === preset.id
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom date range inputs if 'custom' is active */}
        {filterState.datePreset === 'custom' && (
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="font-medium text-slate-500">Từ:</span>
            <input
              type="date"
              value={filterState.customStartDate || ''}
              onChange={(e) =>
                setFilterState((prev) => ({ ...prev, customStartDate: e.target.value }))
              }
              className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <span className="font-medium text-slate-500">Đến:</span>
            <input
              type="date"
              value={filterState.customEndDate || ''}
              onChange={(e) =>
                setFilterState((prev) => ({ ...prev, customEndDate: e.target.value }))
              }
              className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        )}

        {/* Quick Multi-select Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <MultiSelectDropdown
            label="Tỉnh / Thành"
            options={uniqueValues.provinces}
            selected={filterState.provinces}
            onChange={(selected) => setFilterState((prev) => ({ ...prev, provinces: selected }))}
          />

          <MultiSelectDropdown
            label="Kênh bán"
            options={uniqueValues.channels}
            selected={filterState.channels}
            onChange={(selected) => setFilterState((prev) => ({ ...prev, channels: selected }))}
          />

          <MultiSelectDropdown
            label="Giám sát"
            options={uniqueValues.supervisors}
            selected={filterState.supervisors}
            onChange={(selected) => setFilterState((prev) => ({ ...prev, supervisors: selected }))}
          />

          <MultiSelectDropdown
            label="Nhân viên"
            options={availableSalesReps}
            selected={filterState.salesReps}
            onChange={(selected) => setFilterState((prev) => ({ ...prev, salesReps: selected }))}
          />

          <MultiSelectDropdown
            label="Trạng thái đơn"
            options={uniqueValues.orderStatuses}
            selected={filterState.orderStatuses}
            onChange={(selected) =>
              setFilterState((prev) => ({ ...prev, orderStatuses: selected }))
            }
          />

          <MultiSelectDropdown
            label="Giao hàng"
            options={uniqueValues.deliveryStatuses}
            selected={filterState.deliveryStatuses}
            onChange={(selected) =>
              setFilterState((prev) => ({ ...prev, deliveryStatuses: selected }))
            }
          />

          <button
            onClick={onOpenAdvancedFilter}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              filterState.advancedFilters.length > 0
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-1 ring-emerald-400'
                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Bộ lọc nâng cao</span>
            {filterState.advancedFilters.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                {filterState.advancedFilters.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {(filterState.chartFilters.length > 0 ||
        filterState.qualityIssueFilter ||
        filterState.supervisors.length > 0 ||
        filterState.salesReps.length > 0 ||
        filterState.provinces.length > 0 ||
        filterState.channels.length > 0 ||
        filterState.orderStatuses.length > 0 ||
        filterState.deliveryStatuses.length > 0 ||
        filterState.advancedFilters.length > 0) && (
        <div className="max-w-[1920px] mx-auto flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            Đang áp dụng:
          </span>

          {/* Quality issue chip */}
          {filterState.qualityIssueFilter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-950 border border-amber-300 shadow-2xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>
                Cảnh báo:{' '}
                {filterState.qualityIssueFilter === 'deliveryBeforeOrder' && 'Ngày giao < Ngày đặt'}
                {filterState.qualityIssueFilter === 'missingDeliveryStatus' && 'Thiếu tình trạng giao'}
                {filterState.qualityIssueFilter === 'missingActualDelivery' && 'Thiếu giờ giao thực tế'}
                {filterState.qualityIssueFilter === 'invoicedMissingNumber' && 'Đã xuất HD thiếu số HD'}
                {filterState.qualityIssueFilter === 'conflictingStatus' && 'Mâu thuẫn trạng thái'}
              </span>
              <button
                onClick={() => setQualityFilter(undefined)}
                className="hover:text-amber-800 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Chart cross-filters */}
          {filterState.chartFilters.map((cf, idx) => (
            <span
              key={`${cf.field}-${cf.value}-${idx}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-950 border border-emerald-300 shadow-2xs"
            >
              <span className="text-emerald-700 font-normal">Biểu đồ:</span>
              <span>{cf.label || cf.value}</span>
              <button
                onClick={() => removeChartFilter(idx)}
                className="hover:text-emerald-800 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Supervisor chips */}
          {filterState.supervisors.map((sup) => (
            <span
              key={sup}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-900 border border-slate-200"
            >
              <span>Giám sát: {sup}</span>
              <button
                onClick={() =>
                  setFilterState((prev) => ({
                    ...prev,
                    supervisors: prev.supervisors.filter((s) => s !== sup),
                  }))
                }
              >
                <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
              </button>
            </span>
          ))}

          {/* Sales rep chips */}
          {filterState.salesReps.map((rep) => (
            <span
              key={rep}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-900 border border-slate-200"
            >
              <span>NV: {rep}</span>
              <button
                onClick={() =>
                  setFilterState((prev) => ({
                    ...prev,
                    salesReps: prev.salesReps.filter((r) => r !== rep),
                  }))
                }
              >
                <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
              </button>
            </span>
          ))}

          {/* Province chips */}
          {filterState.provinces.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-900 border border-slate-200"
            >
              <span>Tỉnh: {p}</span>
              <button
                onClick={() =>
                  setFilterState((prev) => ({
                    ...prev,
                    provinces: prev.provinces.filter((item) => item !== p),
                  }))
                }
              >
                <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
              </button>
            </span>
          ))}

          {/* Channel chips */}
          {filterState.channels.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-900 border border-slate-200"
            >
              <span>Kênh: {c}</span>
              <button
                onClick={() =>
                  setFilterState((prev) => ({
                    ...prev,
                    channels: prev.channels.filter((item) => item !== c),
                  }))
                }
              >
                <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
