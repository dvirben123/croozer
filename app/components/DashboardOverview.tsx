"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Calendar,
  Target,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useAuthGuard } from "@/hooks/useAuthGuard";

// Mock data for business metrics
const generateMockData = () => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Generate daily data for the last 30 days
  const dailyData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split("T")[0],
      messages: Math.floor(Math.random() * 200) + 50,
      customers: Math.floor(Math.random() * 50) + 10,
      revenue: Math.floor(Math.random() * 5000) + 1000,
      responseTime: Math.floor(Math.random() * 300) + 60, // seconds
    };
  });

  // Calculate totals and averages
  const totalMessages = dailyData.reduce((sum, day) => sum + day.messages, 0);
  const totalCustomers = dailyData.reduce((sum, day) => sum + day.customers, 0);
  const totalRevenue = dailyData.reduce((sum, day) => sum + day.revenue, 0);
  const avgResponseTime = Math.floor(
    dailyData.reduce((sum, day) => sum + day.responseTime, 0) / dailyData.length
  );

  return {
    dailyData,
    summary: {
      totalMessages,
      totalCustomers,
      totalRevenue,
      avgResponseTime,
      // Previous period for comparison (mock)
      previousMessages: Math.floor(totalMessages * (0.8 + Math.random() * 0.4)),
      previousCustomers: Math.floor(
        totalCustomers * (0.8 + Math.random() * 0.4)
      ),
      previousRevenue: Math.floor(totalRevenue * (0.8 + Math.random() * 0.4)),
      previousResponseTime: Math.floor(
        avgResponseTime * (0.8 + Math.random() * 0.4)
      ),
    },
  };
};

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
  trend: "up" | "down";
  color: "blue" | "green" | "orange" | "purple";
}

