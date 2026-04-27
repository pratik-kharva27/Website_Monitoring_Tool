const base =
  "inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed";

const sizes = {
  sm: "h-8 px-3",
  md: "h-10 px-4",
};

const variants = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 shadow-sm",
  secondary:
    "bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700 hover:border-gray-600",
  ghost: "text-gray-300 hover:bg-gray-800",
};

const Button = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) => (
  <button
    className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
