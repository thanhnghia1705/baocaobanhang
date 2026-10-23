import * as XLSX from 'xlsx';
import { ColumnMapping, NormalizedRecord, SalesRecord } from '../types/sales';

export const DEFAULT_COLUMN_MAPPING: ColumnMapping = {
  revenueVAT: 'Đơn hàng Thành tiền (+VAT)',
  orderId: 'Đơn hàng Tiêu đề',
  partnerId: 'Đơn hàng Mã đối tác',
  partnerName: 'Tên đối tác',
  itemCode: 'Mã vật tư',
  itemName: 'Sản phẩm / Dịch vụ',
  unit: 'Đơn vị tính',
  quantity: 'Đơn hàng Số lượng',
  orderDate: 'Ngày đặt hàng',
  expectedDeliveryDate: 'Ngày giao dự kiến',
  actualDeliveryTime: 'Thời gian giao thực tế',
  orderStatus: 'Tình trạng đơn hàng',
  deliveryStatus: 'Tình trạng giao hàng',
  paymentStatus: 'Tình trạng thanh toán',
  invoiceStatus: 'Tình trạng xuất hóa đơn',
  invoiceNumber: 'Số hóa đơn',
  warehouse: 'Kho',
  channel: 'Kênh bán',
  orderType: 'Loại đơn hàng',
  province: 'Tỉnh / Thành',
  ward: 'Phường / Xã',
  salesRep: 'Nhân viên bán hàng',
  teamLead: 'Trưởng nhóm',
  supervisor: 'Giám sát',
  areaDirector: 'Giám đốc khu vực',
  unitDirector: 'Giám đốc đơn vị',
};

const MAPPING_ALIASES: Record<keyof ColumnMapping, string[]> = {
  revenueVAT: [
    'đơn hàng thành tiền (+vat)', 'thành tiền (+vat)', 'thành tiền (+ vat)',
    'thành tiền sau vat', 'thành tiền vat', 'doanh số (+vat)', 'doanh số vat',
    'thành tiền', 'doanh thu sau thuế', 'tổng tiền (+vat)', 'thành tiền có vat'
  ],
  orderId: [
    'đơn hàng tiêu đề', 'mã đơn hàng', 'tiêu đề', 'mã đơn', 'số đơn hàng', 'mã hóa đơn', 'order id'
  ],
  partnerId: [
    'đơn hàng mã đối tác', 'mã đối tác', 'mã khách hàng', 'mã kh', 'mã nhà thuốc', 'partner id', 'partner code'
  ],
  partnerName: [
    'tên đối tác', 'tên khách hàng', 'tên nhà thuốc', 'khách hàng', 'đối tác', 'tên đơn vị'
  ],
  itemCode: [
    'mã vật tư', 'mã sản phẩm', 'mã sp', 'mã hàng', 'mã vt', 'sku', 'product code'
  ],
  itemName: [
    'sản phẩm / dịch vụ', 'sản phẩm/dịch vụ', 'tên sản phẩm', 'sản phẩm', 'tên hàng', 'hàng hóa', 'dịch vụ'
  ],
  unit: [
    'đơn vị tính', 'đvt', 'đơn vị', 'dvt', 'unit'
  ],
  quantity: [
    'đơn hàng số lượng', 'số lượng', 'sl', 'quantity', 'đơn hàng sl'
  ],
  orderDate: [
    'ngày đặt hàng', 'ngày đặt', 'ngày đơn hàng', 'ngày đơn', 'ngày tạo', 'ngày lập', 'order date'
  ],
  expectedDeliveryDate: [
    'ngày giao dự kiến', 'ngày dự kiến giao', 'dự kiến giao', 'ngày hẹn giao', 'expected delivery'
  ],
  actualDeliveryTime: [
    'thời gian giao thực tế', 'ngày giao thực tế', 'thời gian giao', 'thực tế giao', 'giao thực tế'
  ],
  orderStatus: [
    'tình trạng đơn hàng', 'trạng thái đơn hàng', 'trạng thái đơn', 'tình trạng đơn'
  ],
  deliveryStatus: [
    'tình trạng giao hàng', 'trạng thái giao hàng', 'giao hàng'
  ],
  paymentStatus: [
    'tình trạng thanh toán', 'trạng thái thanh toán', 'thanh toán'
  ],
  invoiceStatus: [
    'tình trạng xuất hóa đơn', 'trạng thái xuất hóa đơn', 'xuất hóa đơn', 'tình trạng hóa đơn'
  ],
  invoiceNumber: [
    'số hóa đơn', 'số hđ', 'mã hóa đơn', 'mã hđ'
  ],
  warehouse: [
    'kho', 'kho xuất', 'tên kho', 'kho hàng'
  ],
  channel: [
    'kênh bán', 'kênh bán hàng', 'kênh phân phối', 'kênh'
  ],
  orderType: [
    'loại đơn hàng', 'loại đơn', 'phân loại đơn'
  ],
  province: [
    'tỉnh / thành', 'tỉnh/thành', 'tỉnh / thành phố', 'tỉnh/thành phố', 'tỉnh', 'thành phố', 'tỉnh thành'
  ],
  ward: [
    'phường / xã', 'phường/xã', 'xã / phường', 'xã/phường', 'quận / huyện', 'quận/huyện'
  ],
  salesRep: [
    'nhân viên bán hàng', 'nvbh', 'nhân viên kinh doanh', 'trình dược viên', 'nhân viên phụ trách'
  ],
  teamLead: [
    'trưởng nhóm', 'nhóm trưởng', 'team lead'
  ],
  supervisor: [
    'giám sát', 'giám sát bán hàng', 'supervisor', 'sup'
  ],
  areaDirector: [
    'giám đốc khu vực', 'gđkv', 'giám đốc vùng'
  ],
  unitDirector: [
    'giám đốc đơn vị', 'gđđv'
  ]
};

