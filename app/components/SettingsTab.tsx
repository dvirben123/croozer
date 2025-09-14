"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import {
  MessageCircle,
  Bell,
  Shield,
  Palette,
  Globe,
  Clock,
  Key,
  Smartphone,
} from "lucide-react";

export default function SettingsTab() {
  const [notifications, setNotifications] = useState(true);
  const [autoReply, setAutoReply] = useState(false);
  const [businessHours, setBusinessHours] = useState(true);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-right">הגדרות מערכת</h1>
        <p className="text-muted-foreground text-right mt-1">
          התאמה אישית של המערכת והעדפות
        </p>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* WhatsApp Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                הגדרות וואטסאפ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 text-right flex-1">
                  <Label className="text-base">מצב עסקי</Label>
                  <p className="text-sm text-muted-foreground">
                    הפעל מצב עסקי למשלוח הודעות מסחריות
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  פעיל
                </Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1 text-right flex-1">
                  <Label className="text-base">מענה אוטומטי</Label>
                  <p className="text-sm text-muted-foreground">
                    שלח מענה אוטומטי להודעות נכנסות
                  </p>
                </div>
                <Switch checked={autoReply} onCheckedChange={setAutoReply} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="autoReplyMessage" className="text-right block">
                  הודעת מענה אוטומטי
                </Label>
                <Input
                  id="autoReplyMessage"
                  value="תודה על פנייתכם! נחזור אליכם בהקדם."
                  className="text-right"
                  dir="rtl"
                  disabled={!autoReply}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1 text-right flex-1">
                  <Label className="text-base">שעות פעילות</Label>
                  <p className="text-sm text-muted-foreground">
                    הגבל שליחת הודעות לשעות העבודה בלבד
                  </p>
                </div>
                <Switch
                  checked={businessHours}
                  onCheckedChange={setBusinessHours}
                />
              </div>

              {businessHours && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <Label className="text-right block">שעת התחלה</Label>
                    <Select defaultValue="09:00">
                      <SelectTrigger className="text-right">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="08:00">08:00</SelectItem>
                        <SelectItem value="09:00">09:00</SelectItem>
                        <SelectItem value="10:00">10:00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-right block">שעת סיום</Label>
                    <Select defaultValue="18:00">
                      <SelectTrigger className="text-right">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="17:00">17:00</SelectItem>
                        <SelectItem value="18:00">18:00</SelectItem>
                        <SelectItem value="19:00">19:00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <Bell className="h-5 w-5" />
                התראות
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1 text-right flex-1">
                  <Label className="text-base">התראות דוא"ל</Label>
                  <p className="text-sm text-muted-foreground">
                    קבל התראות על הודעות חדשות בדוא"ל
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-right block">תדירות התראות</Label>
                <Select defaultValue="immediate">
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">מיידי</SelectItem>
                    <SelectItem value="hourly">כל שעה</SelectItem>
                    <SelectItem value="daily">יומי</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* API Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <Key className="h-5 w-5" />
                הגדרות API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-right block">מפתח API</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    חדש
                  </Button>
                  <Input
                    value="sk-1234567890abcdef..."
                    readOnly
                    className="flex-1 font-mono text-sm"
                    type="password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-right block">Webhook URL</Label>
                <Input
                  value="https://api.croozer.co.il/webhook"
                  className="text-left font-mono text-sm"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="text-right">
                  <div className="font-medium">סטטוס חיבור</div>
                  <div className="text-sm text-muted-foreground">
                    מחובר לשרתי Meta
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">מחובר</Badge>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <Shield className="h-5 w-5" />
                הגדרות מערכת
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-right block">שפה</Label>
                <Select defaultValue="he">
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="he">עברית</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-right block">אזור זמן</Label>
                <Select defaultValue="asia/jerusalem">
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asia/jerusalem">
                      ירושלים (UTC+2)
                    </SelectItem>
                    <SelectItem value="europe/london">
                      לונדון (UTC+0)
                    </SelectItem>
                    <SelectItem value="america/new_york">
                      ניו יורק (UTC-5)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline">ייצא נתונים</Button>
                <Button variant="outline">גיבוי הגדרות</Button>
                <Button variant="destructive">מחק חשבון</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
