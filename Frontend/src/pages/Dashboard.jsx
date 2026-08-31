
import {
  ArrowRight,
  Clock3,
  FolderKanban,
  MoreHorizontal,
  Sparkles,
  TrendingUp,
  Users
} from "lucide-react";

import {
  useEffect,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import {
  useAuth
} from "../context/AuthContext";

import {
  getGenerations
} from "../services/generationService";

import {
  getProjects
} from "../services/projectService";

import Loader from "../components/Loader";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";

const Dashboard = () => {
  const { user } =
    useAuth();

  const [generations, setGenerations] =
    useState([]);

  const [projects, setProjects] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadDashboard =
      async () => {
        try {
          const [
            generationsResult,
            projectsResult
          ] = await Promise.all([
            getGenerations({
              limit: 50
            }),
            getProjects()
          ]);

          setGenerations(
            generationsResult.data || []
          );

          setProjects(
            projectsResult.data || []
          );
        } finally {
          setLoading(false);
        }
      };

    loadDashboard();
  }, []);

  if (loading) {
    return <Loader />;
  }

  const totalTokens =
    generations.reduce(
      (
        total,
        generation
      ) =>
        total +
        (generation.tokensUsed ||
          0),
      0
    );

  const chartData =
    buildChartData(
      generations
    );

  return (
    <div className="dashboard-page">
      <div className="page-header dashboard-header">
        <div>
          <span className="eyebrow">
            OVERVIEW
          </span>

          <h1>
            Good morning,{" "}
            <span>
              {user?.name?.split(" ")[0]}
            </span>
            .
          </h1>

          <p>
            Here's what's happening in
            your workspace today.
          </p>
        </div>

        <Link
          to="/workspace"
          className="btn btn-primary"
        >
          <Sparkles size={17} />
          Create with AI
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total generations"
          value={generations.length}
          icon={Sparkles}
          detail="+12%"
        />

        <StatCard
          title="Active projects"
          value={projects.length}
          icon={FolderKanban}
          detail="+3"
        />

        <StatCard
          title="Tokens used"
          value={formatNumber(
            totalTokens
          )}
          icon={TrendingUp}
        />

        <StatCard
          title="Current plan"
          value={
            user?.plan
              ?.charAt(0)
              .toUpperCase() +
              user?.plan?.slice(1)
          }
          icon={Users}
        />
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card chart-card">
          <div className="card-header">
            <div>
              <span className="card-eyebrow">
                ACTIVITY
              </span>
              <h2>
                Generation activity
              </h2>
            </div>

            <button
              className="select-button"
              type="button"
            >
              Last 7 days
            </button>
          </div>

          <div className="chart-container">
            {chartData.length ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={chartData}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="rgba(17,17,17,.08)"
                  />

                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12
                    }}
                    allowDecimals={false}
                  />

                  <Tooltip
                    cursor={{
                      fill: "rgba(17,17,17,.04)"
                    }}
                  />

                  <Bar
                    dataKey="generations"
                    radius={[
                      5,
                      5,
                      0,
                      0
                    ]}
                    fill="currentColor"
                    className="chart-bar"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="No activity yet"
                description="Create your first AI generation to see activity here."
              />
            )}
          </div>
        </section>

        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <span className="card-eyebrow">
                PROJECTS
              </span>
              <h2>
                Your projects
              </h2>
            </div>

            <Link
              to="/projects"
              className="card-link"
            >
              View all
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="project-list">
            {projects.length ? (
              projects
                .slice(0, 5)
                .map((project) => (
                  <div
                    className="mini-project"
                    key={project._id}
                  >
                    <div
                      className="project-color"
                      style={{
                        background:
                          project.color ||
                          "#111"
                      }}
                    />

                    <div>
                      <strong>
                        {project.name}
                      </strong>
                      <span>
                        {project.description ||
                          "AI workspace"}
                      </span>
                    </div>

                    <MoreHorizontal
                      size={17}
                    />
                  </div>
                ))
            ) : (
              <EmptyState
                title="No projects"
                description="Create a project to organize your AI work."
                action={
                  <Link
                    to="/projects"
                    className="btn btn-dark btn-small"
                  >
                    Create project
                  </Link>
                }
              />
            )}
          </div>
        </section>
      </div>

      <section className="dashboard-card recent-card">
        <div className="card-header">
          <div>
            <span className="card-eyebrow">
              RECENT WORK
            </span>
            <h2>
              Latest generations
            </h2>
          </div>

          <Link
            to="/history"
            className="card-link"
          >
            View history
            <ArrowRight size={15} />
          </Link>
        </div>

        {generations.length ? (
          <div className="generation-table">
            {generations
              .slice(0, 5)
              .map(
                (generation) => (
                  <div
                    className="generation-row"
                    key={
                      generation._id
                    }
                  >
                    <div className="generation-type">
                      <Sparkles
                        size={16}
                      />
                    </div>

                    <div className="generation-main">
                      <strong>
                        {generation.prompt}
                      </strong>

                      <span>
                        {generation.type} ·{" "}
                        {generation.project
                          ?.name ||
                          "Project"}
                      </span>
                    </div>

                    <div className="generation-time">
                      <Clock3
                        size={14}
                      />
                      {formatDate(
                        generation.createdAt
                      )}
                    </div>
                  </div>
                )
              )}
          </div>
        ) : (
          <EmptyState
            title="Your history is empty"
            description="Start a generation from the AI workspace."
            action={
              <Link
                to="/workspace"
                className="btn btn-primary btn-small"
              >
                Open workspace
              </Link>
            }
          />
        )}
      </section>
    </div>
  );
};

const buildChartData = (
  generations
) => {
  const days = [];

  for (
    let index = 6;
    index >= 0;
    index -= 1
  ) {
    const date = new Date();

    date.setDate(
      date.getDate() - index
    );

    days.push(date);
  }

  return days.map((date) => {
    const dateKey =
      date.toISOString().slice(
        0,
        10
      );

    const count =
      generations.filter(
        (generation) =>
          generation.createdAt?.slice(
            0,
            10
          ) === dateKey
      ).length;

    return {
      day: date.toLocaleDateString(
        "en-US",
        {
          weekday: "short"
        }
      ),
      generations: count
    };
  });
};

const formatNumber = (
  number
) =>
  new Intl.NumberFormat(
    "en-US",
    {
      notation:
        number > 9999
          ? "compact"
          : "standard"
    }
  ).format(number);

const formatDate = (
  date
) => {
  if (!date) {
    return "Recently";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric"
    }
  ).format(new Date(date));
};

export default Dashboard;
