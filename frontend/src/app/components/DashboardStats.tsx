import React from 'react';
import { motion } from 'motion/react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
  sub?: string;
  trend?: { up: boolean; percent: number };
}

export function StatCard({ icon, label, value, bg, sub, trend }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${bg} rounded-2xl p-4 sm:p-5`}
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center">
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs font-bold ${
              trend.up ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.up ? '↑' : '↓'} {trend.percent}%
          </span>
        )}
      </div>
      <p className="text-stone-500 mb-1" style={{ fontSize: 11, fontWeight: 600 }}>
        {label}
      </p>
      <p className="text-stone-900 mb-1" style={{ fontSize: 24, fontWeight: 800 }}>
        {value}
      </p>
      {sub && (
        <p className="text-stone-400" style={{ fontSize: 11 }}>
          {sub}
        </p>
      )}
    </motion.div>
  );
}

interface DashboardStatsProps {
  stats: {
    totalProducts: number;
    totalOrders: number;
    pendingOrders: number;
    revenue: number;
    lowStockCount: number;
  };
  loading?: boolean;
}

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
      <StatCard
        icon={<span style={{ fontSize: 20 }}>📦</span>}
        label="สินค้าทั้งหมด"
        value={loading ? '…' : String(stats.totalProducts)}
        bg="bg-blue-50"
      />
      <StatCard
        icon={<span style={{ fontSize: 20 }}>📊</span>}
        label="ออเดอร์ทั้งหมด"
        value={loading ? '…' : String(stats.totalOrders)}
        bg="bg-purple-50"
      />
      <StatCard
        icon={<span style={{ fontSize: 20 }}>⏱️</span>}
        label="รอดำเนินการ"
        value={loading ? '…' : String(stats.pendingOrders)}
        bg="bg-yellow-50"
      />
      <StatCard
        icon={<span style={{ fontSize: 20 }}>💰</span>}
        label="รายได้รวม"
        value={loading ? '…' : `฿${stats.revenue.toLocaleString()}`}
        bg="bg-green-50"
      />
      <StatCard
        icon={<span style={{ fontSize: 20 }}>⚠️</span>}
        label="ใกล้หมดสต็อก"
        value={loading ? '…' : String(stats.lowStockCount)}
        bg="bg-red-50"
      />
    </div>
  );
}
