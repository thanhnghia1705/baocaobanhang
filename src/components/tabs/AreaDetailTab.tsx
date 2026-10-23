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

  return (
    <div className="space-y-6">
      {/* Top Review Banner & Supervisor Picker */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl shadow-slate-950/15 border border-slate-800 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center font-bold border border-white/15 shadow-inner">
              <MapPin className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  PHẦN 5: REVIEW 1-1 QUẢN TRỊ
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase mt-1">
                CHI TIẾT KHU VỰC & ĐÁNH GIÁ GIÁM SÁT
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Chọn Giám sát để kiểm tra toàn bộ Nhân viên, sau đó bấm vào từng Nhân viên để bóc tách Tỉnh/Thành, Nhà thuốc, Sản phẩm và Doanh số sau VAT.
              </p>
            </div>
          </div>

          {/* Supervisor Selector */}
          <div className="flex items-center gap-2.5 bg-white/10 p-2 rounded-2xl border border-white/15 backdrop-blur-xs">
            <span className="text-xs font-bold text-slate-200 pl-2">Chọn Giám sát:</span>
            <select
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              className="px-3.5 py-2 text-xs font-bold bg-slate-900 border border-slate-700 rounded-xl text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-inner"
            >
              {uniqueValues.supervisors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Supervisor Team Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-4 border-t border-white/15">
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Khu vực & Đơn vị
            </p>
            <p className="text-sm font-bold text-emerald-300 mt-1 truncate">
              {supervisorSummary.areaDirector}
            </p>
            <p className="text-[10px] text-slate-400 truncate">{supervisorSummary.unitDirector}</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tổng doanh số team (+VAT)
            </p>
            <p className="text-lg font-black font-mono text-white mt-1 tabular-nums">
              {formatCompactVND(supervisorSummary.revenue).compact}
            </p>
            <p className="text-[10px] text-emerald-300 font-mono truncate">
              {formatVND(supervisorSummary.revenue)}
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quy mô nhân sự
            </p>
            <p className="text-lg font-black font-mono text-white mt-1 tabular-nums">
              {salesRepsList.length} Nhân viên
            </p>
            <p className="text-[10px] text-slate-400">Đang có dữ liệu bán</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Nhà thuốc phục vụ
            </p>
            <p className="text-lg font-black font-mono text-emerald-300 mt-1 tabular-nums">
              {formatNumber(supervisorSummary.partnersCount)}
            </p>
            <p className="text-[10px] text-slate-400">Khách hàng duy nhất</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Đơn hàng & Sản lượng
            </p>
            <p className="text-lg font-black font-mono text-white mt-1 tabular-nums">
              {formatNumber(supervisorSummary.ordersCount)} đơn
            </p>
            <p className="text-[10px] text-slate-400">{formatNumber(supervisorSummary.quantity)} sản phẩm</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Độ phủ địa bàn
            </p>
            <p className="text-lg font-black font-mono text-white mt-1 tabular-nums">
              {supervisorSummary.provincesCount} Tỉnh / Thành
            </p>
            <p className="text-[10px] text-emerald-300">Phạm vi giám sát</p>
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

                return (
                  <div
                    key={r.rep}
                    onClick={() => setSelectedSalesRep(r.rep)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-emerald-500 bg-gradient-to-r from-emerald-50/80 to-teal-50/40 ring-2 ring-emerald-400 shadow-md scale-[1.01]'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 font-mono ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <p
                            className={`text-xs font-bold truncate ${
                              isSelected ? 'text-emerald-950 font-extrabold' : 'text-slate-900'
                            }`}
                          >
                            {r.rep}
                          </p>
                          {r.teamLead && (
                            <p className="text-[10px] text-slate-400 truncate">
                              Nhóm: {r.teamLead}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-black font-mono text-slate-950 tabular-nums">
                          {formatVND(r.revenue)}
                        </p>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                          {r.share.toFixed(1).replace('.', ',')}% team
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100/80 font-medium">
                      <span>{r.partnersCount} nhà thuốc</span>
                      <span>{r.ordersCount} đơn</span>
                      <span>{r.provincesCount} tỉnh thành</span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isSelected ? 'text-emerald-600 translate-x-0.5' : 'text-slate-300'
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
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Đang review nhân viên:
                    </span>
                    <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                  title="Xuất bảng dữ liệu chi tiết của nhân viên này ra Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Xuất Excel chi tiết</span>
                </button>
              </div>
            </div>

            {/* Quick KPI strip of selected sales rep */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Doanh số (+VAT)
                </p>
                <p className="text-base font-black font-mono text-slate-950 mt-1 tabular-nums">
                  {formatVND(repCurrentSummary.rev)}
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Nhà thuốc phát sinh
                </p>
                <p className="text-base font-black font-mono text-emerald-800 mt-1 tabular-nums">
                  {repCurrentSummary.partners} Khách hàng
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Sản phẩm bán được
                </p>
                <p className="text-base font-black font-mono text-slate-950 mt-1 tabular-nums">
                  {repCurrentSummary.items} Mã hàng
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Tổng sản lượng
                </p>
                <p className="text-base font-black font-mono text-slate-950 mt-1 tabular-nums">
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
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-64 font-medium"
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

            {/* Granular Table Required by User */}
            <div className="border border-slate-200 rounded-2xl overflow-x-auto max-h-[440px] overflow-y-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-100/90 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200 backdrop-blur-xs">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Tỉnh / Thành phố</th>
                    <th className="py-2.5 px-3">Phường / Xã</th>
                    <th className="py-2.5 px-3">Tên Nhà thuốc</th>
                    <th className="py-2.5 px-3">Tên Sản phẩm bán</th>
                    <th className="py-2.5 px-3 text-right">Số lượng</th>
                    <th className="py-2.5 px-3 text-right">Doanh số sau VAT</th>
                    <th className="py-2.5 px-3 text-center">Ngày đặt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {displayedDetails.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                        Không có dữ liệu phù hợp với điều kiện tìm kiếm
                      </td>
                    </tr>
                  ) : (
                    displayedDetails.map((r, idx) => (
                      <tr key={r._id} className="hover:bg-slate-50/90 transition-colors">
                        <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {r.province || '—'}
                        </td>
                        <td className="py-2 px-3 text-slate-500 text-[11px]">
                          {r.ward || '—'}
                        </td>
                        <td className="py-2 px-3">
                          <p className="font-bold text-slate-900">{r.partnerName}</p>
                          <p className="text-[10px] text-emerald-700 font-mono font-medium">
                            {r.partnerId}
                          </p>
                        </td>
                        <td className="py-2 px-3">
                          <p className="font-bold text-slate-800">{r.itemName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{r.itemCode}</p>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                          {formatNumber(r.quantity)} <span className="text-[10px] text-slate-500 font-normal">{r.unit}</span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-black tabular-nums text-emerald-950">
                          {formatVND(r.revenueVAT)}
                        </td>
                        <td className="py-2 px-3 text-center text-slate-500 font-mono text-[11px]">
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
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardPen className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Biên bản & Ghi chú Review 1-1 với Giám sát: {selectedSupervisor}
                </h4>
              </div>

              {isSavedNote && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Đã lưu ghi chú
                </span>
              )}
            </div>

            <textarea
              rows={3}
              placeholder={`Ghi chú mục tiêu KPI, kế hoạch mở rộng nhà thuốc mới, chấn chỉnh nhân viên yếu hoặc phản hồi của ông ${selectedSupervisor}...`}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 font-medium"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveNote}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-2xs"
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
