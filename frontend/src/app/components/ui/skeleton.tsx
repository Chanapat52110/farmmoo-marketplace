/**
 * Skeleton: Loading placeholder for marketplace components.
 * Uses Tailwind animate-pulse for smooth loading feedback.
 */
function clsx(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={clsx("bg-stone-200 animate-pulse rounded-lg", className)}
      {...props}
    />
  );
}

export { Skeleton };
