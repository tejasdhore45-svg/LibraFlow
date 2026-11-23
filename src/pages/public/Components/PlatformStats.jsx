import {
  LayoutDashboard,
  Users,
  BookOpen,
  Clock,
} from "lucide-react";

import "./PlatformStats.css";

const stats = [
  {
    icon: LayoutDashboard,
    value: "01",
    title: "Unified Platform",
    description: "Manage your entire library from one place.",
  },
  {
    icon: Users,
    value: "02",
    title: "Dedicated Portals",
    description: "Separate experiences for administrators and students.",
  },
  {
    icon: BookOpen,
    value: "03",
    title: "Core Operations",
    description: "Organize books, borrowing and returns easily.",
  },
  {
    icon: Clock,
    value: "24/7",
    title: "Easy Access",
    description: "Access your library management platform anytime.",
  },
];

const PlatformStats = () => {
  return (
    <section className="stats-section">
      <div className="stats-container">

        {/* Section Heading */}
        <div className="stats-heading">
          <span className="stats-label">
            LIBRAFLOW AT A GLANCE
          </span>

          <h2>
            Everything Your Library Needs,
            <span> In One Platform.</span>
          </h2>

          <p>
            Simplify everyday library operations with a connected,
            organized and easy-to-use management platform.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <div className="stats-card" key={index}>
                <div className="stats-icon">
                  <Icon size={23} />
                </div>

                <h3>{item.value}</h3>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default PlatformStats;