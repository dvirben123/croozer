"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Phone,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquareIcon,
  RefreshCw,
  User,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";

interface Message {
  id: string;
  phoneNumber: string;
  content: string;
  timestamp: Date;
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  direction: "outgoing" | "incoming";
  type: "text" | "template";
  templateName?: string;
  whatsappMessageId?: string;
  error?: string;
}

interface IncomingMessage {
  _id: string;
  messageId: string;
  from: string;
  type: string;
  text?: string;
  timestamp: string;
  processed: boolean;
}

export default function InteractiveMessagesTab() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [incomingMessages, setIncomingMessages] = useState<IncomingMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingIncoming, setIsLoadingIncoming] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "unknown" | "connected" | "disconnected"
  >("unknown");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Test backend connection
    testConnection();
    // Load incoming messages
    fetchIncomingMessages();
    
    // Auto-refresh incoming messages every 10 seconds
    const interval = setInterval(fetchIncomingMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  // Merge incoming messages with outgoing messages
  useEffect(() => {
    const merged = [...messages];
    
    incomingMessages.forEach((incoming) => {
      // Check if we already have this message
      const exists = merged.some(m => m.whatsappMessageId === incoming.messageId);
      if (!exists) {
        merged.push({
          id: incoming._id,
          phoneNumber: formatPhoneNumber(incoming.from),
          content: incoming.text || `(${incoming.type} message)`,
          timestamp: new Date(incoming.timestamp),
          status: "read",
          direction: "incoming",
          type: "text",
          whatsappMessageId: incoming.messageId,
        });
      }
    });
    
    // Sort by timestamp
    merged.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    if (merged.length !== messages.length) {
      setMessages(merged);
    }
  }, [incomingMessages]);

  const testConnection = async () => {
    try {
      await whatsappAPI.testConnection();
      setConnectionStatus("connected");
    } catch (error) {
      console.error("Backend connection failed:", error);
      setConnectionStatus("disconnected");
    }
  };

  const fetchIncomingMessages = async () => {
    try {
      setIsLoadingIncoming(true);
      const response = await fetch("/api/messages/incoming?limit=100");
      const data = await response.json();
      
      if (data.success) {
        setIncomingMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch incoming messages:", error);
    } finally {
      setIsLoadingIncoming(false);
    }
  };

  const handleSendMessage = async () => {
    if (!phoneNumber.trim() || !messageContent.trim() || isSending) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      phoneNumber: phoneNumber.trim(),
      content: messageContent.trim(),
      timestamp: new Date(),
      status: "sending",
      direction: "outgoing",
      type: "text",
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageContent("");
    setIsSending(true);

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          message: messageContent.trim(),
          type: 'text',
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id
              ? {
                  ...msg,
                  status: "sent",
                  whatsappMessageId: data.data?.messages?.[0]?.id,
                }
              : msg
          )
        );

        setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
            )
          );
        }, 2000);
      } else {
        throw new Error(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? {
                ...msg,
                status: "failed",
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTemplate = async () => {
    if (!phoneNumber.trim() || isSending) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      phoneNumber: phoneNumber.trim(),
      content: "Template: hello_world",
      timestamp: new Date(),
      status: "sending",
      direction: "outgoing",
      type: "template",
      templateName: "hello_world",
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsSending(true);

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          type: 'template',
          templateName: 'hello_world',
          languageCode: 'en_US',
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id
              ? {
                  ...msg,
                  status: "sent",
                  whatsappMessageId: data.data?.messages?.[0]?.id,
                }
              : msg
          )
        );

        setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
            )
          );
        }, 2000);
      } else {
        throw new Error(data.error || "Failed to send template message");
      }
    } catch (error) {
      console.error("Error sending template:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? {
                ...msg,
                status: "failed",
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : msg
        )
      );
    } finally {
      setIsSending(false);
    }
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
      case "failed":
        return <AlertCircle className="h-3 w-3 text-red-500" />;
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
      case "failed":
        return "נכשל";
      default:
        return "";
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith("972")) {
      return `+972 ${phone.substring(3, 5)}-${phone.substring(5)}`;
    }
    if (phone.startsWith("+972")) {
      return phone.replace("+972", "+972 ");
    }
    return phone;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex justify-between items-start">
          <div className="text-right">
            <h1 className="text-2xl font-bold">שיחות וואטסאפ</h1>
            <p className="text-muted-foreground mt-1">
              שלח וקבל הודעות בזמן אמת
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={fetchIncomingMessages}
              disabled={isLoadingIncoming}
              size="sm"
              variant="outline"
            >
              <RefreshCw
                className={`h-4 w-4 ml-2 ${isLoadingIncoming ? "animate-spin" : ""}`}
              />
              רענן
            </Button>
            {connectionStatus === "connected" && (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                ✅ מחובר
              </Badge>
            )}
            {connectionStatus === "disconnected" && (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200"
              >
                ❌ לא מחובר
              </Badge>
            )}
          </div>
        </div>

        {connectionStatus === "disconnected" && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-right">
              לא ניתן להתחבר ל-WhatsApp Business API. בדוק את הגדרות ה-API.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Conversation Area */}
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="text-right flex justify-between items-center">
              <span>שיחה</span>
              <Badge variant="outline">{messages.length} הודעות</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquareIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      אין הודעות עדיין
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      שלח הודעה כדי להתחיל שיחה
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
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
                          {message.direction === "incoming" && (
                            <User className="h-3 w-3" />
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {formatPhoneNumber(message.phoneNumber)}
                          </Badge>
                          {message.type === "template" && (
                            <Badge variant="outline" className="text-xs">
                              תבנית
                            </Badge>
                          )}
                          {message.direction === "outgoing" && (
                            <div className="flex items-center gap-1">
                              {getStatusIcon(message.status)}
                              <span className="text-xs opacity-75">
                                {getStatusText(message.status)}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-right" dir="auto">
                          {message.content}
                        </p>
                        {message.error && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-right">
                            <p className="text-xs text-red-600">
                              ❌ שגיאה: {message.error}
                            </p>
                          </div>
                        )}
                        <p className="text-xs opacity-75 mt-2 text-right">
                          {message.timestamp.toLocaleString("he-IL")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Send Message Panel */}
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-right">שלח הודעה</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="gap-2">
                  <Send className="h-4 w-4" />
                  טקסט
                </TabsTrigger>
                <TabsTrigger value="template" className="gap-2">
                  <MessageSquareIcon className="h-4 w-4" />
                  תבנית
                </TabsTrigger>
              </TabsList>

              {/* Phone Number Field */}
              <div className="space-y-2 mt-4">
                <Label htmlFor="phone" className="text-right block">
                  מספר טלפון
                </Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="972526581731"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pr-10 text-left"
                    dir="ltr"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  ללא + (לדוגמה: 972526581731)
                </p>
              </div>

              {/* Text Message Tab */}
              <TabsContent value="text" className="space-y-4 mt-4">
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
                      שולח...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      שלח הודעה
                    </>
                  )}
                </Button>
              </TabsContent>

              {/* Template Message Tab */}
              <TabsContent value="template" className="space-y-4 mt-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-right text-green-800">
                    תבנית hello_world תישלח ללקוח
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleSendTemplate}
                  disabled={!phoneNumber.trim() || isSending}
                  className="w-full gap-2"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      שולח תבנית...
                    </>
                  ) : (
                    <>
                      <MessageSquareIcon className="h-4 w-4" />
                      שלח תבנית
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

