"use client";

import { MessageCircle, User, Settings, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";

type TabType = "messages" | "profile" | "settings";

interface DashboardSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function DashboardSidebar({
  activeTab,
  onTabChange,
}: DashboardSidebarProps) {
  const handleLogout = () => {
    // Mock logout functionality
    alert("התנתקות מהמערכת");
  };

  const menuItems = [
    {
      id: "messages" as TabType,
      label: "הודעות",
      icon: MessageCircle,
      description: "ניהול הודעות וואטסאפ",
    },
    {
      id: "profile" as TabType,
      label: "פרופיל",
      icon: User,
      description: "פרטים אישיים",
    },
    {
      id: "settings" as TabType,
      label: "הגדרות",
      icon: Settings,
      description: "הגדרות מערכת",
    },
  ];

  return (
    <div className="w-64 bg-card border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex-1 text-right">
            <h3 className="font-semibold text-sm">דביר בניחי</h3>
            <p className="text-xs text-muted-foreground">מנהל מערכת</p>
          </div>
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
            <AvatarFallback>דב</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-end gap-3 h-auto p-3 text-right ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => onTabChange(item.id)}
                >
                  <div className="flex-1 text-right">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                  <Icon className="h-5 w-5" />
                </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-end gap-3 h-auto p-3 text-right hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <div className="flex-1 text-right">
            <div className="font-medium text-sm">התנתק</div>
            <div className="text-xs opacity-75">יציאה מהמערכת</div>
          </div>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
