"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "../../utils/useSubscription";

interface Plan {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta?: string;
}

interface PricingProps {
  plans: Plan[];
}

const Pricing = React.forwardRef<HTMLElement, PricingProps>(({ plans }, ref) => {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { data: sub } = useSubscription();

  const handleCheckout = async (plan: string, isFree: boolean) => {
    if (isFree) {
      router.push("/signup");
      return;
    }
    setLoadingPlan(plan);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: plan.toLowerCase() }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Checkout failed");
      setLoadingPlan(null);
    }
  };

  return (
    <section ref={ref as React.RefObject<HTMLElement>} id="pricing" className="py-16 px-4 bg-black bg-opacity-70">
      <h2 className="text-3xl font-bold text-center mb-10">Pricing</h2>
      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isFree = plan.price.startsWith("$") ? plan.price === "$0" : false;
          const isCurrent = sub?.plan?.toLowerCase() === plan.name.toLowerCase();
          return (
            <div
              key={plan.name}
              className="flex flex-col bg-gray-800 rounded-xl p-8 shadow-lg w-full md:w-1/3 hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="text-xl font-semibold mb-2 text-center">{plan.name}</div>
              <div className="text-4xl font-extrabold text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
                {plan.price}
              </div>
              <div className="text-gray-300 mb-4 text-center">{plan.description}</div>
              <ul className="flex-1 mb-6 list-disc list-inside text-gray-400">
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button
                disabled={loadingPlan === plan.name || isCurrent}
                onClick={() => handleCheckout(plan.name, isFree)}
                className={`px-6 py-3 rounded-lg font-semibold w-full transition-all ${
                  isFree
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                } ${loadingPlan === plan.name ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isCurrent ? "Current Plan" : loadingPlan === plan.name ? "Loading..." : plan.cta || (isFree ? "Get Started" : "Subscribe")}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
});

Pricing.displayName = "Pricing";

export default Pricing; 