"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Building2, Mail, Phone, MapPin, Calendar } from "lucide-react";

export default function ProfileTab() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-right">פרופיל משתמש</h1>
        <p className="text-muted-foreground text-right mt-1">
          ניהול פרטים אישיים ומידע העסק
        </p>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right">פרטים אישיים</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-right block">
                        שם פרטי
                      </Label>
                      <Input
                        id="firstName"
                        value="דביר"
                        readOnly
                        className="text-right"
                        dir="rtl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-right block">
                        שם משפחה
                      </Label>
                      <Input
                        id="lastName"
                        value="בניחי"
                        readOnly
                        className="text-right"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-right block">
                      כתובת אימייל
                    </Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value="dvir@croozer.co.il"
                      readOnly
                      className="pr-10 text-left"
                      dir="ltr"
                    />
                  </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-right block">
                      מספר טלפון
                    </Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value="+972-50-123-4567"
                      readOnly
                      className="pr-10 text-left"
                      dir="ltr"
                    />
                  </div>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                    <AvatarFallback className="text-xl">דב</AvatarFallback>
                  </Avatar>
                  <Badge variant="secondary">מנהל מערכת</Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>הצטרף ב-01/01/2024</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                פרטי העסק
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-right block">
                    שם העסק
                  </Label>
                  <Input
                    id="businessName"
                    value="קרוזר - פתרונות דיגיטליים"
                    readOnly
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType" className="text-right block">
                    סוג העסק
                  </Label>
                  <Input
                    id="businessType"
                    value="טכנולוגיה ופיתוח"
                    readOnly
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessAddress" className="text-right block">
                  כתובת העסק
                </Label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="businessAddress"
                    value="רחוב הטכנולוגיה 15, תל אביב"
                    readOnly
                    className="pr-10 text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="businessDescription"
                  className="text-right block"
                >
                  תיאור העסק
                </Label>
                <div className="p-3 bg-muted rounded-md text-right" dir="rtl">
                  אנחנו מתמחים בפיתוח פתרונות אוטומציה לעסקים קטנים ובינוניים,
                  כולל בוטים לוואטסאפ, מערכות ניהול לקוחות ופתרונות דיגיטליים
                  מתקדמים.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary">1,247</div>
                <div className="text-sm text-muted-foreground">
                  הודעות נשלחו
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">89%</div>
                <div className="text-sm text-muted-foreground">שיעור הצלחה</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">156</div>
                <div className="text-sm text-muted-foreground">
                  לקוחות פעילים
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
