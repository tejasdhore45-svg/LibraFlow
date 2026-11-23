import {
  ArrowRight,
  Play,
  BookOpen,
  Users,
  TrendingUp,
  CheckCircle2,
  Library,
} from "lucide-react";

import "./HeroSection.css";

const HeroSection = () => {
  return (
    <section className="hero-section" id="home">
      <div className="hero-container">

        {/* LEFT CONTENT */}
        <div className="hero-content">

          <div className="hero-badge">
            <span className="badge-dot"></span>
            Smart Library Management Platform
          </div>

          <h1>
            Manage Your Library.
            <br />
            <span>Empower Your Future.</span>
          </h1>

          <p className="hero-description">
            Simplify your library operations with LibraFlow.
            Manage books, students, borrowing and daily activities
            through one powerful and intelligent platform.
          </p>

          {/* ACTION BUTTONS */}
          <div className="hero-buttons">

            <a href="/signup" className="hero-primary-btn">
              Get Started
              <ArrowRight size={19} />
            </a>

            <a href="#features" className="hero-secondary-btn">
              <Play size={17} />
              Explore Features
            </a>

          </div>

          {/* TRUST POINTS */}
          <div className="hero-trust">

            <div>
              <CheckCircle2 size={17} />
              Easy to Use
            </div>

            <div>
              <CheckCircle2 size={17} />
              Secure Platform
            </div>

            <div>
              <CheckCircle2 size={17} />
              All-in-One Solution
            </div>

          </div>

        </div>

        {/* RIGHT VISUAL */}
        <div className="hero-visual">

          <div className="hero-glow"></div>

          {/* DASHBOARD PREVIEW */}
          <div className="dashboard-preview">

            <div className="preview-header">

              <div className="preview-brand">
                <div className="preview-logo">
                  <Library size={19} />
                </div>

                <span>LibraFlow</span>
              </div>

              <div className="preview-profile">
                <span></span>
                Admin
              </div>

            </div>

            <div className="preview-body">

              <div className="preview-welcome">
                <div>
                  <h3>Dashboard Overview</h3>
                  <p>Welcome back, Admin!</p>
                </div>

                <div className="preview-date">
                  Overview
                </div>
              </div>

              {/* STATISTICS */}
              <div className="preview-stats">

                <div className="preview-stat-card">
                  <div className="stat-icon purple">
                    <BookOpen size={18} />
                  </div>

                  <p>Total Books</p>
                  <h3>2,450</h3>
                  <small>Library collection</small>
                </div>

                <div className="preview-stat-card">
                  <div className="stat-icon blue">
                    <Users size={18} />
                  </div>

                  <p>Total Students</p>
                  <h3>1,280</h3>
                  <small>Active members</small>
                </div>

              </div>

              {/* ACTIVITY CARD */}
              <div className="preview-activity">

                <div className="activity-heading">
                  <h4>Library Activity</h4>

                  <span>
                    <TrendingUp size={15} />
                    Active
                  </span>
                </div>

                <div className="activity-item">
                  <div className="activity-book">
                    <BookOpen size={17} />
                  </div>

                  <div>
                    <strong>Books Issued</strong>
                    <p>Recently borrowed books</p>
                  </div>

                  <b>+24</b>
                </div>

                <div className="activity-item">
                  <div className="activity-book blue">
                    <Users size={17} />
                  </div>

                  <div>
                    <strong>New Members</strong>
                    <p>Recently registered students</p>
                  </div>

                  <b>+12</b>
                </div>

              </div>

            </div>

          </div>

          {/* FLOATING CARD 1 */}
          <div className="floating-card floating-card-top">
            <div className="floating-icon">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <strong>Smart Management</strong>
              <p>Everything organized</p>
            </div>
          </div>

          {/* FLOATING CARD 2 */}
          <div className="floating-card floating-card-bottom">
            <div className="floating-icon blue">
              <TrendingUp size={20} />
            </div>

            <div>
              <strong>Efficient Operations</strong>
              <p>Save time every day</p>
            </div>
          </div>

        </div>

      </div>

      <div className="hero-bottom-gradient"></div>

    </section>
  );
};

export default HeroSection;