# Tự Động Tạo Dashboard Bán Hàng Từ Excel / CSV

Hệ thống phân tích và trực quan hóa bán hàng tự động cho phép người dùng tải lên bất kỳ bảng tính Excel (XLSX, XLS) hoặc CSV nào, tự động phát hiện cấu trúc bảng, chuẩn hóa 41 trường bán hàng và sinh ngay lập tức một dashboard điều hành tương tác đa chiều với bộ lọc chéo thời gian thực, bảng kiểm toán chất lượng dữ liệu và phân cấp quản lý giám sát - nhân viên - nhà thuốc.

## User Review & Critical Decisions

> [!IMPORTANT]
> Các quyết định cốt lõi và giá trị mặc định được áp dụng cho ứng dụng dựa trên yêu cầu đặc tả nghiệp vụ:

- **Khởi động & Trải nghiệm ban đầu**: Ứng dụng cung cấp cả hai lựa chọn song song: khu vực tải file kéo thả trực quan (XLSX, XLS, CSV) và nút bấm **"Khám phá ngay với Dữ liệu mẫu chuẩn"** (chứa đúng 4.601 dòng hàng, 1.680 đơn, 1.114 nhà thuốc, 2.579.012.626 VND doanh số sau VAT để đối soát tức thì). Người dùng có thể nạp file mới bất cứ lúc nào qua nút trên header.
- **Quy tắc bảo toàn và tính toán tài chính bắt buộc**:
  - Doanh số duy nhất tính theo `Đơn hàng Thành tiền (+VAT)`.
  - Mỗi hàng là một dòng sản phẩm; số đơn hàng = đếm duy nhất `Đơn hàng Tiêu đề`.
  - Số nhà thuốc = đếm duy nhất `Đơn hàng Mã đối tác` (tuyệt đối không cộng gộp danh sách từng nhân viên để tránh trùng lặp).
  - Tỷ lệ lặp lại = số nhà thuốc có từ 2 đơn hàng duy nhất trở lên trong kỳ lọc.
  - Bảng dữ liệu chi tiết giữ nguyên vẹn toàn bộ 41 cột nguồn gốc, không tự ý sửa đổi hay làm tròn dữ liệu thô.
- **Bộ lọc & Điều hướng**: 5 tab dạng viên thuốc (*Tổng quan*, *Đội ngũ*, *Sản phẩm & địa bàn*, *Vận hành*, *Dữ liệu*). Khi chuyển tab hoặc bấm vào biểu đồ cột, thanh, donut, toàn bộ bộ lọc được đồng bộ hóa tức thời qua mô hình Cross-Filtering toàn cục.
- **Xuất dữ liệu & Báo cáo**: Hỗ trợ xuất dữ liệu chi tiết đã lọc ra XLSX, CSV và in bảng điều khiển định dạng Print/PDF rõ nét.

---

## 1. Overview & Core Concept

- **What It Does**: Hệ thống tự động phân tích workbook/CSV bán hàng, nhận diện hàng tiêu đề, khớp nối thông minh 41 cột nghiệp vụ ngành dược phẩm/phân phối, và kết xuất dashboard thời gian thực gồm 5 phân hệ chuyên sâu. Mọi tương tác click trên biểu đồ đều trở thành filter động đồng bộ toàn app.
- **Target Audience / Persona**: Giám đốc kinh doanh, Giám sát bán hàng (Sup), Quản trị vận hành chuỗi cung ứng, và Chuyên viên phân tích dữ liệu bán lẻ/phân phối dược phẩm.
- **Key Value**: Xóa bỏ hoàn toàn thao tác tạo Pivot Table hoặc biểu đồ thủ công; tự động phát hiện các lỗ hổng dữ liệu (ngày giao sớm hơn ngày đặt, đơn thiếu mã hóa đơn, mâu thuẫn trạng thái) và cho phép lọc ngay những đơn vi phạm chỉ với một cú nhấp chuột.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Zero-State / Nhập dữ liệu**:
   - Vùng kéo thả hiện đại với hướng dẫn định dạng `.xlsx`, `.xls`, `.csv`.
   - Lựa chọn nạp file riêng hoặc tải ngay bộ dữ liệu mẫu chuẩn 4.601 dòng.
   - Khi tải file mới: tự động ánh xạ thông minh các cột; cho phép người dùng xem bảng đối chiếu mapping và xác nhận nếu phát hiện cột chưa rõ ràng.
   - Tùy chọn **Thay thế toàn bộ** (mặc định) hoặc **Nối thêm dữ liệu** (hiển thị số dòng trước/sau và cảnh báo trùng lặp).
