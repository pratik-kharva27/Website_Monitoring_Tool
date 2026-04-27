const variants = {
  success:
    "bg-green-500/10 text-green-300 ring-1 ring-inset ring-green-500/30",
  danger:
    "bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/30",
  neutral:
    "bg-gray-800 text-gray-300 ring-1 ring-inset ring-gray-700",
};

const dotColors = {
  success: "bg-green-400",
  danger: "bg-red-400",
  neutral: "bg-gray-400",
};

const Badge = ({ variant = "neutral", children, withDot = true }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}
  >
    {withDot && (
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${dotColors[variant]}`}
      />
    )}
    {children}
  </span>
);

export default Badge;
