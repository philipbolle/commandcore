"use client";
import React, { useState } from "react";

interface Idea {
  name: string;
  description: string;
  previewImg: string;
  code: string;
}

interface Step {
  step: string;
  time: string;
  status: string;
  detail: string;
}

interface IdeaPickerDemoProps {
  ideas: Idea[];
  processSteps: Step[];
  processRef?: React.Ref<HTMLElement>;
}

const IdeaPickerDemo = React.forwardRef<HTMLElement, IdeaPickerDemoProps>(({ ideas, processSteps, processRef }, ref) => {
  const [selectedIdea, setSelectedIdea] = useState<Idea>(ideas[0]);
  const [showCode, setShowCode] = useState(false);

  return (
    <section ref={ref as React.RefObject<HTMLElement>} id="demo" className="py-16 px-4 bg-gray-900 bg-opacity-90">
      <h2 className="text-3xl font-bold text-center mb-10">Try the SaaS Builder</h2>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-center">
        {/* Idea Picker */}
        <div className="flex-1 flex flex-col gap-4">
          <h3 className="text-lg font-semibold mb-2">Choose a SaaS Idea:</h3>
          <div className="flex flex-col gap-2">
            {ideas.map((idea) => (
              <button
                key={idea.name}
                className={`px-4 py-3 rounded-lg text-left border transition-all duration-200 hover:scale-105 hover:border-blue-500 ${selectedIdea.name === idea.name ? "bg-gradient-to-r from-blue-700 to-purple-700 text-white border-blue-500" : "bg-gray-800 border-gray-700 text-gray-200"}`}
                onClick={() => {
                  setSelectedIdea(idea);
                  setShowCode(false);
                }}
                aria-label={`Preview ${idea.name}`}
              >
                <div className="font-bold">{idea.name}</div>
                <div className="text-sm text-gray-400">{idea.description}</div>
              </button>
            ))}
          </div>
        </div>
        {/* Live Preview */}
        <div className="flex-1 flex flex-col items-center gap-4 bg-gray-800 rounded-xl p-8 shadow-xl min-h-[320px]">
          <img src={selectedIdea.previewImg} alt="Preview" className="w-32 h-32 object-contain mb-4 animate-fadein" />
          <div className="text-lg font-semibold mb-2">{selectedIdea.name}</div>
          <div className="text-gray-400 mb-4 text-center">{selectedIdea.description}</div>
          <button
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-white hover:from-blue-700 hover:to-purple-700 transition-all"
            onClick={() => setShowCode((v) => !v)}
          >
            {showCode ? "Hide Code" : "Show Example Code"}
          </button>
          {showCode && (
            <pre className="bg-black/80 text-green-400 rounded-lg p-4 mt-2 w-full overflow-x-auto animate-slideup text-xs md:text-sm">
              {selectedIdea.code}
            </pre>
          )}
        </div>
      </div>
      {/* Visual Timeline/Flowchart for Process Steps */}
      <div ref={processRef as React.RefObject<HTMLDivElement>} id="process" className="mt-12 max-w-4xl mx-auto">
        <h3 className="text-xl font-bold mb-6 text-center">How It Works</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {processSteps.map((step, idx) => (
            <div key={step.step} className="flex flex-col items-center group">
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-full text-2xl font-bold mb-2 border-4 transition-all duration-300 ${step.status === "completed" ? "bg-green-500 border-green-700" : step.status === "in-progress" ? "bg-blue-500 border-blue-700 animate-pulse" : "bg-gray-700 border-gray-800"}`}
              >
                {idx + 1}
              </div>
              <div className="font-semibold text-center mb-1">{step.step}</div>
              <div className="text-xs text-gray-400 text-center mb-2">{step.detail}</div>
              <div className="text-xs text-gray-500">{step.time}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

IdeaPickerDemo.displayName = "IdeaPickerDemo";

export default IdeaPickerDemo; 