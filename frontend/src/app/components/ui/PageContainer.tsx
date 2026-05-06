import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  background?: 'warm' | 'white' | 'gradient';
}

/**
 * PageContainer: Consistent max-width, padding, and background for all marketplace screens.
 * Ensures responsive behavior and proper spacing across devices.
 */
export function PageContainer({
  children,
  className = '',
  background = 'warm',
}: PageContainerProps) {
  const bgClasses = {
    warm: 'bg-gradient-to-b from-orange-50 to-stone-50',
    white: 'bg-white',
    gradient: 'bg-gradient-to-br from-orange-50 via-stone-50 to-white',
  };

  return (
    <div className={`min-h-screen flex flex-col ${bgClasses[background]} pb-24 ${className}`}>
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex-1 py-4">
        {children}
      </div>
    </div>
  );
}
