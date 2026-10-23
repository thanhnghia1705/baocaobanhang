/**
 * Các hàm tiện ích định dạng tiền tệ, số lượng và ngày tháng chuẩn tiếng Việt
 */

export function formatVND(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 ₫';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount).replace('VND', '₫').trim();
}

export function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) {
    return '0';
  }
  return new Intl.NumberFormat('vi-VN').format(val);
}

export function formatCompactVND(amount: number): { compact: string; full: string } {
  const full = formatVND(amount);
  if (Math.abs(amount) >= 1_000_000_000) {
    const billions = amount / 1_000_000_000;
    return {
      compact: `${billions.toFixed(2).replace('.', ',')} tỷ`,
      full,
    };
  }
  if (Math.abs(amount) >= 1_000_000) {
    const millions = amount / 1_000_000;
    return {
      compact: `${millions.toFixed(1).replace('.', ',')} tr`,
      full,
    };
  }
  if (Math.abs(amount) >= 1_000) {
    const thousands = amount / 1_000;
    return {
      compact: `${thousands.toFixed(0)}k`,
      full,
    };
  }
  return { compact: full, full };
}

export function formatDateVN(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  // If in YYYY-MM-DD
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  // Try Date parse
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

export function formatPercent(value: number, total: number): string {
  if (!total || total === 0) return '0%';
  const p = (value / total) * 100;
  return `${p.toFixed(1).replace('.', ',')}%`;
}
