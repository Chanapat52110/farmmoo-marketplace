import React from 'react';
import { BarChart3, ShoppingBag, Package, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface EmptyStateProps {
  icon?: 'shopping' | 'package' | 'alert' | 'chart' | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
}

const iconMap = {
  shopping: <ShoppingBag size={48} className="text-stone-400" />,
  package: <Package size={48} className="text-stone-400" />,
  alert: <AlertCircle size={48} className="text-stone-400" />,
  chart: <BarChart3 size={48} className="text-stone-400" />,
};

export function EmptyState({
  icon = 'shopping',
  title,
  description,
  action,
  size = 'md',
}: EmptyStateProps) {
  const sizeStyles = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
  };

  const iconSize = {
    sm: 32,
    md: 48,
    lg: 64,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center rounded-2xl bg-white p-6 ${sizeStyles[size]}`}
    >
      <div className="flex justify-center mb-4" style={{ fontSize: iconSize[size] }}>
        {typeof icon === 'string' ? (
          <div>
            {iconMap[icon as keyof typeof iconMap]}
          </div>
        ) : (
          icon
        )}
      </div>

      <h3
        className="text-stone-800 font-bold mb-2"
        style={{ fontSize: size === 'sm' ? 14 : size === 'md' ? 16 : 18 }}
      >
        {title}
      </h3>

      {description && (
        <p
          className="text-stone-500 mb-4"
          style={{ fontSize: 13 }}
        >
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="inline-block px-6 py-2.5 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 active:scale-95 transition-all"
          style={{ fontSize: 13, fontWeight: 700 }}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