2. **Khám phá Dashboard với 5 Phân hệ**:
   - **Thanh Header cố định nhẹ nhàng**: Tên Dashboard, khoảng ngày đang lọc, ngày dữ liệu mới nhất, số lượng bộ lọc đang kích hoạt, các nút thao tác nhanh (Tải file mới, Xuất dữ liệu, Xóa tất cả bộ lọc).
   - **Thanh bộ lọc nhanh & Nâng cao**: Lọc theo thời gian (7/14/30 ngày từ ngày dữ liệu mới nhất, toàn bộ, hoặc khoảng tùy chọn), Tỉnh/thành, Giám sát, Nhân viên, Kênh bán, Trạng thái đơn, v.v. Có thanh chip hiển thị các điều kiện đang áp dụng để xóa nhanh.
   - **Tab 1: Tổng quan**: Thẻ KPI Doanh số Navy chủ đạo với số to rõ, sparkline xu hướng, cùng 5 thẻ phụ (Đơn hàng, Nhà thuốc duy nhất, Sản lượng, Giá trị đơn TB AOV, Số sản phẩm). Biểu đồ xu hướng (ngày/tuần/tháng), cơ cấu kênh bán, phân bổ theo địa bàn và trạng thái.
   - **Tab 2: Đội ngũ**: Bộ chọn Giám sát cấp cao -> tự động thu hẹp danh sách Nhân viên bán hàng trực thuộc -> biểu đồ thanh ngang xếp hạng doanh số -> bảng chi tiết KPI từng nhân viên (Doanh số, Đơn hàng, Nhà thuốc duy nhất, Sản lượng, AOV, tỷ lệ giao hàng). Drill-down xem nhà thuốc và đơn hàng liên quan.
   - **Tab 3: Sản phẩm & Địa bàn**: Bảng xếp hạng Top N sản phẩm theo doanh số & sản lượng, phân tích tỷ trọng cơ cấu, bản đồ xếp hạng Tỉnh/Thành phố và drill-down Phường/Xã với độ tin cậy dữ liệu cao.
   - **Tab 4: Vận hành**: Biểu đồ phân bổ doanh số và đơn hàng theo trạng thái đơn, tình trạng giao hàng, tình trạng thanh toán, xuất hóa đơn, kho hàng, loại đơn hàng và kênh bán (ghi rõ nhãn *"Giá trị đơn hàng sau VAT theo trạng thái"*).
   - **Tab 5: Dữ liệu & Kiểm toán**: Bảng dữ liệu gốc đầy đủ 41 cột với tìm kiếm, sắp xếp đa cột, ẩn/hiện cột tùy chỉnh; bên cạnh là Widget Cảnh báo chất lượng dữ liệu (ngày giao < ngày đặt, thiếu hóa đơn, đơn có trạng thái mâu thuẫn) với nút bấm lọc trực tiếp đơn có vấn đề.

### Visual Identity & Theme

