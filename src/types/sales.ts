/**
 * Định nghĩa kiểu dữ liệu cho ứng dụng Dashboard bán hàng tự động
 */

export interface SalesRecord {
  // 41 cột nguyên bản từ file Excel/CSV
  [key: string]: any;
}

export interface NormalizedRecord {
  _id: string;
  _rowIndex: number;
  _raw: SalesRecord;
  
  // Các trường nghiệp vụ chính yếu được chuẩn hóa
  orderId: string; // Đơn hàng Tiêu đề (Mã đơn hàng)
  partnerId: string; // Đơn hàng Mã đối tác (Mã nhà thuốc / khách hàng)
  partnerName: string; // Tên đối tác
  itemCode: string; // Mã vật tư / Mã sản phẩm
  itemName: string; // Sản phẩm / Dịch vụ
  unit: string; // Đơn vị tính
  quantity: number; // Đơn hàng Số lượng
  revenueVAT: number; // Đơn hàng Thành tiền (+VAT)
  
  orderDate: string; // YYYY-MM-DD
  orderDateTimeStr: string;
  expectedDeliveryDate: string; // YYYY-MM-DD
  actualDeliveryTime: string; // YYYY-MM-DD HH:mm hoặc date string
  
  orderStatus: string; // Tình trạng đơn hàng
  deliveryStatus: string; // Tình trạng giao hàng
  paymentStatus: string; // Tình trạng thanh toán
  invoiceStatus: string; // Tình trạng xuất hóa đơn
  invoiceNumber: string; // Số hóa đơn
  
  warehouse: string; // Kho
  channel: string; // Kênh bán
  orderType: string; // Loại đơn hàng
  
  province: string; // Tỉnh / Thành
  ward: string; // Phường / Xã
  
  salesRep: string; // Nhân viên bán hàng
  teamLead: string; // Trưởng nhóm
  supervisor: string; // Giám sát
  areaDirector: string; // Giám đốc khu vực
  unitDirector: string; // Giám đốc đơn vị
}

export type TabType = 'overview' | 'team' | 'product_geo' | 'operations' | 'raw_data';

export type DateFilterPreset = 'all' | '7d' | '14d' | '30d' | 'this_month' | 'custom';

export type TrendInterval = 'day' | 'week' | 'month';

export interface FilterState {
  datePreset: DateFilterPreset;
  customStartDate?: string;
  customEndDate?: string;
  
  provinces: string[];
  wards: string[];
  channels: string[];
  orderTypes: string[];
  warehouses: string[];
  itemCodes: string[];
  
  supervisors: string[];
  salesReps: string[];
  teamLeads: string[];
  areaDirectors: string[];
  
  orderStatuses: string[];
  deliveryStatuses: string[];
  paymentStatuses: string[];
  invoiceStatuses: string[];
  
  // Lọc đặc biệt từ click biểu đồ (Cross-filtering)
  chartFilters: {
    field: string;
    value: string;
    label: string;
  }[];
  
  // Lọc theo cảnh báo chất lượng dữ liệu
  qualityIssueFilter?: 'deliveryBeforeOrder' | 'missingDeliveryStatus' | 'missingActualDelivery' | 'invoicedMissingNumber' | 'conflictingStatus';
  
  // Bộ lọc nâng cao cho bất kỳ cột nguồn nào
  advancedFilters: AdvancedFilterRule[];
}

export interface AdvancedFilterRule {
  id: string;
  column: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'startsWith' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty';
  value: string;
}

export interface ColumnMapping {
  // Mapping từ khóa hệ thống sang tên cột thực tế trong file
  orderId: string;
  partnerId: string;
  partnerName: string;
  itemCode: string;
  itemName: string;
  unit: string;
  quantity: string;
  revenueVAT: string;
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryTime: string;
  orderStatus: string;
  deliveryStatus: string;
  paymentStatus: string;
  invoiceStatus: string;
  invoiceNumber: string;
  warehouse: string;
  channel: string;
  orderType: string;
  province: string;
  ward: string;
  salesRep: string;
  teamLead: string;
  supervisor: string;
  areaDirector: string;
  unitDirector: string;
}

export interface DataQualityAlerts {
  deliveryBeforeOrderCount: number;
  deliveryBeforeOrderRows: NormalizedRecord[];
  
  missingDeliveryStatusCount: number;
  missingDeliveryStatusRows: NormalizedRecord[];
  
  missingActualDeliveryCount: number;
  missingActualDeliveryRows: NormalizedRecord[];
  
  invoicedMissingNumberCount: number;
  invoicedMissingNumberRows: NormalizedRecord[];
  
  conflictingStatusOrdersCount: number;
  conflictingStatusOrders: string[]; // Danh sách mã đơn mâu thuẫn
  conflictingStatusRows: NormalizedRecord[];
}

export interface AggregatedKPIs {
  totalRevenueVAT: number;
  uniqueOrdersCount: number;
  uniquePartnersCount: number;
  totalQuantity: number;
  uniqueProductsCount: number;
  averageOrderValue: number | null; // null => '-'
  repeatPartnersCount: number; // Mua từ 2 đơn trở lên
  singleOrderPartnersCount: number; // Mua đúng 1 đơn
}
