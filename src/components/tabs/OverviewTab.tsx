import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Building2,
  Package,
  Receipt,
  Boxes,
  MapPin,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { useSalesData } from '../../context/SalesDataContext';
import {
  formatVND,
  formatCompactVND,
  formatNumber,
  formatDateVN,
  formatPercent,
} from '../../utils/formatters';
import { TrendInterval } from '../../types/sales';

export const OverviewTab: React.FC = () => {
  const {
    aggregatedKPIs,
    filteredRecords,
    toggleChartFilter,
    filterState,
    setActiveTab,
  } = useSalesData();

  const [trendInterval, setTrendInterval] = useState<TrendInterval>('day');

  // Compact currency display
  const revCompact = formatCompactVND(aggregatedKPIs.totalRevenueVAT);

  // 1. Group revenue by trend interval (day / week / month)
  const trendData = useMemo(() => {
    const map = new Map<string, { label: string; revenue: number; orders: Set<string> }>();

    filteredRecords.forEach((r) => {
      if (!r.orderDate) return;
      let key = r.orderDate;
      let label = formatDateVN(r.orderDate);

      if (trendInterval === 'week') {
        const d = new Date(r.orderDate);
        const dayOfWeek = d.getDay() || 7;
        d.setDate(d.getDate() - dayOfWeek + 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dt = String(d.getDate()).padStart(2, '0');
        key = `W_${y}-${m}-${dt}`;
        label = `Tuần ${dt}/${m}`;
      } else if (trendInterval === 'month') {
        const parts = r.orderDate.split('-');
        key = `M_${parts[0]}-${parts[1]}`;
        label = `Tháng ${parts[1]}/${parts[0]}`;
      }

      if (!map.has(key)) {
        map.set(key, { label, revenue: 0, orders: new Set() });
      }
      const item = map.get(key)!;
      item.revenue += r.revenueVAT;
      if (r.orderId) item.orders.add(r.orderId);
    });

    const list = Array.from(map.entries())
      .map(([key, val]) => ({
        key,
        label: val.label,
        revenue: val.revenue,
        orderCount: val.orders.size,
      }))
      .sort((a, b) => a.key.localeCompare(b.key));

    const maxRev = Math.max(...list.map((d) => d.revenue), 1);

    return { list, maxRev };
  }, [filteredRecords, trendInterval]);

  // 2. Channel distribution with specific theme colors
  const channelData = useMemo(() => {
    const map = new Map<string, { revenue: number; orders: Set<string> }>();
    filteredRecords.forEach((r) => {
      const ch = r.channel || '(Chưa phân loại)';
      if (!map.has(ch)) map.set(ch, { revenue: 0, orders: new Set() });
      const item = map.get(ch)!;
      item.revenue += r.revenueVAT;
      if (r.orderId) item.orders.add(r.orderId);
    });

    const colors = [
      'from-emerald-500 to-teal-600',
      'from-blue-600 to-indigo-600',
      'from-purple-600 to-pink-600',
      'from-amber-500 to-orange-600',
      'from-cyan-500 to-blue-600',
    ];

    return Array.from(map.entries())
      .map(([channel, val], idx) => ({
        channel,
        revenue: val.revenue,
        orderCount: val.orders.size,
        gradient: colors[idx % colors.length],
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredRecords]);

  // 3. Top 5 Products
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; qty: number; unit: string }>();
    filteredRecords.forEach((r) => {
      const code = r.itemCode || '(Chưa có mã)';
      if (!map.has(code)) {
        map.set(code, {
          name: r.itemName || code,
          revenue: 0,
          qty: 0,
          unit: r.unit || 'Đơn vị',
        });
      }
      const item = map.get(code)!;
      item.revenue += r.revenueVAT;
      item.qty += r.quantity;
    });

    return Array.from(map.entries())
      .map(([code, val]) => ({
        code,
        name: val.name,
        revenue: val.revenue,
        qty: val.qty,
        unit: val.unit,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredRecords]);

  // 4. Top 5 Provinces
  const topProvinces = useMemo(() => {
    const map = new Map<string, { revenue: number; partners: Set<string> }>();
    filteredRecords.forEach((r) => {
      const prov = r.province || '(Chưa rõ)';
      if (!map.has(prov)) map.set(prov, { revenue: 0, partners: new Set() });
      const item = map.get(prov)!;
      item.revenue += r.revenueVAT;
      if (r.partnerId) item.partners.add(r.partnerId);
    });

    return Array.from(map.entries())
      .map(([province, val]) => ({
        province,
        revenue: val.revenue,
        partnerCount: val.partners.size,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredRecords]);

  // 5. Order Status breakdown
  const orderStatusData = useMemo(() => {
    const map = new Map<string, { revenue: number; orders: Set<string> }>();
    filteredRecords.forEach((r) => {
      const st = r.orderStatus || '(Trống)';
      if (!map.has(st)) map.set(st, { revenue: 0, orders: new Set() });
      const item = map.get(st)!;
      item.revenue += r.revenueVAT;
      if (r.orderId) item.orders.add(r.orderId);
    });

    return Array.from(map.entries())
      .map(([status, val]) => ({
        status,
        revenue: val.revenue,
        orderCount: val.orders.size,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredRecords]);

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid with Rich Color Harmonies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Dominant Midnight Sapphire Hero KPI Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#0c1427] via-[#112240] to-[#1a365d] text-white rounded-3xl p-6 shadow-xl shadow-slate-950/20 border border-indigo-800/50 flex flex-col justify-between relative overflow-hidden group">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
                <span className="text-xs font-black text-emerald-300 tracking-widest uppercase">
                  DOANH SỐ SAU VAT
                </span>
              </div>
              <span className="text-[10px] font-black text-white bg-gradient-to-r from-emerald-500/30 to-teal-500/30 px-3 py-1 rounded-full border border-emerald-400/40 backdrop-blur-xs">
                Cột (+VAT) chuẩn
              </span>
            </div>

            <div className="mt-4">
              <div
                className="text-4xl sm:text-5xl font-black tracking-tight tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-emerald-200"
                title={revCompact.full}
              >
                {revCompact.compact}
              </div>
              <p className="text-xs text-emerald-300 font-mono tabular-nums mt-1.5 font-bold">
                {revCompact.full}
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-3.5 border-t border-white/15 flex items-center justify-between text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-2 text-emerald-300">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>{filteredRecords.length.toLocaleString('vi-VN')} dòng sản phẩm</span>
            </div>
            <span className="text-[11px] text-cyan-300">Không cộng trùng</span>
          </div>
        </div>

        {/* 5 Secondary KPI Cards with Color Themes */}
        {/* 1. Đơn hàng (Blue Theme) */}
        <div className="bg-gradient-to-b from-blue-50/70 via-white to-white rounded-3xl p-5 border border-blue-200/90 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-blue-900">Số đơn hàng</span>
              <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-950 mt-2 font-mono tabular-nums">
              {formatNumber(aggregatedKPIs.uniqueOrdersCount)}
            </div>
          </div>
          <p className="text-[11px] text-blue-800/80 mt-3 border-t border-blue-100 pt-2 font-medium">
            Đếm duy nhất Tiêu đề đơn
          </p>
        </div>

        {/* 2. Nhà thuốc (Emerald Theme) */}
        <div className="bg-gradient-to-b from-emerald-50/70 via-white to-white rounded-3xl p-5 border border-emerald-200/90 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-emerald-300 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-emerald-900">Nhà thuốc duy nhất</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 mt-2 font-mono tabular-nums">
              {formatNumber(aggregatedKPIs.uniquePartnersCount)}
            </div>
          </div>
          <div className="text-[11px] text-emerald-800 mt-3 border-t border-emerald-100 pt-2 flex items-center justify-between font-bold">
            <span>Mua lặp (≥2 đơn):</span>
            <span className="font-extrabold text-emerald-700 tabular-nums">
              {formatNumber(aggregatedKPIs.repeatPartnersCount)} ({formatPercent(aggregatedKPIs.repeatPartnersCount, aggregatedKPIs.uniquePartnersCount)})
            </span>
          </div>
        </div>

        {/* 3. Sản lượng (Indigo Theme) */}
        <div className="bg-gradient-to-b from-indigo-50/70 via-white to-white rounded-3xl p-5 border border-indigo-200/90 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-indigo-300 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-indigo-900">Tổng sản lượng</span>
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-950 mt-2 font-mono tabular-nums">
              {formatNumber(aggregatedKPIs.totalQuantity)}
            </div>
          </div>
          <p className="text-[11px] text-indigo-800/80 mt-3 border-t border-indigo-100 pt-2 font-medium">
            Số lượng sản phẩm xuất
          </p>
        </div>

        {/* 4. Giá trị đơn TB (Amber Theme) */}
        <div className="bg-gradient-to-b from-amber-50/70 via-white to-white rounded-3xl p-5 border border-amber-200/90 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-amber-300 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-amber-900">Giá trị đơn TB (AOV)</span>
              <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-2 font-mono tabular-nums truncate">
              {aggregatedKPIs.averageOrderValue !== null
                ? formatVND(aggregatedKPIs.averageOrderValue)
                : '—'}
            </div>
          </div>
          <p className="text-[11px] text-amber-800/80 mt-3 border-t border-amber-100 pt-2 font-medium">
            Doanh số / Đơn duy nhất
          </p>
        </div>

        {/* 5. Mã sản phẩm (Fuchsia Theme) */}
        <div className="bg-gradient-to-b from-fuchsia-50/70 via-white to-white rounded-3xl p-5 border border-fuchsia-200/90 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-fuchsia-300 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-fuchsia-900">Mã sản phẩm</span>
              <div className="w-9 h-9 rounded-2xl bg-fuchsia-600 text-white flex items-center justify-center shadow-md shadow-fuchsia-500/20">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-fuchsia-950 mt-2 font-mono tabular-nums">
              {formatNumber(aggregatedKPIs.uniqueProductsCount)}
            </div>
          </div>
          <p className="text-[11px] text-fuchsia-800/80 mt-3 border-t border-fuchsia-100 pt-2 font-medium">
            Mã vật tư phát sinh
          </p>
        </div>
      </div>

      {/* Row 2: Sales Trend Chart & Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>Xu hướng doanh số sau VAT</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Bấm vào cột để áp dụng lọc chéo ngay cho toàn bộ dashboard
                </p>
              </div>

              {/* Day / Week / Month toggle */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                <button
                  onClick={() => setTrendInterval('day')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    trendInterval === 'day'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ngày
                </button>
                <button
                  onClick={() => setTrendInterval('week')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    trendInterval === 'week'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tuần
                </button>
                <button
                  onClick={() => setTrendInterval('month')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    trendInterval === 'month'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tháng
                </button>
              </div>
            </div>

            {/* Bar Chart Visualization with rich colorful gradient bars */}
            <div className="pt-6 h-64 flex items-end gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar">
              {trendData.list.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                  Không có dữ liệu trong khoảng thời gian này
                </div>
              ) : (
                trendData.list.map((item) => {
                  const heightPercent = Math.max(
                    Math.round((item.revenue / trendData.maxRev) * 100),
                    6
                  );
                  const isFiltered = filterState.chartFilters.some(
                    (cf) => cf.field === 'orderDate' && cf.value === item.key
                  );

                  return (
                    <div
                      key={item.key}
                      onClick={() =>
                        trendInterval === 'day'
                          ? toggleChartFilter('orderDate', item.key, `Ngày ${item.label}`)
                          : null
                      }
                      className="flex-1 flex flex-col items-center min-w-[28px] sm:min-w-[36px] group cursor-pointer relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-16 bg-slate-950 text-white text-[11px] rounded-xl px-3 py-1.5 whitespace-nowrap shadow-xl pointer-events-none z-20 border border-slate-700">
                        <p className="font-bold text-cyan-300">{item.label}</p>
                        <p className="font-mono font-bold text-white">{formatVND(item.revenue)}</p>
                        <p className="text-slate-300">{item.orderCount} đơn hàng duy nhất</p>
                      </div>

                      {/* Bar with vivid gradient */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-xl transition-all duration-200 ${
                          isFiltered
                            ? 'bg-gradient-to-t from-emerald-500 via-teal-400 to-cyan-300 ring-2 ring-emerald-400 shadow-md shadow-emerald-500/30'
                            : 'bg-gradient-to-t from-blue-800 via-indigo-700 to-cyan-500 hover:from-emerald-600 hover:to-teal-400'
                        }`}
                      />

                      {/* Label */}
                      <span className="text-[10px] font-bold text-slate-500 mt-2 truncate w-full text-center">
                        {item.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Tổng cộng: {trendData.list.length} mốc thời gian</span>
            <span className="font-extrabold text-indigo-950 font-mono tabular-nums">
              Đỉnh điểm: {formatVND(trendData.maxRev)}
            </span>
          </div>
        </div>

        {/* Channel Breakdown with Colorful Progress Bars */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">Cơ cấu Kênh bán hàng</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Tỷ trọng doanh số và số đơn theo từng kênh
            </p>

            <div className="mt-4 space-y-3">
              {channelData.map((item) => {
                const percent =
                  aggregatedKPIs.totalRevenueVAT > 0
                    ? (item.revenue / aggregatedKPIs.totalRevenueVAT) * 100
                    : 0;

                const isFiltered = filterState.chartFilters.some(
                  (cf) => cf.field === 'channel' && cf.value === item.channel
                );

                return (
                  <div
                    key={item.channel}
                    onClick={() =>
                      toggleChartFilter('channel', item.channel, `Kênh ${item.channel}`)
                    }
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isFiltered
                        ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-400 shadow-xs'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="truncate pr-2">{item.channel}</span>
                      <span className="font-mono tabular-nums text-slate-950 font-black">
                        {formatVND(item.revenue)}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2.5">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`bg-gradient-to-r ${item.gradient} h-full rounded-full transition-all duration-300 shadow-xs`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
                      <span>{item.orderCount} đơn hàng duy nhất</span>
                      <span className="font-extrabold text-slate-800">
                        {percent.toFixed(1).replace('.', ',')}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-indigo-700 mt-4 text-center font-bold">
            Bấm vào kênh để lọc toàn bộ dashboard
          </p>
        </div>
      </div>

      {/* Row 3: Top Products, Geography & Order Status with Colorful Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Products */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Top 5 Sản phẩm</h3>
                <p className="text-xs text-slate-500 font-medium">Xếp theo thành tiền sau VAT</p>
              </div>
              <button
                onClick={() => setActiveTab('product_geo')}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {topProducts.map((prod, idx) => {
                const rankColors = [
                  'bg-amber-400 text-amber-950 shadow-amber-300',
                  'bg-slate-300 text-slate-900',
                  'bg-amber-600 text-white',
                  'bg-indigo-100 text-indigo-900',
                  'bg-teal-100 text-teal-900',
                ];

                return (
                  <div
                    key={prod.code}
                    onClick={() =>
                      toggleChartFilter('itemCode', prod.code, `Sản phẩm ${prod.name}`)
                    }
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 px-2 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 font-mono shadow-2xs ${
                          rankColors[idx]
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-700">
                          {prod.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-semibold">
                          {prod.code} · {formatNumber(prod.qty)} {prod.unit}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black font-mono text-slate-950 tabular-nums shrink-0">
                      {formatVND(prod.revenue)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top 5 Provinces */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Top 5 Địa bàn</h3>
                <p className="text-xs text-slate-500 font-medium">Tỉnh / Thành phố doanh số cao nhất</p>
              </div>
              <button
                onClick={() => setActiveTab('product_geo')}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Chi tiết</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {topProvinces.map((geo) => (
                <div
                  key={geo.province}
                  onClick={() =>
                    toggleChartFilter('province', geo.province, `Tỉnh ${geo.province}`)
                  }
                  className="p-3 rounded-2xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{geo.province}</p>
                      <p className="text-[11px] text-slate-400 font-semibold">
                        {geo.partnerCount} nhà thuốc hoạt động
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black font-mono text-slate-950 tabular-nums">
                    {formatVND(geo.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Trạng thái đơn hàng</h3>
                <p className="text-xs text-slate-500 font-medium">Doanh số sau VAT theo tình trạng</p>
              </div>
              <button
                onClick={() => setActiveTab('operations')}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Vận hành</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {orderStatusData.map((st) => (
                <div
                  key={st.status}
                  onClick={() =>
                    toggleChartFilter('orderStatus', st.status, `Trạng thái: ${st.status}`)
                  }
                  className="p-3 rounded-2xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{st.status}</p>
                    <p className="text-[11px] text-slate-400 font-semibold">
                      {st.orderCount} đơn hàng duy nhất
                    </p>
                  </div>
                  <span className="text-xs font-black font-mono text-slate-950 tabular-nums">
                    {formatVND(st.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 text-center font-medium">
            Dữ liệu doanh số tính chuẩn theo từng dòng sản phẩm
          </p>
        </div>
      </div>
    </div>
  );
};
