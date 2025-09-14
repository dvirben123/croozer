"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import MessagesTab from "@/components/MessagesTab";
import ProfileTab from "@/components/ProfileTab";
import SettingsTab from "@/components/SettingsTab";

type TabType = "messages" | "profile" | "settings";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("messages");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "messages":
        return <MessagesTab />;
      case "profile":
        return <ProfileTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <MessagesTab />;
    }
  };

  return (
    <div className="flex h-screen bg-background" dir="rtl">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-hidden">{renderActiveTab()}</main>
    </div>
  );
}
