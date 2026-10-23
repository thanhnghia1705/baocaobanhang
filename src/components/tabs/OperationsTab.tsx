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
  theme: {
    accentColor: string;
    gradient: string;
    iconBg: string;
    iconColor: string;
    ringColor: string;
    borderTop: string;
    tagBg: string;
  };
  icon: React.ElementType;
}

const StatusGroupCard: React.FC<StatusGroupCardProps> = ({
  title,
  field,
  items,
  totalRevenue,
  onSelect,
  activeFilterValue,
  theme,
  icon: Icon,
}) => {
  return (
    <div className={`bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between relative overflow-hidden ${theme.borderTop}`}>
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl ${theme.iconBg} ${theme.iconColor} flex items-center justify-center font-bold shadow-2xs`}>
              <Icon className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">{title}</h3>
          </div>
          <span className={`text-[11px] font-bold ${theme.tagBg} px-2 py-0.5 rounded-lg border`}>
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
                    ? `border-emerald-500 bg-emerald-50/70 ring-2 ${theme.ringColor} shadow-xs scale-[1.01]`
                    : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/90'
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
                    className={`bg-gradient-to-r ${theme.gradient} h-full rounded-full transition-all duration-300 shadow-2xs`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
                  <span>{formatNumber(it.ordersCount)} đơn hàng duy nhất</span>
                  <span className="font-extrabold text-slate-800">
                    {percent.toFixed(1).replace('.', ',')}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider">
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

      {/* Grid of 6 Operations Status Categories with Vivid Colorful Themes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Tình trạng giao hàng (Sky / Cyan Theme) */}
        <StatusGroupCard
          title="Tình trạng giao hàng"
          field="deliveryStatus"
          items={deliveryData}
          totalRevenue={aggregatedKPIs.totalRevenueVAT}
          onSelect={toggleChartFilter}
          icon={Truck}
          theme={{
            accentColor: 'text-sky-700',
            gradient: 'from-sky-500 via-cyan-500 to-blue-600',
            iconBg: 'bg-sky-100',
            iconColor: 'text-sky-700',
            ringColor: 'ring-sky-400',
            borderTop: 'border-t-4 border-t-sky-500',
            tagBg: 'bg-sky-50 text-sky-800 border-sky-200',
          }}
        />

        {/* 2. Tình trạng thanh toán (Emerald / Teal Theme) */}
        <StatusGroupCard
          title="Tình trạng thanh toán"
          field="paymentStatus"
          items={paymentData}
          totalRevenue={aggregatedKPIs.totalRevenueVAT}
          onSelect={toggleChartFilter}
          icon={CreditCard}
          theme={{
            accentColor: 'text-emerald-700',
            gradient: 'from-emerald-500 via-teal-500 to-green-600',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-700',
            ringColor: 'ring-emerald-400',
            borderTop: 'border-t-4 border-t-emerald-500',
            tagBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          }}
        />

        {/* 3. Tình trạng xuất hóa đơn (Amber / Gold Theme) */}
        <StatusGroupCard
          title="Tình trạng xuất hóa đơn"
          field="invoiceStatus"
          items={invoiceData}
          totalRevenue={aggregatedKPIs.totalRevenueVAT}
          onSelect={toggleChartFilter}
          icon={Receipt}
          theme={{
            accentColor: 'text-amber-700',
            gradient: 'from-amber-400 via-orange-500 to-amber-600',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-700',
            ringColor: 'ring-amber-400',
            borderTop: 'border-t-4 border-t-amber-500',
            tagBg: 'bg-amber-50 text-amber-800 border-amber-200',
          }}
        />

        {/* 4. Tình trạng đơn hàng (Purple / Violet Theme) */}
        <StatusGroupCard
          title="Tình trạng đơn hàng"
          field="orderStatus"
          items={orderStatusData}
          totalRevenue={aggregatedKPIs.totalRevenueVAT}
          onSelect={toggleChartFilter}
          icon={CheckCircle}
          theme={{
            accentColor: 'text-purple-700',
            gradient: 'from-purple-500 via-indigo-600 to-purple-700',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-700',
            ringColor: 'ring-purple-400',
            borderTop: 'border-t-4 border-t-purple-500',
            tagBg: 'bg-purple-50 text-purple-800 border-purple-200',
          }}
        />

        {/* 5. Kho xuất hàng (Teal / Cyan Theme) */}
        <StatusGroupCard
          title="Kho xuất hàng"
          field="warehouse"
          items={warehouseData}
          totalRevenue={aggregatedKPIs.totalRevenueVAT}
          onSelect={toggleChartFilter}
          icon={Warehouse}
          theme={{
            accentColor: 'text-teal-700',
            gradient: 'from-teal-500 via-emerald-600 to-cyan-600',
            iconBg: 'bg-teal-100',
            iconColor: 'text-teal-700',
            ringColor: 'ring-teal-400',
            borderTop: 'border-t-4 border-t-teal-500',
            tagBg: 'bg-teal-50 text-teal-800 border-teal-200',
          }}
        />

        {/* 6. Phân loại đơn hàng (Rose / Pink Theme) */}
        <StatusGroupCard
          title="Phân loại đơn hàng"
          field="orderType"
          items={orderTypeData}
          totalRevenue={aggregatedKPIs.totalRevenueVAT}
          onSelect={toggleChartFilter}
          icon={Layers}
          theme={{
            accentColor: 'text-rose-700',
            gradient: 'from-rose-500 via-pink-600 to-fuchsia-600',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-700',
            ringColor: 'ring-rose-400',
            borderTop: 'border-t-4 border-t-rose-500',
            tagBg: 'bg-rose-50 text-rose-800 border-rose-200',
          }}
        />
      </div>
    </div>
  );
};
