interface RouteBadgeProps {
  name: string;
  color?: string;
}

export default function RouteBadge({ name, color }: RouteBadgeProps) {
  // Use a default TTC yellow if no color provided, otherwise use the hex
  const style = color ? { backgroundColor: color } : {};
  
  return (
    <span
      style={style}
      className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-bold text-white ${
        !color ? "bg-yellow-400 text-zinc-900" : ""
      }`}
    >
      {name}
    </span>
  );
}