- **Aesthetic Direction**: B2B Analytical Precision – phong cách giao diện báo cáo chuyên nghiệp theo cảm hứng video tham chiếu: thoáng đãng, sắc nét, tối ưu cho desktop landscape (1366px - 1920px), responsive mượt mà trên laptop và tablet.
- **Color Palette**:
  - Canvas nền: Xanh xám nhạt cao cấp (`#F8FAFC` / Slate-50) tạo độ tương phản êm mắt.
  - Thẻ & Bề mặt: Trắng tinh khôi (`#FFFFFF`) với đường viền hairline mảnh (`border-slate-200/80`) và bóng đổ tự nhiên (`shadow-xs`).
  - Thẻ KPI chủ đạo: Xanh Navy quyền lực (`#0F172A` / `#1E293B`) với số liệu trắng nổi bật và biểu đồ mini xanh lơ.
  - Điểm nhấn tương tác: Xanh Ngọc / Teal (`#0D9488` / `#14B8A6`) biểu thị trạng thái đang chọn và tab active; Xanh Lam (`#2563EB` / `#3B82F6`) cho các chuỗi dữ liệu phụ và phân tích.
  - Màu trạng thái ngữ nghĩa rõ ràng: Thành công (`#16A34A`), Cảnh báo (`#D97706`), Thất bại/Chậm trễ (`#DC2626`) luôn đi kèm nhãn văn bản.
- **Typography & Formatting**:
  - Phông chữ giao diện: Sans-serif hiện đại, thanh thoát, dấu tiếng Việt chuẩn xác.
  - Số liệu & Tài chính: Bắt buộc dùng `tabular-nums` hoặc font mono cho tất cả các con số, định dạng tiền VND có dấu phân cách hàng nghìn (`2.579.012.626 ₫`), hiển thị tooltip giá trị đầy đủ khi rút gọn (tr/tỷ).
- **Interactive Feedback**: Hover tooltip mượt mà trên biểu đồ, hiệu ứng chuyển tab êm ái, bộ lọc chéo phản hồi tức thì dưới 100ms.

---

## 3. Key Product Decisions & Trade-Offs

- **Client-Side In-Memory Engine**:
  - *Chosen Approach*: Toàn bộ quá trình giải nén XLSX/CSV, nhận diện cột, lọc dữ liệu chéo và tổng hợp KPI được xử lý hoàn toàn trên Client-side bằng cấu trúc dữ liệu indexed (Web Worker / tối ưu hóa vòng lặp Map/Set).
  - *Why*: Tốc độ lọc tức thời (<30ms) với bộ dữ liệu hàng chục nghìn dòng, hoàn toàn riêng tư không tải dữ liệu nhạy cảm của doanh nghiệp lên máy chủ bên ngoài, chạy được offline.
- **Bảo toàn 41 cột nguyên bản (Data Immutability)**:
  - *Chosen Approach*: Lưu trữ mảng bản ghi thô nguyên bản (`rawRows: Record<string, any>[]`) và sinh một tầng ánh xạ trường chuẩn hóa (`NormalizedRecord`) tham chiếu trực tiếp đến bản ghi gốc.
  - *Why*: Đảm bảo bảng tab "Dữ liệu" luôn đúng 100% cột gốc người dùng đưa vào; không bao giờ mất thông tin, biến chuỗi rỗng thành số 0 hay làm lệch dữ liệu gốc.
- **Quy tắc phân cấp Giám sát - Nhân viên - Nhà thuốc không cộng dồn**:
  - *Chosen Approach*: Tính tập hợp `Set<partnerId>` trên toàn bộ dòng dữ liệu thỏa mãn bộ lọc hiện hành của Giám sát, thay vì tính tổng số nhà thuốc của từng nhân viên cộng lại.
  - *Why*: Tránh hoàn toàn lỗi phóng đại số lượng khách hàng khi một nhà thuốc mua hàng qua nhiều nhân viên hoặc nhiều đơn trong cùng một kỳ.

---

## 4. Technical Architecture & Data Strategy

