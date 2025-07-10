"use client";
import React, { useState } from "react";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQProps {
  faqs: FAQItem[];
}

const FAQ = React.forwardRef<HTMLElement, FAQProps>(({ faqs }, ref) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section ref={ref as React.RefObject<HTMLElement>} id="faq" className="py-16 px-4 bg-gray-900 bg-opacity-90">
      <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
      <div className="max-w-3xl mx-auto divide-y divide-gray-700">
        {faqs.map((item, idx) => (
          <div key={idx} className="py-4">
            <button
              className="w-full text-left flex items-center justify-between text-lg font-medium text-gray-200 focus:outline-none"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              aria-expanded={openIndex === idx}
            >
              {item.q}
              <span>{openIndex === idx ? "-" : "+"}</span>
            </button>
            {openIndex === idx && <p className="mt-2 text-gray-400">{item.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
});

FAQ.displayName = "FAQ";

export default FAQ; 