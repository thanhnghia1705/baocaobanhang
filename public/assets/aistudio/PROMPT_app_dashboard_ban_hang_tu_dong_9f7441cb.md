# PROMPT: Xây dựng app tự tạo dashboard bán hàng từ file Excel

Bạn là chuyên gia thiết kế sản phẩm, phân tích dữ liệu và phát triển ứng dụng. Hãy trực tiếp xây dựng một ứng dụng web chạy được, cho phép người dùng tải lên một file Excel/CSV và tự động tạo dashboard bán hàng tương tác. Không chỉ tạo ảnh minh họa hay giao diện tĩnh. Các bộ lọc, thẻ KPI, biểu đồ, bảng dữ liệu và drill-down phải dùng chung một mô hình lọc và cập nhật theo nhau ngay khi người dùng thao tác.

## Mục tiêu sử dụng

Người dùng chỉ cần kéo thả hoặc chọn file. App tự nhận diện sheet dữ liệu, hàng tiêu đề, kiểu dữ liệu và các trường bán hàng; sau đó tạo dashboard, bộ lọc và phần kiểm tra chất lượng dữ liệu. Nếu file có một bảng bán hàng rõ ràng và các trường quan trọng được nhận diện đủ tin cậy, hãy đi thẳng vào dashboard. Chỉ yêu cầu người dùng xác nhận khi có nhiều bảng phù hợp, tiêu đề hoặc ý nghĩa cột chưa rõ, hoặc thiếu trường bắt buộc. Khi cần xác nhận, hiển thị bản xem trước và đề xuất ghép cột để người dùng sửa nhanh.

App phải dùng được lại khi tải lên file cập nhật sau này. Ghi nhớ cách ánh xạ cột cho những file có cùng cấu trúc. Mặc định thay thế bộ dữ liệu đang mở bằng file mới; chỉ nối thêm dữ liệu khi người dùng chủ động chọn chế độ nối để tránh cộng trùng dữ liệu cũ. Không tự xóa các dòng trùng vì nhiều dòng sản phẩm trong cùng đơn là dữ liệu hợp lệ.

## Phong cách giao diện tham chiếu

Thiết kế theo cảm giác của dashboard trong video tham chiếu: trang phân tích rộng cho màn hình máy tính ngang, thanh điều hướng dạng viên thuốc ở phía trên, các vùng thông tin tách thành thẻ bo góc, nền sáng, một thẻ KPI chủ đạo màu xanh navy, điểm nhấn xanh lam và xanh ngọc, đường viền và bóng đổ nhẹ. Dùng khoảng trắng thoáng, tiêu đề rõ, số liệu lớn, chú giải ngắn, nhãn trục dễ đọc và tooltip khi rê chuột. Ưu tiên biểu đồ cột, đường, thanh ngang và donut khi phù hợp với dữ liệu. Không dùng biểu đồ radar nếu khó so sánh chính xác.

Gợi ý màu: nền xanh xám rất nhạt, thẻ trắng, navy cho doanh số chính, xanh ngọc cho lựa chọn đang xem, xanh lam cho chuỗi dữ liệu phụ; chữ chính màu than đậm. Màu trạng thái phải nhất quán và có nhãn, không chỉ dựa vào màu. Dùng chữ tiếng Việt có dấu, cỡ chữ dễ đọc, định dạng tiền VND có dấu phân cách hàng nghìn. Nếu rút gọn thành triệu/tỷ đồng, tooltip phải hiện giá trị đầy đủ.

Thiết kế desktop landscape là ưu tiên, tối ưu khoảng 1366–1920 px chiều rộng. Khi màn hình nhỏ hơn, xếp thẻ và biểu đồ thành một cột mà vẫn giữ được bộ lọc và chú giải. Không để dashboard cần cuộn ngang để đọc. Có thể cuộn dọc giữa các phần; không che nội dung bằng thanh cố định.

## Cấu trúc màn hình

