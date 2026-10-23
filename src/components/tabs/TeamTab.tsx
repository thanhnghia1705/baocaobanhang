import React, { useState, useMemo } from 'react';
import {
  Users2,
  UserCheck,
  TrendingUp,
  Building2,
  ShoppingBag,
  Package,
  Receipt,
  Search,
  ChevronDown,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useSalesData } from '../../context/SalesDataContext';
import {
  formatVND,
  formatCompactVND,
  formatNumber,
  formatPercent,
} from '../../utils/formatters';

export const TeamTab: React.FC = () => {
  const {
    filteredRecords,
    uniqueValues,
    filterState,
    setFilterState,
    toggleChartFilter,
  } = useSalesData();

  const [selectedRepDetail, setSelectedRepDetail] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Current selected supervisor
  const currentSupervisor =
    filterState.supervisors.length === 1 ? filterState.supervisors[0] : null;

  // 2. Records within supervisor scope (if selected) or current filtered scope
  const scopeRecords = filteredRecords;

  // 3. Supervisor Scope Summary Metrics:
  const supervisorScopeSummary = useMemo(() => {
    let rev = 0;
    let qty = 0;
    const ordersSet = new Set<string>();
    const partnersSet = new Set<string>();
    const activeRepsSet = new Set<string>();

    scopeRecords.forEach((r) => {
      rev += r.revenueVAT;
      qty += r.quantity;
      if (r.orderId) ordersSet.add(r.orderId);
      if (r.partnerId) partnersSet.add(r.partnerId);
      if (r.salesRep) activeRepsSet.add(r.salesRep);
    });

    const uniqueOrders = ordersSet.size;
    const uniquePartners = partnersSet.size;
    const aov = uniqueOrders > 0 ? Math.round(rev / uniqueOrders) : null;

    return {
      revenue: rev,
      orders: uniqueOrders,
      partners: uniquePartners,
      quantity: qty,
      activeReps: activeRepsSet.size,
      aov,
    };
  }, [scopeRecords]);

  // 4. Staff KPI Breakdown:
  const staffRankingData = useMemo(() => {
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
        deliveredLines: number;
        totalLines: number;
      }
    >();

    scopeRecords.forEach((r) => {
      const name = r.salesRep || '(Chưa phân bổ)';
      if (!map.has(name)) {
        map.set(name, {
          rep: name,
          supervisor: r.supervisor || '',
          teamLead: r.teamLead || '',
          revenue: 0,
          qty: 0,
          orders: new Set(),
          partners: new Set(),
          deliveredLines: 0,
          totalLines: 0,
        });
      }

      const item = map.get(name)!;
      item.revenue += r.revenueVAT;
      item.qty += r.quantity;
      item.totalLines += 1;
      if (r.orderId) item.orders.add(r.orderId);
      if (r.partnerId) item.partners.add(r.partnerId);
      if (
        r.deliveryStatus &&
        (r.deliveryStatus.toLowerCase().includes('đã giao') ||
          r.deliveryStatus.toLowerCase().includes('thành công'))
      ) {
        item.deliveredLines += 1;
      }
    });

    const list = Array.from(map.values())
      .map((item) => ({
        rep: item.rep,
        supervisor: item.supervisor,
        teamLead: item.teamLead,
        revenue: item.revenue,
        qty: item.qty,
        ordersCount: item.orders.size,
        partnersCount: item.partners.size,
        aov: item.orders.size > 0 ? Math.round(item.revenue / item.orders.size) : 0,
        deliveryRate:
          item.totalLines > 0 ? (item.deliveredLines / item.totalLines) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const maxRev = Math.max(...list.map((i) => i.revenue), 1);

    return { list, maxRev };
  }, [scopeRecords]);

  // Filtered staff list by search
  const displayedStaff = useMemo(() => {
    return staffRankingData.list.filter(
      (s) =>
        s.rep.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.supervisor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.teamLead.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staffRankingData.list, searchTerm]);

  // 5. Drill-down: Pharmacies and Orders for selected staff
  const staffDrilldown = useMemo(() => {
    if (!selectedRepDetail) return null;

    const repRecords = scopeRecords.filter((r) => r.salesRep === selectedRepDetail);
    const partnerMap = new Map<
      string,
      { name: string; revenue: number; orders: Set<string>; province: string }
    >();

    repRecords.forEach((r) => {
      const pid = r.partnerId || '(Chưa rõ)';
      if (!partnerMap.has(pid)) {
        partnerMap.set(pid, {
          name: r.partnerName || pid,
          revenue: 0,
          orders: new Set(),
          province: r.province || '',
        });
      }
      const p = partnerMap.get(pid)!;
      p.revenue += r.revenueVAT;
      if (r.orderId) p.orders.add(r.orderId);
    });

    const partnerList = Array.from(partnerMap.entries())
      .map(([id, val]) => ({
        id,
        name: val.name,
        revenue: val.revenue,
        ordersCount: val.orders.size,
        province: val.province,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      repName: selectedRepDetail,
      totalRevenue: repRecords.reduce((sum, r) => sum + r.revenueVAT, 0),
      totalOrders: new Set(repRecords.map((r) => r.orderId)).size,
      totalPartners: partnerList.length,
      partners: partnerList,
    };
  }, [selectedRepDetail, scopeRecords]);

  const handleSelectSupervisor = (sup: string) => {
    setFilterState((prev) => ({
      ...prev,
      supervisors: sup ? [sup] : [],
      salesReps: [],
    }));
  };

  const handleToggleSalesRep = (rep: string) => {
    setFilterState((prev) => {
      const isSelected = prev.salesReps.includes(rep);
      return {
        ...prev,
        salesReps: isSelected ? [] : [rep],
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Supervisor Scope & Selector Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-emerald-400 flex items-center justify-center font-bold shadow-md shadow-slate-950/10 border border-slate-800">
              <Users2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950 tracking-tight uppercase">
                Hiệu Quả Đội Ngũ Bán Hàng & Giám Sát
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Phân cấp: Giám sát → Nhân viên bán hàng → Khách hàng & Đơn hàng
              </p>
            </div>
          </div>

          {/* Supervisor Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Chọn Giám sát:</span>
            <select
              value={currentSupervisor || ''}
              onChange={(e) => handleSelectSupervisor(e.target.value)}
              className="px-3.5 py-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
            >
              <option value="">Tất cả Giám sát ({uniqueValues.supervisors.length})</option>
              {uniqueValues.supervisors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {currentSupervisor && (
              <button
                onClick={() => handleSelectSupervisor('')}
                className="px-3 py-2 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200 flex items-center gap-1 shadow-2xs"
                title="Bỏ lọc giám sát"
              >
                <X className="w-3.5 h-3.5" />
                <span>Bỏ chọn</span>
              </button>
            )}
          </div>
        </div>

        {/* Supervisor Scope Summary Cards with 6 Distinct Color Themes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-4 border-t border-slate-100">
          <div className="bg-gradient-to-b from-indigo-50/70 via-white to-white rounded-2xl p-4 border border-indigo-200/90 shadow-2xs">
            <p className="text-[11px] font-black text-indigo-900 uppercase tracking-wider">
              Doanh số sau VAT
            </p>
            <p className="text-xl font-black font-mono text-indigo-950 mt-1 tabular-nums">
              {formatCompactVND(supervisorScopeSummary.revenue).compact}
            </p>
            <p className="text-[10px] text-indigo-700 font-mono mt-0.5 truncate font-bold">
              {formatVND(supervisorScopeSummary.revenue)}
            </p>
          </div>

          <div className="bg-gradient-to-b from-emerald-50/70 via-white to-white rounded-2xl p-4 border border-emerald-200/90 shadow-2xs">
            <p className="text-[11px] font-black text-emerald-900 uppercase tracking-wider">
              Nhà thuốc duy nhất
            </p>
            <p className="text-xl font-black font-mono text-emerald-950 mt-1 tabular-nums">
              {formatNumber(supervisorScopeSummary.partners)}
            </p>
            <p className="text-[10px] text-emerald-700 mt-0.5 font-bold">
              Đếm duy nhất toàn phạm vi
            </p>
          </div>

          <div className="bg-gradient-to-b from-blue-50/70 via-white to-white rounded-2xl p-4 border border-blue-200/90 shadow-2xs">
            <p className="text-[11px] font-black text-blue-900 uppercase tracking-wider">
              Đơn hàng duy nhất
            </p>
            <p className="text-xl font-black font-mono text-blue-950 mt-1 tabular-nums">
              {formatNumber(supervisorScopeSummary.orders)}
            </p>
            <p className="text-[10px] text-blue-700 mt-0.5 font-medium">Mã đơn phát sinh</p>
          </div>

          <div className="bg-gradient-to-b from-amber-50/70 via-white to-white rounded-2xl p-4 border border-amber-200/90 shadow-2xs">
            <p className="text-[11px] font-black text-amber-900 uppercase tracking-wider">
              Tổng sản lượng
            </p>
            <p className="text-xl font-black font-mono text-amber-950 mt-1 tabular-nums">
              {formatNumber(supervisorScopeSummary.quantity)}
            </p>
            <p className="text-[10px] text-amber-700 mt-0.5 font-medium">Số lượng sản phẩm</p>
          </div>

          <div className="bg-gradient-to-b from-purple-50/70 via-white to-white rounded-2xl p-4 border border-purple-200/90 shadow-2xs">
            <p className="text-[11px] font-black text-purple-900 uppercase tracking-wider">
              Nhân viên có đơn
            </p>
            <p className="text-xl font-black font-mono text-purple-950 mt-1 tabular-nums">
              {supervisorScopeSummary.activeReps} NV
            </p>
            <p className="text-[10px] text-purple-700 mt-0.5 font-medium">Có đơn trong kỳ</p>
          </div>

          <div className="bg-gradient-to-b from-teal-50/70 via-white to-white rounded-2xl p-4 border border-teal-200/90 shadow-2xs">
            <p className="text-[11px] font-black text-teal-900 uppercase tracking-wider">
              AOV trung bình
            </p>
            <p className="text-xl font-black font-mono text-teal-950 mt-1 tabular-nums truncate">
              {supervisorScopeSummary.aov ? formatVND(supervisorScopeSummary.aov) : '—'}
            </p>
            <p className="text-[10px] text-teal-700 mt-0.5 font-medium">Doanh số / Đơn</p>
          </div>
        </div>
      </div>

      {/* Row 2: Staff Horizontal Bar Chart & Staff Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Horizontal Bar Chart (1 Col) with Colorful Gradient Bars */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Xếp hạng Doanh số Nhân viên
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bấm vào thanh để chọn/bỏ chọn nhân viên
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                {staffRankingData.list.length} NV
              </span>
            </div>

            <div className="mt-4 space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {staffRankingData.list.map((st, idx) => {
                const widthPercent = Math.max(
                  Math.round((st.revenue / staffRankingData.maxRev) * 100),
                  5
                );
                const isSelected = filterState.salesReps.includes(st.rep);

                // 8 rotating vibrant gradients for bars
                const barGradients = [
                  'from-blue-600 via-indigo-600 to-cyan-500',
                  'from-purple-600 via-pink-600 to-indigo-500',
                  'from-emerald-500 via-teal-500 to-cyan-500',
                  'from-amber-500 via-orange-500 to-rose-500',
                  'from-cyan-500 via-blue-600 to-indigo-600',
                  'from-fuchsia-600 via-purple-600 to-pink-500',
                  'from-teal-500 via-emerald-600 to-green-600',
                  'from-indigo-600 via-purple-600 to-blue-600',
                ];
                const gradient = barGradients[idx % barGradients.length];

                return (
                  <div
                    key={st.rep}
                    onClick={() => handleToggleSalesRep(st.rep)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-400 shadow-xs scale-[1.01]'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/90'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-5 text-indigo-700 font-mono text-xs font-black">
                          #{idx + 1}
                        </span>
                        <span className="truncate">{st.rep}</span>
                      </div>
                      <span className="font-mono text-emerald-700 font-black tabular-nums">
                        {formatVND(st.revenue)}
                      </span>
                    </div>

                    {/* Progress Bar with vibrant colorful gradient */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2.5">
                      <div
                        style={{ width: `${widthPercent}%` }}
                        className={`h-full rounded-full transition-all duration-300 shadow-2xs ${
                          isSelected
                            ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400'
                            : `bg-gradient-to-r ${gradient}`
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
                      <span>{st.ordersCount} đơn · {st.partnersCount} nhà thuốc</span>
                      <span className="text-slate-400 truncate max-w-[120px]">
                        {st.supervisor}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 text-xs text-slate-500 text-center font-medium">
            {filterState.salesReps.length > 0
              ? `Đang lọc: ${filterState.salesReps.join(', ')}`
              : 'Hiển thị tất cả nhân viên trong phạm vi'}
          </div>
        </div>

        {/* Detailed Staff KPI Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Bảng Chỉ Số KPI Chi Tiết Từng Nhân Viên
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bấm vào tên để xem danh sách nhà thuốc và đơn hàng liên quan
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm nhân viên, quản lý..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-52"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[460px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/90 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200 backdrop-blur-xs">
                  <tr>
                    <th className="py-3 px-3.5">Nhân viên</th>
                    <th className="py-3 px-3">Giám sát / Nhóm</th>
                    <th className="py-3 px-3 text-right">Doanh số (+VAT)</th>
                    <th className="py-3 px-3 text-right">Nhà thuốc</th>
                    <th className="py-3 px-3 text-right">Đơn hàng</th>
                    <th className="py-3 px-3 text-right">Sản lượng</th>
                    <th className="py-3 px-3 text-right">AOV</th>
                    <th className="py-3 px-3 text-center">Giao thành công</th>
                    <th className="py-3 px-3 text-center">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {displayedStaff.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 text-xs font-medium">
                        Không tìm thấy nhân viên phù hợp
                      </td>
                    </tr>
                  ) : (
                    displayedStaff.map((item) => {
                      const isSelected = filterState.salesReps.includes(item.rep);

                      return (
                        <tr
                          key={item.rep}
                          className={`hover:bg-slate-50 transition-colors ${
                            isSelected ? 'bg-emerald-50/50 font-semibold' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3.5 font-bold text-slate-900">
                            <button
                              onClick={() => handleToggleSalesRep(item.rep)}
                              className="hover:text-emerald-700 text-left"
                            >
                              {item.rep}
                            </button>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-medium">
                            <p>{item.supervisor || '—'}</p>
                            <p className="text-[10px] text-slate-400">{item.teamLead}</p>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950 tabular-nums">
                            {formatVND(item.revenue)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-800 font-bold">
                            {formatNumber(item.partnersCount)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-medium">
                            {formatNumber(item.ordersCount)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-medium">
                            {formatNumber(item.qty)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-medium">
                            {formatVND(item.aov)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200/80 px-2 py-0.5 rounded-md text-[11px]">
                              {item.deliveryRate.toFixed(1).replace('.', ',')}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => setSelectedRepDetail(item.rep)}
                              className="p-1.5 rounded-lg hover:bg-slate-200/80 text-emerald-700 transition-colors"
                              title="Xem danh sách nhà thuốc & đơn"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Drill-down Drawer / Modal if a staff member is clicked */}
      {staffDrilldown && (
        <div className="bg-slate-900/5 text-slate-900 border border-slate-300 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Khách hàng & Đơn hàng trực thuộc:</span>
                <span className="text-emerald-900 bg-emerald-100/80 px-2.5 py-0.5 rounded-lg text-xs font-bold border border-emerald-200">
                  {staffDrilldown.repName}
                </span>
              </h4>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Doanh số: <span className="font-bold font-mono text-slate-900">{formatVND(staffDrilldown.totalRevenue)}</span> ·{' '}
                {staffDrilldown.totalOrders} đơn · {staffDrilldown.totalPartners} nhà thuốc duy nhất
              </p>
            </div>
            <button
              onClick={() => setSelectedRepDetail(null)}
              className="p-1.5 rounded-xl hover:bg-white text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto pr-1">
            {staffDrilldown.partners.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-1 hover:border-emerald-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <p className="text-xs font-bold text-slate-900 truncate pr-1">{p.name}</p>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold">
                    {p.id}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">{p.province}</p>
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100 font-semibold">
                  <span className="text-slate-500">{p.ordersCount} đơn</span>
                  <span className="font-mono text-slate-950 font-bold">{formatVND(p.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
