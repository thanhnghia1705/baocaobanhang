import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  SalesRecord,
  NormalizedRecord,
  ColumnMapping,
  TabType,
  FilterState,
  AggregatedKPIs,
  DataQualityAlerts,
  DateFilterPreset,
} from '../types/sales';
import { DEFAULT_COLUMN_MAPPING, normalizeRecord } from '../utils/fileParser';
import { generateStandardBenchmarkData } from '../utils/sampleDataGenerator';

export interface FileMetadata {
  fileName: string;
  fileSize: number;
  sheetName: string;
  totalRows: number;
  totalCols: number;
  isSampleData: boolean;
  uploadedAt: string;
}

interface SalesDataContextType {
  rawRecords: SalesRecord[];
  headers: string[];
  columnMapping: ColumnMapping;
  normalizedRecords: NormalizedRecord[];
  filteredRecords: NormalizedRecord[];
  activeTab: TabType;
  filterState: FilterState;
  fileInfo: FileMetadata;
  aggregatedKPIs: AggregatedKPIs;
  dataQualityAlerts: DataQualityAlerts;
  latestDate: string;
  earliestDate: string;
  uniqueValues: {
    provinces: string[];
    wards: string[];
    channels: string[];
    orderTypes: string[];
    warehouses: string[];
    itemCodes: { code: string; name: string }[];
    supervisors: string[];
    salesReps: string[];
    teamLeads: string[];
    areaDirectors: string[];
    orderStatuses: string[];
    deliveryStatuses: string[];
    paymentStatuses: string[];
    invoiceStatuses: string[];
  };
  setActiveTab: (tab: TabType) => void;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  resetAllFilters: () => void;
  toggleChartFilter: (field: string, value: string, label: string) => void;
  removeChartFilter: (index: number) => void;
  setQualityFilter: (issue?: FilterState['qualityIssueFilter']) => void;
  updateColumnMapping: (mapping: ColumnMapping) => void;
  loadSampleData: () => void;
  loadUploadedData: (
    records: SalesRecord[],
    headers: string[],
    mapping: ColumnMapping,
    fileName: string,
    fileSize: number,
    sheetName: string,
    mode: 'replace' | 'append'
  ) => void;
}

const initialFilterState: FilterState = {
  datePreset: 'all',
  provinces: [],
  wards: [],
  channels: [],
  orderTypes: [],
  warehouses: [],
  itemCodes: [],
  supervisors: [],
  salesReps: [],
  teamLeads: [],
  areaDirectors: [],
  orderStatuses: [],
  deliveryStatuses: [],
  paymentStatuses: [],
  invoiceStatuses: [],
  chartFilters: [],
  qualityIssueFilter: undefined,
  advancedFilters: [],
};

const SalesDataContext = createContext<SalesDataContextType | undefined>(undefined);