1. **Màn hình tải file:** vùng kéo thả rõ ràng, hỗ trợ XLSX, XLS và CSV; hiển thị tên file, dung lượng, sheet được nhận diện, số dòng/cột và nút thay file. Có trạng thái đang đọc, lỗi đọc file và hướng xử lý.
2. **Thanh đầu dashboard:** tên “Dashboard bán hàng”, khoảng ngày đang xem, ngày dữ liệu mới nhất, trạng thái bộ lọc, nút Tải dữ liệu mới, Xuất dữ liệu đang lọc và Xóa tất cả bộ lọc.
3. **Điều hướng dạng viên:** Tổng quan, Đội ngũ, Sản phẩm & địa bàn, Vận hành, Dữ liệu. Chuyển tab không xóa bộ lọc đang dùng.
4. **Bộ lọc:** thanh lọc nhiều lựa chọn, tìm kiếm trong danh sách, hiển thị các lựa chọn hiện hành thành chip có thể xóa riêng. Cho phép đóng/mở bộ lọc nâng cao để màn hình chính không bị chật.
5. **Tổng quan:** thẻ doanh số chính màu navy có số lớn và đường xu hướng nhỏ; cạnh đó là các KPI số đơn, nhà thuốc duy nhất, tổng sản lượng, giá trị đơn trung bình và số sản phẩm duy nhất. Bên dưới là xu hướng doanh số theo ngày/tuần/tháng, cơ cấu theo kênh hoặc trạng thái, doanh số theo sản phẩm, địa bàn và trạng thái đơn. Bố trí theo lưới cân đối, thẻ biểu đồ đủ lớn để đọc nhãn và tương tác.
6. **Đội ngũ:** khu vực chọn Giám sát, biểu đồ thanh ngang xếp hạng nhân viên bán hàng, tổng kết phạm vi của giám sát và bảng KPI theo nhân viên. Bên dưới hoặc trong drill-down có thể xem nhà thuốc và đơn liên quan.
7. **Sản phẩm & địa bàn:** Top N sản phẩm, chọn cấp sản phẩm/mã vật tư, tỉnh/thành và drill-down đến phường/xã. Nếu địa chỉ không đủ tin cậy để vẽ bản đồ, dùng biểu đồ thanh và bảng xếp hạng thay cho bản đồ.
8. **Vận hành:** doanh số và số đơn theo tình trạng đơn hàng, giao hàng, thanh toán, xuất hóa đơn, kho, loại đơn hàng và kênh bán. Nhãn tiền theo trạng thái phải ghi “Giá trị đơn hàng sau VAT theo trạng thái”; không gọi là tiền đã thu hoặc công nợ.
9. **Dữ liệu:** bảng chi tiết giữ toàn bộ cột gốc của file, có tìm kiếm, sắp xếp, lọc theo cột, ẩn/hiện cột và xuất phần đang lọc. Bên cạnh đó có thẻ chất lượng dữ liệu và cảnh báo kiểm tra.

Không tạo thẻ ngân sách, mục tiêu, tăng trưởng hay so sánh kế hoạch nếu file không có dữ liệu kế hoạch hoặc kỳ so sánh hợp lệ. Có thể giữ phong cách trình bày của video nhưng chỉ thể hiện chỉ số có căn cứ từ dữ liệu.

## Nhận diện và bảo toàn dữ liệu

