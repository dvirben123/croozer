"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Phone, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";

interface Message {
  id: string;
  phoneNumber: string;
  content: string;
  timestamp: Date;
  status: "sending" | "sent" | "delivered" | "read";
  direction: "outgoing" | "incoming";
}

export default function MessagesTab() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      phoneNumber: "+972501234567",
      content:
        "שלום! ברוכים הבאים לשירות הלקוחות שלנו. איך אוכל לעזור לכם היום?",
      timestamp: new Date(Date.now() - 3600000),
      status: "read",
      direction: "outgoing",
    },
    {
      id: "2",
      phoneNumber: "+972501234567",
      content: "היי, אני מעוניין לקבל מידע על המוצרים שלכם",
      timestamp: new Date(Date.now() - 3000000),
      status: "read",
      direction: "incoming",
    },
    {
      id: "3",
      phoneNumber: "+972507654321",
      content: "תודה על ההזמנה! נחזור אליכם בהקדם עם פרטי המשלוח.",
      timestamp: new Date(Date.now() - 1800000),
      status: "delivered",
      direction: "outgoing",
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!phoneNumber.trim() || !messageContent.trim() || isSending) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      phoneNumber: phoneNumber.trim(),
      content: messageContent.trim(),
      timestamp: new Date(),
      status: "sending",
      direction: "outgoing",
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageContent("");
    setIsSending(true);

    // Simulate sending delay (1-2 seconds)
    const delay = Math.random() * 1000 + 1000; // 1-2 seconds

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
        )
      );
      setIsSending(false);

      // Simulate delivery status after another second
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
          )
        );
      }, 1000);
    }, delay);
  };

  const getStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "sending":
        return (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        );
      case "sent":
        return <CheckCircle2 className="h-3 w-3 text-blue-500" />;
      case "delivered":
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case "read":
        return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: Message["status"]) => {
    switch (status) {
      case "sending":
        return "שולח...";
      case "sent":
        return "נשלח";
      case "delivered":
        return "הועבר";
      case "read":
        return "נקרא";
      default:
        return "";
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Format Israeli phone numbers
    if (phone.startsWith("+972")) {
      return phone.replace("+972", "0");
    }
    return phone;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-right">ניהול הודעות וואטסאפ</h1>
        <p className="text-muted-foreground text-right mt-1">
          שלח והתקבל הודעות ללקוחות שלך
        </p>
      </div>

      <div className="flex-1 flex gap-6 p-6">
        {/* Message Form */}
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-right">שלח הודעה חדשה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-right block">
                מספר טלפון
              </Label>
              <div className="relative">
                <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+972501234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pr-10 text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-right block">
                תוכן ההודעה
              </Label>
              <Textarea
                id="message"
                placeholder="הקלד את ההודעה שלך כאן..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
                className="text-right"
                dir="rtl"
              />
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={
                !phoneNumber.trim() || !messageContent.trim() || isSending
              }
              className="w-full gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  שולח הודעה...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  שלח הודעה
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Messages History */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-right">היסטוריית הודעות</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.direction === "outgoing"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.direction === "outgoing"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {formatPhoneNumber(message.phoneNumber)}
                        </Badge>
                        {message.direction === "outgoing" && (
                          <div className="flex items-center gap-1">
                            {getStatusIcon(message.status)}
                            <span className="text-xs opacity-75">
                              {getStatusText(message.status)}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-right" dir="rtl">
                        {message.content}
                      </p>
                      <p className="text-xs opacity-75 mt-2 text-right">
                        {message.timestamp.toLocaleString("he-IL")}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
