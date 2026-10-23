import React from 'react';
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
  activeColor: string;
  inactiveColor: string;
  iconColor: string;
}

const TABS: TabItem[] = [
  {
    id: 'overview',
    label: '1. Tổng quan',
    icon: LayoutDashboard,
    activeColor: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white shadow-md shadow-blue-500/25 border-blue-400/40',
    inactiveColor: 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/80 border-transparent hover:border-blue-200',
    iconColor: 'text-blue-500',
  },
  {
    id: 'team',
    label: '2. Đội ngũ & Giám sát',
    icon: Users2,
    activeColor: 'bg-gradient-to-r from-purple-600 via-indigo-700 to-slate-900 text-white shadow-md shadow-purple-500/25 border-purple-400/40',
    inactiveColor: 'text-slate-700 hover:text-purple-700 hover:bg-purple-50/80 border-transparent hover:border-purple-200',
    iconColor: 'text-purple-500',
  },
  {
    id: 'product_geo',
    label: '3. Sản phẩm & Địa bàn',
    icon: PackageSearch,
    activeColor: 'bg-gradient-to-r from-amber-500 via-orange-600 to-slate-900 text-white shadow-md shadow-amber-500/25 border-amber-400/40',
    inactiveColor: 'text-slate-700 hover:text-amber-700 hover:bg-amber-50/80 border-transparent hover:border-amber-200',
    iconColor: 'text-amber-500',
  },
  {
    id: 'operations',
    label: '4. Vận hành',
    icon: Truck,
    activeColor: 'bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white shadow-md shadow-emerald-500/25 border-emerald-400/40',
    inactiveColor: 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/80 border-transparent hover:border-emerald-200',
    iconColor: 'text-emerald-500',
  },
  {
    id: 'area_detail',
    label: '5. Chi tiết khu vực',
    icon: MapPin,
    activeColor: 'bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-950 text-white shadow-md shadow-cyan-500/25 border-cyan-400/40',
    inactiveColor: 'text-slate-700 hover:text-cyan-700 hover:bg-cyan-50/80 border-transparent hover:border-cyan-200',
    iconColor: 'text-cyan-500',
  },
  {
    id: 'product_detail',
    label: '6. Chi tiết sản phẩm',
    icon: Boxes,
    activeColor: 'bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-950 text-white shadow-md shadow-pink-500/25 border-pink-400/40',
    inactiveColor: 'text-slate-700 hover:text-pink-700 hover:bg-pink-50/80 border-transparent hover:border-pink-200',
    iconColor: 'text-pink-500',
  },
  {
    id: 'raw_data',
    label: '7. Dữ liệu & Kiểm toán',
    icon: TableProperties,
    activeColor: 'bg-gradient-to-r from-slate-800 via-slate-900 to-zinc-950 text-white shadow-md shadow-slate-900/25 border-slate-700/60',
    inactiveColor: 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 border-transparent hover:border-slate-300',
    iconColor: 'text-teal-500',
  },
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
    <div className="bg-gradient-to-r from-white via-indigo-50/30 to-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-3 shadow-2xs">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-inner shrink-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? `${tab.activeColor} scale-[1.02]`
                    : `${tab.inactiveColor} bg-white/70 shadow-2xs`
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white stroke-[2.5]' : tab.iconColor
                  }`}
                />
                <span>{tab.label}</span>
                {tab.id === 'raw_data' && totalIssuesCount > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold shadow-2xs ${
                      isActive
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
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

        <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white/70 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 animate-pulse"></span>
          <span>Cross-Filtering tức thời toàn bộ 7 phân hệ</span>
        </div>
      </div>
    </div>
  );
};