- Đọc các sheet và nhận diện bảng có cấu trúc. Ưu tiên sheet có dữ liệu bán hàng; dùng Sheet1 nếu có và phù hợp, nhưng không phụ thuộc tên sheet cố định.
- Tự nhận diện hàng tiêu đề kể cả khi phía trên có tiêu đề báo cáo hoặc dòng trống. Cho xem trước dữ liệu đã đọc trước khi xác nhận nếu có khả năng chọn sai.
- Giữ nguyên mọi cột và giá trị nguồn; với workbook hiện tại có 41 cột. Không đổi tên, ghi đè, xóa dòng, tự sửa mã, tự điền trạng thái hay biến ô trống thành 0. Có thể tạo lớp dữ liệu chuẩn hóa riêng cho lọc và tính toán nhưng luôn giữ liên kết với cột gốc.
- Tự đoán kiểu dữ liệu ngày, tiền, số lượng, mã và văn bản. Giữ mã định danh ở dạng văn bản để không mất số 0 đầu. Chuẩn hóa khoảng trắng chỉ trong giá trị dùng làm danh sách lọc; không sửa dữ liệu gốc.
- Nhận diện trường tương đương khi tiêu đề khác nhẹ và cho phép người dùng sửa ánh xạ. Các trường quan trọng của dữ liệu hiện tại gồm: Đơn hàng Thành tiền (+VAT), Đơn hàng Tiêu đề, Đơn hàng Mã đối tác, Đơn hàng Số lượng, mã vật tư/sản phẩm, ngày đặt hàng, tỉnh/thành, phường/xã, tên đối tác, sản phẩm/dịch vụ, đơn vị tính, tình trạng đơn hàng, tình trạng giao hàng, tình trạng thanh toán, ngày giao dự kiến, thời gian giao thực tế, tình trạng xuất hóa đơn, số hóa đơn, kho, kênh bán, loại đơn hàng, nhân viên bán hàng, trưởng nhóm, giám sát, giám đốc khu vực và giám đốc đơn vị. Hãy đọc tên cột thật từ file để ánh xạ, không tự giả định tên của các cột còn lại.
- Nếu thiếu một trường cốt lõi, vẫn cho phép xem dữ liệu và các KPI có thể tính, nhưng đánh dấu rõ KPI/biểu đồ nào không khả dụng và vì sao. Không âm thầm dùng một trường khác làm thay thế.

## Quy tắc tính toán bắt buộc

- Mọi chỉ tiêu doanh số và mọi phân tích giá trị dùng duy nhất cột **Đơn hàng Thành tiền (+VAT)**. Không cộng thêm tiền thuế hoặc trừ giảm giá lần nữa.
- Mỗi dòng dữ liệu là một dòng sản phẩm trong đơn hàng, không phải một đơn hàng độc lập.
- Số đơn hàng là số **Đơn hàng Tiêu đề** duy nhất trong phạm vi lọc.
- Số nhà thuốc/khách hàng là số **Đơn hàng Mã đối tác** duy nhất trong phạm vi lọc. Không dùng tên đối tác làm khóa và không đếm lặp do nhiều dòng hàng hoặc nhiều đơn.
- Tổng sản lượng là tổng **Đơn hàng Số lượng**. Số sản phẩm duy nhất là số mã vật tư duy nhất.
- Giá trị đơn trung bình sau VAT = tổng thành tiền sau VAT chia số đơn hàng duy nhất trong cùng ngữ cảnh lọc. Nếu mẫu số bằng 0, hiển thị dấu gạch ngang, không báo lỗi.
- Doanh số theo sản phẩm là tổng sau VAT của các dòng sản phẩm. Doanh số theo trạng thái là tổng sau VAT của các dòng thuộc trạng thái đó. Số đơn theo trạng thái là số mã đơn duy nhất, không phải số dòng hàng.
- Nếu một đơn có nhiều trạng thái khác nhau giữa các dòng, không tự chọn một trạng thái đại diện; báo dữ liệu trạng thái không nhất quán và cho phép tra cứu đơn liên quan.
- Nhóm nhà thuốc mua lặp lại trong kỳ bằng số **Đơn hàng Tiêu đề** duy nhất theo từng mã đối tác: mua 1 đơn và mua từ 2 đơn trở lên. Một mã nhà thuốc vẫn chỉ tính một lần trong KPI nhà thuốc duy nhất.
- Hiển thị khoảng ngày được lọc và ngày mới nhất trong file. Các lựa chọn 7/14/30 ngày gần nhất được tính lùi từ ngày dữ liệu mới nhất để phù hợp với file cập nhật trễ; có lựa chọn toàn bộ dữ liệu, tháng hiện tại theo dữ liệu và khoảng ngày tùy chọn.
- Xu hướng mặc định theo ngày; cho phép đổi sang tuần hoặc tháng. Không tự đưa ra so sánh năm hoặc nhận định dài hạn khi dữ liệu không đủ kỳ.

