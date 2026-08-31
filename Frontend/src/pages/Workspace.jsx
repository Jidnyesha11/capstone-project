
import {
  ArrowRight,
  Copy,
  FileText,
  Mail,
  Megaphone,
  RefreshCw,
  Sparkles,
  Check,
  Share2
} from "lucide-react";

import {
  useEffect,
  useState
} from "react";

import {
  useSearchParams
} from "react-router-dom";

import {
  createGeneration
} from "../services/generationService";

import {
  getProjects
} from "../services/projectService";

import Loader from "../components/Loader";
import Toast from "../components/Toast";

const Workspace = () => {
  const [
    searchParams
  ] = useSearchParams();

  const [projects, setProjects] =
    useState([]);

  const [projectId, setProjectId] =
    useState(
      searchParams.get(
        "project"
      ) || ""
    );

  const [type, setType] =
    useState("general");

  const [prompt, setPrompt] =
    useState("");

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [generating, setGenerating] =
    useState(false);

  const [error, setError] =
    useState("");

  const [toast, setToast] =
    useState("");

  useEffect(() => {
    const loadProjects =
      async () => {
        try {
          const response =
            await getProjects();

          const data =
            response.data || [];

          setProjects(data);

          if (
            !projectId &&
            data.length
          ) {
            setProjectId(
              data[0]._id
            );
          }
        } catch (requestError) {
          setError(
            requestError.response
              ?.data?.message ||
              "Unable to load projects."
          );
        } finally {
          setLoading(false);
        }
      };

    loadProjects();
  }, [projectId]);

  const handleGenerate =
    async (event) => {
      event.preventDefault();

      if (!projectId) {
        setError(
          "Create or select a project first."
        );
        return;
      }

      if (!prompt.trim()) {
        setError(
          "Enter a prompt to generate content."
        );
        return;
      }

      setGenerating(true);
      setError("");

      try {
        const response =
          await createGeneration({
            projectId,
            type,
            prompt
          });

        setResult(
          response.data
        );

        setToast(
          "Content generated successfully."
        );
      } catch (requestError) {
        setError(
          requestError.response
            ?.data?.message ||
            "Generation failed."
        );
      } finally {
        setGenerating(false);
      }
    };

  const copyResult = async () => {
    if (!result?.result) {
      return;
    }

    await navigator.clipboard.writeText(
      result.result
    );

    setToast(
      "Copied to clipboard."
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="workspace-page">
      <Toast
        message={toast}
        onClose={() =>
          setToast("")
        }
      />

      <div className="page-header">
        <div>
          <span className="eyebrow">
            AI WORKSPACE
          </span>

          <h1>
            Create something great.
          </h1>

          <p>
            Tell NexaAI what you need.
            We'll help you shape it.
          </p>
        </div>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {!projects.length ? (
        <div className="workspace-empty">
          <div className="empty-icon">
            <Sparkles size={24} />
          </div>

          <h2>
            Create a project first
          </h2>

          <p>
            Every generation belongs to a
            project.
          </p>

          <a
            href="/projects"
            className="btn btn-primary"
          >
            Create project
            <ArrowRight size={17} />
          </a>
        </div>
      ) : (
        <div className="workspace-layout">
          <section className="generator-card">
            <div className="generator-top">
              <div className="ai-badge">
                <Sparkles size={16} />
                NexaAI
              </div>

              <span>
                Mock AI Engine
              </span>
            </div>

            <form
              className="generator-form"
              onSubmit={
                handleGenerate
              }
            >
              <div className="field-row">
                <label>
                  Project

                  <select
                    value={projectId}
                    onChange={(event) =>
                      setProjectId(
                        event.target
                          .value
                      )
                    }
                  >
                    {projects.map(
                      (project) => (
                        <option
                          key={
                            project._id
                          }
                          value={
                            project._id
                          }
                        >
                          {project.name}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  Content type

                  <select
                    value={type}
                    onChange={(event) =>
                      setType(
                        event.target
                          .value
                      )
                    }
                  >
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
                </label>
              </div>

              <label className="prompt-label">
                What should we create?

                <textarea
                  value={prompt}
                  onChange={(event) =>
                    setPrompt(
                      event.target
                        .value
                    )
                  }
                  placeholder="Example: Create a launch campaign for a productivity app aimed at students..."
                  rows={10}
                  maxLength={5000}
                />

                <span className="character-count">
                  {prompt.length}
                  {" "}
                  / 5000
                </span>
              </label>

              <div className="prompt-suggestions">
                <button
                  type="button"
                  onClick={() =>
                    setPrompt(
                      "Create a professional product launch announcement for a modern productivity application."
                    )
                  }
                >
                  Product launch
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPrompt(
                      "Write a concise LinkedIn post about the benefits of AI-powered productivity."
                    )
                  }
                >
                  LinkedIn post
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPrompt(
                      "Write an engaging welcome email for new users joining an AI SaaS platform."
                    )
                  }
                >
                  Welcome email
                </button>
              </div>

              <button
                type="submit"
                className="btn btn-primary generate-button"
                disabled={
                  generating
                }
              >
                {generating ? (
                  <>
                    <RefreshCw
                      size={17}
                      className="spin"
                    />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    Generate content
                    <ArrowRight
                      size={17}
                    />
                  </>
                )}
              </button>
            </form>
          </section>

          <section className="result-card">
            <div className="result-header">
              <div>
                <span className="card-eyebrow">
                  OUTPUT
                </span>

                <h2>
                  Your result
                </h2>
              </div>

              {result && (
                <div className="result-actions">
                  <button
                    className="icon-button"
                    type="button"
                    onClick={
                      copyResult
                    }
                    title="Copy"
                  >
                    <Copy
                      size={17}
                    />
                  </button>

                  <button
                    className="icon-button"
                    type="button"
                    title="Share"
                  >
                    <Share2
                      size={17}
                    />
                  </button>
                </div>
              )}
            </div>

            {result ? (
              <div className="result-content">
                <div className="result-meta">
                  <span>
                    {result.type}
                  </span>

                  <span>
                    {result.tokensUsed}
                    {" "}
                    tokens
                  </span>

                  <span>
                    <Check size={13} />
                    Generated
                  </span>
                </div>

                <pre>
                  {result.result}
                </pre>
              </div>
            ) : (
              <div className="result-placeholder">
                <div className="result-placeholder-icon">
                  <Sparkles size={25} />
                </div>

                <h3>
                  Your AI output will
                  appear here.
                </h3>

                <p>
                  Choose a project, describe
                  what you want, and click
                  generate.
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      <div className="workspace-features">
        <WorkspaceFeature
          icon={FileText}
          title="Long-form content"
          text="Create structured drafts and articles."
        />

        <WorkspaceFeature
          icon={Megaphone}
          title="Marketing copy"
          text="Turn ideas into compelling campaigns."
        />

        <WorkspaceFeature
          icon={Mail}
          title="Email writing"
          text="Create clear, polished communication."
        />
      </div>
    </div>
  );
};

const WorkspaceFeature = ({
  icon: Icon,
  title,
  text
}) => (
  <div className="workspace-feature">
    <Icon size={19} />
    <div>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  </div>
);

export default Workspace;
