import React, { useState } from 'react';
import { SlidersHorizontal, Plus, Trash2, X, Check } from 'lucide-react';
import { useSalesData } from '../context/SalesDataContext';
import { AdvancedFilterRule } from '../types/sales';

interface AdvancedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvancedFilterModal: React.FC<AdvancedFilterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { headers, filterState, setFilterState } = useSalesData();
  const [localRules, setLocalRules] = useState<AdvancedFilterRule[]>(filterState.advancedFilters);

  if (!isOpen) return null;

  const handleAddRule = () => {
    const newRule: AdvancedFilterRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      column: headers[0] || '',
      operator: 'contains',
      value: '',
    };
    setLocalRules([...localRules, newRule]);
  };

  const handleRemoveRule = (id: string) => {
    setLocalRules(localRules.filter((r) => r.id !== id));
  };

  const handleUpdateRule = (id: string, updates: Partial<AdvancedFilterRule>) => {
    setLocalRules(
      localRules.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const handleApply = () => {
    setFilterState((prev) => ({
      ...prev,
      advancedFilters: localRules,
    }));
    onClose();
  };

  const handleClearAll = () => {
    setLocalRules([]);
    setFilterState((prev) => ({
      ...prev,
      advancedFilters: [],
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-none">
                Bộ lọc nâng cao theo mọi cột
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Lọc chi tiết dữ liệu nguồn với các điều kiện logic tùy biến
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rules list */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {localRules.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-xs">Chưa có điều kiện lọc nâng cao nào.</p>
              <button
                type="button"
                onClick={handleAddRule}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm điều kiện đầu tiên</span>
              </button>
            </div>
          ) : (
            localRules.map((rule, idx) => (
              <div
                key={rule.id}
                className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200"
              >
                <span className="text-xs font-bold text-slate-400 w-5 text-center">
                  {idx + 1}
                </span>

                {/* Column selector */}
                <select
                  value={rule.column}
                  onChange={(e) => handleUpdateRule(rule.id, { column: e.target.value })}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 max-w-[180px] truncate"
                >
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>

                {/* Operator selector */}
                <select
                  value={rule.operator}
                  onChange={(e) =>
                    handleUpdateRule(rule.id, {
                      operator: e.target.value as AdvancedFilterRule['operator'],
                    })
                  }
                  className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="contains">chứa</option>
                  <option value="equals">bằng chính xác</option>
                  <option value="notEquals">khác</option>
                  <option value="startsWith">bắt đầu bằng</option>
                  <option value="greaterThan">lớn hơn (&gt;)</option>
                  <option value="lessThan">nhỏ hơn (&lt;)</option>
                  <option value="isEmpty">là ô trống</option>
                  <option value="isNotEmpty">không trống</option>
                </select>

                {/* Value input (hidden if isEmpty / isNotEmpty) */}
                {rule.operator !== 'isEmpty' && rule.operator !== 'isNotEmpty' ? (
                  <input
                    type="text"
                    placeholder="Giá trị lọc..."
                    value={rule.value}
                    onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
                    className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                ) : (
                  <div className="flex-1 text-xs text-slate-400 italic px-2">
                    (Không cần nhập giá trị)
                  </div>
                )}

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleRemoveRule(rule.id)}
                  className="w-7 h-7 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}

          {localRules.length > 0 && (
            <button
              type="button"
              onClick={handleAddRule}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
            >
              <Plus className="w-3.5 h-3.5 text-teal-600" />
              <span>Thêm điều kiện khác</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-medium text-rose-600 hover:text-rose-700 underline"
          >
            Xóa tất cả điều kiện nâng cao
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-teal-300" />
              <span>Áp dụng bộ lọc ({localRules.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
