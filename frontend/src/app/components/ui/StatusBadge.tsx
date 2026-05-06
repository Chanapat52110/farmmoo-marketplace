import React from 'react';

type StatusType = 'success' | 'pending' | 'error' | 'warning' | 'info';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
}

/**
 * StatusBadge: Consistent status indicator for orders, products, etc.
 * Uses color coding for quick visual scanning.
 */
export function StatusBadge({ status, label, icon, size = 'md' }: StatusBadgeProps) {
  const variants = {
    success: 'bg-green-50 border-green-200 text-green-700',
    pending: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-orange-50 border-orange-200 text-orange-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
  };

  return (
    <div className={`${variants[status]} ${sizes[size]} rounded-2xl border-2 inline-flex items-center gap-1.5 font-semibold`}>
      {icon && <span>{icon}</span>}
      {label}
    </div>
  );
}