export const SalesDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load sample data by default on first run
  const initialData = useMemo(() => generateStandardBenchmarkData(), []);

  const [rawRecords, setRawRecords] = useState<SalesRecord[]>(initialData.records);
  const [headers, setHeaders] = useState<string[]>(initialData.headers);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>(DEFAULT_COLUMN_MAPPING);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [filterState, setFilterState] = useState<FilterState>(initialFilterState);

  const [fileInfo, setFileInfo] = useState<FileMetadata>({
    fileName: 'Dữ liệu bán hàng dược phẩm chuẩn (Mẫu).xlsx',
    fileSize: 1024 * 768,
    sheetName: 'Sheet1',
    totalRows: initialData.records.length,
    totalCols: initialData.headers.length,
    isSampleData: true,
    uploadedAt: new Date().toLocaleTimeString('vi-VN'),
  });

  // Normalize all raw records
  const normalizedRecords = useMemo(() => {
    return rawRecords.map((r, idx) => normalizeRecord(r, columnMapping, idx + 1));
  }, [rawRecords, columnMapping]);

  // Determine earliest and latest dates
  const { earliestDate, latestDate } = useMemo(() => {
    let min = '';
    let max = '';
    for (const rec of normalizedRecords) {
      if (!rec.orderDate) continue;
      if (!min || rec.orderDate < min) min = rec.orderDate;
      if (!max || rec.orderDate > max) max = rec.orderDate;
    }
    return { earliestDate: min || '2026-09-29', latestDate: max || '2026-10-21' };
  }, [normalizedRecords]);

  // Unique values for dropdown filters
  const uniqueValues = useMemo(() => {
    const pSet = new Set<string>();
    const wSet = new Set<string>();
    const cSet = new Set<string>();
    const otSet = new Set<string>();
    const whSet = new Set<string>();
    const itMap = new Map<string, string>();
    const sSet = new Set<string>();
    const srSet = new Set<string>();
    const tlSet = new Set<string>();
    const adSet = new Set<string>();
    const osSet = new Set<string>();
    const dsSet = new Set<string>();
    const psSet = new Set<string>();
    const isSet = new Set<string>();

    for (const r of normalizedRecords) {
      if (r.province) pSet.add(r.province);
      if (r.ward) wSet.add(r.ward);
      if (r.channel) cSet.add(r.channel);
      if (r.orderType) otSet.add(r.orderType);
      if (r.warehouse) whSet.add(r.warehouse);
      if (r.itemCode) itMap.set(r.itemCode, r.itemName || r.itemCode);
      if (r.supervisor) sSet.add(r.supervisor);
      if (r.salesRep) srSet.add(r.salesRep);
      if (r.teamLead) tlSet.add(r.teamLead);
      if (r.areaDirector) adSet.add(r.areaDirector);
      if (r.orderStatus) osSet.add(r.orderStatus);
      if (r.deliveryStatus) dsSet.add(r.deliveryStatus);
      if (r.paymentStatus) psSet.add(r.paymentStatus);
      if (r.invoiceStatus) isSet.add(r.invoiceStatus);
    }

    const itemCodesList = Array.from(itMap.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.code.localeCompare(b.code));

    return {
      provinces: Array.from(pSet).sort(),
      wards: Array.from(wSet).sort(),
      channels: Array.from(cSet).sort(),
      orderTypes: Array.from(otSet).sort(),
      warehouses: Array.from(whSet).sort(),
      itemCodes: itemCodesList,
      supervisors: Array.from(sSet).sort(),
      salesReps: Array.from(srSet).sort(),
      teamLeads: Array.from(tlSet).sort(),
      areaDirectors: Array.from(adSet).sort(),
      orderStatuses: Array.from(osSet).sort(),
      deliveryStatuses: Array.from(dsSet).sort(),
      paymentStatuses: Array.from(psSet).sort(),
      invoiceStatuses: Array.from(isSet).sort(),
    };
  }, [normalizedRecords]);

  // Detect conflicting order status across product lines
  const orderStatusConflictData = useMemo(() => {
    const orderStatusesMap = new Map<string, Set<string>>();
    for (const r of normalizedRecords) {
      if (!r.orderId) continue;
      if (!orderStatusesMap.has(r.orderId)) {
        orderStatusesMap.set(r.orderId, new Set());
      }
      orderStatusesMap.get(r.orderId)!.add(r.orderStatus || '(Trống)');
    }

    const conflictingOrders: string[] = [];
    orderStatusesMap.forEach((statuses, ordId) => {
      if (statuses.size > 1) {
        conflictingOrders.push(ordId);
      }
    });

    return new Set(conflictingOrders);
  }, [normalizedRecords]);

  // Calculate Data Quality Alerts across current dataset
  const dataQualityAlerts = useMemo<DataQualityAlerts>(() => {
    const deliveryBeforeOrderRows: NormalizedRecord[] = [];
    const missingDeliveryStatusRows: NormalizedRecord[] = [];
    const missingActualDeliveryRows: NormalizedRecord[] = [];
    const invoicedMissingNumberRows: NormalizedRecord[] = [];
    const conflictingStatusRows: NormalizedRecord[] = [];

    for (const r of normalizedRecords) {
      // 1. Ngày giao dự kiến trước ngày đặt hàng
      if (r.expectedDeliveryDate && r.orderDate && r.expectedDeliveryDate < r.orderDate) {
        deliveryBeforeOrderRows.push(r);
      }
      // 2. Thiếu tình trạng giao hàng
      if (!r.deliveryStatus || r.deliveryStatus.trim() === '') {
        missingDeliveryStatusRows.push(r);
      }
      // 3. Thiếu thời gian giao thực tế
      if (!r.actualDeliveryTime || r.actualDeliveryTime.trim() === '') {
        missingActualDeliveryRows.push(r);
      }
      // 4. Đã xuất hóa đơn nhưng thiếu số hóa đơn
      const invStr = (r.invoiceStatus || '').toLowerCase();
      if ((invStr.includes('đã xuất') || invStr.includes('da xuat')) && (!r.invoiceNumber || r.invoiceNumber.trim() === '')) {
        invoicedMissingNumberRows.push(r);
      }
      // 5. Đơn có trạng thái mâu thuẫn giữa các dòng
      if (orderStatusConflictData.has(r.orderId)) {
        conflictingStatusRows.push(r);
      }
    }

    return {
      deliveryBeforeOrderCount: deliveryBeforeOrderRows.length,
      deliveryBeforeOrderRows,
      missingDeliveryStatusCount: missingDeliveryStatusRows.length,
      missingDeliveryStatusRows,
      missingActualDeliveryCount: missingActualDeliveryRows.length,
      missingActualDeliveryRows,
      invoicedMissingNumberCount: invoicedMissingNumberRows.length,
      invoicedMissingNumberRows,
      conflictingStatusOrdersCount: orderStatusConflictData.size,
      conflictingStatusOrders: Array.from(orderStatusConflictData),
      conflictingStatusRows,
    };
  }, [normalizedRecords, orderStatusConflictData]);

  // Filter records based on active FilterState
  const filteredRecords = useMemo(() => {
    // 1. Calculate date boundaries based on datePreset
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (filterState.datePreset === 'custom') {
      startDate = filterState.customStartDate;
      endDate = filterState.customEndDate;
    } else if (filterState.datePreset === '7d' && latestDate) {
      const d = new Date(latestDate);
      d.setDate(d.getDate() - 6);
      startDate = d.toISOString().split('T')[0];
      endDate = latestDate;
    } else if (filterState.datePreset === '14d' && latestDate) {
      const d = new Date(latestDate);
      d.setDate(d.getDate() - 13);
      startDate = d.toISOString().split('T')[0];
      endDate = latestDate;
    } else if (filterState.datePreset === '30d' && latestDate) {
      const d = new Date(latestDate);
      d.setDate(d.getDate() - 29);
      startDate = d.toISOString().split('T')[0];
      endDate = latestDate;
    } else if (filterState.datePreset === 'this_month' && latestDate) {
      const parts = latestDate.split('-');
      startDate = `${parts[0]}-${parts[1]}-01`;
      endDate = latestDate;
    }

    return normalizedRecords.filter((rec) => {
      // Date filter
      if (startDate && rec.orderDate && rec.orderDate < startDate) return false;
      if (endDate && rec.orderDate && rec.orderDate > endDate) return false;

      // Multi-select filters
      if (filterState.provinces.length > 0 && !filterState.provinces.includes(rec.province)) return false;
      if (filterState.wards.length > 0 && !filterState.wards.includes(rec.ward)) return false;
      if (filterState.channels.length > 0 && !filterState.channels.includes(rec.channel)) return false;
      if (filterState.orderTypes.length > 0 && !filterState.orderTypes.includes(rec.orderType)) return false;
      if (filterState.warehouses.length > 0 && !filterState.warehouses.includes(rec.warehouse)) return false;
      if (filterState.itemCodes.length > 0 && !filterState.itemCodes.includes(rec.itemCode)) return false;

      if (filterState.supervisors.length > 0 && !filterState.supervisors.includes(rec.supervisor)) return false;
      if (filterState.salesReps.length > 0 && !filterState.salesReps.includes(rec.salesRep)) return false;
      if (filterState.teamLeads.length > 0 && !filterState.teamLeads.includes(rec.teamLead)) return false;
      if (filterState.areaDirectors.length > 0 && !filterState.areaDirectors.includes(rec.areaDirector)) return false;

      if (filterState.orderStatuses.length > 0 && !filterState.orderStatuses.includes(rec.orderStatus)) return false;
      if (filterState.deliveryStatuses.length > 0 && !filterState.deliveryStatuses.includes(rec.deliveryStatus)) return false;
      if (filterState.paymentStatuses.length > 0 && !filterState.paymentStatuses.includes(rec.paymentStatus)) return false;
      if (filterState.invoiceStatuses.length > 0 && !filterState.invoiceStatuses.includes(rec.invoiceStatus)) return false;

      // Quality Issue Filter
      if (filterState.qualityIssueFilter) {
        if (filterState.qualityIssueFilter === 'deliveryBeforeOrder') {
          if (!rec.expectedDeliveryDate || !rec.orderDate || rec.expectedDeliveryDate >= rec.orderDate) return false;
        } else if (filterState.qualityIssueFilter === 'missingDeliveryStatus') {
          if (rec.deliveryStatus && rec.deliveryStatus.trim() !== '') return false;
        } else if (filterState.qualityIssueFilter === 'missingActualDelivery') {
          if (rec.actualDeliveryTime && rec.actualDeliveryTime.trim() !== '') return false;
        } else if (filterState.qualityIssueFilter === 'invoicedMissingNumber') {
          const inv = (rec.invoiceStatus || '').toLowerCase();
          if (!inv.includes('đã xuất') || (rec.invoiceNumber && rec.invoiceNumber.trim() !== '')) return false;
        } else if (filterState.qualityIssueFilter === 'conflictingStatus') {
          if (!orderStatusConflictData.has(rec.orderId)) return false;
        }
      }

      // Cross-chart filters
      for (const cf of filterState.chartFilters) {
        const val = (rec as any)[cf.field];
        if (String(val) !== String(cf.value)) {
          return false;
        }
      }

      // Advanced filters
      for (const rule of filterState.advancedFilters) {
        const rawVal = String(rec._raw[rule.column] ?? '').trim().toLowerCase();
        const ruleVal = rule.value.trim().toLowerCase();

        switch (rule.operator) {
          case 'equals':
            if (rawVal !== ruleVal) return false;
            break;
          case 'notEquals':
            if (rawVal === ruleVal) return false;
            break;
          case 'contains':
            if (!rawVal.includes(ruleVal)) return false;
            break;
          case 'startsWith':
            if (!rawVal.startsWith(ruleVal)) return false;
            break;
          case 'greaterThan':
            if (parseFloat(rawVal) <= parseFloat(ruleVal) || isNaN(parseFloat(rawVal))) return false;
            break;
          case 'lessThan':
            if (parseFloat(rawVal) >= parseFloat(ruleVal) || isNaN(parseFloat(rawVal))) return false;
            break;
          case 'isEmpty':
            if (rawVal !== '') return false;
            break;
          case 'isNotEmpty':
            if (rawVal === '') return false;
            break;
        }
      }

      return true;
    });
  }, [normalizedRecords, filterState, latestDate, orderStatusConflictData]);

  // Aggregated KPIs calculation based on strict business rules:
  // - Revenue = sum of `Đơn hàng Thành tiền (+VAT)` ONLY
  // - Unique Orders = count unique `orderId`
  // - Unique Partners = count unique `partnerId`
  // - Total Quantity = sum of `quantity`
  // - Unique Products = count unique `itemCode`
  // - Average Order Value = totalRevenueVAT / uniqueOrdersCount
  // - Repeat Partners = partners with >= 2 unique orders in filtered scope
  const aggregatedKPIs = useMemo<AggregatedKPIs>(() => {
    let totalRevenue = 0;
    let totalQty = 0;
    const ordersSet = new Set<string>();
    const partnersSet = new Set<string>();
    const productsSet = new Set<string>();
    const partnerOrdersMap = new Map<string, Set<string>>();

    for (const rec of filteredRecords) {
      totalRevenue += rec.revenueVAT;
      totalQty += rec.quantity;

      if (rec.orderId) {
        ordersSet.add(rec.orderId);
      }
      if (rec.partnerId) {
        partnersSet.add(rec.partnerId);
        if (rec.orderId) {
          if (!partnerOrdersMap.has(rec.partnerId)) {
            partnerOrdersMap.set(rec.partnerId, new Set());
          }
          partnerOrdersMap.get(rec.partnerId)!.add(rec.orderId);
        }
      }
      if (rec.itemCode) {
        productsSet.add(rec.itemCode);
      }
    }

    const uniqueOrders = ordersSet.size;
    const uniquePartners = partnersSet.size;
    const aov = uniqueOrders > 0 ? Math.round(totalRevenue / uniqueOrders) : null;

    let repeatCount = 0;
    let singleCount = 0;
    partnerOrdersMap.forEach((ordSet) => {
      if (ordSet.size >= 2) {
        repeatCount++;
      } else {
        singleCount++;
      }
    });

    return {
      totalRevenueVAT: totalRevenue,
      uniqueOrdersCount: uniqueOrders,
      uniquePartnersCount: uniquePartners,
      totalQuantity: totalQty,
      uniqueProductsCount: productsSet.size,
      averageOrderValue: aov,
      repeatPartnersCount: repeatCount,
      singleOrderPartnersCount: singleCount,
    };
  }, [filteredRecords]);

  // Actions
  const resetAllFilters = () => {
    setFilterState(initialFilterState);
  };

  const toggleChartFilter = (field: string, value: string, label: string) => {
    setFilterState((prev) => {
      const existsIndex = prev.chartFilters.findIndex(
        (cf) => cf.field === field && cf.value === value
      );
      if (existsIndex >= 0) {
        // Remove it
        return {
          ...prev,
          chartFilters: prev.chartFilters.filter((_, i) => i !== existsIndex),
        };
      } else {
        // Add it
        return {
          ...prev,
          chartFilters: [...prev.chartFilters, { field, value, label }],
        };
      }
    });
  };

  const removeChartFilter = (index: number) => {
    setFilterState((prev) => ({
      ...prev,
      chartFilters: prev.chartFilters.filter((_, i) => i !== index),
    }));
  };

  const setQualityFilter = (issue?: FilterState['qualityIssueFilter']) => {
    setFilterState((prev) => ({
      ...prev,
      qualityIssueFilter: prev.qualityIssueFilter === issue ? undefined : issue,
    }));
  };

  const updateColumnMapping = (newMapping: ColumnMapping) => {
    setColumnMapping(newMapping);
    try {
      localStorage.setItem('sales_dashboard_column_mapping', JSON.stringify(newMapping));
    } catch (e) {
      // Ignore storage errors
    }
  };

  const loadSampleData = () => {
    const data = generateStandardBenchmarkData();
    setRawRecords(data.records);
    setHeaders(data.headers);
    setColumnMapping(DEFAULT_COLUMN_MAPPING);
    setFilterState(initialFilterState);
    setFileInfo({
      fileName: 'Dữ liệu bán hàng dược phẩm chuẩn (Mẫu).xlsx',
      fileSize: 1024 * 768,
      sheetName: 'Sheet1',
      totalRows: data.records.length,
      totalCols: data.headers.length,
      isSampleData: true,
      uploadedAt: new Date().toLocaleTimeString('vi-VN'),
    });
  };

  const loadUploadedData = (
    records: SalesRecord[],
    newHeaders: string[],
    mapping: ColumnMapping,
    fileName: string,
    fileSize: number,
    sheetName: string,
    mode: 'replace' | 'append'
  ) => {
    if (mode === 'append') {
      setRawRecords((prev) => [...prev, ...records]);
      // Union headers
      const unionHeaders = Array.from(new Set([...headers, ...newHeaders]));
      setHeaders(unionHeaders);
      setFileInfo((prev) => ({
        ...prev,
        totalRows: prev.totalRows + records.length,
        isSampleData: false,
        uploadedAt: new Date().toLocaleTimeString('vi-VN'),
      }));
    } else {
      setRawRecords(records);
      setHeaders(newHeaders);
      setColumnMapping(mapping);
      setFilterState(initialFilterState);
      setFileInfo({
        fileName,
        fileSize,
        sheetName,
        totalRows: records.length,
        totalCols: newHeaders.length,
        isSampleData: false,
        uploadedAt: new Date().toLocaleTimeString('vi-VN'),
      });
    }
  };

  return (
    <SalesDataContext.Provider
      value={{
        rawRecords,
        headers,
        columnMapping,
        normalizedRecords,
        filteredRecords,
        activeTab,
        filterState,
        fileInfo,
        aggregatedKPIs,
        dataQualityAlerts,
        latestDate,
        earliestDate,
        uniqueValues,
        setActiveTab,
        setFilterState,
        resetAllFilters,
        toggleChartFilter,
        removeChartFilter,
        setQualityFilter,
        updateColumnMapping,
        loadSampleData,
        loadUploadedData,
      }}
    >
      {children}
    </SalesDataContext.Provider>
  );
};

export const useSalesData = () => {
  const context = useContext(SalesDataContext);
  if (!context) {
    throw new Error('useSalesData must be used within a SalesDataProvider');
  }
  return context;
};
