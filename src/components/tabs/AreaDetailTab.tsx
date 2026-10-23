import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  MapPin,
  Users2,
  UserCheck,
  Building2,
  Package,
  Receipt,
  Search,
  Download,
  Filter,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  ChevronRight,
  ClipboardPen,
  Save,
  MessageSquare,
} from 'lucide-react';
import { useSalesData } from '../../context/SalesDataContext';
import {
  formatVND,
  formatCompactVND,
  formatNumber,
  formatPercent,
  formatDateVN,
} from '../../utils/formatters';

export const AreaDetailTab: React.FC = () => {
  const { filteredRecords, uniqueValues, filterState } = useSalesData();

  // 1. Supervisor Selection (defaults to first supervisor or currently filtered supervisor)
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>(() => {
    if (filterState.supervisors.length > 0) return filterState.supervisors[0];
    return uniqueValues.supervisors[0] || '';
  });

  // Keep in sync if global supervisor filter changes
  useEffect(() => {
    if (filterState.supervisors.length > 0) {
      setSelectedSupervisor(filterState.supervisors[0]);
    }
  }, [filterState.supervisors]);

  // If no supervisor selected yet, pick first available
  useEffect(() => {
    if (!selectedSupervisor && uniqueValues.supervisors.length > 0) {
      setSelectedSupervisor(uniqueValues.supervisors[0]);
    }
  }, [uniqueValues.supervisors, selectedSupervisor]);

  // 2. All records under the selected supervisor
  const supervisorRecords = useMemo(() => {
    if (!selectedSupervisor) return [];
    return filteredRecords.filter((r) => r.supervisor === selectedSupervisor);
  }, [filteredRecords, selectedSupervisor]);

  // 3. Supervisor Info & Metrics
  const supervisorSummary = useMemo(() => {
    let rev = 0;
    let qty = 0;
    const ordersSet = new Set<string>();
    const partnersSet = new Set<string>();
    const provincesSet = new Set<string>();
    let areaDirector = '';
    let unitDirector = '';

    supervisorRecords.forEach((r) => {
      rev += r.revenueVAT;
      qty += r.quantity;
      if (r.orderId) ordersSet.add(r.orderId);
      if (r.partnerId) partnersSet.add(r.partnerId);
      if (r.province) provincesSet.add(r.province);
      if (!areaDirector && r.areaDirector) areaDirector = r.areaDirector;
      if (!unitDirector && r.unitDirector) unitDirector = r.unitDirector;
    });

    return {
      revenue: rev,
      quantity: qty,
      ordersCount: ordersSet.size,
      partnersCount: partnersSet.size,
      provincesCount: provincesSet.size,
      areaDirector: areaDirector || 'Khu vực phụ trách',
      unitDirector: unitDirector || 'Đơn vị kinh doanh',
    };
  }, [supervisorRecords]);

  // 4. Sales Reps of this supervisor and their VAT revenue
  const salesRepsList = useMemo(() => {
    const map = new Map<
      string,
      {
        rep: string;
        revenue: number;
        qty: number;
        orders: Set<string>;
        partners: Set<string>;
        provinces: Set<string>;
        teamLead: string;
      }
    >();

    supervisorRecords.forEach((r) => {
      const name = r.salesRep || '(Chưa phân bổ)';
      if (!map.has(name)) {
        map.set(name, {
          rep: name,
          revenue: 0,
          qty: 0,
          orders: new Set(),
          partners: new Set(),
          provinces: new Set(),
          teamLead: r.teamLead || '',
        });
      }
      const item = map.get(name)!;
      item.revenue += r.revenueVAT;
      item.qty += r.quantity;
      if (r.orderId) item.orders.add(r.orderId);
      if (r.partnerId) item.partners.add(r.partnerId);
      if (r.province) item.provinces.add(r.province);
    });

    const list = Array.from(map.values())
      .map((item) => ({
        rep: item.rep,
        revenue: item.revenue,
        qty: item.qty,
        ordersCount: item.orders.size,
        partnersCount: item.partners.size,
        provincesCount: item.provinces.size,
        teamLead: item.teamLead,
        share:
          supervisorSummary.revenue > 0
            ? (item.revenue / supervisorSummary.revenue) * 100
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return list;
  }, [supervisorRecords, supervisorSummary.revenue]);

  // Selected Sales Rep for granular breakdown
  const [selectedSalesRep, setSelectedSalesRep] = useState<string>('');

  // Default to first sales rep when supervisor changes
  useEffect(() => {
    if (salesRepsList.length > 0) {
      // If previous selection isn't in this supervisor's list, reset to first
      if (!salesRepsList.some((s) => s.rep === selectedSalesRep)) {
        setSelectedSalesRep(salesRepsList[0].rep);
      }
    } else {
      setSelectedSalesRep('');
    }
  }, [salesRepsList, selectedSalesRep]);

  // Search filter for sales rep list
  const [repSearch, setRepSearch] = useState('');
  const displayedReps = useMemo(() => {
    if (!repSearch.trim()) return salesRepsList;
    const term = repSearch.toLowerCase();
    return salesRepsList.filter(
      (r) =>
        r.rep.toLowerCase().includes(term) ||
        r.teamLead.toLowerCase().includes(term)
    );
  }, [salesRepsList, repSearch]);

  // 5. Detailed Breakdown Records of Selected Sales Rep
  // Required fields: Tỉnh / Thành phố, Tên nhà thuốc, Tên sản phẩm bán, Số lượng, Doanh số sản phẩm sau VAT
  const [detailSearch, setDetailSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');

  const selectedRepRecords = useMemo(() => {
    if (!selectedSalesRep) return [];
    return supervisorRecords.filter((r) => r.salesRep === selectedSalesRep);
  }, [supervisorRecords, selectedSalesRep]);

  // Unique provinces for the selected rep
  const repProvinces = useMemo(() => {
    const set = new Set<string>();
    selectedRepRecords.forEach((r) => {
      if (r.province) set.add(r.province);
    });
    return Array.from(set).sort();
  }, [selectedRepRecords]);

  // Filtered detailed transactions
  const displayedDetails = useMemo(() => {
    let result = selectedRepRecords;

    if (provinceFilter !== 'all') {
      result = result.filter((r) => r.province === provinceFilter);
    }

    if (detailSearch.trim()) {
      const term = detailSearch.toLowerCase();
      result = result.filter(
        (r) =>
          r.partnerName.toLowerCase().includes(term) ||
          r.partnerId.toLowerCase().includes(term) ||
          r.itemName.toLowerCase().includes(term) ||
          r.itemCode.toLowerCase().includes(term) ||
          r.province.toLowerCase().includes(term) ||
          r.ward.toLowerCase().includes(term) ||
          r.orderId.toLowerCase().includes(term)
      );
    }

    return result;
  }, [selectedRepRecords, provinceFilter, detailSearch]);

  // Summary stats for the selected rep's current filtered table view
  const repCurrentSummary = useMemo(() => {
    const rev = displayedDetails.reduce((sum, r) => sum + r.revenueVAT, 0);
    const qty = displayedDetails.reduce((sum, r) => sum + r.quantity, 0);
    const partners = new Set(displayedDetails.map((r) => r.partnerId)).size;
    const items = new Set(displayedDetails.map((r) => r.itemCode)).size;

    return { rev, qty, partners, items };
  }, [displayedDetails]);

  // 6. Meeting Review Notes per Supervisor
  const [reviewNote, setReviewNote] = useState<string>(() => {
    try {
      return localStorage.getItem(`review_note_${selectedSupervisor}`) || '';
    } catch {
      return '';
    }
  });

  const [isSavedNote, setIsSavedNote] = useState(false);

  useEffect(() => {
    try {
      const note = localStorage.getItem(`review_note_${selectedSupervisor}`) || '';
      setReviewNote(note);
    } catch {
      setReviewNote('');
    }
    setIsSavedNote(false);
  }, [selectedSupervisor]);

  const handleSaveNote = () => {
    try {
      localStorage.setItem(`review_note_${selectedSupervisor}`, reviewNote);
      setIsSavedNote(true);
      setTimeout(() => setIsSavedNote(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Export current breakdown table to Excel (.xlsx)
  const handleExportReviewExcel = () => {
    if (displayedDetails.length === 0) return;

    const data = displayedDetails.map((r, idx) => ({
      'STT': idx + 1,
      'Mã đơn hàng': r.orderId,
      'Ngày đặt hàng': r.orderDate,
      'Tỉnh / Thành phố': r.province,
      'Phường / Xã': r.ward,
      'Mã nhà thuốc': r.partnerId,
      'Tên nhà thuốc': r.partnerName,
      'Mã sản phẩm': r.itemCode,
      'Tên sản phẩm bán': r.itemName,
      'Đơn vị tính': r.unit,
      'Số lượng': r.quantity,
      'Doanh số sau VAT (VNĐ)': r.revenueVAT,
      'Nhân viên bán hàng': r.salesRep,
      'Giám sát': r.supervisor,
      'Tình trạng giao hàng': r.deliveryStatus,
      'Tình trạng thanh toán': r.paymentStatus,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Chi_Tiet_Review');

    const cleanRep = (selectedSalesRep || 'NhanVien').replace(/\s+/g, '_');
    const cleanSup = (selectedSupervisor || 'GiamSat').replace(/\s+/g, '_');
    XLSX.writeFile(wb, `Review_${cleanSup}_${cleanRep}_${Date.now()}.xlsx`);
  };

  // Colors for supervisor avatar pills
  const supervisorColorMap = useMemo(() => {
    const palettes = [
      { bg: 'from-blue-600 to-indigo-700', text: 'text-blue-300', ring: 'ring-blue-400', badge: 'bg-blue-500/20 text-blue-300 border-blue-400/30' },
      { bg: 'from-emerald-600 to-teal-700', text: 'text-emerald-300', ring: 'ring-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' },
      { bg: 'from-purple-600 to-pink-700', text: 'text-purple-300', ring: 'ring-purple-400', badge: 'bg-purple-500/20 text-purple-300 border-purple-400/30' },
      { bg: 'from-amber-500 to-orange-600', text: 'text-amber-300', ring: 'ring-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-400/30' },
      { bg: 'from-cyan-600 to-blue-700', text: 'text-cyan-300', ring: 'ring-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30' },
    ];
    const map = new Map<string, typeof palettes[0]>();
    uniqueValues.supervisors.forEach((s, idx) => {
      map.set(s, palettes[idx % palettes.length]);
    });
    return map;
  }, [uniqueValues.supervisors]);

  return (
    <div className="space-y-6">
      {/* Top Review Banner & Supervisor Picker */}
      <div className="bg-gradient-to-br from-[#0c1427] via-[#112240] to-[#1e1b4b] text-white rounded-3xl p-6 shadow-xl shadow-slate-950/20 border border-indigo-900/60 space-y-5 relative overflow-hidden">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none -mb-20" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-cyan-500/30 border border-white/20">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border border-cyan-400/40 shadow-xs">
                  PHẦN 5: REVIEW 1-1 QUẢN TRỊ VÙNG
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-200 tracking-tight uppercase mt-1">
                CHI TIẾT KHU VỰC & ĐÁNH GIÁ GIÁM SÁT
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Chọn Giám sát bên dưới để kiểm tra toàn bộ Nhân viên, sau đó bấm vào từng Nhân viên để bóc tách Tỉnh/Thành, Nhà thuốc, Sản phẩm và Doanh số sau VAT.
              </p>
            </div>
          </div>

          {/* Supervisor Quick Buttons & Dropdown */}
          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/20 backdrop-blur-md shadow-inner">
            <span className="text-xs font-bold text-slate-300 px-2 hidden sm:inline">Giám sát:</span>
            <select
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              className="px-3.5 py-2 text-xs font-black bg-slate-950 border border-indigo-700/60 rounded-xl text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-inner"
            >
              {uniqueValues.supervisors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Clickable Supervisor Pill Badges */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 relative z-10">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Chọn nhanh:</span>
          {uniqueValues.supervisors.map((sup) => {
            const isSelected = selectedSupervisor === sup;
            const style = supervisorColorMap.get(sup) || {
              bg: 'from-blue-600 to-indigo-700',
              text: 'text-blue-300',
              ring: 'ring-blue-400',
              badge: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
            };

            return (
              <button
                key={sup}
                onClick={() => setSelectedSupervisor(sup)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? `bg-gradient-to-r ${style.bg} text-white shadow-md shadow-indigo-900/40 border-white/30 scale-105`
                    : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white border-white/10'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
                <span>{sup}</span>
              </button>
            );
          })}
        </div>

        {/* Supervisor Team Summary Strip with Colorful Theme Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-4 border-t border-white/15 relative z-10">
          <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-3.5 border border-white/15 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
              Khu vực & Đơn vị
            </p>
            <p className="text-sm font-black text-white mt-1 truncate">
              {supervisorSummary.areaDirector}
            </p>
            <p className="text-[10px] text-slate-300 truncate mt-0.5">{supervisorSummary.unitDirector}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-white/5 rounded-2xl p-3.5 border border-emerald-400/30 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
              Doanh số team (+VAT)
            </p>
            <p className="text-xl font-black font-mono text-emerald-300 mt-1 tabular-nums">
              {formatCompactVND(supervisorSummary.revenue).compact}
            </p>
            <p className="text-[10px] text-slate-300 font-mono truncate mt-0.5">
              {formatVND(supervisorSummary.revenue)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 via-indigo-500/15 to-white/5 rounded-2xl p-3.5 border border-purple-400/30 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-purple-300">
              Quy mô nhân sự
            </p>
            <p className="text-xl font-black font-mono text-white mt-1 tabular-nums">
              {salesRepsList.length} Nhân viên
            </p>
            <p className="text-[10px] text-purple-200 mt-0.5">Đang phát sinh số</p>
          </div>

          <div className="bg-gradient-to-br from-teal-500/20 via-cyan-500/15 to-white/5 rounded-2xl p-3.5 border border-teal-400/30 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-teal-300">
              Nhà thuốc phục vụ
            </p>
            <p className="text-xl font-black font-mono text-teal-300 mt-1 tabular-nums">
              {formatNumber(supervisorSummary.partnersCount)}
            </p>
            <p className="text-[10px] text-slate-300 mt-0.5">Khách hàng đếm duy nhất</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-white/5 rounded-2xl p-3.5 border border-blue-400/30 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-blue-300">
              Đơn hàng & Sản lượng
            </p>
            <p className="text-xl font-black font-mono text-white mt-1 tabular-nums">
              {formatNumber(supervisorSummary.ordersCount)} đơn
            </p>
            <p className="text-[10px] text-blue-200 mt-0.5">{formatNumber(supervisorSummary.quantity)} sản phẩm</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-white/5 rounded-2xl p-3.5 border border-amber-400/30 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-300">
              Độ phủ địa bàn
            </p>
            <p className="text-xl font-black font-mono text-amber-300 mt-1 tabular-nums">
              {supervisorSummary.provincesCount} Tỉnh / Thành
            </p>
            <p className="text-[10px] text-slate-300 mt-0.5">Phạm vi giám sát</p>
          </div>
        </div>
      </div>

      {/* Main Review 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sales Reps List of this Supervisor (4 of 12 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                1. Đội ngũ nhân viên bán hàng
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Nhấn vào nhân viên để xem chi tiết giao dịch
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg">
              {displayedReps.length} NV
            </span>
          </div>

          {/* Search Reps */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm tên nhân viên, nhóm..."
              value={repSearch}
              onChange={(e) => setRepSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Reps Cards List */}
          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {displayedReps.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                Không tìm thấy nhân viên phù hợp
              </p>
            ) : (
              displayedReps.map((r, idx) => {
                const isSelected = selectedSalesRep === r.rep;

                // Rank medal styling
                let rankBadge = (
                  <span className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 font-mono bg-slate-100 text-slate-600">
                    {idx + 1}
                  </span>
                );
                if (idx === 0) {
                  rankBadge = (
                    <span className="w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 font-mono bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-amber-950 shadow-xs shadow-amber-500/30">
                      🥇
                    </span>
                  );
                } else if (idx === 1) {
                  rankBadge = (
                    <span className="w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 font-mono bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-900 shadow-xs">
                      🥈
                    </span>
                  );
                } else if (idx === 2) {
                  rankBadge = (
                    <span className="w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 font-mono bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white shadow-xs">
                      🥉
                    </span>
                  );
                }

                return (
                  <div
                    key={r.rep}
                    onClick={() => setSelectedSalesRep(r.rep)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-cyan-500 bg-gradient-to-r from-cyan-50/90 via-sky-50/70 to-emerald-50/80 ring-2 ring-cyan-400 shadow-md scale-[1.01]'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/90 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {rankBadge}
                        <div className="truncate">
                          <p
                            className={`text-xs font-bold truncate ${
                              isSelected ? 'text-cyan-950 font-black' : 'text-slate-900'
                            }`}
                          >
                            {r.rep}
                          </p>
                          {r.teamLead && (
                            <p className="text-[10px] text-indigo-700 font-medium truncate">
                              Nhóm: {r.teamLead}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-black font-mono text-emerald-700 tabular-nums">
                          {formatVND(r.revenue)}
                        </p>
                        <span className="text-[10px] font-black text-cyan-800 bg-cyan-100/80 px-2 py-0.5 rounded-md inline-block mt-0.5">
                          {r.share.toFixed(1).replace('.', ',')}% team
                        </span>
                      </div>
                    </div>

                    {/* Mini colorful share progress bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        style={{ width: `${Math.min(r.share, 100)}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          isSelected
                            ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100/90 font-medium">
                      <span className="text-teal-700 font-semibold">{r.partnersCount} nhà thuốc</span>
                      <span className="text-blue-700 font-semibold">{r.ordersCount} đơn</span>
                      <span className="text-amber-700 font-semibold">{r.provincesCount} tỉnh thành</span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isSelected ? 'text-cyan-600 translate-x-0.5 stroke-[2.5]' : 'text-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Breakdown for Review (8 of 12 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Active Sales Rep Review Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-cyan-500/20">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Đang review nhân viên:
                    </span>
                    <span className="text-xs font-black text-cyan-900 bg-cyan-100 px-3 py-0.5 rounded-full border border-cyan-300 shadow-2xs">
                      {selectedSalesRep || 'Chưa chọn'}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-950 uppercase tracking-tight mt-0.5">
                    Bóc tách Tỉnh/Thành · Nhà thuốc · Sản phẩm · Doanh số (+VAT)
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportReviewExcel}
                  disabled={displayedDetails.length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                  title="Xuất bảng dữ liệu chi tiết của nhân viên này ra Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
                  <span>Xuất Excel chi tiết</span>
                </button>
              </div>
            </div>

            {/* Quick KPI strip of selected sales rep with 4 distinct vibrant themes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 rounded-2xl p-3 border border-emerald-200/80 shadow-2xs">
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  Doanh số (+VAT)
                </p>
                <p className="text-base font-black font-mono text-emerald-950 mt-1 tabular-nums">
                  {formatVND(repCurrentSummary.rev)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50/40 rounded-2xl p-3 border border-cyan-200/80 shadow-2xs">
                <p className="text-[10px] font-black uppercase tracking-wider text-cyan-800">
                  Nhà thuốc phát sinh
                </p>
                <p className="text-base font-black font-mono text-cyan-950 mt-1 tabular-nums">
                  {repCurrentSummary.partners} Khách hàng
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50/40 rounded-2xl p-3 border border-purple-200/80 shadow-2xs">
                <p className="text-[10px] font-black uppercase tracking-wider text-purple-800">
                  Sản phẩm bán được
                </p>
                <p className="text-base font-black font-mono text-purple-950 mt-1 tabular-nums">
                  {repCurrentSummary.items} Mã hàng
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-2xl p-3 border border-amber-200/80 shadow-2xs">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                  Tổng sản lượng
                </p>
                <p className="text-base font-black font-mono text-amber-950 mt-1 tabular-nums">
                  {formatNumber(repCurrentSummary.qty)} Đơn vị
                </p>
              </div>
            </div>

            {/* Filters bar for details */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Lọc nhà thuốc, sản phẩm, địa bàn..."
                    value={detailSearch}
                    onChange={(e) => setDetailSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 w-64 font-medium"
                  />
                </div>

                {repProvinces.length > 1 && (
                  <select
                    value={provinceFilter}
                    onChange={(e) => setProvinceFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                  >
                    <option value="all">Tất cả tỉnh thành ({repProvinces.length})</option>
                    {repProvinces.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <span className="text-xs text-slate-500 font-medium">
                Hiển thị <span className="font-bold text-slate-900">{displayedDetails.length}</span> dòng giao dịch
              </span>
            </div>

            {/* Granular Table Required by User with rich color cells */}
            <div className="border border-slate-200 rounded-2xl overflow-x-auto max-h-[440px] overflow-y-auto shadow-inner">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-slate-200 font-bold sticky top-0 z-10 border-b border-indigo-900">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center text-slate-400">#</th>
                    <th className="py-2.5 px-3 text-cyan-300">Tỉnh / Thành phố</th>
                    <th className="py-2.5 px-3 text-slate-300">Phường / Xã</th>
                    <th className="py-2.5 px-3 text-emerald-300">Tên Nhà thuốc</th>
                    <th className="py-2.5 px-3 text-purple-300">Tên Sản phẩm bán</th>
                    <th className="py-2.5 px-3 text-right text-amber-300">Số lượng</th>
                    <th className="py-2.5 px-3 text-right text-emerald-300">Doanh số sau VAT</th>
                    <th className="py-2.5 px-3 text-center text-slate-300">Ngày đặt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                  {displayedDetails.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                        Không có dữ liệu phù hợp với điều kiện tìm kiếm
                      </td>
                    </tr>
                  ) : (
                    displayedDetails.map((r, idx) => (
                      <tr key={r._id} className="hover:bg-slate-50/90 transition-colors">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-semibold">
                          <span className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-800 font-bold border border-sky-200/80 text-[11px]">
                            {r.province || '—'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                          {r.ward || '—'}
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-950">{r.partnerName}</p>
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold border border-emerald-200/70 inline-block mt-0.5">
                            {r.partnerId}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-indigo-950">{r.itemName}</p>
                          <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-mono font-medium border border-purple-200/60 inline-block mt-0.5">
                            {r.itemCode}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 font-bold font-mono border border-amber-200/80">
                            {formatNumber(r.quantity)}{' '}
                            <span className="text-[10px] text-slate-500 font-normal">{r.unit}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black tabular-nums">
                          <span className="text-emerald-700 font-black text-xs bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/70 inline-block">
                            {formatVND(r.revenueVAT)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                          {formatDateVN(r.orderDate)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Meeting Notes & Action Items Section for Review with this Supervisor */}
          <div className="bg-gradient-to-br from-amber-50/40 via-white to-indigo-50/30 rounded-3xl p-5 border border-amber-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                  <ClipboardPen className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                  Biên bản & Ghi chú Review 1-1 với Giám sát: {selectedSupervisor}
                </h4>
              </div>

              {isSavedNote && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Đã lưu ghi chú vào hệ thống
                </span>
              )}
            </div>

            <textarea
              rows={3}
              placeholder={`Ghi chú mục tiêu KPI, kế hoạch mở rộng nhà thuốc mới, chấn chỉnh nhân viên yếu hoặc phản hồi của ông ${selectedSupervisor}...`}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              className="w-full p-3 text-xs bg-white rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800 font-medium shadow-inner"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveNote}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl transition-all shadow-md shadow-amber-600/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu ghi chú review này</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
