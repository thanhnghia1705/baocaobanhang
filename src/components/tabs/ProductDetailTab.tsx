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
      {/* Top Banner: Product Deep-Dive Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl shadow-slate-950/15 border border-slate-800 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center font-bold border border-white/15 shadow-inner">
              <Boxes className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  PHẦN 6: REVIEW THEO SẢN PHẨM
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase mt-1">
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
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-950/20 transition-all border border-emerald-400/30 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Xuất Excel Báo Cáo Sản Phẩm</span>
            </button>
          </div>
        </div>

        {/* Selected Products Aggregate KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-4 border-t border-white/15">
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Sản phẩm đang chọn
            </p>
            <p className="text-xl font-black font-mono text-emerald-300 mt-1 tabular-nums">
              {selectedProductCodes.length} / {allProducts.length} SKU
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {productMatchedRecords.length.toLocaleString('vi-VN')} dòng phát sinh
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Doanh số sau VAT
            </p>
            <p className="text-xl font-black font-mono text-white mt-1 tabular-nums">
              {formatCompactVND(overallProductSummary.revenue).compact}
            </p>
            <p className="text-[10px] text-emerald-300 font-mono truncate">
              {formatVND(overallProductSummary.revenue)}
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Nhà thuốc lấy hàng
            </p>
            <p className="text-xl font-black font-mono text-emerald-300 mt-1 tabular-nums">
              {formatNumber(overallProductSummary.uniquePartners)}
            </p>
            <p className="text-[10px] text-emerald-400 font-medium">Không trùng lặp (Set duy nhất)</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tổng sản lượng xuất
            </p>
            <p className="text-xl font-black font-mono text-white mt-1 tabular-nums">
              {formatNumber(overallProductSummary.quantity)}
            </p>
            <p className="text-[10px] text-slate-400">{formatNumber(overallProductSummary.uniqueOrders)} đơn hàng</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Độ phủ nhân sự
            </p>
            <p className="text-xl font-black font-mono text-white mt-1 tabular-nums">
              {overallProductSummary.activeReps} NV · {overallProductSummary.activeSupervisors} Sup
            </p>
            <p className="text-[10px] text-slate-400">Có phát sinh doanh số</p>
          </div>
        </div>
      </div>

      {/* Product Selection Workspace with Robust Multi-Select Tools */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        {/* Header & Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <CheckSquare className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tích chọn sản phẩm cần xem ({selectedProductCodes.length}/{allProducts.length} SKU)
              </h3>
              <p className="text-[11px] text-slate-500">
                Bấm vào từng ô để tích chọn/bỏ chọn, hoặc dùng các nút thao tác hàng loạt bên cạnh
              </p>
            </div>
          </div>

          {/* Bulk select buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors shadow-2xs"
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
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shadow-2xs"
            >
              Đảo ngược chọn
            </button>
            <button
              type="button"
              onClick={selectTop5}
              className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
            >
              Top 5 doanh số
            </button>
            <button
              type="button"
              onClick={selectTop10}
              className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
            >
              Top 10 doanh số
            </button>
            <button
              type="button"
              onClick={selectTop20}
              className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
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

        {/* Interactive Checkbox Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
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
                      ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-400 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50/90 hover:border-slate-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className={`text-xs font-bold truncate ${isChecked ? 'text-emerald-950 font-extrabold' : 'text-slate-900'}`}>
                      {p.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.code}</p>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                        : 'border-slate-300 bg-white hover:border-slate-400'
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
            <span className="font-bold text-slate-700">Đang chọn ({selectedProductCodes.length}):</span>
            {selectedProductCodes.length === 0 ? (
              <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                ⚠️ Chưa chọn sản phẩm nào. Vui lòng tích chọn ở trên!
              </span>
            ) : (
              <span className="text-slate-500">
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
              className="text-rose-600 hover:text-rose-700 font-bold hover:underline"
            >
              Xóa tất cả lựa chọn
            </button>
          )}
        </div>
      </div>

      {/* Segmented View Switcher: Theo Giám sát | Theo Nhân viên | Danh sách Nhà thuốc */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveViewTab('supervisor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeViewTab === 'supervisor'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
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
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
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
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>3. Danh sách NHÀ THUỐC lấy hàng ({pharmaciesTakingProduct.length})</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Số lượng nhà thuốc tính chuẩn <span className="font-bold text-emerald-800">không trùng lặp</span>
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
              className="mt-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
            >
              Chọn nhanh Top 5 sản phẩm
            </button>
          </div>
        ) : (
          <>
            {/* View 1: Breakdown by SUPERVISOR */}
            {activeViewTab === 'supervisor' && (
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[520px] overflow-y-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-100/90 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200 backdrop-blur-xs">
                      <tr>
                        <th className="py-3 px-3.5 w-12 text-center">#</th>
                        <th className="py-3 px-4">Giám sát phụ trách</th>
                        <th className="py-3 px-4">Khu vực / Đơn vị</th>
                        <th className="py-3 px-4 text-center">Số NV có bán</th>
                        <th className="py-3 px-4 text-right">Nhà thuốc lấy hàng (Ko trùng)</th>
                        <th className="py-3 px-4 text-right">Số lượng sản phẩm</th>
                        <th className="py-3 px-4 text-right">Doanh số sau VAT</th>
                        <th className="py-3 px-4 text-right">Tỷ trọng đóng góp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
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
                            <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                              {s.supervisor}
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-medium">
                              <p>{s.areaDirector}</p>
                              <p className="text-[10px] text-slate-400">{s.unitDirector}</p>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                                {s.activeRepsCount} NV
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800 tabular-nums">
                              {formatNumber(s.uniquePartnersCount)} Nhà thuốc
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                              {formatNumber(s.qty)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-black text-slate-950 tabular-nums">
                              {formatVND(s.revenue)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
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
                      className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-64 font-medium"
                    />
                  </div>

                  <span className="text-xs text-slate-500 font-medium">
                    {displayedStaff.length} Nhân viên có phát sinh doanh số sản phẩm này
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[520px] overflow-y-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-100/90 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200 backdrop-blur-xs">
                      <tr>
                        <th className="py-3 px-3.5 w-12 text-center">#</th>
                        <th className="py-3 px-4">Nhân viên bán hàng</th>
                        <th className="py-3 px-4">Giám sát phụ trách</th>
                        <th className="py-3 px-4">Trưởng nhóm</th>
                        <th className="py-3 px-4 text-right">Nhà thuốc lấy hàng (Ko trùng)</th>
                        <th className="py-3 px-4 text-right">Số lượng sản phẩm</th>
                        <th className="py-3 px-4 text-right">Doanh số sau VAT</th>
                        <th className="py-3 px-4 text-right">Tỷ trọng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
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
                            <td className="py-2.5 px-4 font-bold text-slate-900">
                              {r.rep}
                            </td>
                            <td className="py-2.5 px-4 font-medium text-slate-700">
                              {r.supervisor}
                            </td>
                            <td className="py-2.5 px-4 text-slate-500">
                              {r.teamLead || '—'}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-800 tabular-nums">
                              {formatNumber(r.uniquePartnersCount)} Nhà thuốc
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                              {formatNumber(r.qty)}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-black text-slate-950 tabular-nums">
                              {formatVND(r.revenue)}
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <span className="font-bold text-slate-700">
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
                      className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-72 font-medium"
                    />
                  </div>

                  <span className="text-xs text-slate-500 font-medium">
                    {displayedPharmacies.length} Nhà thuốc duy nhất đã nhập các sản phẩm này
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-x-auto max-h-[520px] overflow-y-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-100/90 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200 backdrop-blur-xs">
                      <tr>
                        <th className="py-3 px-3.5 w-12 text-center">#</th>
                        <th className="py-3 px-4">Mã nhà thuốc</th>
                        <th className="py-3 px-4">Tên Nhà thuốc</th>
                        <th className="py-3 px-4">Tỉnh / Thành</th>
                        <th className="py-3 px-4">Phường / Xã</th>
                        <th className="py-3 px-4 text-right">Số lượng lấy</th>
                        <th className="py-3 px-4 text-right">Doanh số sau VAT</th>
                        <th className="py-3 px-4">Nhân viên phụ trách</th>
                        <th className="py-3 px-4">Giám sát</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
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
                            <td className="py-2.5 px-4 font-mono font-bold text-emerald-800">
                              {p.partnerId}
                            </td>
                            <td className="py-2.5 px-4 font-bold text-slate-900">
                              {p.partnerName}
                            </td>
                            <td className="py-2.5 px-4 font-medium text-slate-700">
                              {p.province}
                            </td>
                            <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                              {p.ward}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                              {formatNumber(p.qty)}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-black text-emerald-950 tabular-nums">
                              {formatVND(p.revenue)}
                            </td>
                            <td className="py-2.5 px-4 text-slate-700 font-medium truncate max-w-[150px]">
                              {p.reps}
                            </td>
                            <td className="py-2.5 px-4 text-slate-500 truncate max-w-[150px]">
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
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardPen className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Biên bản Chiến Lược & Kế Hoạch Đẩy Hàng Theo Sản Phẩm
            </h4>
          </div>

          {isSavedNote && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Đã lưu biên bản
            </span>
          )}
        </div>

        <textarea
          rows={3}
          placeholder="Nhập ghi chú chiến lược: Mục tiêu mở rộng độ phủ nhà thuốc, chương trình khuyến mãi theo combo, chỉ tiêu số lượng giao cho từng Giám sát và Nhân viên..."
          value={productReviewNote}
          onChange={(e) => setProductReviewNote(e.target.value)}
          className="w-full p-3.5 text-xs bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 font-medium"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveNote}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-2xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu ghi chú chiến lược sản phẩm</span>
          </button>
        </div>
      </div>
    </div>
  );
};
