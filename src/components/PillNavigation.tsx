import {
  LayoutDashboard,
  Users2,
  PackageSearch,
  Truck,
  MapPin,
  Boxes,
  TableProperties,
} from 'lucide-react';
import { useSalesData } from '../context/SalesDataContext';
import { TabType } from '../types/sales';

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ElementType;
}

const TABS: TabItem[] = [
  { id: 'overview', label: '1. Tổng quan', icon: LayoutDashboard },
  { id: 'team', label: '2. Đội ngũ & Giám sát', icon: Users2 },
  { id: 'product_geo', label: '3. Sản phẩm & Địa bàn', icon: PackageSearch },
  { id: 'operations', label: '4. Vận hành', icon: Truck },
  { id: 'area_detail', label: '5. Chi tiết khu vực', icon: MapPin },
  { id: 'product_detail', label: '6. Chi tiết sản phẩm', icon: Boxes },
  { id: 'raw_data', label: '7. Dữ liệu & Kiểm toán', icon: TableProperties },
];

export const PillNavigation: React.FC = () => {
  const { activeTab, setActiveTab, dataQualityAlerts } = useSalesData();

  const totalIssuesCount =
    dataQualityAlerts.deliveryBeforeOrderCount +
    dataQualityAlerts.missingDeliveryStatusCount +
    dataQualityAlerts.missingActualDeliveryCount +
    dataQualityAlerts.invoicedMissingNumberCount +
    dataQualityAlerts.conflictingStatusOrdersCount;

  return (
    <div className="bg-slate-50/80 border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-2.5">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl border border-slate-300/60 shadow-inner shrink-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md shadow-slate-900/15 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400 stroke-[2.5]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.id === 'raw_data' && totalIssuesCount > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-2xs ${
                      isActive ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                    title={`${totalIssuesCount} cảnh báo chất lượng dữ liệu`}
                  >
                    {totalIssuesCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Chuyển đổi phân hệ tức thì không mất bộ lọc</span>
        </div>
      </div>
    </div>
  );
};
