"use client";

import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardOverview from "@/components/DashboardOverview";
import InteractiveMessagesTab from "@/components/InteractiveMessagesTab";
import ProfileTab from "@/components/ProfileTab";
import SettingsTab from "@/components/SettingsTab";

type TabType = "overview" | "messages" | "profile" | "settings";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return <DashboardOverview />;
      case "messages":
        return <InteractiveMessagesTab />;
      case "profile":
        return <ProfileTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <AuthGuard redirectTo="/login">
      <div className="flex h-screen bg-background" dir="rtl">
        <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-hidden">{renderActiveTab()}</main>
      </div>
    </AuthGuard>
  );
}
