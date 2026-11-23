import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";
import "./PublicFooter.css";

const PublicFooter = () => {
  return (
    <footer className="public-footer">
      <div className="footer-container">

        {/* Brand Information */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-icon">
              <BookOpen size={25} />
            </span>
            <span>LibraFlow</span>
          </Link>

          <p>
            Simplify your library operations with smarter,
            faster, and more efficient library management.
          </p>

          <div className="footer-socials">
  <a href="#" aria-label="Facebook">f</a>
  <a href="#" aria-label="Instagram">◎</a>
  <a href="#" aria-label="LinkedIn">in</a>
</div>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <a href="/#features">Features</a>
          <a href="/#pricing">Pricing</a>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </div>

        {/* Services */}
        <div className="footer-links">
          <h3>Our Platform</h3>
          <a href="/#features">Book Management</a>
          <a href="/#features">Student Management</a>
          <a href="/#features">Issue & Return</a>
          <a href="/#features">Reports & Analytics</a>
          <a href="/#features">Library Dashboard</a>
        </div>

        {/* Contact */}
        <div className="footer-contact">
          <h3>Get In Touch</h3>

          <p>
            <Mail size={17} />
            <span>support@libraflow.com</span>
          </p>

          <p>
            <Phone size={17} />
            <span>+91 XXXXX XXXXX</span>
          </p>

          <p>
            <MapPin size={17} />
            <span>India</span>
          </p>

          <a href="mailto:support@libraflow.com" className="footer-contact-btn">
            Contact Us <ArrowRight size={16} />
          </a>
        </div>

      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} LibraFlow. All rights reserved.
        </p>

        <div>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms & Conditions</a>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;