import {
  UserPlus,
  Settings,
  LibraryBig,
  ArrowRight,
} from "lucide-react";

import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Register your library and set up your LibraFlow account in just a few simple steps.",
  },
  {
    number: "02",
    icon: Settings,
    title: "Set Up Your Library",
    description:
      "Add books, organize student records and configure your library management system.",
  },
  {
    number: "03",
    icon: LibraryBig,
    title: "Manage Everything",
    description:
      "Start managing books, issuing returns and monitoring daily library activities.",
  },
];

const HowItWorks = () => {
  return (
   <section className="how-section" id="how-it-works">
      <div className="how-container">

        <div className="how-heading">
          <span className="how-label">GETTING STARTED</span>

          <h2>
            Get Started with
            <span> Three Simple Steps.</span>
          </h2>

          <p>
            Managing your library has never been easier.
            Get started with LibraFlow in three simple steps.
          </p>
        </div>

        <div className="how-grid">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div className="how-card" key={step.number}>

                <div className="how-card-top">
                  <span className="how-number">{step.number}</span>

                  <div className="how-icon">
                    <Icon size={26} />
                  </div>
                </div>

                <h3>{step.title}</h3>

                <p>{step.description}</p>

                {index !== 2 && (
                  <ArrowRight className="how-arrow" size={22} />
                )}

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;