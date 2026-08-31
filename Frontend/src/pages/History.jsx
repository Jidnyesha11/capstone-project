
import {
  Calendar,
  Copy,
  Search,
  Sparkles,
  Trash2
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  getGenerations,
  deleteGeneration
} from "../services/generationService";

import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";

const History = () => {
  const [generations, setGenerations] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [type, setType] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [toast, setToast] =
    useState("");

  const loadHistory =
    useCallback(
      async () => {
        setLoading(true);

        try {
          const result =
            await getGenerations({
              search,
              type,
              limit: 50
            });

          setGenerations(
            result.data || []
          );
        } catch (requestError) {
          setError(
            requestError.response
              ?.data?.message ||
              "Unable to load history."
          );
        } finally {
          setLoading(false);
        }
      },
      [search, type]
    );

  useEffect(() => {
    const timer =
      setTimeout(
        loadHistory,
        250
      );

    return () =>
      clearTimeout(timer);
  }, [loadHistory]);

  const removeGeneration =
    async (id) => {
      try {
        await deleteGeneration(
          id
        );

        setGenerations(
          (current) =>
            current.filter(
              (item) =>
                item._id !== id
            )
        );

        setToast(
          "Generation deleted."
        );
      } catch (requestError) {
        setError(
          requestError.response
            ?.data?.message ||
            "Unable to delete generation."
        );
      }
    };

  const copyGeneration =
    async (text) => {
      await navigator.clipboard.writeText(
        text
      );

      setToast(
        "Copied to clipboard."
      );
    };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="standard-page">
      <Toast
        message={toast}
        onClose={() =>
          setToast("")
        }
      />

      <div className="page-header">
        <div>
          <span className="eyebrow">
            WORKSPACE
          </span>

          <h1>
            Generation history
          </h1>

          <p>
            Everything you've created,
            all in one place.
          </p>
        </div>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="history-toolbar">
        <div className="search-field">
          <Search size={17} />

          <input
            type="search"
            placeholder="Search generations..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>

        <select
          value={type}
          onChange={(event) =>
            setType(
              event.target.value
            )
          }
        >
          <option value="">
            All types
          </option>
          <option value="general">
            General
          </option>
          <option value="blog">
            Blog
          </option>
          <option value="marketing">
            Marketing
          </option>
          <option value="social">
            Social
          </option>
          <option value="email">
            Email
          </option>
          <option value="summary">
            Summary
          </option>
        </select>
      </div>

      {generations.length ? (
        <div className="history-list">
          {generations.map(
            (generation) => (
              <article
                className="history-card"
                key={
                  generation._id
                }
              >
                <div className="history-card-icon">
                  <Sparkles size={18} />
                </div>

                <div className="history-card-body">
                  <div className="history-card-meta">
                    <span>
                      {generation.type}
                    </span>

                    <span>
                      {generation.project
                        ?.name ||
                        "Project"}
                    </span>

                    <span>
                      <Calendar
                        size={13}
                      />
                      {formatDate(
                        generation.createdAt
                      )}
                    </span>
                  </div>

                  <h3>
                    {generation.prompt}
                  </h3>

                  <p>
                    {generation.result}
                  </p>

                  <div className="history-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-small"
                      onClick={() =>
                        copyGeneration(
                          generation.result
                        )
                      }
                    >
                      <Copy
                        size={14}
                      />
                      Copy
                    </button>

                    <button
                      type="button"
                      className="btn btn-ghost-danger btn-small"
                      onClick={() =>
                        removeGeneration(
                          generation._id
                        )
                      }
                    >
                      <Trash2
                        size={14}
                      />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            )
          )}
        </div>
      ) : (
        <EmptyState
          title="No generations found"
          description={
            search
              ? "Try a different search term."
              : "Your generated content will appear here."
          }
        />
      )}
    </div>
  );
};

const formatDate = (
  date
) => {
  if (!date) {
    return "Recently";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle: "medium"
    }
  ).format(new Date(date));
};

export default History;
