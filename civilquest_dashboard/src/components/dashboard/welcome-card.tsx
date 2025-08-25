"use client";

import React from "react";
import Link from "next/link";
import { FaRocket, FaUsers, FaCalendarAlt, FaChartLine } from "react-icons/fa";

interface WelcomeStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const WelcomeCard: React.FC = () => {
  const steps: WelcomeStep[] = [
    {
      title: "Create Your First Event",
      description:
        "Start by creating events for your community to participate in.",
      icon: <FaCalendarAlt className="w-8 h-8" />,
      href: "/events",
      color: "bg-blue-500",
    },
    {
      title: "Manage Users",
      description: "View and manage user accounts, roles, and permissions.",
      icon: <FaUsers className="w-8 h-8" />,
      href: "/user-management",
      color: "bg-green-500",
    },
    {
      title: "View Analytics",
      description:
        "Track performance and get insights into your platform usage.",
      icon: <FaChartLine className="w-8 h-8" />,
      href: "/analytics",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaRocket className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Civil Quest Dashboard!
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Get started by exploring the key features of your admin dashboard.
          Here are some recommended first steps:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {steps.map((step, index) => (
          <Link key={index} href={step.href} className="group block">
            <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200">
              <div
                className={`${step.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}
              >
                {step.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WelcomeCard;
