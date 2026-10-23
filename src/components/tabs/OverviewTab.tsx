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

  // 2. Channel distribution
  const channelData = useMemo(() => {
    const map = new Map<string, { revenue: number; orders: Set<string> }>();
    filteredRecords.forEach((r) => {
      const ch = r.channel || '(Chưa phân loại)';
      if (!map.has(ch)) map.set(ch, { revenue: 0, orders: new Set() });
      const item = map.get(ch)!;
      item.revenue += r.revenueVAT;
      if (r.orderId) item.orders.add(r.orderId);
    });

    return Array.from(map.entries())
      .map(([channel, val]) => ({
        channel,
        revenue: val.revenue,
        orderCount: val.orders.size,
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
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Dominant Midnight Navy Hero KPI Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#0A1128] text-white rounded-3xl p-6 shadow-xl shadow-slate-950/20 border border-slate-700/60 flex flex-col justify-between relative overflow-hidden group">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-bold text-emerald-300 tracking-widest uppercase">
                  DOANH SỐ SAU VAT
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/15 backdrop-blur-xs">
                Cột (+VAT) chuẩn
              </span>
            </div>

            <div className="mt-4">
              <div
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight tabular-nums text-white"
                title={revCompact.full}
              >
                {revCompact.compact}
              </div>
              <p className="text-xs text-emerald-200/90 font-mono tabular-nums mt-1.5 font-medium">
                {revCompact.full}
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-3.5 border-t border-white/15 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>{filteredRecords.length.toLocaleString('vi-VN')} dòng sản phẩm</span>
            </div>
            <span className="text-[11px] text-slate-400">Không cộng trùng</span>
          </div>
        </div>

        {/* 5 Secondary KPI Cards with Elevated Palette */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">Số đơn hàng</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">
              {formatNumber(aggregatedKPIs.uniqueOrdersCount)}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 border-t border-slate-100 pt-2 font-medium">
            Đếm duy nhất Tiêu đề đơn
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">Nhà thuốc duy nhất</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 mt-2 font-mono tabular-nums">
              {formatNumber(aggregatedKPIs.uniquePartnersCount)}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 border-t border-slate-100 pt-2 flex items-center justify-between font-medium">
            <span>Mua lặp (≥2 đơn):</span>
            <span className="font-bold text-emerald-700 tabular-nums">
              {formatNumber(aggregatedKPIs.repeatPartnersCount)} ({formatPercent(aggregatedKPIs.repeatPartnersCount, aggregatedKPIs.uniquePartnersCount)})
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">Tổng sản lượng</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">
              {formatNumber(aggregatedKPIs.totalQuantity)}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 border-t border-slate-100 pt-2 font-medium">
            Tổng số lượng sản phẩm xuất
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">Giá trị đơn TB (AOV)</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums truncate">
              {aggregatedKPIs.averageOrderValue !== null
                ? formatVND(aggregatedKPIs.averageOrderValue)
                : '—'}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 border-t border-slate-100 pt-2 font-medium">
            Doanh số sau VAT / Đơn duy nhất
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">Mã sản phẩm</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">
              {formatNumber(aggregatedKPIs.uniqueProductsCount)}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 border-t border-slate-100 pt-2 font-medium">
            Mã vật tư duy nhất phát sinh
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
                <h3 className="text-base font-bold text-slate-900">
                  Xu hướng doanh số sau VAT
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bấm vào cột để áp dụng lọc chéo ngay cho toàn bộ dashboard
                </p>
              </div>

              {/* Day / Week / Month toggle */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                <button
                  onClick={() => setTrendInterval('day')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    trendInterval === 'day'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ngày
                </button>
                <button
                  onClick={() => setTrendInterval('week')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    trendInterval === 'week'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tuần
                </button>
                <button
                  onClick={() => setTrendInterval('month')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    trendInterval === 'month'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tháng
                </button>
              </div>
            </div>

            {/* Bar Chart Visualization with rich gradient bars */}
            <div className="pt-6 h-64 flex items-end gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar">
              {trendData.list.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                  Không có dữ liệu trong khoảng thời gian này
                </div>
              ) : (
                trendData.list.map((item) => {
                  const heightPercent = Math.max(
                    Math.round((item.revenue / trendData.maxRev) * 100),
                    5
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
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-16 bg-slate-900 text-white text-[11px] rounded-xl px-3 py-1.5 whitespace-nowrap shadow-xl pointer-events-none z-20 border border-slate-700">
                        <p className="font-bold text-emerald-400">{item.label}</p>
                        <p className="font-mono font-semibold">{formatVND(item.revenue)}</p>
                        <p className="text-slate-300">{item.orderCount} đơn hàng duy nhất</p>
                      </div>

                      {/* Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-lg transition-all duration-200 ${
                          isFiltered
                            ? 'bg-gradient-to-t from-emerald-600 to-teal-400 ring-2 ring-emerald-500 shadow-md shadow-emerald-500/20'
                            : 'bg-gradient-to-t from-slate-800 to-slate-700 hover:from-emerald-600 hover:to-teal-500'
                        }`}
                      />

                      {/* Label */}
                      <span className="text-[10px] font-semibold text-slate-500 mt-2 truncate w-full text-center">
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
            <span className="font-bold text-slate-900 font-mono tabular-nums">
              Đỉnh điểm: {formatVND(trendData.maxRev)}
            </span>
          </div>
        </div>

        {/* Channel Breakdown (1 Col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Cơ cấu Kênh bán hàng</h3>
            <p className="text-xs text-slate-500 mt-0.5">
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
                        ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-xs'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="truncate pr-2">{item.channel}</span>
                      <span className="font-mono tabular-nums text-slate-950 font-extrabold">
                        {formatVND(item.revenue)}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2.5">
                      <div
                        style={{ width: `${percent}%` }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-300"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
                      <span>{item.orderCount} đơn hàng duy nhất</span>
                      <span className="font-bold text-emerald-800">
                        {percent.toFixed(1).replace('.', ',')}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 text-center font-medium">
            Bấm vào kênh để lọc toàn bộ dashboard
          </p>
        </div>
      </div>

      {/* Row 3: Top Products, Geography & Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Products */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Top 5 Sản phẩm</h3>
                <p className="text-xs text-slate-500">Xếp theo thành tiền sau VAT</p>
              </div>
              <button
                onClick={() => setActiveTab('product_geo')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {topProducts.map((prod, idx) => (
                <div
                  key={prod.code}
                  onClick={() =>
                    toggleChartFilter('itemCode', prod.code, `Sản phẩm ${prod.name}`)
                  }
                  className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 px-2 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 font-mono">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-700">
                        {prod.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {prod.code} · {formatNumber(prod.qty)} {prod.unit}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold font-mono text-slate-900 tabular-nums shrink-0">
                    {formatVND(prod.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 5 Provinces */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Top 5 Địa bàn</h3>
                <p className="text-xs text-slate-500">Tỉnh / Thành phố doanh số cao nhất</p>
              </div>
              <button
                onClick={() => setActiveTab('product_geo')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
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
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{geo.province}</p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {geo.partnerCount} nhà thuốc hoạt động
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold font-mono text-slate-900 tabular-nums">
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
                <h3 className="text-base font-bold text-slate-900">Trạng thái đơn hàng</h3>
                <p className="text-xs text-slate-500">Doanh số sau VAT theo tình trạng</p>
              </div>
              <button
                onClick={() => setActiveTab('operations')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
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
                    <p className="text-[11px] text-slate-400 font-medium">
                      {st.orderCount} đơn hàng duy nhất
                    </p>
                  </div>
                  <span className="text-xs font-extrabold font-mono text-slate-900 tabular-nums">
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