function normalizeString(str: string): string {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export function autoDetectColumnMapping(headers: string[]): ColumnMapping {
  const result: Partial<ColumnMapping> = {};
  const normalizedHeaders = headers.map(h => ({ raw: h, norm: normalizeString(h) }));

  // Check saved custom mapping first
  try {
    const saved = localStorage.getItem('sales_dashboard_column_mapping');
    if (saved) {
      const parsed = JSON.parse(saved);
      for (const [key, val] of Object.entries(parsed)) {
        if (headers.includes(val as string)) {
          result[key as keyof ColumnMapping] = val as string;
        }
      }
    }
  } catch (e) {
    // Ignore localStorage parse errors
  }

  // Iterate each key
  (Object.keys(DEFAULT_COLUMN_MAPPING) as (keyof ColumnMapping)[]).forEach((key) => {
    if (result[key]) return;

    // 1. Exact match with default mapping
    const defaultName = DEFAULT_COLUMN_MAPPING[key];
    const exactMatch = headers.find(h => h.trim() === defaultName.trim());
    if (exactMatch) {
      result[key] = exactMatch;
      return;
    }

    // 2. Case-insensitive exact match
    const normDefault = normalizeString(defaultName);
    const caseMatch = normalizedHeaders.find(h => h.norm === normDefault);
    if (caseMatch) {
      result[key] = caseMatch.raw;
      return;
    }

    // 3. Match aliases
    const aliases = MAPPING_ALIASES[key] || [];
    for (const alias of aliases) {
      const aliasMatch = normalizedHeaders.find(h => h.norm === alias || h.norm.includes(alias));
      if (aliasMatch) {
        result[key] = aliasMatch.raw;
        return;
      }
    }

    // 4. Fallback to default
    result[key] = defaultName;
  });

  return result as ColumnMapping;
}

export interface ParsedWorkbookResult {
  sheetNames: string[];
  selectedSheet: string;
  headers: string[];
  rawRows: SalesRecord[];
  mapping: ColumnMapping;
  missingRequiredColumns: string[];
}

export function parseRawValueToDate(val: any): string {
  if (!val) return '';
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(val).trim();
  // Match YYYY-MM-DD
  const m1 = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m1) {
    return `${m1[1]}-${String(m1[2]).padStart(2, '0')}-${String(m1[3]).padStart(2, '0')}`;
  }
  // Match DD/MM/YYYY
  const m2 = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (m2) {
    return `${m2[3]}-${String(m2[2]).padStart(2, '0')}-${String(m2[1]).padStart(2, '0')}`;
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return '';
}

export function parseRawValueToNumber(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const str = String(val).trim().replace(/\s/g, '').replace(/[₫đ$]/g, '');
  // If Vietnamese format like 2.579.012,50 or 2.579.012
  if (str.includes('.') && !str.includes(',')) {
    // Might be dots as thousand separators if more than 3 digits after dot
    const parts = str.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      const clean = str.replace(/\./g, '');
      const num = parseFloat(clean);
      return isNaN(num) ? 0 : num;
    }
  }
  // If dot is thousand and comma is decimal
  const cleanWithComma = str.replace(/\./g, '').replace(/,/g, '.');
  const num = parseFloat(cleanWithComma);
  return isNaN(num) ? 0 : num;
}

