import React, { useMemo } from 'react';
import {
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Warehouse,
  Receipt,
  CreditCard,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import { useSalesData } from '../../context/SalesDataContext';
import {
  formatVND,
  formatNumber,
  formatPercent,
} from '../../utils/formatters';

interface StatusGroupCardProps {
  title: string;
  field: string;
  items: { label: string; revenue: number; ordersCount: number }[];
  totalRevenue: number;
  onSelect: (field: string, value: string, label: string) => void;
  activeFilterValue?: string;
}

const StatusGroupCard: React.FC<StatusGroupCardProps> = ({
  title,
  field,
  items,
  totalRevenue,
  onSelect,
  activeFilterValue,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
            {items.length} trạng thái
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {items.map((it) => {
            const percent = totalRevenue > 0 ? (it.revenue / totalRevenue) * 100 : 0;
            const isSelected = activeFilterValue === it.label;

            return (
              <div
                key={it.label}
                onClick={() => onSelect(field, it.label, `${title}: ${it.label}`)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-400 shadow-xs'
                    : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="truncate pr-2">{it.label || '(Trống)'}</span>
                  <span className="font-mono tabular-nums text-slate-950 font-black">
                    {formatVND(it.revenue)}
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2.5">
                  <div
                    style={{ width: `${percent}%` }}
                    className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-300"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
                  <span>{formatNumber(it.ordersCount)} đơn hàng duy nhất</span>
                  <span className="font-bold text-emerald-800">
                    {percent.toFixed(1).replace('.', ',')}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-medium text-slate-400 text-center uppercase tracking-wider">
        Giá trị đơn hàng sau VAT theo trạng thái
      </div>
    </div>
  );
};

export const OperationsTab: React.FC = () => {
  const { filteredRecords, aggregatedKPIs, toggleChartFilter } = useSalesData();

  const aggregateByField = (field: keyof typeof filteredRecords[0]) => {
    const map = new Map<string, { revenue: number; orders: Set<string> }>();
    filteredRecords.forEach((r) => {
      const val = String(r[field] || '(Trống)').trim();
      if (!map.has(val)) map.set(val, { revenue: 0, orders: new Set() });
      const item = map.get(val)!;
      item.revenue += r.revenueVAT;
      if (r.orderId) item.orders.add(r.orderId);
    });

    return Array.from(map.entries())
      .map(([label, val]) => ({
        label,
        revenue: val.revenue,
        ordersCount: val.orders.size,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  const deliveryData = useMemo(() => aggregateByField('deliveryStatus'), [filteredRecords]);
  const paymentData = useMemo(() => aggregateByField('paymentStatus'), [filteredRecords]);
  const invoiceData = useMemo(() => aggregateByField('invoiceStatus'), [filteredRecords]);
  const warehouseData = useMemo(() => aggregateByField('warehouse'), [filteredRecords]);
  const orderTypeData = useMemo(() => aggregateByField('orderType'), [filteredRecords]);
  const orderStatusData = useMemo(() => aggregateByField('orderStatus'), [filteredRecords]);

  return (
    <div className="space-y-6">
      {/* Overview Notice Header with Deep Slate Gradient */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl shadow-slate-950/15 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center font-bold border border-white/15">
            <Truck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-black text-white tracking-tight uppercase">
              Theo Dõi Vận Hành & Chuỗi Cung Ứng
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 font-medium">
              Phân tích đa chiều luân chuyển đơn hàng từ kho, vận chuyển, xuất hóa đơn đến thanh toán
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/15 text-xs text-slate-200">
          <span className="text-emerald-300 font-bold">Quy chuẩn nhãn tiền:</span>{' '}
          Hiển thị chuẩn <span className="font-extrabold text-white">"Giá trị đơn hàng sau VAT theo trạng thái"</span>
        </div>
      </div>

      {/* Grid of 6 Operations Status Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatusGroupCard
          title="Tình trạng giao hàng"
          field="deliveryStatus"
          items={deliveryData}
          totalRevenue={aggregatedKPIs.totalRevenueVAT}
          onSelect={toggleChartFilter}
        />

        <StatusGroupCard
          title="Tình trạng thanh toán"
          field="paymentStatus"
          items={paymentData}
          totalRevenue={aggregatedKPIs.totalRevenueVAT}
          onSelect={toggleChartFilter}
        />

        <StatusGroupCard
          title="Tình trạng xuất hóa đơn"
          field="invoiceStatus"
          items={invoiceData}
          totalRevenue={aggregatedKPIs.totalRevenueVAT}
          onSelect={toggleChartFilter}
        />

        <StatusGroupCard
          title="Tình trạng đơn hàng"
          field="orderStatus"
          items={orderStatusData}
          totalRevenue={aggregatedKPIs.totalRevenueVAT}
          onSelect={toggleChartFilter}
        />

        <StatusGroupCard
          title="Kho xuất hàng"
          field="warehouse"
          items={warehouseData}
          totalRevenue={aggregatedKPIs.totalRevenueVAT}
          onSelect={toggleChartFilter}
        />

        <StatusGroupCard
          title="Phân loại đơn hàng"
          field="orderType"
          items={orderTypeData}
          totalRevenue={aggregatedKPIs.totalRevenueVAT}
          onSelect={toggleChartFilter}
        />
      </div>
    </div>
  );
};
