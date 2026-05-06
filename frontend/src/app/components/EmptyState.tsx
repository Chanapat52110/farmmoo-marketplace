interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {icon && (
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <p className="text-stone-700" style={{ fontSize: 18, fontWeight: 700 }}>
        {title}
      </p>
      {description && (
        <p className="text-stone-400 mt-2" style={{ fontSize: 14, lineHeight: 1.6 }}>
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
