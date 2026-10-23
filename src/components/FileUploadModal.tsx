import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useSalesData } from '../context/SalesDataContext';
import { parseSpreadsheetBuffer, DEFAULT_COLUMN_MAPPING } from '../utils/fileParser';
import { ColumnMapping, SalesRecord } from '../types/sales';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose }) => {
  const { loadUploadedData, loadSampleData, fileInfo, rawRecords } = useSalesData();

  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Staged parsed file data
  const [stagedData, setStagedData] = useState<{
    fileName: string;
    fileSize: number;
    sheetNames: string[];
    selectedSheet: string;
    headers: string[];
    rawRows: SalesRecord[];
    mapping: ColumnMapping;
    missingRequired: string[];
  } | null>(null);

  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [showMappingConfig, setShowMappingConfig] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const result = parseSpreadsheetBuffer(buffer, file.name);

      if (result.rawRows.length === 0) {
        throw new Error('Tệp không chứa dòng dữ liệu nào sau hàng tiêu đề.');
      }

      setStagedData({
        fileName: file.name,
        fileSize: file.size,
        sheetNames: result.sheetNames,
        selectedSheet: result.selectedSheet,
        headers: result.headers,
        rawRows: result.rawRows,
        mapping: result.mapping,
        missingRequired: result.missingRequiredColumns,
      });

      // If missing core columns, prompt user to review mapping
      if (result.missingRequiredColumns.length > 0) {
        setShowMappingConfig(true);
      }
    } catch (err: any) {
      setErrorMsg(
        err.message || 'Không thể đọc tệp Excel/CSV. Vui lòng kiểm tra định dạng tệp và thử lại.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!stagedData) return;

    loadUploadedData(
      stagedData.rawRows,
      stagedData.headers,
      stagedData.mapping,
      stagedData.fileName,
      stagedData.fileSize,
      stagedData.selectedSheet,
      importMode
    );

    onClose();
  };

  const handleLoadSample = () => {
    loadSampleData();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-none">
                Tải lên file dữ liệu bán hàng
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Hỗ trợ định dạng Microsoft Excel (.xlsx, .xls) và văn bản .csv
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Lỗi nạp file</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {!stagedData ? (
            <>
              {/* Dropzone */}
              <div
                onDragEnter={() => setDragActive(true)}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center ${
                  dragActive
                    ? 'border-teal-500 bg-teal-50/50 scale-[0.99]'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-600 mb-3">
                  <FileSpreadsheet className="w-6 h-6 text-teal-600" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  Kéo thả file Excel / CSV vào đây hoặc{' '}
                  <span className="text-teal-600 underline">chọn từ máy tính</span>
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Tự động phát hiện tiêu đề, các trường bán hàng, không sửa đổi dữ liệu gốc
                </p>

                {isProcessing && (
                  <p className="text-xs text-teal-600 font-semibold mt-4 animate-pulse">
                    Đang phân tích cấu trúc file...
                  </p>
                )}
              </div>

              {/* Sample benchmark quick action */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    Sử dụng bộ dữ liệu mẫu chuẩn (Benchmark)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    4.601 dòng hàng · 1.680 đơn · 1.114 nhà thuốc · 2.58 tỷ VNĐ (29/09 - 21/10/2026)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-100 hover:bg-teal-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  Nạp mẫu chuẩn
                </button>
              </div>
            </>
          ) : (
            /* Staged File Preview & Confirmation */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{stagedData.fileName}</p>
                      <p className="text-xs text-slate-500">
                        {(stagedData.fileSize / 1024).toFixed(1)} KB · Sheet:{' '}
                        <span className="font-semibold text-slate-700">{stagedData.selectedSheet}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStagedData(null)}
                    className="text-xs text-slate-500 hover:text-slate-800 underline"
                  >
                    Chọn file khác
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 text-xs">
                  <div>
                    <span className="text-slate-500">Số dòng phát hiện:</span>{' '}
                    <span className="font-bold text-slate-900 tabular-nums">
                      {stagedData.rawRows.length.toLocaleString('vi-VN')} dòng
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Số cột tiêu đề:</span>{' '}
                    <span className="font-bold text-slate-900 tabular-nums">
                      {stagedData.headers.length} cột
                    </span>
                  </div>
                </div>
              </div>

              {/* Mode Selection: Replace vs Append */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  Chế độ nạp dữ liệu:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      importMode === 'replace'
                        ? 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">
                      Thay thế toàn bộ (Khuyên dùng)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Đóng bộ dữ liệu cũ ({rawRecords.length.toLocaleString('vi-VN')} dòng) và mở tệp mới
                      này. Tránh rủi ro cộng trùng số liệu.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMode('append')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      importMode === 'append'
                        ? 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">Nối thêm dòng dữ liệu</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tổng số dòng sẽ là:{' '}
                      <span className="font-bold text-slate-800">
                        {(rawRecords.length + stagedData.rawRows.length).toLocaleString('vi-VN')} dòng
                      </span>
                      . Chỉ dùng khi tệp là phần nối tiếp kỳ trước.
                    </p>
                  </button>
                </div>
              </div>

              {/* Column Mapping Review Button */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setShowMappingConfig(!showMappingConfig)}
                  className="text-teal-700 hover:text-teal-800 font-medium underline"
                >
                  {showMappingConfig ? 'Ẩn đối chiếu ánh xạ cột' : 'Xem & chỉnh sửa ánh xạ cột'}
                </button>

                {stagedData.missingRequired.length > 0 && (
                  <span className="text-rose-600 font-medium">
                    ⚠️ Chưa tìm thấy: {stagedData.missingRequired.join(', ')}
                  </span>
                )}
              </div>

              {/* Optional Mapping Config Table */}
              {showMappingConfig && (
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Trường nghiệp vụ</th>
                        <th className="py-2 px-3">Cột tương ứng trong file</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {(Object.keys(DEFAULT_COLUMN_MAPPING) as (keyof ColumnMapping)[]).map(
                        (key) => (
                          <tr key={key} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 font-medium text-slate-700">
                              {DEFAULT_COLUMN_MAPPING[key]}
                            </td>
                            <td className="py-1.5 px-3">
                              <select
                                value={stagedData.mapping[key]}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setStagedData((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          mapping: { ...prev.mapping, [key]: val },
                                        }
                                      : null
                                  );
                                }}
                                className="w-full py-1 px-2 text-xs bg-white border border-slate-200 rounded focus:ring-1 focus:ring-teal-500"
                              >
                                {stagedData.headers.map((h) => (
                                  <option key={h} value={h}>
                                    {h}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg transition-colors"
          >
            Đóng
          </button>
          {stagedData && (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Nạp vào Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
