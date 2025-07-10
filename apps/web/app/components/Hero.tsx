"use client";
import React from "react";

interface HeroProps {
  onStart: () => void;
  onWatchDemo: () => void;
}

const Hero = React.forwardRef<HTMLElement, HeroProps>(({ onStart, onWatchDemo }, ref) => {
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="home"
      className="flex flex-col items-center justify-center flex-1 px-4 py-10 text-center min-h-[40vh] bg-black bg-opacity-70"
    >
      <div className="mb-6">
        <span className="inline-block px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-full text-sm font-semibold mb-4">
          🚀 Beta Access - Limited to 500 users
        </span>
      </div>
      <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
        Enterprise-Grade SaaS Development
      </h1>
      <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl">
        Generate production-ready SaaS applications with modern tech stacks, automated deployment, and AI-driven optimization—from concept to revenue in days.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          onClick={onStart}
          aria-label="Start Building Now"
        >
          Start Building Now
        </button>
        <button
          className="px-10 py-4 bg-gray-800 text-white rounded-lg text-lg font-semibold hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          onClick={onWatchDemo}
          aria-label="Watch Live Demo"
        >
          Watch Live Demo
        </button>
      </div>
      <div className="text-gray-400 text-sm mb-8">
        No credit card required • Free during beta • Production-ready code
      </div>
      {/* Social Proof */}
      <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <span className="text-green-400">✓</span>
          <span>500+ developers joined</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-400">✓</span>
          <span>47 SaaS products deployed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-400">✓</span>
          <span>$1.2M+ revenue generated</span>
        </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";

export default Hero; 