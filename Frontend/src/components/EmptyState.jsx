
import {
  Sparkles
} from "lucide-react";

const EmptyState = ({
  title,
  description,
  action
}) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Sparkles size={24} />
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      {action}
    </div>
  );
};

export default EmptyState;
