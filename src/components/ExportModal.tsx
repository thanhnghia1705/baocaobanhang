import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Download,
  X,
  FileSpreadsheet,
  FileText,
  Printer,
  Check,
} from 'lucide-react';
import { useSalesData } from '../context/SalesDataContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { filteredRecords, fileInfo } = useSalesData();
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const exportToXLSX = () => {
    setIsExporting(true);
    try {
      const dataToExport = filteredRecords.map((r) => r._raw);
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Filtered_Sales_Data');

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `Sales_Export_${timestamp}.xlsx`;
      XLSX.writeFile(wb, filename);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const dataToExport = filteredRecords.map((r) => r._raw);
      if (dataToExport.length === 0) return;

      const keys = Object.keys(dataToExport[0]);
      const headerRow = keys.map((k) => `"${k.replace(/"/g, '""')}"`).join(',');

      const rows = dataToExport.map((row) =>
        keys
          .map((k) => {
            const val = row[k] === null || row[k] === undefined ? '' : String(row[k]);
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',')
      );

      // Add UTF-8 BOM for Excel
      const csvContent = '\uFEFF' + [headerRow, ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Sales_Export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Xuất dữ liệu đang lọc</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Số bản ghi thỏa mãn bộ lọc:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {filteredRecords.length.toLocaleString('vi-VN')} dòng
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-500 mt-1">
              <span>Tệp nguồn:</span>
              <span className="truncate max-w-[200px] text-right font-medium">
                {fileInfo.fileName}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={exportToXLSX}
              disabled={isExporting || filteredRecords.length === 0}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-teal-800">
                    Microsoft Excel (.XLSX)
                  </p>
                  <p className="text-[11px] text-slate-500">Giữ nguyên các cột và định dạng dữ liệu</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
            </button>

            <button
              onClick={exportToCSV}
              disabled={isExporting || filteredRecords.length === 0}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-teal-800">
                    Định dạng CSV (.CSV)
                  </p>
                  <p className="text-[11px] text-slate-500">Hỗ trợ tiếng Việt UTF-8 chuẩn xác</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
            </button>

            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-teal-800">
                    In báo cáo / Lưu PDF (Print)
                  </p>
                  <p className="text-[11px] text-slate-500">Giao diện in ấn tối ưu đồ thị và thẻ KPI</p>
                </div>
              </div>
              <Printer className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
            </button>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
