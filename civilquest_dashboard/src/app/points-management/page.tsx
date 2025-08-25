"use client";
import React, { useState, useEffect } from "react";
import usePoints from "@/hooks/usePoints";
import LoadingButton from "@/components/ui/button";
import Loading from "@/components/ui/loading";

export default function PointsManagementPage() {
  const {
    pointsConfig,
    loading,
    getPointsConfig,
    updatePointsConfig,
    adjustUserPoints,
  } = usePoints();
  const [config, setConfig] = useState({
    eventCreationPoints: 50,
    eventCompletionBonusPoints: 25,
    eventApprovalBonusPoints: 50,
    sponsorshipBonusPoints: 30,
    allowNegativeBalance: false,
    maxDailyPointsPerUser: 500,
  });
  const [adjustmentData, setAdjustmentData] = useState({
    userEmail: "",
    pointsAdjustment: 0,
    reason: "",
  });

  useEffect(() => {
    handleGetConfig();
  }, []);

  useEffect(() => {
    if (pointsConfig) {
      setConfig(pointsConfig as any);
    }
  }, [pointsConfig]);

  const handleGetConfig = async () => {
    await getPointsConfig();
  };

  const handleUpdateConfig = async () => {
    await updatePointsConfig(config);
  };

  const handleAdjustPoints = async () => {
    await adjustUserPoints(adjustmentData);
    setAdjustmentData({
      userEmail: "",
      pointsAdjustment: 0,
      reason: "",
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Points Management</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Points Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Event Creation Points
            </label>
            <input
              type="number"
              value={config.eventCreationPoints}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  eventCreationPoints: parseInt(e.target.value) || 0,
                }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Event Completion Bonus Points
            </label>
            <input
              type="number"
              value={config.eventCompletionBonusPoints}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  eventCompletionBonusPoints: parseInt(e.target.value) || 0,
                }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Event Approval Bonus Points
            </label>
            <input
              type="number"
              value={config.eventApprovalBonusPoints}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  eventApprovalBonusPoints: parseInt(e.target.value) || 0,
                }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Sponsorship Bonus Points
            </label>
            <input
              type="number"
              value={config.sponsorshipBonusPoints}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  sponsorshipBonusPoints: parseInt(e.target.value) || 0,
                }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Max Daily Points Per User
            </label>
            <input
              type="number"
              value={config.maxDailyPointsPerUser}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  maxDailyPointsPerUser: parseInt(e.target.value) || 0,
                }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Allow Negative Balance
            </label>
            <input
              type="checkbox"
              checked={config.allowNegativeBalance}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  allowNegativeBalance: e.target.checked,
                }))
              }
              className="rounded"
            />
          </div>
        </div>
        <div className="flex gap-2">
        
          <LoadingButton onClick={handleUpdateConfig}>
            Update Config
          </LoadingButton>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Adjust User Points</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">User Email</label>
            <input
              type="email"
              placeholder="user@example.com"
              value={adjustmentData.userEmail}
              onChange={(e) =>
                setAdjustmentData((prev) => ({
                  ...prev,
                  userEmail: e.target.value,
                }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Points Adjustment
            </label>
            <input
              type="number"
              placeholder="25 or -10"
              value={adjustmentData.pointsAdjustment}
              onChange={(e) =>
                setAdjustmentData((prev) => ({
                  ...prev,
                  pointsAdjustment: parseInt(e.target.value) || 0,
                }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Reason</label>
            <input
              type="text"
              placeholder="Reason for adjustment"
              value={adjustmentData.reason}
              onChange={(e) =>
                setAdjustmentData((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>
        </div>
        <LoadingButton onClick={handleAdjustPoints}>
          Adjust Points
        </LoadingButton>
      </div>

      {pointsConfig && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Current Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">
                  Event Creation
                </span>
                <span className="text-2xl font-bold text-blue-900">
                  {(pointsConfig as any)?.eventCreationPoints || 0}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Points awarded for creating events
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">
                  Event Completion
                </span>
                <span className="text-2xl font-bold text-green-900">
                  {(pointsConfig as any)?.eventCompletionBonusPoints || 0}
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Bonus for completing events
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-700">
                  Event Approval
                </span>
                <span className="text-2xl font-bold text-purple-900">
                  {(pointsConfig as any)?.eventApprovalBonusPoints || 0}
                </span>
              </div>
              <p className="text-xs text-purple-600 mt-1">
                Bonus for event approval
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-700">
                  Sponsorship
                </span>
                <span className="text-2xl font-bold text-orange-900">
                  {(pointsConfig as any)?.sponsorshipBonusPoints || 0}
                </span>
              </div>
              <p className="text-xs text-orange-600 mt-1">
                Bonus for sponsorships
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-700">
                  Daily Limit
                </span>
                <span className="text-2xl font-bold text-red-900">
                  {(pointsConfig as any)?.maxDailyPointsPerUser || 0}
                </span>
              </div>
              <p className="text-xs text-red-600 mt-1">
                Maximum daily points per user
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Negative Balance
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    (pointsConfig as any)?.allowNegativeBalance
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {(pointsConfig as any)?.allowNegativeBalance
                    ? "Allowed"
                    : "Not Allowed"}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Can users have negative points
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
