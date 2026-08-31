
import {
  ArrowRight,
  Check,
  ChevronRight,
  Play,
  Sparkles,
  WandSparkles,
  BarChart3,
  ShieldCheck,
  Zap
} from "lucide-react";

import {
  Link
} from "react-router-dom";

const Landing = () => {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <Link
          to="/"
          className="landing-logo"
        >
          <div className="logo-mark">
            <Sparkles size={19} />
          </div>

          Nexa<span>AI</span>
        </Link>

        <div className="landing-nav-links">
          <a href="#features">
            Features
          </a>

          <a href="#workflow">
            Workflow
          </a>

          <a href="#pricing">
            Pricing
          </a>
        </div>

        <div className="landing-actions">
          <Link
            to="/login"
            className="landing-login"
          >
            Log in
          </Link>

          <Link
            to="/register"
            className="btn btn-dark"
          >
            Get started
            <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="hero-badge">
          <span className="pulse-dot" />
          AI productivity, reimagined
          <ChevronRight size={14} />
        </div>

        <h1>
          Turn ideas into
          <span className="hero-gradient">
            {" "}impact.
          </span>
        </h1>

        <p className="hero-description">
          NexaAI is your intelligent workspace
          for creating, organizing and
          accelerating content with AI.
        </p>

        <div className="hero-actions">
          <Link
            to="/register"
            className="btn btn-primary btn-large"
          >
            Start creating
            <ArrowRight size={18} />
          </Link>

          <a
            href="#workflow"
            className="hero-secondary"
          >
            <span className="play-icon">
              <Play
                size={13}
                fill="currentColor"
              />
            </span>
            See how it works
          </a>
        </div>

        <div className="hero-proof">
          <div className="proof-avatars">
            <span>A</span>
            <span>R</span>
            <span>M</span>
            <span>J</span>
          </div>

          <div>
            <strong>
              Built for modern teams
            </strong>
            <small>
              Create faster. Think bigger.
            </small>
          </div>
        </div>
      </section>

      <section
        className="product-preview"
        id="workflow"
      >
        <div className="preview-window">
          <div className="preview-topbar">
            <div className="preview-dots">
              <span />
              <span />
              <span />
            </div>

            <span>
              app.nexaai.local
            </span>

            <div />
          </div>

          <div className="preview-body">
            <div className="preview-sidebar">
              <div className="preview-logo">
                <Sparkles size={14} />
                NexaAI
              </div>

              <span className="preview-active">
                Overview
              </span>

              <span>
                AI Workspace
              </span>

              <span>
                Projects
              </span>

              <span>
                History
              </span>
            </div>

            <div className="preview-content">
              <small>
                MONDAY, AUGUST 31
              </small>

              <h3>
                Good morning, Jidnyesha
              </h3>

              <p>
                What will you create today?
              </p>

              <div className="preview-stats">
                <div>
                  <span>Generations</span>
                  <strong>128</strong>
                </div>

                <div>
                  <span>Projects</span>
                  <strong>12</strong>
                </div>

                <div>
                  <span>Tokens</span>
                  <strong>24.8K</strong>
                </div>
              </div>

              <div className="preview-chart">
                <div className="chart-bars">
                  {[38, 52, 44, 69, 55, 78, 65, 91, 72, 84].map(
                    (height, index) => (
                      <i
                        key={index}
                        style={{
                          height: `${height}%`
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="features-section"
        id="features"
      >
        <div className="section-heading">
          <span>POWERFUL BY DEFAULT</span>
          <h2>
            Everything you need
            <br />
            to create at your best.
          </h2>
        </div>

        <div className="features-grid">
          <Feature
            icon={WandSparkles}
            title="AI Workspace"
            text="Generate blogs, marketing copy, social posts, emails and more from one focused workspace."
          />

          <Feature
            icon={BarChart3}
            title="Usage analytics"
            text="Understand your AI activity with clean, actionable generation and usage insights."
          />

          <Feature
            icon={ShieldCheck}
            title="Secure by design"
            text="JWT authentication, protected APIs and role-based access keep your workspace secure."
          />

          <Feature
            icon={Zap}
            title="Built for speed"
            text="A responsive architecture designed to feel fast on desktop, tablet and mobile."
          />
        </div>
      </section>

      <section
        className="pricing-section"
        id="pricing"
      >
        <div className="section-heading center">
          <span>SIMPLE PLANS</span>
          <h2>
            Start free.
            <br />
            Scale when you need to.
          </h2>
        </div>

        <div className="pricing-grid">
          <PriceCard
            title="Free"
            price="$0"
            text="For trying NexaAI."
            features={[
              "50 generations / month",
              "3 projects",
              "Generation history"
            ]}
          />

          <PriceCard
            featured
            title="Pro"
            price="$19"
            text="For serious creators."
            features={[
              "Unlimited projects",
              "Advanced analytics",
              "Priority generation"
            ]}
          />

          <PriceCard
            title="Enterprise"
            price="$49"
            text="For growing teams."
            features={[
              "Team workspaces",
              "Admin controls",
              "Advanced usage insights"
            ]}
          />
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-logo">
          <div className="logo-mark">
            <Sparkles size={17} />
          </div>
          Nexa<span>AI</span>
        </div>

        <span>
          Built as a full-stack MERN capstone.
        </span>
      </footer>
    </div>
  );
};

const Feature = ({
  icon: Icon,
  title,
  text
}) => (
  <div className="feature-card">
    <div className="feature-icon">
      <Icon size={20} />
    </div>

    <h3>{title}</h3>
    <p>{text}</p>
  </div>
);

const PriceCard = ({
  featured = false,
  title,
  price,
  text,
  features
}) => (
  <div
    className={`price-card ${
      featured
        ? "featured"
        : ""
    }`}
  >
    {featured && (
      <span className="popular-badge">
        MOST POPULAR
      </span>
    )}

    <span className="price-title">
      {title}
    </span>

    <div className="price-value">
      {price}
      <small>/month</small>
    </div>

    <p>{text}</p>

    <ul>
      {features.map(
        (feature) => (
          <li key={feature}>
            <Check size={16} />
            {feature}
          </li>
        )
      )}
    </ul>

    <Link
      to="/register"
      className={`btn ${
        featured
          ? "btn-primary"
          : "btn-outline"
      }`}
    >
      Get started
      <ArrowRight size={16} />
    </Link>
  </div>
);

export default Landing;
