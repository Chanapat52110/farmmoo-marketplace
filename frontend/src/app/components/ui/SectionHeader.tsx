import React from 'react';
import { motion } from 'motion/react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * SectionHeader: Consistent heading style for all marketplace sections.
 * Provides icon, title, subtitle, and optional action button.
 */
export function SectionHeader({
  title,
  subtitle,
  icon,
  action,
  className = '',
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-between mb-6 gap-4 ${className}`}
    >
      <div className="flex items-center gap-3 flex-1">
        {icon && <div className="text-orange-600">{icon}</div>}
        <div>
          <h2 className="text-stone-900 font-bold" style={{ fontSize: 18 }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-stone-500 text-sm">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.div>
  );
}
