
const StatCard = ({
  title,
  value,
  icon: Icon,
  detail,
  className = ""
}) => {
  return (
    <div
      className={`stat-card ${className}`}
    >
      <div className="stat-card-top">
        <div className="stat-icon">
          <Icon size={20} />
        </div>

        {detail && (
          <span className="stat-detail">
            {detail}
          </span>
        )}
      </div>

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-title">
        {title}
      </div>
    </div>
  );
};

export default StatCard;