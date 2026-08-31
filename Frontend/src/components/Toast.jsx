
import {
  CheckCircle2,
  XCircle
} from "lucide-react";

const Toast = ({
  message,
  type = "success",
  onClose
}) => {
  if (!message) {
    return null;
  }

  const Icon =
    type === "error"
      ? XCircle
      : CheckCircle2;

  return (
    <div
      className={`toast toast-${type}`}
      onClick={onClose}
    >
      <Icon size={18} />
      <span>{message}</span>
    </div>
  );
};

export default Toast;
