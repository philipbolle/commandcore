"use client";
import React from "react";

interface Achievement {
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
}

interface AchievementsProps {
  achievements: Achievement[];
}

const Achievements: React.FC<AchievementsProps> = ({ achievements }) => (
  <section className="py-16 px-4 bg-gray-900 bg-opacity-90">
    <h2 className="text-3xl font-bold text-center mb-10">Your Progress</h2>
    <div className="flex flex-col md:flex-row gap-6 justify-center items-center max-w-4xl mx-auto">
      {achievements.map((achievement) => (
        <div
          key={achievement.name}
          className={`flex items-center gap-4 p-6 rounded-xl w-full md:w-1/2 ${achievement.unlocked ? "bg-green-900 bg-opacity-30 border border-green-500" : "bg-gray-800"}`}
        >
          <div className={`text-3xl ${achievement.unlocked ? "opacity-100" : "opacity-50"}`}>{achievement.icon}</div>
          <div className="flex-1">
            <div className={`font-semibold ${achievement.unlocked ? "text-green-400" : "text-gray-400"}`}>{achievement.name}</div>
            <div className="text-sm text-gray-400 mb-2">{achievement.description}</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${achievement.unlocked ? "bg-green-500" : "bg-blue-500"}`}
                style={{ width: `${achievement.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Achievements; 