import {
  BookOpen,
  Users,
  RefreshCw,
  BarChart3,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";

import "./FeaturesSection.css";

const features = [
  {
    icon: BookOpen,
    title: "Smart Book Management",
    description:
      "Organize, manage and track your entire book collection from one centralized platform.",
  },
  {
    icon: Users,
    title: "Student Management",
    description:
      "Maintain student records and manage library members with ease.",
  },
  {
    icon: RefreshCw,
    title: "Easy Book Circulation",
    description:
      "Simplify book issuing, returns, renewals and borrowing activities.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "Get useful insights into library activities, book availability and transactions.",
  },
  {
    icon: ShieldCheck,
    title: "Organized Access",
    description:
      "Provide separate and organized access for administrators and students.",
  },
  {
    icon: LayoutDashboard,
    title: "Dedicated Dashboards",
    description:
      "Manage everyday library operations through simple and intuitive dashboards.",
  },
];

const FeaturesSection = () => {
  return (
   <section className="features-section" id="features">
      <div className="features-container">

        <div className="features-heading">
          <span className="features-label">POWERFUL FEATURES</span>

          <h2>
            Everything You Need to
            <span> Manage Your Library.</span>
          </h2>

          <p>
            Discover powerful tools designed to simplify library
            management and improve everyday operations.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div className="feature-card" key={index}>
                <div className="feature-icon">
                  <Icon size={25} />
                </div>

                <h3>{feature.title}</h3>

                <p>{feature.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;