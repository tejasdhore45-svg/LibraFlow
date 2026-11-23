import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import "./CTASection.css";

const CTASection = () => {
  return (
    <section className="cta-section">
      <div className="cta-container">

        <div className="cta-content">
          <span className="cta-label">
            <Sparkles size={15} /> START YOUR JOURNEY
          </span>

          <h2>
            Ready to Transform
            <span> Your Library?</span>
          </h2>

          <p>
            Simplify your daily operations, manage your books efficiently,
            and create a smarter library experience with LibraFlow.
          </p>

          <div className="cta-buttons">
            <Link to="/signup" className="cta-primary">
              Get Started Now <ArrowRight size={18} />
            </Link>

            <Link to="/login" className="cta-secondary">
              Explore Your Account
            </Link>
          </div>

          <div className="cta-note">
            <BookOpen size={17} />
            <span>Smarter Library Management Starts Here.</span>
          </div>
        </div>

        <div className="cta-decoration">
          <div className="cta-circle">
            <BookOpen size={75} strokeWidth={1.3} />
          </div>
        </div>

      </div>
    </section>
  );
};

export default CTASection;