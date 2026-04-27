const Input = ({ icon, className = "", ...props }) => (
  <div className="relative w-full">
    {icon && (
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
        {icon}
      </span>
    )}
    <input
      className={`w-full h-10 rounded-lg border border-gray-700 bg-gray-800 text-sm text-gray-100 placeholder-gray-500 shadow-sm transition-colors duration-150 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
        icon ? "pl-10 pr-3" : "px-3"
      } ${className}`}
      {...props}
    />
  </div>
);

export default Input;
