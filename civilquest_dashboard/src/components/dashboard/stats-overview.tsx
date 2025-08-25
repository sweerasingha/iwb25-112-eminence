"use client";

import React from "react";
import Link from "next/link";

interface StatItem {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  href?: string;
}

interface StatsOverviewProps {
  stats: StatItem[];
  loading?: boolean;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const StatCard = ({ children }: { children: React.ReactNode }) => {
          if (stat.href) {
            return (
              <Link href={stat.href} className="group block">
                {children}
              </Link>
            );
          }
          return <div>{children}</div>;
        };

        return (
          <StatCard key={index}>
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  {stat.change && (
                    <div className="flex items-center mt-2">
                      <span
                        className={`text-sm font-medium ${
                          stat.changeType === "increase"
                            ? "text-green-600"
                            : stat.changeType === "decrease"
                              ? "text-red-600"
                              : "text-gray-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className={`${stat.color} rounded-lg p-3 text-white ${
                    stat.href
                      ? "group-hover:scale-110 transition-transform duration-200"
                      : ""
                  }`}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          </StatCard>
        );
      })}
    </div>
  );
};

export default StatsOverview;
