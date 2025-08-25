"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaUsers,
  FaCalendarAlt,
  FaStar,
  FaHandHoldingUsd,
  FaChartLine,
  FaCog,
  FaClipboardList,
  FaFileInvoice,
  FaEye,
} from "react-icons/fa";
import { useUserContext } from "@/context/userContext";
import { Roles } from "@/types";
import useAnalytics from "@/hooks/useAnalytics";
import useEvent from "@/hooks/useEvent";
import Loading from "@/components/ui/loading";
import StatsOverview from "@/components/dashboard/stats-overview";
import WelcomeCard from "@/components/dashboard/welcome-card";

interface QuickAction {
  title: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  allowedRoles: string[];
}

export default function Home() {
  const { user } = useUserContext();
  const {
    eventAnalytics,
    userAnalytics,
    sponsorshipAnalytics,
    loading: analyticsLoading,
    getEventAnalytics,
    getUserAnalytics,
    getSponsorshipAnalytics,
  } = useAnalytics();
  const { events, fetchEvents, loading: eventsLoading } = useEvent();

  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);

  useEffect(() => {
    // Fetch initial data
    getEventAnalytics({ startDate: "2025-01-01", endDate: "2025-12-31" });
    getUserAnalytics();
    getSponsorshipAnalytics({ startDate: "2025-01-01", endDate: "2025-12-31" });
    fetchEvents();
  }, []);

  const quickActions: QuickAction[] = [
    {
      title: "Create Event",
      href: "/events",
      icon: <FaCalendarAlt className="w-5 h-5" />,
      color: "bg-blue-500 hover:bg-blue-600",
      allowedRoles: [Roles.ADMIN, Roles.ADMIN_OPERATOR],
    },
    {
      title: "Manage Users",
      href: "/user-management",
      icon: <FaUsers className="w-5 h-5" />,
      color: "bg-green-500 hover:bg-green-600",
      allowedRoles: [Roles.ADMIN, Roles.SUPER_ADMIN, Roles.ADMIN_OPERATOR],
    },
    {
      title: "View Analytics",
      href: "/analytics",
      icon: <FaChartLine className="w-5 h-5" />,
      color: "bg-purple-500 hover:bg-purple-600",
      allowedRoles: [Roles.ADMIN, Roles.SUPER_ADMIN, Roles.ADMIN_OPERATOR],
    },
    {
      title: "Points Management",
      href: "/points-management",
      icon: <FaCog className="w-5 h-5" />,
      color: "bg-orange-500 hover:bg-orange-600",
      allowedRoles: [Roles.ADMIN, Roles.ADMIN_OPERATOR],
    },
  ];

  const statCards = [
    {
      title: "Total Events",
      value: (eventAnalytics as any)?.totalEvents || 0,
      icon: <FaCalendarAlt className="w-8 h-8" />,
      color: "bg-blue-500",
      change: "+12%",
      changeType: "increase" as const,
      href: "/events",
    },
    {
      title: "Total Users",
      value: (userAnalytics as any)?.totalUsers || 0,
      icon: <FaUsers className="w-8 h-8" />,
      color: "bg-green-500",
      change: "+8%",
      changeType: "increase" as const,
      href: "/user-management",
    },
    {
      title: "Active Events",
      value: (eventAnalytics as any)?.activeEvents || 0,
      icon: <FaStar className="w-8 h-8" />,
      color: "bg-yellow-500",
      change: "0%",
      changeType: "neutral" as const,
      href: "/events",
    },
    {
      title: "Total Sponsorships",
      value: (sponsorshipAnalytics as any)?.totalSponsorships || 0,
      icon: <FaHandHoldingUsd className="w-8 h-8" />,
      color: "bg-purple-500",
      change: "+15%",
      changeType: "increase" as const,
      href: "/sponsors",
    },
  ];

  const recentEvents: Event[] = events!.slice(0, 5) || [];
  const hasData =
    eventAnalytics ||
    userAnalytics ||
    sponsorshipAnalytics ||
    events?.length > 0;

  if (analyticsLoading || eventsLoading) {
    return <Loading />;
  }

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {greeting}, {user?.email?.split("@")[0] || "Admin"}!
        </h1>
        <p className="text-gray-600">
          Welcome to the Civil Quest Admin Dashboard
        </p>
      </div>

      {!hasData && (
        <div className="mb-8">
          <WelcomeCard />
        </div>
      )}

      {/* Stats Cards */}
      <div className="mb-8">
        <StatsOverview stats={statCards} loading={analyticsLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              {quickActions.map(
                (action, index) =>
                  action.allowedRoles.includes(
                    user?.role || Roles.ADMIN_OPERATOR
                  ) && (
                    <Link
                      key={index}
                      href={action.href}
                      className={`${action.color} text-white p-3 rounded-lg flex items-center transition-colors duration-200 group`}
                    >
                      <div className="mr-3 group-hover:scale-110 transition-transform duration-200">
                        {action.icon}
                      </div>
                      <span className="font-medium">{action.title}</span>
                    </Link>
                  )
              )}
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Events
              </h2>
              <Link
                href="/events"
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <span>View All</span>
                <FaEye className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {recentEvents.length > 0 ? (
              <div className="space-y-3">
                {recentEvents.map((event, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {event.eventTitle}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {event.location}, {event.city}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            📅 {new Date(event.date).toLocaleDateString()}
                          </span>
                          <span>
                            ⏰ {event.startTime} - {event.endTime}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : event.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {event.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaCalendarAlt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No recent events found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/analytics"
          className="group bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-3 text-white group-hover:scale-110 transition-transform duration-200">
              <FaChartLine className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-600">View detailed reports</p>
            </div>
          </div>
        </Link>

        <Link
          href="/audit"
          className="group bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <div className="bg-orange-500 rounded-lg p-3 text-white group-hover:scale-110 transition-transform duration-200">
              <FaClipboardList className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">
                Audit & Monitoring
              </h3>
              <p className="text-sm text-gray-600">System activity logs</p>
            </div>
          </div>
        </Link>

        <Link
          href="/sponsors"
          className="group bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <div className="bg-indigo-500 rounded-lg p-3 text-white group-hover:scale-110 transition-transform duration-200">
              <FaFileInvoice className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Sponsors</h3>
              <p className="text-sm text-gray-600">Manage partnerships</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
