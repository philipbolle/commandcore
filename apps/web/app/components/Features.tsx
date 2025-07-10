"use client";
import React from "react";

interface Feature {
  title: string;
  description: string;
  icon: string;
  metric: string;
}

interface FeaturesProps {
  features: Feature[];
}

const Features = React.forwardRef<HTMLElement, FeaturesProps>(({ features }, ref) => (
  <section
    ref={ref as React.RefObject<HTMLElement>}
    id="features"
    className="py-16 px-4 bg-black bg-opacity-70"
  >
    <h2 className="text-3xl font-bold text-center mb-10">Enterprise Features</h2>
    <div className="flex flex-col md:flex-row gap-8 justify-center items-center max-w-5xl mx-auto">
      {features.map((f) => (
        <div
          key={f.title}
          className="flex flex-col items-center bg-gray-800 rounded-xl p-8 shadow-lg w-full md:w-1/3 hover:transform hover:scale-105 transition-all duration-300"
        >
          <div className="text-5xl mb-4" aria-hidden="true">
            {f.icon}
          </div>
          <div className="text-xl font-semibold mb-2">{f.title}</div>
          <div className="text-gray-300 mb-4 text-center">{f.description}</div>
          <div className="text-blue-400 font-semibold">{f.metric}</div>
        </div>
      ))}
    </div>
  </section>
));

Features.displayName = "Features";

export default Features; 