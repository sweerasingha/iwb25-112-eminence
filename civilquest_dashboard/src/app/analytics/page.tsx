"use client";
import React, { useEffect, useState } from "react";
import useAnalytics from "@/hooks/useAnalytics";
import Loading from "@/components/ui/loading";

export default function AnalyticsPage() {
  const {
    eventAnalytics,
    userAnalytics,
    sponsorshipAnalytics,
    participationAnalytics,
    loading,
    getEventAnalytics,
    getUserAnalytics,
    getSponsorshipAnalytics,
    getParticipationAnalytics,
  } = useAnalytics();

  const [dateRange, setDateRange] = useState({
    startDate: "2025-01-01",
    endDate: "2025-12-31",
  });

  useEffect(() => {
    handleGetEventAnalytics();
    handleGetUserAnalytics();
    handleGetSponsorshipAnalytics();
    handleGetParticipationAnalytics();
  }, [dateRange]);

  const handleGetEventAnalytics = async () => {
    await getEventAnalytics(dateRange);
  };

  const handleGetUserAnalytics = async () => {
    await getUserAnalytics();
  };

  const handleGetSponsorshipAnalytics = async () => {
    await getSponsorshipAnalytics(dateRange);
  };

  const handleGetParticipationAnalytics = async () => {
    await getParticipationAnalytics(dateRange);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Date Range</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {eventAnalytics && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Event Analytics</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-blue-700">
                    Total Events
                  </h3>
                  <p className="text-2xl font-bold text-blue-900">
                    {(eventAnalytics as any)?.totalEvents || 0}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-green-700">
                    Active Events
                  </h3>
                  <p className="text-2xl font-bold text-green-900">
                    {(eventAnalytics as any)?.activeEvents || 0}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-purple-700">
                    Completed
                  </h3>
                  <p className="text-2xl font-bold text-purple-900">
                    {(eventAnalytics as any)?.completedEvents || 0}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-orange-700">
                    Avg Participants
                  </h3>
                  <p className="text-2xl font-bold text-orange-900">
                    {(eventAnalytics as any)?.avgParticipants || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {userAnalytics && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">User Analytics</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-indigo-700">
                    Total Users
                  </h3>
                  <p className="text-2xl font-bold text-indigo-900">
                    {(userAnalytics as any)?.totalUsers || 0}
                  </p>
                </div>
                <div className="bg-emerald-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-emerald-700">
                    Active Users
                  </h3>
                  <p className="text-2xl font-bold text-emerald-900">
                    {(userAnalytics as any)?.activeUsers || 0}
                  </p>
                </div>
                <div className="bg-rose-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-rose-700">
                    Premium Users
                  </h3>
                  <p className="text-2xl font-bold text-rose-900">
                    {(userAnalytics as any)?.premiumUsers || 0}
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-amber-700">
                    New This Month
                  </h3>
                  <p className="text-2xl font-bold text-amber-900">
                    {(userAnalytics as any)?.newUsersThisMonth || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {sponsorshipAnalytics && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">
              Sponsorship Analytics
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-teal-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-teal-700">
                    Total Sponsorships
                  </h3>
                  <p className="text-2xl font-bold text-teal-900">
                    {(sponsorshipAnalytics as any)?.totalSponsorships || 0}
                  </p>
                </div>
                <div className="bg-cyan-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-cyan-700">
                    Active Sponsors
                  </h3>
                  <p className="text-2xl font-bold text-cyan-900">
                    {(sponsorshipAnalytics as any)?.activeSponsors || 0}
                  </p>
                </div>
                <div className="bg-lime-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-lime-700">
                    Total Value
                  </h3>
                  <p className="text-2xl font-bold text-lime-900">
                    ${(sponsorshipAnalytics as any)?.totalValue || 0}
                  </p>
                </div>
                <div className="bg-violet-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-violet-700">
                    Avg per Event
                  </h3>
                  <p className="text-2xl font-bold text-violet-900">
                    ${(sponsorshipAnalytics as any)?.avgPerEvent || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {participationAnalytics && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">
              Participation Analytics
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-pink-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-pink-700">
                    Total Participants
                  </h3>
                  <p className="text-2xl font-bold text-pink-900">
                    {(participationAnalytics as any)?.totalParticipants || 0}
                  </p>
                </div>
                <div className="bg-sky-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-sky-700">
                    Repeat Participants
                  </h3>
                  <p className="text-2xl font-bold text-sky-900">
                    {(participationAnalytics as any)?.repeatParticipants || 0}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-red-700">
                    Completion Rate
                  </h3>
                  <p className="text-2xl font-bold text-red-900">
                    {(participationAnalytics as any)?.completionRate || 0}%
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-yellow-700">
                    Avg Rating
                  </h3>
                  <p className="text-2xl font-bold text-yellow-900">
                    {(participationAnalytics as any)?.avgRating || 0}/5
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!eventAnalytics &&
        !userAnalytics &&
        !sponsorshipAnalytics &&
        !participationAnalytics && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold mb-2">No Analytics Data</h2>
              <p className="text-gray-500">
                Select a date range and click on the analytics buttons above to
                view data.
              </p>
            </div>
          </div>
        )}
    </div>
  );
}