export function normalizeRecord(raw: SalesRecord, mapping: ColumnMapping, rowIndex: number): NormalizedRecord {
  // Preserve raw strings and leading zeroes for codes
  const getRawStr = (colName: string) => {
    const val = raw[colName];
    if (val === undefined || val === null) return '';
    return String(val).trim();
  };

  const revenueRaw = raw[mapping.revenueVAT];
  const quantityRaw = raw[mapping.quantity];

  return {
    _id: `rec_${rowIndex}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    _rowIndex: rowIndex,
    _raw: raw,

    orderId: getRawStr(mapping.orderId),
    partnerId: getRawStr(mapping.partnerId),
    partnerName: getRawStr(mapping.partnerName),
    itemCode: getRawStr(mapping.itemCode),
    itemName: getRawStr(mapping.itemName),
    unit: getRawStr(mapping.unit),
    quantity: parseRawValueToNumber(quantityRaw),
    revenueVAT: parseRawValueToNumber(revenueRaw),

    orderDate: parseRawValueToDate(raw[mapping.orderDate]),
    orderDateTimeStr: getRawStr(mapping.orderDate),
    expectedDeliveryDate: parseRawValueToDate(raw[mapping.expectedDeliveryDate]),
    actualDeliveryTime: getRawStr(mapping.actualDeliveryTime),

    orderStatus: getRawStr(mapping.orderStatus),
    deliveryStatus: getRawStr(mapping.deliveryStatus),
    paymentStatus: getRawStr(mapping.paymentStatus),
    invoiceStatus: getRawStr(mapping.invoiceStatus),
    invoiceNumber: getRawStr(mapping.invoiceNumber),

    warehouse: getRawStr(mapping.warehouse),
    channel: getRawStr(mapping.channel),
    orderType: getRawStr(mapping.orderType),

    province: getRawStr(mapping.province),
    ward: getRawStr(mapping.ward),

    salesRep: getRawStr(mapping.salesRep),
    teamLead: getRawStr(mapping.teamLead),
    supervisor: getRawStr(mapping.supervisor),
    areaDirector: getRawStr(mapping.areaDirector),
    unitDirector: getRawStr(mapping.unitDirector),
  };
}

export function parseSpreadsheetBuffer(buffer: ArrayBuffer, fileName: string): ParsedWorkbookResult {
  const wb = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,
    cellText: true,
    raw: true,
  });

  const sheetNames = wb.SheetNames;
  // Pick preferred sheet: either first sheet containing sales-like name or Sheet1, or index 0
  let selectedSheet = sheetNames[0];
  const foundSheet = sheetNames.find(s => /sales|bán hàng|đơn hàng|data|sheet1/i.test(s));
  if (foundSheet) {
    selectedSheet = foundSheet;
  }

  const sheet = wb.Sheets[selectedSheet];
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  // Auto-detect header row (could be preceded by title rows or empty rows)
  let headerRowIndex = 0;
  let bestHeaderScore = -1;

  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const row = rows[i] || [];
    const nonEmpties = row.filter((c: any) => c !== '' && c !== null && c !== undefined);
    if (nonEmpties.length < 3) continue;

    // Count how many know keywords appear
    let score = 0;
    const rowText = row.map(c => normalizeString(String(c)));
    const targetKeywords = ['thành tiền', 'tiêu đề', 'mã đối tác', 'số lượng', 'vật tư', 'sản phẩm', 'ngày đặt', 'giám sát'];
    for (const kw of targetKeywords) {
      if (rowText.some(t => t.includes(kw))) {
        score += 5;
      }
    }
    score += nonEmpties.length;

    if (score > bestHeaderScore) {
      bestHeaderScore = score;
      headerRowIndex = i;
    }
  }

  const headerRow = (rows[headerRowIndex] || []).map((h: any) => String(h || '').trim());
  const headers = headerRow.filter(h => h.length > 0);

  // Parse remaining rows
  const rawRows: SalesRecord[] = [];
  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const rowData = rows[r] || [];
    const record: SalesRecord = {};
    let hasAnyValue = false;

    headerRow.forEach((colName, colIdx) => {
      if (!colName) return;
      const cellVal = rowData[colIdx];
      record[colName] = cellVal !== undefined ? cellVal : '';
      if (cellVal !== '' && cellVal !== null && cellVal !== undefined) {
        hasAnyValue = true;
      }
    });

    if (hasAnyValue) {
      rawRows.push(record);
    }
  }

  const mapping = autoDetectColumnMapping(headers);

  // Check required core columns
  const requiredFields: (keyof ColumnMapping)[] = ['revenueVAT', 'orderId', 'partnerId', 'quantity'];
  const missingRequiredColumns = requiredFields
    .filter(f => !headers.includes(mapping[f]))
    .map(f => DEFAULT_COLUMN_MAPPING[f]);

  return {
    sheetNames,
    selectedSheet,
    headers,
    rawRows,
    mapping,
    missingRequiredColumns,
  };
}
