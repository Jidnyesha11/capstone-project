
import {
  ArrowLeft,
  Sparkles
} from "lucide-react";

import {
  Link
} from "react-router-dom";

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-icon">
        <Sparkles size={25} />
      </div>

      <span>
        404
      </span>

      <h1>
        Page not found.
      </h1>

      <p>
        The page you're looking for
        doesn't exist or has moved.
      </p>

      <Link
        to="/"
        className="btn btn-primary"
      >
        <ArrowLeft size={16} />
        Back home
      </Link>
    </div>
  );
};

export default NotFound;
