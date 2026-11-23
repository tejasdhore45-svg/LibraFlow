import { Check, ArrowRight } from "lucide-react";
import "./PricingSection.css";

const plans = [
  {
    name: "Starter",
    description: "Perfect for small libraries getting started.",
    price: "₹499",
    features: [
      "Up to 500 Books",
      "Up to 100 Students",
      "Book Management",
      "Issue & Return Management",
      "Basic Reports",
      "Email Support",
    ],
    popular: false,
  },
  {
    name: "Professional",
    description: "Everything you need to manage your library.",
    price: "₹999",
    features: [
      "Unlimited Books",
      "Up to 1,000 Students",
      "Advanced Book Management",
      "Issue & Return Tracking",
      "Detailed Analytics",
      "Student Management",
      "Priority Support",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Advanced solutions for growing libraries.",
    price: "Custom",
    features: [
      "Unlimited Books",
      "Unlimited Students",
      "All Professional Features",
      "Advanced Reports",
      "Multiple Library Management",
      "Dedicated Support",
      "Custom Solutions",
    ],
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section className="pricing-section" id="pricing">
      <div className="pricing-container">

        <div className="pricing-heading">
          <span className="pricing-label">SIMPLE PRICING</span>
          <h2>
            Plans That Grow With
            <span> Your Library.</span>
          </h2>
          <p>
            Choose the right plan to simplify your library management.
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <div
              className={`pricing-card ${plan.popular ? "popular" : ""}`}
              key={plan.name}
            >
              {plan.popular && (
                <span className="popular-badge">MOST POPULAR</span>
              )}

              <h3>{plan.name}</h3>
              <p className="plan-description">{plan.description}</p>

              <div className="plan-price">
                <h2>{plan.price}</h2>
                {plan.price !== "Custom" && <span>/ month</span>}
              </div>

              <button className="pricing-button">
                Get Started <ArrowRight size={17} />
              </button>

              <div className="plan-divider"></div>

              <h4>What's included:</h4>

              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={18} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PricingSection;