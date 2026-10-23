import { SalesRecord } from '../types/sales';

/**
 * Tạo bộ dữ liệu mẫu chuẩn ngành phân phối Dược phẩm đối soát chính xác theo đề bài:
 * - 4.601 dòng hàng
 * - 1.680 đơn hàng duy nhất
 * - 1.114 mã đối tác
 * - 112 mã sản phẩm
 * - Tổng số lượng: 46.039
 * - Tổng thành tiền sau VAT: 2.579.012.626 VND
 * - Khoảng ngày đặt hàng: 29/09/2026 – 21/10/2026
 * - 665 dòng thiếu tình trạng giao hàng
 * - 769 dòng thiếu thời gian giao thực tế
 * - 9 dòng có ngày giao dự kiến trước ngày đặt hàng
 * - 233 dòng được đánh dấu đã xuất hóa đơn nhưng thiếu số hóa đơn
 * - Có đơn hàng mâu thuẫn trạng thái giữa các dòng
 */

export function generateStandardBenchmarkData(): {
  records: SalesRecord[];
  headers: string[];
} {
  const TOTAL_ROWS = 4601;
  const TOTAL_ORDERS = 1680;
  const TOTAL_PARTNERS = 1114;
  const TOTAL_ITEMS = 112;
  const TARGET_TOTAL_QTY = 46039;
  const TARGET_TOTAL_REVENUE = 2579012626;

  // 1. Chuẩn bị danh mục 112 sản phẩm
  const baseItems: { code: string; name: string; unit: string; basePrice: number }[] = [];
  const itemNames = [
    'Panadol Extra Đỏ 500mg', 'Berberin 50mg Domesco', 'Hapacol 650mg Hạ Sốt',
    'Klamentin 875/125mg Kháng Sinh', 'Eugica Xanh Viên Nang Mềm', 'Otrivin 0.05% Xịt Mũi',
    'Strepsils Ngậm Vị Cam', 'Smecta Điều Trị Tiêu Chảy', 'Efferalgan 500mg Sủi',
    'Oresol 245 Bù Nước', 'Vitamin C 500mg Boston', 'Biotin Collagen Forte',
    'Cefuroxim 500mg TVP', 'Augmentin 1g Kháng Sinh', 'Gaviscon Hỗn Dịch Uống',
    'Phosphalugel Dạ Dày Chữ P', 'Decolgen Cảm Cúm', 'Paracetamol 500mg Mekophar',
    'Cetirizin 10mg Kháng Dị Ứng', 'Loratadin 10mg Hậu Giang', 'Omeprazol 20mg DHG',
    'Esomeprazol 40mg Stada', 'Nexium Mups 20mg', 'Salonpas Dán Giảm Đau',
    'Băng Cá Nhân Urgo Cơ Bản', 'Cồn 70 Độ Vĩnh Phúc 500ml', 'Nước Muối Sinh Lý 0.9% 500ml',
    'Khẩu Trang Y Tế 4 Lớp Kháng Khuẩn', 'Găng Tay Y Tế Có Bột Vglove', 'Bổ Phế Nam Hà Chỉ Khái Lộ',
    'Siro Ho Prospan Đức 100ml', 'Betadine Sát Trùng Vàng 30ml', 'Dầu Gió Xanh Con Ó',
    'Hoạt Huyết Dưỡng Não Traphaco', 'Ginkgo Biloba 120mg Mỹ', 'Boganic Traphaco Gan Mật',
    'Liver tonic 17500mg', 'Sữa Ensure Gold 850g', 'Canxi Corbiere 10ml',
    'Men Vi Sinh Enterogermina 5ml', 'Bio-Acrobe Men Tiêu Hóa', 'Kẽm ZinC 10mg Nhũ Nhi',
    'Vitamin D3 D3K2 Fitobimbi', 'Dạ Hương Vệ Sinh Phụ Nữ', 'Dầu Mù U Bôi Da',
    'Kem Trị Phỏng Panthenol', 'Nghệ Curcumin Nano Học Viện Quân Y', 'Trà Gừng Hộp 20 Gói',
    'Đông Trùng Hạ Thảo Viên', 'Cao Xoa Bóp Bạch Hổ'
  ];

  for (let i = 1; i <= TOTAL_ITEMS; i++) {
    const code = `VT-${String(i).padStart(4, '0')}`;
    const name = itemNames[(i - 1) % itemNames.length] + (i > itemNames.length ? ` (Lô ${Math.floor(i / itemNames.length) + 1})` : '');
    const units = ['Hộp', 'Chai', 'Lọ', 'Vỉ', 'Gói', 'Tuýp'];
    const unit = units[i % units.length];
    const basePrice = 25000 + ((i * 1373) % 280000);
    baseItems.push({ code, name, unit, basePrice });
  }

  // 2. Danh mục 1.114 nhà thuốc
  const partners: { id: string; name: string; province: string; ward: string }[] = [];
  const provinces = [
    { name: 'TP. Hồ Chí Minh', wards: ['Bến Nghé, Quận 1', 'Đa Kao, Quận 1', 'Phường 12, Quận 3', 'Phường 5, Quận 5', 'Phường 14, Quận 10', 'Bình Thạnh', 'Tân Bình', 'Gò Vấp'] },
    { name: 'Hà Nội', wards: ['Tràng Tiền, Hoàn Kiếm', 'Hàng Bông, Hoàn Kiếm', 'Dịch Vọng, Cầu Giấy', 'Mỹ Đình, Nam Từ Liêm', 'Khâm Thiên, Đống Đa', 'Kim Mã, Ba Đình'] },
    { name: 'Đà Nẵng', wards: ['Hải Châu 1, Hải Châu', 'Thạch Thang, Hải Châu', 'An Hải Bắc, Sơn Trà', 'Khuê Trung, Cẩm Lệ'] },
    { name: 'Cần Thơ', wards: ['Ninh Kiều', 'Cái Răng', 'Bình Thủy'] },
    { name: 'Đồng Nai', wards: ['Trấn Biên, Biên Hòa', 'Tân Tiến, Biên Hòa', 'Long Khánh'] },
    { name: 'Bình Dương', wards: ['Thủ Dầu Một', 'Thuận An', 'Dĩ An'] },
    { name: 'Hải Phòng', wards: ['Lê Chân', 'Ngô Quyền', 'Hồng Bàng'] }
  ];

  for (let i = 1; i <= TOTAL_PARTNERS; i++) {
    const id = `NT-${String(i).padStart(5, '0')}`;
    const provObj = provinces[i % provinces.length];
    const ward = provObj.wards[i % provObj.wards.length];
    const pharmacyNames = [
      'Nhà thuốc An Khang', 'Nhà thuốc Long Châu', 'Nhà thuốc Pharmacity', 'Nhà thuốc Minh Châu',
      'Nhà thuốc Hoàng Lan', 'Nhà thuốc Phương Đông', 'Nhà thuốc Tân Bình', 'Nhà thuốc Đa Khoa',
      'Nhà thuốc Việt Hương', 'Nhà thuốc Sức Khỏe Vàng', 'Nhà thuốc Hồng Đức', 'Nhà thuốc Bảo An'
    ];
    const name = `${pharmacyNames[i % pharmacyNames.length]} #${i}`;
    partners.push({ id, name, province: provObj.name, ward });
  }

  // 3. Đội ngũ bán hàng (Giám đốc, Giám sát, Nhân viên)
  const supervisors = [
    { name: 'Trần Văn Hùng', area: 'Khu vực Miền Nam', unit: 'Đơn vị OTC 01' },
    { name: 'Nguyễn Thị Mai', area: 'Khu vực Miền Nam', unit: 'Đơn vị ETC 01' },
    { name: 'Phạm Đức Anh', area: 'Khu vực Miền Bắc', unit: 'Đơn vị OTC 02' },
    { name: 'Lê Hoàng Nam', area: 'Khu vực Miền Bắc', unit: 'Đơn vị Chuỗi & MT' },
    { name: 'Vũ Quốc Bảo', area: 'Khu vực Miền Trung', unit: 'Đơn vị OTC 03' }
  ];

  const salesReps = [
    { name: 'Đặng Tuấn Kiệt', sup: 'Trần Văn Hùng', lead: 'Phan Minh Đăng' },
    { name: 'Võ Minh Trí', sup: 'Trần Văn Hùng', lead: 'Phan Minh Đăng' },
    { name: 'Lý Quốc Huy', sup: 'Trần Văn Hùng', lead: 'Ngô Thanh Tùng' },
    { name: 'Bùi Thị Bích', sup: 'Nguyễn Thị Mai', lead: 'Đỗ Hải Yến' },
    { name: 'Trần Kim Loan', sup: 'Nguyễn Thị Mai', lead: 'Đỗ Hải Yến' },
    { name: 'Huỳnh Gia Bảo', sup: 'Phạm Đức Anh', lead: 'Nguyễn Văn Quang' },
    { name: 'Phan Thanh Thảo', sup: 'Phạm Đức Anh', lead: 'Nguyễn Văn Quang' },
    { name: 'Đỗ Hoàng Khang', sup: 'Lê Hoàng Nam', lead: 'Trịnh Xuân Hưng' },
    { name: 'Nguyễn Ngọc Trâm', sup: 'Vũ Quốc Bảo', lead: 'Hoàng Văn Sơn' },
    { name: 'Trịnh Đức Thịnh', sup: 'Vũ Quốc Bảo', lead: 'Hoàng Văn Sơn' }
  ];

  // 4. Danh sách 1.680 đơn hàng và gán đối tác
  // Cần bảo đảm:
  // - 1.114 đối tác có ít nhất 1 đơn.
  // - Các đơn còn lại (1.680 - 1.114 = 566 đơn) phân bổ cho một số đối tác để có nhóm khách hàng mua lặp lại (>= 2 đơn).
  const orderList: {
    orderId: string;
    partner: typeof partners[0];
    orderDate: string;
    expectedDate: string;
    actualDate: string;
    orderStatus: string;
    deliveryStatus: string;
    paymentStatus: string;
    invoiceStatus: string;
    invoiceNumber: string;
    warehouse: string;
    channel: string;
    orderType: string;
    rep: typeof salesReps[0];
  }[] = [];

  // Tạo chuỗi ngày 29/09/2026 -> 21/10/2026 (23 ngày)
  const dateStrings: string[] = [];
  const startD = new Date('2026-09-29T00:00:00');
  for (let d = 0; d < 23; d++) {
    const cur = new Date(startD);
    cur.setDate(startD.getDate() + d);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const day = String(cur.getDate()).padStart(2, '0');
    dateStrings.push(`${y}-${m}-${day}`);
  }

  const orderStatuses = ['Hoàn thành', 'Hoàn thành', 'Hoàn thành', 'Đang giao hàng', 'Đã xác nhận', 'Chờ xử lý', 'Đã hủy'];
  const deliveryStatuses = ['Đã giao hàng', 'Đang vận chuyển', 'Chờ lấy hàng', 'Giao thất bại'];
  const paymentStatuses = ['Đã thanh toán', 'Thanh toán công nợ', 'Chưa thanh toán'];
  const warehouses = ['Kho Tổng Bình Dương', 'Kho Hà Nội (Gia Lâm)', 'Kho Đà Nẵng', 'Kho Cần Thơ'];
  const channels = ['OTC - Nhà thuốc lẻ', 'Chuỗi nhà thuốc', 'Bệnh viện & Phòng khám', 'Thương mại điện tử B2B'];
  const orderTypes = ['Đơn hàng chuẩn', 'Đơn hàng khuyến mãi', 'Đơn hàng định kỳ', 'Đơn hàng gấp'];

  for (let o = 1; o <= TOTAL_ORDERS; o++) {
    const orderId = `DH-2026-${String(o).padStart(5, '0')}`;
    let partner: typeof partners[0];
    if (o <= TOTAL_PARTNERS) {
      partner = partners[o - 1];
    } else {
      // Repeat purchase: pick from the first 566 partners
      partner = partners[(o - TOTAL_PARTNERS) % TOTAL_PARTNERS];
    }

    const dateStr = dateStrings[o % dateStrings.length];
    const orderDateObj = new Date(dateStr);
    
    // Expected date = orderDate + 1 to 3 days
    const expObj = new Date(orderDateObj);
    expObj.setDate(orderDateObj.getDate() + 1 + (o % 3));
    const expDateStr = `${expObj.getFullYear()}-${String(expObj.getMonth() + 1).padStart(2, '0')}-${String(expObj.getDate()).padStart(2, '0')}`;

    // Actual delivery
    const actObj = new Date(expObj);
    if (o % 7 === 0) {
      actObj.setDate(expObj.getDate() + 1); // Trễ 1 ngày
    }
    const actDateStr = `${actObj.getFullYear()}-${String(actObj.getMonth() + 1).padStart(2, '0')}-${String(actObj.getDate()).padStart(2, '0')} 14:30`;

    const oStatus = orderStatuses[o % orderStatuses.length];
    const dStatus = oStatus === 'Hoàn thành' ? 'Đã giao hàng' : deliveryStatuses[o % deliveryStatuses.length];
    const pStatus = oStatus === 'Hoàn thành' ? 'Đã thanh toán' : paymentStatuses[o % paymentStatuses.length];
    const isInv = o % 3 !== 0;
    const invStatus = isInv ? 'Đã xuất hóa đơn' : 'Chưa xuất hóa đơn';
    const invNum = isInv ? `HD-26-${String(o).padStart(5, '0')}` : '';

    const rep = salesReps[o % salesReps.length];
    const warehouse = warehouses[o % warehouses.length];
    const channel = channels[o % channels.length];
    const orderType = orderTypes[o % orderTypes.length];

    orderList.push({
      orderId,
      partner,
      orderDate: dateStr,
      expectedDate: expDateStr,
      actualDate: actDateStr,
      orderStatus: oStatus,
      deliveryStatus: dStatus,
      paymentStatus: pStatus,
      invoiceStatus: invStatus,
      invoiceNumber: invNum,
      warehouse,
      channel,
      orderType,
      rep
    });
  }

  // 5. Phân bổ 4.601 dòng hàng cho 1.680 đơn hàng
  // Mỗi đơn có ít nhất 1 dòng = 1.680 dòng
  // Còn lại: 4.601 - 1.680 = 2.921 dòng thêm vào các đơn
  const linesPerOrder: number[] = new Array(TOTAL_ORDERS).fill(1);
  let remainingLines = TOTAL_ROWS - TOTAL_ORDERS;
  let oIdx = 0;
  while (remainingLines > 0) {
    const add = Math.min(remainingLines, (oIdx % 4) + 1);
    linesPerOrder[oIdx] += add;
    remainingLines -= add;
    oIdx = (oIdx + 1) % TOTAL_ORDERS;
  }

  // 6. Xây dựng 4.601 dòng và bảo đảm tất cả 112 mã sản phẩm đều xuất hiện
  interface TempRow {
    orderIndex: number;
    itemIndex: number;
    qty: number;
    rev: number;
  }

  const tempRows: TempRow[] = [];
  let itemCounter = 0;

  for (let i = 0; i < TOTAL_ORDERS; i++) {
    const count = linesPerOrder[i];
    for (let c = 0; c < count; c++) {
      const itIdx = itemCounter % TOTAL_ITEMS;
      itemCounter++;
      // Base quantity between 1 and 25
      const q = 1 + ((i * 7 + c * 13) % 20);
      const unitP = baseItems[itIdx].basePrice;
      const r = q * unitP;
      tempRows.push({
        orderIndex: i,
        itemIndex: itIdx,
        qty: q,
        rev: r
      });
    }
  }

  // Cân đối chính xác tổng số lượng = 46.039
  let currentTotalQty = tempRows.reduce((acc, row) => acc + row.qty, 0);
  let qtyDelta = TARGET_TOTAL_QTY - currentTotalQty;
  for (let idx = 0; idx < tempRows.length && qtyDelta !== 0; idx++) {
    if (qtyDelta > 0) {
      tempRows[idx].qty += 1;
      qtyDelta -= 1;
    } else if (qtyDelta < 0 && tempRows[idx].qty > 1) {
      tempRows[idx].qty -= 1;
      qtyDelta += 1;
    }
  }

  // Cân đối chính xác tổng thành tiền sau VAT = 2.579.012.626
  // Trước hết tính lại rev = qty * basePrice
  tempRows.forEach(row => {
    row.rev = Math.round(row.qty * baseItems[row.itemIndex].basePrice * 1.08); // +8% VAT
  });
  let currentTotalRev = tempRows.reduce((acc, row) => acc + row.rev, 0);
  let revDelta = TARGET_TOTAL_REVENUE - currentTotalRev;
  
  // Điều chỉnh phân bổ delta vào 100 dòng đầu tiên để không làm méo mó dòng nào
  const adjustSteps = 100;
  const stepAmount = Math.floor(revDelta / adjustSteps);
  for (let i = 0; i < adjustSteps; i++) {
    tempRows[i].rev += stepAmount;
  }
  // Phần dư cuối cùng
  const finalRemainder = TARGET_TOTAL_REVENUE - tempRows.reduce((acc, row) => acc + row.rev, 0);
  tempRows[adjustSteps].rev += finalRemainder;

  // 7. Thiết lập chính xác các mốc cảnh báo chất lượng mẫu:
  // - 665 dòng thiếu tình trạng giao hàng
  // - 769 dòng thiếu thời gian giao thực tế
  // - 9 dòng có ngày giao dự kiến trước ngày đặt hàng
  // - 233 dòng được đánh dấu đã xuất hóa đơn nhưng thiếu số hóa đơn
  // - 2 đơn mâu thuẫn trạng thái đơn giữa các dòng

  const headers = [
    'Đơn hàng Tiêu đề',
    'Đơn hàng Mã đối tác',
    'Tên đối tác',
    'Ngày đặt hàng',
    'Đơn hàng Thành tiền (+VAT)',
    'Đơn hàng Số lượng',
    'Đơn vị tính',
    'Mã vật tư',
    'Sản phẩm / Dịch vụ',
    'Tình trạng đơn hàng',
    'Tình trạng giao hàng',
    'Tình trạng thanh toán',
    'Tình trạng xuất hóa đơn',
    'Số hóa đơn',
    'Ngày giao dự kiến',
    'Thời gian giao thực tế',
    'Kho',
    'Kênh bán',
    'Loại đơn hàng',
    'Tỉnh / Thành',
    'Phường / Xã',
    'Nhân viên bán hàng',
    'Trưởng nhóm',
    'Giám sát',
    'Giám đốc khu vực',
    'Giám đốc đơn vị',
    'Mã nhân viên tạo',
    'Chiết khấu (%)',
    'Giá niêm yết',
    'Tiền thuế VAT',
    'Ghi chú đơn hàng',
    'Địa chỉ giao hàng',
    'Số điện thoại người nhận',
    'Phương thức thanh toán',
    'Ngày tạo đơn',
    'Người phê duyệt',
    'Phân hạng nhà thuốc',
    'Hạn mức tín dụng (ngày)',
    'Trọng lượng ước tính (kg)',
    'Mã vạch sản phẩm',
    'Độ ưu tiên xử lý'
  ];

  const records: SalesRecord[] = [];

  for (let r = 0; r < TOTAL_ROWS; r++) {
    const tr = tempRows[r];
    const ord = orderList[tr.orderIndex];
    const item = baseItems[tr.itemIndex];

    let rowOrderStatus = ord.orderStatus;
    let rowDeliveryStatus: string = ord.deliveryStatus;
    let rowActualDelivery: string = ord.actualDate;
    let rowExpectedDate: string = ord.expectedDate;
    let rowInvoiceStatus = ord.invoiceStatus;
    let rowInvoiceNumber = ord.invoiceNumber;

    // 1. 665 dòng thiếu tình trạng giao hàng (từ r = 0 đến 664)
    if (r < 665) {
      rowDeliveryStatus = '';
    }

    // 2. 769 dòng thiếu thời gian giao thực tế (từ r = 300 đến 1068)
    if (r >= 300 && r < 300 + 769) {
      rowActualDelivery = '';
    }

    // 3. 9 dòng ngày giao dự kiến trước ngày đặt hàng (từ r = 1200 đến 1208)
    if (r >= 1200 && r < 1200 + 9) {
      const ordD = new Date(ord.orderDate);
      ordD.setDate(ordD.getDate() - 2); // 2 ngày trước đặt hàng
      const y = ordD.getFullYear();
      const m = String(ordD.getMonth() + 1).padStart(2, '0');
      const d = String(ordD.getDate()).padStart(2, '0');
      rowExpectedDate = `${y}-${m}-${d}`;
    }

    // 4. 233 dòng được đánh dấu đã xuất hóa đơn nhưng thiếu số hóa đơn (từ r = 1500 đến 1732)
    if (r >= 1500 && r < 1500 + 233) {
      rowInvoiceStatus = 'Đã xuất hóa đơn';
      rowInvoiceNumber = '';
    }

    // 5. Cố tình tạo 3 đơn có mâu thuẫn trạng thái giữa các dòng
    // Đơn thứ 10, 25, 40
    if (tr.orderIndex === 10 && r % 2 === 0) {
      rowOrderStatus = 'Đang xử lý';
    } else if (tr.orderIndex === 10 && r % 2 !== 0) {
      rowOrderStatus = 'Hoàn thành';
    }
    if (tr.orderIndex === 25 && r % 2 === 0) {
      rowOrderStatus = 'Đã xác nhận';
    } else if (tr.orderIndex === 25 && r % 2 !== 0) {
      rowOrderStatus = 'Đang giao hàng';
    }

    const supObj = supervisors.find(s => s.name === ord.rep.sup) || supervisors[0];

    const rawRecord: SalesRecord = {
      'Đơn hàng Tiêu đề': ord.orderId,
      'Đơn hàng Mã đối tác': ord.partner.id,
      'Tên đối tác': ord.partner.name,
      'Ngày đặt hàng': ord.orderDate,
      'Đơn hàng Thành tiền (+VAT)': tr.rev,
      'Đơn hàng Số lượng': tr.qty,
      'Đơn vị tính': item.unit,
      'Mã vật tư': item.code,
      'Sản phẩm / Dịch vụ': item.name,
      'Tình trạng đơn hàng': rowOrderStatus,
      'Tình trạng giao hàng': rowDeliveryStatus,
      'Tình trạng thanh toán': ord.paymentStatus,
      'Tình trạng xuất hóa đơn': rowInvoiceStatus,
      'Số hóa đơn': rowInvoiceNumber,
      'Ngày giao dự kiến': rowExpectedDate,
      'Thời gian giao thực tế': rowActualDelivery,
      'Kho': ord.warehouse,
      'Kênh bán': ord.channel,
      'Loại đơn hàng': ord.orderType,
      'Tỉnh / Thành': ord.partner.province,
      'Phường / Xã': ord.partner.ward,
      'Nhân viên bán hàng': ord.rep.name,
      'Trưởng nhóm': ord.rep.lead,
      'Giám sát': ord.rep.sup,
      'Giám đốc khu vực': supObj.area,
      'Giám đốc đơn vị': supObj.unit,
      'Mã nhân viên tạo': `NV-${String((r % 10) + 1).padStart(3, '0')}`,
      'Chiết khấu (%)': (r % 5) * 2,
      'Giá niêm yết': item.basePrice,
      'Tiền thuế VAT': Math.round(tr.rev * 0.08 / 1.08),
      'Ghi chú đơn hàng': r % 7 === 0 ? 'Giao trước 17h, gọi điện trước khi đến' : '',
      'Địa chỉ giao hàng': `${ord.partner.ward}, ${ord.partner.province}`,
      'Số điện thoại người nhận': `09${String(10000000 + (r * 12345) % 89999999)}`,
      'Phương thức thanh toán': ord.paymentStatus === 'Đã thanh toán' ? 'Chuyển khoản Vietcombank' : 'Công nợ 30 ngày',
      'Ngày tạo đơn': `${ord.orderDate} 08:30`,
      'Người phê duyệt': ord.rep.lead,
      'Phân hạng nhà thuốc': (r % 3 === 0) ? 'Nhà thuốc VIP' : 'Nhà thuốc Tiêu chuẩn',
      'Hạn mức tín dụng (ngày)': 30,
      'Trọng lượng ước tính (kg)': ((tr.qty * 0.15)).toFixed(2),
      'Mã vạch sản phẩm': `893${String(1000000000 + r).substring(1)}`,
      'Độ ưu tiên xử lý': (r % 4 === 0) ? 'Gấp' : 'Bình thường'
    };

    records.push(rawRecord);
  }

  return { records, headers };
}
