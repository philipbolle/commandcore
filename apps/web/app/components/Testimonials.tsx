"use client";
import React from "react";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar: string;
  metrics: Record<string, string | undefined>;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => (
  <section className="py-16 px-4 bg-black bg-opacity-70">
    <h2 className="text-3xl font-bold text-center mb-10">Success Stories</h2>
    <div className="flex flex-col md:flex-row gap-8 justify-center items-center max-w-6xl mx-auto">
      {testimonials.map((t) => (
        <div
          key={t.name}
          className="bg-gray-800 rounded-xl p-8 shadow-lg flex flex-col items-center w-full md:w-1/3 hover:transform hover:scale-105 transition-all duration-300"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold mb-4" aria-hidden="true">
            {t.avatar}
          </div>
          <div className="italic text-gray-200 mb-4 text-center">"{t.quote}"</div>
          <div className="text-gray-400 font-semibold mb-1">{t.name}</div>
          <div className="text-gray-500 text-sm mb-4">
            {t.role} at {t.company}
          </div>
          <div className="flex gap-4 text-sm">
            {Object.entries(t.metrics).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-blue-400 font-bold">{value}</div>
                <div className="text-gray-500 capitalize">{key}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Testimonials; 