## Bộ lọc và tương tác thật

Bộ lọc nhanh gồm thời gian, tỉnh/thành, phường/xã, kênh bán, loại đơn hàng, kho, sản phẩm, nhân viên bán hàng, trưởng nhóm, giám sát, giám đốc khu vực, tình trạng đơn hàng, tình trạng giao hàng, tình trạng thanh toán và tình trạng xuất hóa đơn. Tất cả danh sách lấy giá trị trực tiếp từ file hiện tại, tự nhận giá trị mới sau khi nạp file khác; cho phép nhiều lựa chọn, tìm kiếm và chọn giá trị trống.

Bộ lọc nâng cao phải áp dụng được cho mọi cột nguồn: chọn trường, điều kiện (bằng, khác, chứa, bắt đầu bằng, lớn hơn/nhỏ hơn, khoảng ngày, trống/không trống) và giá trị. Thêm bộ chọn chỉ tiêu, chiều phân tích, cấp thời gian và Top N cho biểu đồ phù hợp.

Khi bấm vào cột, điểm dữ liệu, phần donut, dòng xếp hạng hoặc địa bàn, hãy áp dụng lựa chọn đó như một bộ lọc thật và cập nhật tất cả KPI, biểu đồ, bảng chi tiết, danh sách phụ thuộc và tổng đang hiển thị. Cho phép chọn nhiều điểm, bỏ chọn điểm đã chọn, xem chip lọc phát sinh từ biểu đồ và xóa từng lựa chọn. Không làm nút giả chỉ thay tiêu đề hoặc số ở một ô.

### Phân cấp Giám sát → Nhân viên bán hàng → Nhà thuốc

- Chọn một giám sát thì danh sách nhân viên và bảng xếp hạng chỉ còn nhân viên có bản ghi thuộc giám sát đó trong phạm vi ngày/bộ lọc hiện tại.
- Khi chọn một nhân viên, KPI, biểu đồ liên quan và bảng chi tiết cập nhật theo các dòng dữ liệu phù hợp. Khi xóa chọn nhân viên nhưng giữ giám sát, trở về tổng của toàn bộ phạm vi giám sát.
- Hiển thị tổng giám sát gồm doanh số sau VAT, nhà thuốc duy nhất, đơn duy nhất, sản lượng, số nhân viên có phát sinh đơn và giá trị đơn trung bình.
- Có biểu đồ thanh ngang xếp hạng nhân viên theo doanh số sau VAT và bảng theo nhân viên gồm doanh số, nhà thuốc duy nhất, đơn duy nhất, sản lượng, giá trị đơn trung bình và các chỉ số trạng thái cần theo dõi.
- Tổng nhà thuốc của giám sát phải đếm duy nhất mã đối tác trên toàn phạm vi đang lọc; tuyệt đối không cộng số nhà thuốc từng nhân viên vì một nhà thuốc có thể xuất hiện dưới nhiều người.
- Nếu một nhà thuốc có dữ liệu dưới nhiều nhân viên, giữ quan hệ theo từng dòng nguồn; không tự gán chủ sở hữu và không chia doanh số. Nếu một nhân viên liên quan đến nhiều giám sát, kết quả phụ thuộc các dòng thực tế sau lọc, không gán người đó cho duy nhất một giám sát.
- Ghi rõ “Nhà thuốc duy nhất trong kỳ đang chọn”. Số nhà thuốc mua lặp lại phải dựa trên số đơn duy nhất theo mã đối tác, không dựa trên số dòng sản phẩm.

## Cảnh báo chất lượng dữ liệu

Tạo vùng cảnh báo không làm thay đổi dữ liệu nguồn. Cho phép bấm cảnh báo để lọc ra các dòng liên quan. Kiểm tra ngày không hợp lệ, thiếu mã, thiếu trạng thái, mã đơn có trạng thái mâu thuẫn, số tiền hoặc số lượng không đọc được, và ngày giao dự kiến sớm hơn ngày đặt hàng. Chỉ đánh giá đúng hạn/trễ hạn khi ngày dự kiến và ngày giao thực tế đều hợp lệ.