### System & Component Hierarchy

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            Vite + React Application                          │
├──────────────────────────────────────────────────────────────────────────────┤
│  Top Bar & Global Actions                                                    │
│  [Logo / Tiêu đề] ── [Khoảng ngày & Ngày mới nhất] ── [Nút Tải / Xuất / Reset]│
├──────────────────────────────────────────────────────────────────────────────┤
│  Pill Tabs Segmented Navigation                                              │
│  [1. Tổng quan] [2. Đội ngũ] [3. Sản phẩm & Địa bàn] [4. Vận hành] [5. Dữ liệu]│
├──────────────────────────────────────────────────────────────────────────────┤
│  Filter Bar & Active Chips                                                   │
│  [Khoảng ngày] [Tỉnh/Thành] [Kênh] [Trạng thái] [Giám sát] [Bộ lọc nâng cao] │
├──────────────────────────────────────────────────────────────────────────────┤
│                               Active Tab View                                │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ 1. OverviewTab    : Navy Hero KPI + Sub KPIs + Trend Chart + Donut     │  │
│  │ 2. TeamTab        : Supervisor Selector + Rep Ranking + Pharmacy Table │  │
│  │ 3. GeoProductTab  : Top N Products + Geo Ranking + Ward Drilldown     │  │
│  │ 4. OperationsTab  : VAT Value by Order/Delivery/Invoice/Warehouse      │  │
│  │ 5. RawDataTab     : 41-Column Table + Search + Data Quality Audit      │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────┤
│  Data Engine & Normalizer (State Store)                                      │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌──────────────────┐  │
│  │ File Parser (xlsx/csv)│  │ Smart Column Mapper   │  │ Cross-Filter Hook│  │
│  └───────────────────────┘  └───────────────────────┘  └──────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Data Normalization & Core Fields Schema

Tầng dữ liệu chuẩn hóa tự động ánh xạ các tên cột phổ biến và tên cột chính xác từ workbook mẫu:
- **Doanh số**: `Đơn hàng Thành tiền (+VAT)` (float)
- **Mã đơn**: `Đơn hàng Tiêu đề` (string)
- **Mã khách hàng / nhà thuốc**: `Đơn hàng Mã đối tác` (string)
- **Tên đối tác**: `Tên đối tác` (string)
- **Sản lượng**: `Đơn hàng Số lượng` (number)
- **Mã sản phẩm / SKU**: `Mã vật tư` hoặc `Mã sản phẩm` (string)
- **Tên sản phẩm**: `Sản phẩm / Dịch vụ` (string)
- **Ngày đặt hàng**: `Ngày đặt hàng` (Date / YYYY-MM-DD)
- **Địa bàn**: `Tỉnh / Thành`, `Phường / Xã`
- **Quản lý**: `Giám sát`, `Nhân viên bán hàng`, `Trưởng nhóm`, `Giám đốc khu vực`
- **Vận hành**: `Tình trạng đơn hàng`, `Tình trạng giao hàng`, `Tình trạng thanh toán`, `Tình trạng xuất hóa đơn`, `Số hóa đơn`, `Kho`, `Kênh bán`, `Loại đơn hàng`, `Ngày giao dự kiến`, `Thời gian giao thực tế`.

### Data Quality Rules
1. `ngayGiaoSomHonDat`: `ngayGiaoDuKien < ngayDatHang`
2. `thieuTinhTrangGiao`: `tinhTrangGiaoHang == null || tinhTrangGiaoHang == ''`
3. `thieuThoiGianGiaoThucTe`: đã giao hoặc có trạng thái nhưng thiếu thời gian thực tế
4. `daXuatHDNhungThieuSoHD`: `tinhTrangXuatHoaDon == 'Đã xuất'` nhưng `soHoaDon` rỗng
5. `trangThaiMauThuan`: cùng 1 mã đơn (`Đơn hàng Tiêu đề`) nhưng các dòng sản phẩm có trạng thái đơn khác nhau.

Mỗi cảnh báo có nút **"Xem X dòng liên quan"**, khi bấm vào sẽ kích hoạt filter ngay lập tức để người dùng kiểm tra trên bảng dữ liệu.
