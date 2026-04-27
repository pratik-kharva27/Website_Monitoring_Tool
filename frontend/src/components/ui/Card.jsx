const Card = ({ children, className = "" }) => (
  <div
    className={`bg-gray-900 rounded-xl border border-gray-800 shadow-card ${className}`}
  >
    {children}
  </div>
);

export default Card;