Nếu nhận diện đúng workbook mẫu hiện tại, dùng các số dưới đây làm mốc đối soát ban đầu: 4.601 dòng hàng, 1.680 đơn hàng duy nhất, 1.114 mã đối tác, 112 mã sản phẩm, tổng số lượng 46.039, tổng thành tiền sau VAT 2.579.012.626 VND, khoảng ngày đặt hàng 29/09/2026–21/10/2026. Cảnh báo mẫu gồm 665 dòng thiếu tình trạng giao hàng, 769 dòng thiếu thời gian giao thực tế, 9 dòng có ngày giao dự kiến trước ngày đặt hàng và 233 dòng được đánh dấu đã xuất hóa đơn nhưng thiếu số hóa đơn. Chỉ dùng các mốc này để kiểm tra đúng workbook mẫu; file cập nhật khác phải được tính lại từ dữ liệu thật, không xem khác mốc là lỗi tự động.

## Cập nhật và xuất dữ liệu

Khi người dùng tải file mới có cùng cấu trúc, nạp lại dữ liệu, làm mới KPI, biểu đồ, bộ lọc, phân cấp giám sát/nhân viên và bảng chi tiết mà không cần cấu hình lại. Nếu có cột mới, giữ cột đó trong bảng dữ liệu và cho phép lọc qua bộ lọc nâng cao. Nếu thiếu hoặc đổi tên cột cũ, đưa ra bước xác nhận ánh xạ thay vì âm thầm bỏ dữ liệu. Có lựa chọn thay toàn bộ hoặc nối dữ liệu; khi nối, hiển thị số dòng trước/sau và cảnh báo nguy cơ nạp trùng file.

Cho phép xuất dữ liệu chi tiết đã lọc ra XLSX/CSV và tải ảnh hoặc PDF dashboard nếu môi trường hỗ trợ. Xuất phải phản ánh đúng lựa chọn và bộ lọc hiện hành. Ghi rõ thời điểm và tên file nguồn đang được phân tích.

## Kiểm thử trước khi bàn giao

Tự chạy kiểm thử với file mẫu nếu file đó được cung cấp cho app; nếu không, tạo bộ dữ liệu kiểm thử nhỏ có nhiều dòng hàng mỗi đơn, nhà thuốc mua nhiều đơn, nhà thuốc xuất hiện dưới nhiều nhân viên, nhân viên liên quan nhiều giám sát, ô trống và trạng thái không nhất quán. Xóa bộ dữ liệu thử khỏi trạng thái cuối.

Xác nhận tối thiểu: tổng doanh số sau VAT và số đơn duy nhất đúng; mã nhà thuốc và mã sản phẩm được đếm duy nhất; KPI nhà thuốc không bị cộng trùng qua nhân viên; lọc giám sát làm thu hẹp danh sách nhân viên; chọn/xóa nhân viên cập nhật và hoàn nguyên đúng; chọn một điểm trên biểu đồ lọc đồng bộ toàn dashboard; kết hợp nhiều bộ lọc, khoảng ngày, giá trị trống, tìm kiếm mã và Top N hoạt động; tải file cập nhật làm mới toàn bộ danh sách và biểu đồ; bảng chi tiết vẫn chứa mọi cột gốc; không có lỗi hiển thị, công thức, biểu đồ hoặc lỗi JavaScript nghiêm trọng.

Trước khi hoàn tất, mở app và thao tác thử trực tiếp. Nếu tính năng nào chưa hoạt động, sửa rồi kiểm tra lại. Bàn giao ứng dụng chạy được cùng hướng dẫn ngắn: tải file, thay/nối dữ liệu, lọc tương tác và xuất kết quả. Nêu rõ giới hạn kỹ thuật còn lại; không tuyên bố có tính năng chưa được kiểm thử.
