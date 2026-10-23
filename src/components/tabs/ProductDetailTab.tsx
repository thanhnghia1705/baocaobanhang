import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Boxes,
  Check,
  Search,
  Filter,
  Download,
  Users2,
  Building2,
  Package,
  TrendingUp,
  X,
  ChevronDown,
  ChevronRight,
  ClipboardPen,
  Save,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  CheckSquare,
  Square,
  RotateCcw,
} from 'lucide-react';
import { useSalesData } from '../../context/SalesDataContext';
import {
  formatVND,
  formatCompactVND,
  formatNumber,
  formatPercent,
} from '../../utils/formatters';

export const ProductDetailTab: React.FC = () => {
  const { filteredRecords, uniqueValues } = useSalesData();

  // All available unique products
  const allProducts = uniqueValues.itemCodes;

  // Selected products state (set of item codes)
  // Default to first 3 products
  const [selectedProductCodes, setSelectedProductCodes] = useState<string[]>(() => {
    return allProducts.slice(0, 3).map((p) => p.code);
  });

  const [productSearch, setProductSearch] = useState('');
  const [activeViewTab, setActiveViewTab] = useState<'supervisor' | 'staff' | 'pharmacies'>('supervisor');
  const [staffSearch, setStaffSearch] = useState('');
  const [pharmacySearch, setPharmacySearch] = useState('');

  // Filter products in the selection list
  const filteredProductOptions = useMemo(() => {
    if (!productSearch.trim()) return allProducts;
    const term = productSearch.toLowerCase();
    return allProducts.filter(
      (p) => p.code.toLowerCase().includes(term) || p.name.toLowerCase().includes(term)
    );
  }, [allProducts, productSearch]);

  // Toggle single product selection
  const toggleProduct = (code: string) => {
    setSelectedProductCodes((prev) => {
      if (prev.includes(code)) {
        return prev.filter((c) => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  // Bulk Actions
  const selectAll = () => {
    setSelectedProductCodes(allProducts.map((p) => p.code));
  };

  const deselectAll = () => {
    setSelectedProductCodes([]);
  };

  const selectCurrentFiltered = () => {
    const codesToAdd = filteredProductOptions.map((p) => p.code);
    setSelectedProductCodes((prev) => Array.from(new Set([...prev, ...codesToAdd])));
  };

  const deselectCurrentFiltered = () => {
    const codesToRemove = new Set(filteredProductOptions.map((p) => p.code));
    setSelectedProductCodes((prev) => prev.filter((c) => !codesToRemove.has(c)));
  };

  const invertSelection = () => {
    const currentSet = new Set(selectedProductCodes);
    setSelectedProductCodes(allProducts.filter((p) => !currentSet.has(p.code)).map((p) => p.code));
  };

  const selectTop5 = () => {
    const revMap = new Map<string, number>();
    filteredRecords.forEach((r) => {
      revMap.set(r.itemCode, (revMap.get(r.itemCode) || 0) + r.revenueVAT);
    });
    const sorted = Array.from(revMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([code]) => code);
    setSelectedProductCodes(sorted.length > 0 ? sorted : allProducts.slice(0, 5).map((p) => p.code));
  };

  const selectTop10 = () => {
    const revMap = new Map<string, number>();
    filteredRecords.forEach((r) => {
      revMap.set(r.itemCode, (revMap.get(r.itemCode) || 0) + r.revenueVAT);
    });
    const sorted = Array.from(revMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([code]) => code);
    setSelectedProductCodes(sorted.length > 0 ? sorted : allProducts.slice(0, 10).map((p) => p.code));
  };

  const selectTop20 = () => {
    const revMap = new Map<string, number>();
    filteredRecords.forEach((r) => {
      revMap.set(r.itemCode, (revMap.get(r.itemCode) || 0) + r.revenueVAT);
    });
    const sorted = Array.from(revMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([code]) => code);
    setSelectedProductCodes(sorted.length > 0 ? sorted : allProducts.slice(0, 20).map((p) => p.code));
  };

  // Filter dataset to ONLY rows matching selected products
  const productMatchedRecords = useMemo(() => {
    if (selectedProductCodes.length === 0) return [];
    const codeSet = new Set(selectedProductCodes);
    return filteredRecords.filter((r) => codeSet.has(r.itemCode));
  }, [filteredRecords, selectedProductCodes]);

  // Overall KPI Summary for Selected Products
  const overallProductSummary = useMemo(() => {
    let rev = 0;
    let qty = 0;
    const ordersSet = new Set<string>();
    const partnersSet = new Set<string>();
    const repsSet = new Set<string>();
    const supsSet = new Set<string>();

    productMatchedRecords.forEach((r) => {
      rev += r.revenueVAT;
      qty += r.quantity;
      if (r.orderId) ordersSet.add(r.orderId);
      if (r.partnerId) partnersSet.add(r.partnerId);
      if (r.salesRep) repsSet.add(r.salesRep);
      if (r.supervisor) supsSet.add(r.supervisor);
    });

    return {
      revenue: rev,
      quantity: qty,
      uniqueOrders: ordersSet.size,
      uniquePartners: partnersSet.size, // Unique pharmacies taking these products (NON-DUPLICATED)
      activeReps: repsSet.size,
      activeSupervisors: supsSet.size,
    };
  }, [productMatchedRecords]);

  // 1. Aggregation by SUPERVISOR for selected products
  // Rule: Count unique pharmacies taking product (NO DUPLICATION across reps)
  const supervisorBreakdown = useMemo(() => {
    const map = new Map<
      string,
      {
        supervisor: string;
        areaDirector: string;
        unitDirector: string;
        revenue: number;
        qty: number;
        orders: Set<string>;
        partners: Set<string>; // Unique pharmacies under this supervisor
        reps: Set<string>;
      }
    >();

    productMatchedRecords.forEach((r) => {
      const sup = r.supervisor || '(Chưa phân bổ)';
      if (!map.has(sup)) {
        map.set(sup, {
          supervisor: sup,
          areaDirector: r.areaDirector || '',
          unitDirector: r.unitDirector || '',
          revenue: 0,
          qty: 0,
          orders: new Set(),
          partners: new Set(),
          reps: new Set(),
        });
      }

      const item = map.get(sup)!;
      item.revenue += r.revenueVAT;
      item.qty += r.quantity;
      if (r.orderId) item.orders.add(r.orderId);
      if (r.partnerId) item.partners.add(r.partnerId);
      if (r.salesRep) item.reps.add(r.salesRep);
    });

    const list = Array.from(map.values())
      .map((item) => ({
        supervisor: item.supervisor,
        areaDirector: item.areaDirector,
        unitDirector: item.unitDirector,
        revenue: item.revenue,
        qty: item.qty,
        ordersCount: item.orders.size,
        uniquePartnersCount: item.partners.size, // De-duplicated pharmacies
        activeRepsCount: item.reps.size,
        share:
          overallProductSummary.revenue > 0
            ? (item.revenue / overallProductSummary.revenue) * 100
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const maxRev = Math.max(...list.map((i) => i.revenue), 1);

    return { list, maxRev };
  }, [productMatchedRecords, overallProductSummary.revenue]);

  // 2. Aggregation by SALES REP for selected products
  // Rule: Count unique pharmacies taking product (NO DUPLICATION)
  const staffBreakdown = useMemo(() => {
    const map = new Map<
      string,
      {
        rep: string;
        supervisor: string;
        teamLead: string;
        revenue: number;
        qty: number;
        orders: Set<string>;
        partners: Set<string>;
        provinces: Set<string>;
      }
    >();

    productMatchedRecords.forEach((r) => {
      const rep = r.salesRep || '(Chưa phân bổ)';
      if (!map.has(rep)) {
        map.set(rep, {
          rep,
          supervisor: r.supervisor || '',
          teamLead: r.teamLead || '',
          revenue: 0,
          qty: 0,
          orders: new Set(),
          partners: new Set(),
          provinces: new Set(),
        });
      }

      const item = map.get(rep)!;
      item.revenue += r.revenueVAT;
      item.qty += r.quantity;
      if (r.orderId) item.orders.add(r.orderId);
      if (r.partnerId) item.partners.add(r.partnerId);
      if (r.province) item.provinces.add(r.province);
    });

    const list = Array.from(map.values())
      .map((item) => ({
        rep: item.rep,
        supervisor: item.supervisor,
        teamLead: item.teamLead,
        revenue: item.revenue,
        qty: item.qty,
        ordersCount: item.orders.size,
        uniquePartnersCount: item.partners.size, // De-duplicated pharmacies for this rep
        provincesCount: item.provinces.size,
        share:
          overallProductSummary.revenue > 0
            ? (item.revenue / overallProductSummary.revenue) * 100
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return list;
  }, [productMatchedRecords, overallProductSummary.revenue]);

  // Filtered staff list by search
  const displayedStaff = useMemo(() => {
    if (!staffSearch.trim()) return staffBreakdown;
    const term = staffSearch.toLowerCase();
    return staffBreakdown.filter(
      (s) =>
        s.rep.toLowerCase().includes(term) ||
        s.supervisor.toLowerCase().includes(term) ||
        s.teamLead.toLowerCase().includes(term)
    );
  }, [staffBreakdown, staffSearch]);

  // 3. Unique Pharmacies taking these selected products
  const pharmaciesTakingProduct = useMemo(() => {
    const map = new Map<
      string,
      {
        partnerId: string;
        partnerName: string;
        province: string;
        ward: string;
        revenue: number;
        qty: number;
        orders: Set<string>;
        reps: Set<string>;
        supervisors: Set<string>;
      }
    >();

    productMatchedRecords.forEach((r) => {
      const pid = r.partnerId || '(Chưa rõ)';
      if (!map.has(pid)) {
        map.set(pid, {
          partnerId: pid,
          partnerName: r.partnerName || pid,
          province: r.province || '—',
          ward: r.ward || '—',
          revenue: 0,
          qty: 0,
          orders: new Set(),
          reps: new Set(),
          supervisors: new Set(),
        });
      }

      const item = map.get(pid)!;
      item.revenue += r.revenueVAT;
      item.qty += r.quantity;
      if (r.orderId) item.orders.add(r.orderId);
      if (r.salesRep) item.reps.add(r.salesRep);
      if (r.supervisor) item.supervisors.add(r.supervisor);
    });

    const list = Array.from(map.values())
      .map((item) => ({
        partnerId: item.partnerId,
        partnerName: item.partnerName,
        province: item.province,
        ward: item.ward,
        revenue: item.revenue,
        qty: item.qty,
        ordersCount: item.orders.size,
        reps: Array.from(item.reps).join(', '),
        supervisors: Array.from(item.supervisors).join(', '),
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return list;
  }, [productMatchedRecords]);

  const displayedPharmacies = useMemo(() => {
    if (!pharmacySearch.trim()) return pharmaciesTakingProduct;
    const term = pharmacySearch.toLowerCase();
    return pharmaciesTakingProduct.filter(
      (p) =>
        p.partnerName.toLowerCase().includes(term) ||
        p.partnerId.toLowerCase().includes(term) ||
        p.province.toLowerCase().includes(term) ||
        p.reps.toLowerCase().includes(term)
    );
  }, [pharmaciesTakingProduct, pharmacySearch]);

  // Review note for products
  const [productReviewNote, setProductReviewNote] = useState<string>(() => {
    try {
      return localStorage.getItem('review_product_note') || '';
    } catch {
      return '';
    }
  });

  const [isSavedNote, setIsSavedNote] = useState(false);

  const handleSaveNote = () => {
    try {
      localStorage.setItem('review_product_note', productReviewNote);
      setIsSavedNote(true);
      setTimeout(() => setIsSavedNote(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Export Product Review to Excel
  const handleExportProductExcel = () => {
    if (productMatchedRecords.length === 0) return;

    // Sheet 1: Tổng hợp theo Giám sát
    const wsSup = XLSX.utils.json_to_sheet(
      supervisorBreakdown.list.map((s, idx) => ({
        'STT': idx + 1,
        'Giám sát': s.supervisor,
        'Khu vực': s.areaDirector,
        'Đơn vị': s.unitDirector,
        'Số nhà thuốc lấy hàng (Không trùng lặp)': s.uniquePartnersCount,
        'Số nhân viên bán': s.activeRepsCount,
        'Số lượng sản phẩm': s.qty,
        'Doanh số sau VAT (VNĐ)': s.revenue,
        'Tỷ trọng %': s.share.toFixed(1) + '%',
      }))
    );

    // Sheet 2: Chi tiết theo Nhân viên
    const wsStaff = XLSX.utils.json_to_sheet(
      staffBreakdown.map((r, idx) => ({
        'STT': idx + 1,
        'Nhân viên bán hàng': r.rep,
        'Giám sát trực tiếp': r.supervisor,
        'Trưởng nhóm': r.teamLead,
        'Số nhà thuốc lấy hàng (Không trùng lặp)': r.uniquePartnersCount,
        'Số lượng sản phẩm': r.qty,
        'Doanh số sau VAT (VNĐ)': r.revenue,
        'Tỷ trọng %': r.share.toFixed(1) + '%',
      }))
    );

    // Sheet 3: Danh sách nhà thuốc
    const wsPharmacies = XLSX.utils.json_to_sheet(
      pharmaciesTakingProduct.map((p, idx) => ({
        'STT': idx + 1,
        'Mã nhà thuốc': p.partnerId,
        'Tên nhà thuốc': p.partnerName,
        'Tỉnh / Thành phố': p.province,
        'Phường / Xã': p.ward,
        'Số lượng lấy': p.qty,
        'Doanh số sau VAT (VNĐ)': p.revenue,
        'Nhân viên phụ trách': p.reps,
        'Giám sát': p.supervisors,
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSup, 'Theo_Giam_Sat');
    XLSX.utils.book_append_sheet(wb, wsStaff, 'Theo_Nhan_Vien');
    XLSX.utils.book_append_sheet(wb, wsPharmacies, 'Danh_Sach_Nha_Thuoc');

    XLSX.writeFile(wb, `Review_SanPham_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Product Deep-Dive Header with Executive Fuchsia/Purple/Navy Gradient */}
      <div className="bg-gradient-to-br from-[#1e1035] via-[#2a1347] to-[#0c1427] text-white rounded-3xl p-6 shadow-xl shadow-purple-950/20 border border-purple-800/50 space-y-5 relative overflow-hidden">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none -mb-24" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white flex items-center justify-center font-bold shadow-lg shadow-pink-500/30 border border-white/20">
              <Boxes className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-to-r from-fuchsia-500/30 to-pink-500/30 text-pink-300 border border-pink-400/40 shadow-xs">
                  PHẦN 6: REVIEW THEO SẢN PHẨM & ĐỘ PHỦ
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-fuchsia-200 tracking-tight uppercase mt-1">
                CHI TIẾT SẢN PHẨM & ĐỘ PHỦ NHÀ THUỐC
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Tích chọn sản phẩm cần xem để đổ ra chi tiết từng Giám sát, Nhân viên bán hàng, số lượng nhà thuốc lấy hàng (không trùng lặp), sản lượng và doanh số sau VAT.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportProductExcel}
              disabled={productMatchedRecords.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl shadow-md shadow-emerald-950/20 transition-all border border-emerald-400/30 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Xuất Excel Báo Cáo Sản Phẩm</span>
            </button>
          </div>
        </div>

        {/* Selected Products Aggregate KPI Cards with 5 Distinct Colorful Personalities */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-4 border-t border-white/15 relative z-10">
          <div className="bg-gradient-to-br from-fuchsia-500/20 via-pink-500/15 to-white/5 rounded-2xl p-3.5 border border-fuchsia-400/30 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-pink-300">
              Sản phẩm đang chọn
            </p>
            <p className="text-xl font-black font-mono text-pink-300 mt-1 tabular-nums">
              {selectedProductCodes.length} / {allProducts.length} SKU
            </p>
            <p className="text-[10px] text-slate-300 truncate mt-0.5">
              {productMatchedRecords.length.toLocaleString('vi-VN')} dòng phát sinh
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-white/5 rounded-2xl p-3.5 border border-emerald-400/30 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
              Doanh số sau VAT
            </p>
            <p className="text-xl font-black font-mono text-emerald-300 mt-1 tabular-nums">
              {formatCompactVND(overallProductSummary.revenue).compact}
            </p>
            <p className="text-[10px] text-slate-300 font-mono truncate mt-0.5">
              {formatVND(overallProductSummary.revenue)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-teal-500/20 via-cyan-500/15 to-white/5 rounded-2xl p-3.5 border border-teal-400/30 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-teal-300">
              Nhà thuốc lấy hàng
            </p>
            <p className="text-xl font-black font-mono text-teal-300 mt-1 tabular-nums">
              {formatNumber(overallProductSummary.uniquePartners)}
            </p>
            <p className="text-[10px] text-teal-200 font-medium mt-0.5">Đếm duy nhất (Không trùng)</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-white/5 rounded-2xl p-3.5 border border-amber-400/30 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-300">
              Tổng sản lượng xuất
            </p>
            <p className="text-xl font-black font-mono text-amber-300 mt-1 tabular-nums">
              {formatNumber(overallProductSummary.quantity)}
            </p>
            <p className="text-[10px] text-slate-300 mt-0.5">{formatNumber(overallProductSummary.uniqueOrders)} đơn hàng</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 via-indigo-500/15 to-white/5 rounded-2xl p-3.5 border border-purple-400/30 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-purple-300">
              Độ phủ nhân sự
            </p>
            <p className="text-xl font-black font-mono text-white mt-1 tabular-nums">
              {overallProductSummary.activeReps} NV · {overallProductSummary.activeSupervisors} Sup
            </p>
            <p className="text-[10px] text-purple-200 mt-0.5">Có phát sinh đơn</p>
          </div>
        </div>
      </div>

      {/* Product Selection Workspace with Robust Multi-Select Tools */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        {/* Header & Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white flex items-center justify-center font-bold shadow-xs">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>Tích chọn sản phẩm cần xem</span>
                <span className="text-xs font-black text-fuchsia-700 bg-fuchsia-100 px-2 py-0.5 rounded-full border border-fuchsia-300">
                  {selectedProductCodes.length}/{allProducts.length} SKU
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Bấm vào từng ô để tích chọn/bỏ chọn, hoặc dùng các nút thao tác hàng loạt nhiều sản phẩm bên cạnh
              </p>
            </div>
          </div>

          {/* Bulk select buttons with vibrant color personalities */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-xl transition-all shadow-xs"
            >
              ✓ Chọn tất cả ({allProducts.length})
            </button>
            <button
              type="button"
              onClick={deselectAll}
              className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors shadow-2xs"
            >
              ✕ Bỏ chọn tất cả
            </button>
            <button
              type="button"
              onClick={invertSelection}
              className="px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors shadow-2xs"
            >
              ⇄ Đảo ngược chọn
            </button>
            <button
              type="button"
              onClick={selectTop5}
              className="px-3 py-1.5 text-xs font-black text-amber-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-600 rounded-xl transition-all shadow-xs border border-amber-300"
            >
              🏆 Top 5 doanh số
            </button>
            <button
              type="button"
              onClick={selectTop10}
              className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl transition-all shadow-xs"
            >
              Top 10 doanh số
            </button>
            <button
              type="button"
              onClick={selectTop20}
              className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 rounded-xl transition-all shadow-xs"
            >
              Top 20 doanh số
            </button>
          </div>
        </div>

        {/* Search input for products with "Select All Found" button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo mã hoặc tên sản phẩm để tích chọn..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
            {productSearch && (
              <button
                type="button"
                onClick={() => setProductSearch('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {productSearch && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectCurrentFiltered}
                className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors"
              >
                + Chọn {filteredProductOptions.length} sản phẩm tìm thấy
              </button>
              <button
                type="button"
                onClick={deselectCurrentFiltered}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                - Bỏ chọn {filteredProductOptions.length} sản phẩm này
              </button>
            </div>
          )}
        </div>

        {/* Interactive Checkbox Grid with colorful checked state */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto pr-1">
          {filteredProductOptions.length === 0 ? (
            <div className="col-span-full py-8 text-center text-xs text-slate-400 font-medium">
              Không tìm thấy sản phẩm nào khớp với từ khóa "{productSearch}"
            </div>
          ) : (
            filteredProductOptions.map((p) => {
              const isChecked = selectedProductCodes.includes(p.code);

              return (
                <div
                  key={p.code}
                  onClick={() => toggleProduct(p.code)}
                  role="checkbox"
                  aria-checked={isChecked}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      toggleProduct(p.code);
                    }
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer select-none transition-all duration-150 ${
                    isChecked
                      ? 'border-pink-500 bg-gradient-to-r from-pink-50/90 via-fuchsia-50/70 to-purple-50/80 ring-2 ring-pink-400 shadow-sm scale-[1.01]'
                      : 'border-slate-200 bg-white hover:bg-pink-50/30 hover:border-pink-300 shadow-2xs'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className={`text-xs font-bold truncate ${isChecked ? 'text-purple-950 font-black' : 'text-slate-900'}`}>
                      {p.name}
                    </p>
                    <span className="text-[10px] text-fuchsia-700 bg-fuchsia-50 px-1.5 py-0.2 rounded font-mono font-medium border border-fuchsia-200/60 inline-block mt-0.5">
                      {p.code}
                    </span>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                      isChecked
                        ? 'bg-gradient-to-br from-fuchsia-600 to-pink-600 border-fuchsia-600 text-white shadow-xs'
                        : 'border-slate-300 bg-white hover:border-pink-400'
                    }`}
                  >
                    {isChecked ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <div className="w-2 h-2 rounded bg-transparent" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Active Selection Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-800">Đang chọn ({selectedProductCodes.length}):</span>
            {selectedProductCodes.length === 0 ? (
              <span className="text-rose-600 font-bold bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                ⚠️ Chưa chọn sản phẩm nào. Vui lòng tích chọn ở trên!
              </span>
            ) : (
              <span className="text-slate-600 font-medium">
                {selectedProductCodes.length > 5
                  ? `${selectedProductCodes.slice(0, 5).join(', ')} ... và ${selectedProductCodes.length - 5} sản phẩm khác`
                  : selectedProductCodes.join(', ')}
              </span>
            )}
          </div>

          {selectedProductCodes.length > 0 && (
            <button
              type="button"
              onClick={deselectAll}
              className="text-rose-600 hover:text-rose-700 font-black hover:underline text-xs"
            >
              ✕ Xóa tất cả lựa chọn
            </button>
          )}
        </div>
      </div>

      {/* Segmented View Switcher: Theo Giám sát | Theo Nhân viên | Danh sách Nhà thuốc */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/90 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveViewTab('supervisor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeViewTab === 'supervisor'
                  ? 'bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-700 text-white shadow-md shadow-pink-500/25 border border-white/20'
                  : 'text-slate-600 hover:text-fuchsia-700 hover:bg-white/80'
              }`}
            >
              <Users2 className="w-3.5 h-3.5" />
              <span>1. Chi tiết theo từng GIÁM SÁT ({supervisorBreakdown.list.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewTab('staff')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeViewTab === 'staff'
                  ? 'bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-700 text-white shadow-md shadow-pink-500/25 border border-white/20'
                  : 'text-slate-600 hover:text-fuchsia-700 hover:bg-white/80'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>2. Chi tiết theo từng NHÂN VIÊN BÁN HÀNG ({staffBreakdown.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewTab('pharmacies')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeViewTab === 'pharmacies'
                  ? 'bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-700 text-white shadow-md shadow-pink-500/25 border border-white/20'
                  : 'text-slate-600 hover:text-fuchsia-700 hover:bg-white/80'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>3. Danh sách NHÀ THUỐC lấy hàng ({pharmaciesTakingProduct.length})</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Số lượng nhà thuốc tính chuẩn <span className="font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">không trùng lặp</span>
          </div>
        </div>

        {selectedProductCodes.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Boxes className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Chưa có sản phẩm nào được chọn</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Hãy tích chọn ít nhất một sản phẩm ở khung phía trên (hoặc bấm nút "Top 5 doanh số", "Chọn tất cả") để đổ ra dữ liệu bóc tách chi tiết.
            </p>
            <button
              type="button"
              onClick={selectTop5}
              className="mt-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 rounded-xl transition-all shadow-md shadow-pink-500/20"
            >
              Chọn nhanh Top 5 sản phẩm
            </button>
          </div>
        ) : (
          <>
            {/* View 1: Breakdown by SUPERVISOR */}
            {activeViewTab === 'supervisor' && (
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[520px] overflow-y-auto shadow-inner">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 text-slate-200 font-bold sticky top-0 z-10 border-b border-purple-900">
                      <tr>
                        <th className="py-3 px-3.5 w-12 text-center text-slate-400">#</th>
                        <th className="py-3 px-4 text-pink-300">Giám sát phụ trách</th>
                        <th className="py-3 px-4 text-slate-300">Khu vực / Đơn vị</th>
                        <th className="py-3 px-4 text-center text-blue-300">Số NV có bán</th>
                        <th className="py-3 px-4 text-right text-teal-300">Nhà thuốc lấy hàng (Ko trùng)</th>
                        <th className="py-3 px-4 text-right text-amber-300">Số lượng sản phẩm</th>
                        <th className="py-3 px-4 text-right text-emerald-300">Doanh số sau VAT</th>
                        <th className="py-3 px-4 text-right text-pink-300">Tỷ trọng đóng góp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                      {supervisorBreakdown.list.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                            Không có dữ liệu cho các sản phẩm đang chọn
                          </td>
                        </tr>
                      ) : (
                        supervisorBreakdown.list.map((s, idx) => (
                          <tr key={s.supervisor} className="hover:bg-slate-50/90 transition-colors">
                            <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-950 text-sm">
                              {s.supervisor}
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-medium">
                              <p className="font-bold text-slate-800">{s.areaDirector}</p>
                              <p className="text-[10px] text-slate-400">{s.unitDirector}</p>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                {s.activeRepsCount} NV
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                              <span className="text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 inline-block">
                                {formatNumber(s.uniquePartnersCount)} Nhà thuốc
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                              {formatNumber(s.qty)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-black tabular-nums">
                              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                                {formatVND(s.revenue)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="font-black text-pink-800 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
                                {s.share.toFixed(1).replace('.', ',')}%
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* View 2: Breakdown by SALES REP */}
            {activeViewTab === 'staff' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Tìm nhân viên, giám sát..."
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-64 font-medium"
                    />
                  </div>

                  <span className="text-xs text-slate-500 font-medium">
                    <span className="font-black text-purple-900">{displayedStaff.length}</span> Nhân viên có phát sinh doanh số sản phẩm này
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[520px] overflow-y-auto shadow-inner">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 text-slate-200 font-bold sticky top-0 z-10 border-b border-purple-900">
                      <tr>
                        <th className="py-3 px-3.5 w-12 text-center text-slate-400">#</th>
                        <th className="py-3 px-4 text-pink-300">Nhân viên bán hàng</th>
                        <th className="py-3 px-4 text-cyan-300">Giám sát phụ trách</th>
                        <th className="py-3 px-4 text-slate-300">Trưởng nhóm</th>
                        <th className="py-3 px-4 text-right text-teal-300">Nhà thuốc lấy hàng (Ko trùng)</th>
                        <th className="py-3 px-4 text-right text-amber-300">Số lượng sản phẩm</th>
                        <th className="py-3 px-4 text-right text-emerald-300">Doanh số sau VAT</th>
                        <th className="py-3 px-4 text-right text-fuchsia-300">Tỷ trọng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                      {displayedStaff.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                            Không tìm thấy nhân viên phù hợp
                          </td>
                        </tr>
                      ) : (
                        displayedStaff.map((r, idx) => (
                          <tr key={r.rep} className="hover:bg-slate-50/90 transition-colors">
                            <td className="py-2.5 px-3.5 text-center text-slate-400 font-mono text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-4 font-bold text-slate-950">
                              {r.rep}
                            </td>
                            <td className="py-2.5 px-4 font-medium">
                              <span className="text-cyan-900 bg-cyan-50 px-2 py-0.5 rounded-md font-semibold border border-cyan-200">
                                {r.supervisor}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-500">
                              {r.teamLead || '—'}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums">
                              <span className="text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 inline-block">
                                {formatNumber(r.uniquePartnersCount)} Nhà thuốc
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                              {formatNumber(r.qty)}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-black tabular-nums">
                              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                                {formatVND(r.revenue)}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <span className="font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                {r.share.toFixed(1).replace('.', ',')}%
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* View 3: List of PHARMACIES taking these products (NON-DUPLICATED) */}
            {activeViewTab === 'pharmacies' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Tìm nhà thuốc, tỉnh thành, nhân viên..."
                      value={pharmacySearch}
                      onChange={(e) => setPharmacySearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 w-72 font-medium"
                    />
                  </div>

                  <span className="text-xs text-slate-500 font-medium">
                    <span className="font-black text-teal-900">{displayedPharmacies.length}</span> Nhà thuốc duy nhất đã nhập các sản phẩm này
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-x-auto max-h-[520px] overflow-y-auto shadow-inner">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 text-slate-200 font-bold sticky top-0 z-10 border-b border-purple-900">
                      <tr>
                        <th className="py-3 px-3.5 w-12 text-center text-slate-400">#</th>
                        <th className="py-3 px-4 text-emerald-300">Mã nhà thuốc</th>
                        <th className="py-3 px-4 text-white">Tên Nhà thuốc</th>
                        <th className="py-3 px-4 text-sky-300">Tỉnh / Thành</th>
                        <th className="py-3 px-4 text-slate-300">Phường / Xã</th>
                        <th className="py-3 px-4 text-right text-amber-300">Số lượng lấy</th>
                        <th className="py-3 px-4 text-right text-emerald-300">Doanh số sau VAT</th>
                        <th className="py-3 px-4 text-purple-300">Nhân viên phụ trách</th>
                        <th className="py-3 px-4 text-cyan-300">Giám sát</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                      {displayedPharmacies.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-10 text-center text-slate-400 font-medium">
                            Không tìm thấy nhà thuốc phù hợp
                          </td>
                        </tr>
                      ) : (
                        displayedPharmacies.map((p, idx) => (
                          <tr key={p.partnerId} className="hover:bg-slate-50/90 transition-colors">
                            <td className="py-2.5 px-3.5 text-center text-slate-400 font-mono text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-4 font-mono font-bold">
                              <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                                {p.partnerId}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-bold text-slate-950">
                              {p.partnerName}
                            </td>
                            <td className="py-2.5 px-4 font-semibold">
                              <span className="text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/80">
                                {p.province}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                              {p.ward}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums">
                              <span className="text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                                {formatNumber(p.qty)}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-black tabular-nums">
                              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 inline-block">
                                {formatVND(p.revenue)}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-semibold text-purple-900 truncate max-w-[150px]">
                              {p.reps}
                            </td>
                            <td className="py-2.5 px-4 text-cyan-900 font-medium truncate max-w-[150px]">
                              {p.supervisors}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Review Notes Section for Product Strategy */}
      <div className="bg-gradient-to-br from-fuchsia-50/40 via-white to-purple-50/40 rounded-3xl p-6 border border-fuchsia-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-fuchsia-600 to-pink-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ClipboardPen className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-fuchsia-950 uppercase tracking-wider">
              Biên bản Chiến Lược & Kế Hoạch Đẩy Hàng Theo Sản Phẩm
            </h4>
          </div>

          {isSavedNote && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg flex items-center gap-1 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Đã lưu biên bản thành công
            </span>
          )}
        </div>

        <textarea
          rows={3}
          placeholder="Nhập ghi chú chiến lược: Mục tiêu mở rộng độ phủ nhà thuốc, chương trình khuyến mãi theo combo, chỉ tiêu số lượng giao cho từng Giám sát và Nhân viên..."
          value={productReviewNote}
          onChange={(e) => setProductReviewNote(e.target.value)}
          className="w-full p-3.5 text-xs bg-white rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 text-slate-800 font-medium shadow-inner"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveNote}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 rounded-xl transition-all shadow-md shadow-fuchsia-600/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu ghi chú chiến lược sản phẩm</span>
          </button>
        </div>
      </div>
    </div>
  );
};