function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  trend,
  color,
}: MetricCardProps) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50 border-blue-200",
    green: "text-green-600 bg-green-50 border-green-200",
    orange: "text-orange-600 bg-orange-50 border-orange-200",
    purple: "text-purple-600 bg-purple-50 border-purple-200",
  };

  const trendIcon = trend === "up" ? TrendingUp : TrendingDown;
  const trendColor = trend === "up" ? "text-green-600" : "text-red-600";
  const TrendIcon = trendIcon;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-right">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-right mb-2">{value}</div>
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="text-muted-foreground">{changeLabel}</span>
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            <span className="font-medium">{Math.abs(change)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ActivityItemProps {
  type: "message" | "customer" | "order" | "alert";
  title: string;
  description: string;
  time: string;
  status?: "success" | "warning" | "error";
}

function ActivityItem({
  type,
  title,
  description,
  time,
  status = "success",
}: ActivityItemProps) {
  const getIcon = () => {
    switch (type) {
      case "message":
        return <MessageCircle className="h-4 w-4" />;
      case "customer":
        return <Users className="h-4 w-4" />;
      case "order":
        return <DollarSign className="h-4 w-4" />;
      case "alert":
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-orange-600 bg-orange-50";
      case "error":
        return "text-red-600 bg-red-50";
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
      <div className={`p-2 rounded-full ${getStatusColor()}`}>{getIcon()}</div>
      <div className="flex-1 text-right">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="text-xs text-muted-foreground">{time}</div>
    </div>
  );
}

export default function DashboardOverview() {
  const [timeRange, setTimeRange] = useState("30");
  const mockData = useMemo(() => generateMockData(), [timeRange]);
  const { user } = useAuthGuard();

  const { summary } = mockData;

  // Calculate percentage changes
  const messageChange =
    ((summary.totalMessages - summary.previousMessages) /
      summary.previousMessages) *
    100;
  const customerChange =
    ((summary.totalCustomers - summary.previousCustomers) /
      summary.previousCustomers) *
    100;
  const revenueChange =
    ((summary.totalRevenue - summary.previousRevenue) /
      summary.previousRevenue) *
    100;
  const responseTimeChange =
    ((summary.avgResponseTime - summary.previousResponseTime) /
      summary.previousResponseTime) *
    100;

  // Mock recent activities
  const recentActivities = [
    {
      type: "message" as const,
      title: "הודעה חדשה התקבלה",
      description: "לקוח חדש שאל על המוצרים שלכם",
      time: "לפני 5 דק׳",
      status: "success" as const,
    },
    {
      type: "customer" as const,
      title: "לקוח חדש נרשם",
      description: "דני כהן הצטרף למערכת",
      time: "לפני 12 דק׳",
      status: "success" as const,
    },
    {
      type: "order" as const,
      title: "הזמנה חדשה",
      description: "הזמנה בסך ₪1,250",
      time: "לפני 25 דק׳",
      status: "success" as const,
    },
    {
      type: "alert" as const,
      title: "זמן תגובה איטי",
      description: "זמן התגובה הממוצע עלה ב-15%",
      time: "לפני שעה",
      status: "warning" as const,
    },
  ];

  // Mock goals and targets
  const monthlyGoals = [
    {
      title: "הודעות חודשיות",
      current: summary.totalMessages,
      target: 5000,
      unit: "הודעות",
    },
    {
      title: "לקוחות חדשים",
      current: summary.totalCustomers,
      target: 800,
      unit: "לקוחות",
    },
    {
      title: "הכנסות חודשיות",
      current: summary.totalRevenue,
      target: 100000,
      unit: "₪",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 ימים אחרונים</SelectItem>
                <SelectItem value="30">30 ימים אחרונים</SelectItem>
                <SelectItem value="90">90 ימים אחרונים</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 ml-2" />
              ייצא דוח
            </Button>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold">
              שלום {user?.name ? `${user.name}!` : "!"}
            </h1>
            <p className="text-muted-foreground">
              ברוך הבא לדשבורד הניהול העסקי שלך - סקירה כללית של הביצועים
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="space-y-6">
          {/* User Welcome Card */}
          {user && (
            <Card className="bg-gradient-to-l from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <img
                    src={user.picture?.data?.url}
                    alt={user.name}
                    className="w-12 h-12 rounded-full ring-2 ring-blue-500/20"
                  />
                  <div className="flex-1 text-right">
                    <h3 className="font-semibold text-blue-900">
                      ברוך הבא, {user.name}!
                    </h3>
                    <p className="text-sm text-blue-700">
                      {user.email
                        ? `מחובר כ-${user.email}`
                        : "מחובר דרך פייסבוק"}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-blue-200 text-blue-800"
                  >
                    מחובר
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="סה״כ הודעות"
              value={summary.totalMessages.toLocaleString("he-IL")}
              change={Math.round(messageChange)}
              changeLabel="מהחודש הקודם"
              icon={MessageCircle}
              trend={messageChange >= 0 ? "up" : "down"}
              color="blue"
            />
            <MetricCard
              title="לקוחות פעילים"
              value={summary.totalCustomers.toLocaleString("he-IL")}
              change={Math.round(customerChange)}
              changeLabel="מהחודש הקודם"
              icon={Users}
              trend={customerChange >= 0 ? "up" : "down"}
              color="green"
            />
            <MetricCard
              title="הכנסות"
              value={`₪${summary.totalRevenue.toLocaleString("he-IL")}`}
              change={Math.round(revenueChange)}
              changeLabel="מהחודש הקודם"
              icon={DollarSign}
              trend={revenueChange >= 0 ? "up" : "down"}
              color="purple"
            />
            <MetricCard
              title="זמן תגובה ממוצע"
              value={`${Math.floor(summary.avgResponseTime / 60)}:${(
                summary.avgResponseTime % 60
              )
                .toString()
                .padStart(2, "0")}`}
              change={Math.round(Math.abs(responseTimeChange))}
              changeLabel="מהחודש הקודם"
              icon={Clock}
              trend={responseTimeChange <= 0 ? "up" : "down"}
              color="orange"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Monthly Goals */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  יעדים חודשיים
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {monthlyGoals.map((goal, index) => {
                  const progress = Math.min(
                    (goal.current / goal.target) * 100,
                    100
                  );
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {goal.current.toLocaleString("he-IL")} /{" "}
                          {goal.target.toLocaleString("he-IL")} {goal.unit}
                        </span>
                        <span className="font-medium">{goal.title}</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="text-xs text-muted-foreground text-right">
                        {Math.round(progress)}% מהיעד
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  פעילות אחרונה
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentActivities.map((activity, index) => (
                    <ActivityItem
                      key={index}
                      type={activity.type}
                      title={activity.title}
                      description={activity.description}
                      time={activity.time}
                      status={activity.status}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                סקירת ביצועים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="messages" className="w-full" dir="rtl">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="messages">הודעות</TabsTrigger>
                  <TabsTrigger value="customers">לקוחות</TabsTrigger>
                  <TabsTrigger value="revenue">הכנסות</TabsTrigger>
                  <TabsTrigger value="response">זמני תגובה</TabsTrigger>
                </TabsList>

                <TabsContent value="messages" className="mt-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {summary.totalMessages}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        סה״כ הודעות
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(summary.totalMessages / 30)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ממוצע יומי
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(
                          (summary.totalMessages /
                            (summary.totalMessages +
                              summary.previousMessages)) *
                            100
                        )}
                        %
                      </div>
                      <div className="text-sm text-muted-foreground">
                        שיעור הצלחה
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="customers" className="mt-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {summary.totalCustomers}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        לקוחות פעילים
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(summary.totalCustomers * 0.3)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        לקוחות חדשים
                      </div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(summary.totalCustomers * 0.8)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        לקוחות חוזרים
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="revenue" className="mt-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        ₪{summary.totalRevenue.toLocaleString("he-IL")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        סה״כ הכנסות
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        ₪
                        {Math.round(summary.totalRevenue / 30).toLocaleString(
                          "he-IL"
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ממוצע יומי
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        ₪
                        {Math.round(
                          summary.totalRevenue / summary.totalCustomers
                        ).toLocaleString("he-IL")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ממוצע ללקוח
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="response" className="mt-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.floor(summary.avgResponseTime / 60)}:
                        {(summary.avgResponseTime % 60)
                          .toString()
                          .padStart(2, "0")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        זמן תגובה ממוצע
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(summary.totalMessages * 0.85)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        תגובות מהירות (&lt;2 דק׳)
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        97%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        שיעור שביעות רצון
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
