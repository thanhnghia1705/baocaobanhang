import React, { useState, useMemo } from 'react';
import {
  PackageSearch,
  MapPin,
  Search,
  Filter,
  Layers,
  ChevronRight,
  TrendingUp,
  Boxes,
} from 'lucide-react';
import { useSalesData } from '../../context/SalesDataContext';
import {
  formatVND,
  formatNumber,
  formatPercent,
} from '../../utils/formatters';

export const ProductGeoTab: React.FC = () => {
  const {
    filteredRecords,
    aggregatedKPIs,
    toggleChartFilter,
    filterState,
  } = useSalesData();

  const [topN, setTopN] = useState<number | 'all'>(10);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProvinceDrill, setSelectedProvinceDrill] = useState<string | null>(null);

  // 1. Products Aggregation
  const productsData = useMemo(() => {
    const map = new Map<
      string,
      {
        code: string;
        name: string;
        unit: string;
        revenue: number;
        qty: number;
        orders: Set<string>;
        partners: Set<string>;
      }
    >();

    filteredRecords.forEach((r) => {
      const code = r.itemCode || '(Trống)';
      if (!map.has(code)) {
        map.set(code, {
          code,
          name: r.itemName || code,
          unit: r.unit || 'Đơn vị',
          revenue: 0,
          qty: 0,
          orders: new Set(),
          partners: new Set(),
        });
      }
      const item = map.get(code)!;
      item.revenue += r.revenueVAT;
      item.qty += r.quantity;
      if (r.orderId) item.orders.add(r.orderId);
      if (r.partnerId) item.partners.add(r.partnerId);
    });

    const list = Array.from(map.values())
      .map((item) => ({
        code: item.code,
        name: item.name,
        unit: item.unit,
        revenue: item.revenue,
        qty: item.qty,
        ordersCount: item.orders.size,
        partnersCount: item.partners.size,
        share:
          aggregatedKPIs.totalRevenueVAT > 0
            ? (item.revenue / aggregatedKPIs.totalRevenueVAT) * 100
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const maxRev = Math.max(...list.map((i) => i.revenue), 1);

    return { list, maxRev };
  }, [filteredRecords, aggregatedKPIs.totalRevenueVAT]);

  // Filtered & sliced products list
  const displayedProducts = useMemo(() => {
    let filtered = productsData.list.filter(
      (p) =>
        p.code.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    if (topN !== 'all') {
      filtered = filtered.slice(0, topN);
    }
    return filtered;
  }, [productsData.list, productSearch, topN]);

  // 2. Geography: Province Aggregation
  const provinceData = useMemo(() => {
    const map = new Map<
      string,
      {
        province: string;
        revenue: number;
        qty: number;
        orders: Set<string>;
        partners: Set<string>;
      }
    >();

    filteredRecords.forEach((r) => {
      const p = r.province || '(Chưa rõ)';
      if (!map.has(p)) {
        map.set(p, {
          province: p,
          revenue: 0,
          qty: 0,
          orders: new Set(),
          partners: new Set(),
        });
      }
      const item = map.get(p)!;
      item.revenue += r.revenueVAT;
      item.qty += r.quantity;
      if (r.orderId) item.orders.add(r.orderId);
      if (r.partnerId) item.partners.add(r.partnerId);
    });

    const list = Array.from(map.values())
      .map((item) => ({
        province: item.province,
        revenue: item.revenue,
        qty: item.qty,
        ordersCount: item.orders.size,
        partnersCount: item.partners.size,
        share:
          aggregatedKPIs.totalRevenueVAT > 0
            ? (item.revenue / aggregatedKPIs.totalRevenueVAT) * 100
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const maxRev = Math.max(...list.map((i) => i.revenue), 1);

    return { list, maxRev };
  }, [filteredRecords, aggregatedKPIs.totalRevenueVAT]);

  // 3. Ward drill-down within selected province
  const wardDrilldownData = useMemo(() => {
    const activeProv = selectedProvinceDrill || (provinceData.list[0]?.province ?? '');
    if (!activeProv) return null;

    const provRecords = filteredRecords.filter((r) => r.province === activeProv);
    const wardMap = new Map<
      string,
      { ward: string; revenue: number; qty: number; partners: Set<string>; orders: Set<string> }
    >();

    provRecords.forEach((r) => {
      const w = r.ward || '(Chưa xác định)';
      if (!wardMap.has(w)) {
        wardMap.set(w, {
          ward: w,
          revenue: 0,
          qty: 0,
          partners: new Set(),
          orders: new Set(),
        });
      }
      const item = wardMap.get(w)!;
      item.revenue += r.revenueVAT;
      item.qty += r.quantity;
      if (r.partnerId) item.partners.add(r.partnerId);
      if (r.orderId) item.orders.add(r.orderId);
    });

    const list = Array.from(wardMap.values())
      .map((item) => ({
        ward: item.ward,
        revenue: item.revenue,
        qty: item.qty,
        partnersCount: item.partners.size,
        ordersCount: item.orders.size,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const provRev = provRecords.reduce((sum, r) => sum + r.revenueVAT, 0);

    return {
      provinceName: activeProv,
      totalRevenue: provRev,
      totalPartners: new Set(provRecords.map((r) => r.partnerId)).size,
      totalOrders: new Set(provRecords.map((r) => r.orderId)).size,
      wards: list,
    };
  }, [selectedProvinceDrill, provinceData.list, filteredRecords]);

  return (
    <div className="space-y-6">
      {/* Products Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-emerald-400 flex items-center justify-center font-bold shadow-md shadow-slate-950/10 border border-slate-800">
              <Boxes className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950 tracking-tight uppercase">
                Hiệu Suất Sản Phẩm & Mã Vật Tư
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Xếp hạng doanh thu sau VAT, sản lượng tiêu thụ và tỷ trọng đóng góp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Top N Selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 px-2 uppercase tracking-wider text-[10px]">
                Xem:
              </span>
              {[5, 10, 20, 'all'].map((n) => (
                <button
                  key={n}
                  onClick={() => setTopN(n as any)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    topN === n
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {n === 'all' ? 'Tất cả' : `Top ${n}`}
                </button>
              ))}
            </div>

            {/* Product Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Tìm mã hoặc tên sản phẩm..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-56"
              />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[460px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200 backdrop-blur-xs">
              <tr>
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-3">Mã vật tư</th>
                <th className="py-3 px-3">Sản phẩm / Dịch vụ</th>
                <th className="py-3 px-3">ĐVT</th>
                <th className="py-3 px-3 text-right">Sản lượng</th>
                <th className="py-3 px-3 text-right">Số đơn</th>
                <th className="py-3 px-3 text-right">Số nhà thuốc</th>
                <th className="py-3 px-3 text-right">Doanh số (+VAT)</th>
                <th className="py-3 px-3 text-right">Tỷ trọng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
              ) : (
                displayedProducts.map((p, idx) => {
                  const isFiltered = filterState.chartFilters.some(
                    (cf) => cf.field === 'itemCode' && cf.value === p.code
                  );

                  return (
                    <tr
                      key={p.code}
                      onClick={() =>
                        toggleChartFilter('itemCode', p.code, `Sản phẩm ${p.name}`)
                      }
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        isFiltered ? 'bg-emerald-50/50 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                        {p.code}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{p.name}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-medium">{p.unit}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold">
                        {formatNumber(p.qty)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                        {formatNumber(p.ordersCount)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-800 font-bold">
                        {formatNumber(p.partnersCount)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-slate-950 tabular-nums">
                        {formatVND(p.revenue)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-bold text-slate-700 tabular-nums">
                          {p.share.toFixed(1).replace('.', ',')}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Geography Section: Province Ranking & Ward Drilldown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Province Ranking */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Xếp hạng Địa bàn theo Tỉnh / Thành
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bấm vào tỉnh để xem phân rã theo Phường / Xã
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {provinceData.list.length} Tỉnh/Thành
              </span>
            </div>

            <div className="mt-4 space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {provinceData.list.map((geo, idx) => {
                const widthPercent = Math.max(
                  Math.round((geo.revenue / provinceData.maxRev) * 100),
                  5
                );
                const isSelected =
                  selectedProvinceDrill === geo.province ||
                  (!selectedProvinceDrill && idx === 0);

                return (
                  <div
                    key={geo.province}
                    onClick={() => setSelectedProvinceDrill(geo.province)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-400 shadow-xs'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-bold">{geo.province}</span>
                      </div>
                      <span className="font-mono text-slate-950 font-black tabular-nums">
                        {formatVND(geo.revenue)}
                      </span>
                    </div>

                    {/* Bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2.5">
                      <div
                        style={{ width: `${widthPercent}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          isSelected
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-400'
                            : 'bg-gradient-to-r from-slate-900 to-slate-700'
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
                      <span>{geo.partnersCount} nhà thuốc · {geo.ordersCount} đơn</span>
                      <span className="font-bold text-emerald-800">
                        {geo.share.toFixed(1).replace('.', ',')}% tổng doanh số
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ward Drill-down */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Phân rã Phường / Xã tại:</span>
                  <span className="text-emerald-700 font-black">
                    {wardDrilldownData?.provinceName}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Doanh số:{' '}
                  <span className="font-bold font-mono text-slate-900">
                    {wardDrilldownData ? formatVND(wardDrilldownData.totalRevenue) : '—'}
                  </span>{' '}
                  ({wardDrilldownData?.totalPartners} nhà thuốc)
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {wardDrilldownData?.wards.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center font-medium">
                  Không có dữ liệu phường/xã
                </p>
              ) : (
                wardDrilldownData?.wards.map((w) => (
                  <div
                    key={w.ward}
                    onClick={() =>
                      toggleChartFilter('ward', w.ward, `Địa bàn: ${w.ward}`)
                    }
                    className="p-3 rounded-2xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{w.ward}</p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {w.partnersCount} nhà thuốc · {w.ordersCount} đơn hàng
                      </p>
                    </div>
                    <span className="text-xs font-black font-mono text-slate-950 tabular-nums">
                      {formatVND(w.revenue)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 text-center font-medium">
            Bấm vào Phường/Xã để lọc toàn bộ dashboard
          </p>
        </div>
      </div>
    </div>
  );
};
