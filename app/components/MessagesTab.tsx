"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Phone,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquareIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import whatsappAPI, { TEST_PHONE_NUMBERS } from "@/lib/whatsapp-api";

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

interface Template {
  id: string;
  name: string;
  status: string;
  category: string;
  language: string;
  components: Array<{
    type: string;
    text?: string;
    format?: string;
  }>;
}

export default function MessagesTab() {
  const { user } = useAuthGuard();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "unknown" | "connected" | "disconnected"
  >("unknown");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      phoneNumber: "+972501234567",
      content:
        "שלום! ברוכים הבאים לשירות הלקוחות שלנו. איך אוכל לעזור לכם היום?",
      timestamp: new Date(Date.now() - 3600000),
      status: "read",
      direction: "outgoing",
      type: "text",
    },
    {
      id: "2",
      phoneNumber: "+972501234567",
      content: "היי, אני מעוניין לקבל מידע על המוצרים שלכם",
      timestamp: new Date(Date.now() - 3000000),
      status: "read",
      direction: "incoming",
      type: "text",
    },
    {
      id: "3",
      phoneNumber: "+972507654321",
      content: "תודה על ההזמנה! נחזור אליכם בהקדם עם פרטי המשלוח.",
      timestamp: new Date(Date.now() - 1800000),
      status: "delivered",
      direction: "outgoing",
      type: "text",
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

  useEffect(() => {
    // Test backend connection on component mount
    testConnection();
    // Load available templates
    loadTemplates();
  }, []);

  const testConnection = async () => {
    try {
      await whatsappAPI.testConnection();
      setConnectionStatus("connected");
    } catch (error) {
      console.error("Backend connection failed:", error);
      setConnectionStatus("disconnected");
    }
  };

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await whatsappAPI.getTemplates();
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setIsLoadingTemplates(false);
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
      const response = await whatsappAPI.sendTextMessage({
        phoneNumber: phoneNumber.trim(),
        message: messageContent.trim(),
      });

      if (response.success && response.data) {
        // Update message with WhatsApp message ID and mark as sent
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id
              ? {
                  ...msg,
                  status: "sent",
                  whatsappMessageId: response.data?.messages?.[0]?.id,
                }
              : msg
          )
        );

        // Simulate delivery status after a delay (WhatsApp doesn't provide real-time delivery status)
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
            )
          );
        }, 2000);
      } else {
        throw new Error(response.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Update message status to failed
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
    if (!phoneNumber.trim() || !selectedTemplate || isSending) return;

    const template = templates.find((t) => t.name === selectedTemplate);
    if (!template) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      phoneNumber: phoneNumber.trim(),
      content: `Template: ${template.name} (${template.category})`,
      timestamp: new Date(),
      status: "sending",
      direction: "outgoing",
      type: "template",
      templateName: template.name,
    };

    setMessages((prev) => [...prev, newMessage]);
    setSelectedTemplate("");
    setIsSending(true);

    try {
      const response = await whatsappAPI.sendTemplateMessage({
        phoneNumber: phoneNumber.trim(),
        templateName: template.name,
        languageCode: template.language,
      });

      if (response.success && response.data) {
        // Update message with WhatsApp message ID and mark as sent
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id
              ? {
                  ...msg,
                  status: "sent",
                  whatsappMessageId: response.data?.messages?.[0]?.id,
                }
              : msg
          )
        );

        // Simulate delivery status after a delay
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
            )
          );
        }, 2000);
      } else {
        throw new Error(response.error || "Failed to send template message");
      }
    } catch (error) {
      console.error("Error sending template:", error);
      // Update message status to failed
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
        <div className="flex justify-between items-start">
          <div className="text-right">
            <h1 className="text-2xl font-bold">
              ניהול הודעות וואטסאפ {user?.name && `- ${user.name}`}
            </h1>
            <p className="text-muted-foreground mt-1">
              שלח הודעות ללקוחות שלך דרך WhatsApp Business API
            </p>
          </div>
          <div className="flex items-center gap-2">
            {connectionStatus === "connected" && (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                ✅ מחובר לוואטסאפ
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
            {connectionStatus === "unknown" && (
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 border-yellow-200"
              >
                ⏳ בודק חיבור...
              </Badge>
            )}
          </div>
        </div>

        {connectionStatus === "disconnected" && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-right">
              לא ניתן להתחבר ל-WhatsApp Business API. בדוק את הגדרות ה-API או
              פנה לתמיכה.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex-1 flex gap-6 p-6">
        {/* Message Form */}
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-right">שלח הודעה חדשה</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="gap-2">
                  <Send className="h-4 w-4" />
                  הודעת טקסט
                </TabsTrigger>
                <TabsTrigger value="template" className="gap-2">
                  <MessageSquareIcon className="h-4 w-4" />
                  תבנית הודעה
                </TabsTrigger>
              </TabsList>

              {/* Phone Number Field - Common for both tabs */}
              <div className="space-y-2 mt-4">
                <Label htmlFor="phone" className="text-right block">
                  מספר טלפון
                </Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+15550101010"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pr-10 text-left"
                    dir="ltr"
                  />
                </div>

                {/* Test Phone Numbers Helper */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs text-blue-800 font-medium text-right mb-2">
                    📞 מספרי טלפון לבדיקה (Test Numbers):
                  </p>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {Object.entries(TEST_PHONE_NUMBERS).map(([key, number]) => (
                      <button
                        key={key}
                        onClick={() => setPhoneNumber(number)}
                        className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs rounded border border-blue-300 transition-colors"
                        type="button"
                      >
                        {number}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600 text-right mt-2">
                    לחץ על מספר כדי להשתמש בו
                  </p>
                </div>
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
                      שולח הודעה...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      שלח הודעת טקסט
                    </>
                  )}
                </Button>
              </TabsContent>

              {/* Template Message Tab */}
              <TabsContent value="template" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="template" className="text-right block">
                    בחר תבנית הודעה
                  </Label>
                  {isLoadingTemplates ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      טוען תבניות...
                    </div>
                  ) : (
                    <Select
                      value={selectedTemplate}
                      onValueChange={setSelectedTemplate}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="בחר תבנית הודעה..." />
                      </SelectTrigger>
                      <SelectContent>
                        {templates
                          .filter((t) => t.status === "APPROVED")
                          .map((template) => (
                            <SelectItem key={template.id} value={template.name}>
                              <div className="flex items-center gap-2 text-right">
                                <Badge variant="outline" className="text-xs">
                                  {template.category}
                                </Badge>
                                <span>{template.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        {templates.filter((t) => t.status === "APPROVED")
                          .length === 0 && (
                          <SelectItem value="" disabled>
                            אין תבניות מאושרות זמינות
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {selectedTemplate && (
                  <div className="p-3 bg-muted rounded-md text-right">
                    <p className="text-sm text-muted-foreground mb-2">
                      תצוגה מקדימה של התבנית:
                    </p>
                    {templates
                      .find((t) => t.name === selectedTemplate)
                      ?.components?.map((comp, idx) => (
                        <div key={idx} className="text-sm mb-1">
                          {comp.type === "HEADER" && comp.text && (
                            <div className="font-semibold">{comp.text}</div>
                          )}
                          {comp.type === "BODY" && comp.text && (
                            <div>{comp.text}</div>
                          )}
                          {comp.type === "FOOTER" && comp.text && (
                            <div className="text-xs text-muted-foreground">
                              {comp.text}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}

                <Button
                  onClick={handleSendTemplate}
                  disabled={
                    !phoneNumber.trim() || !selectedTemplate || isSending
                  }
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
                      שלח תבנית הודעה
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
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
                        {message.type === "template" && (
                          <Badge variant="outline" className="text-xs">
                            תבנית: {message.templateName}
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
                      <p className="text-sm text-right" dir="rtl">
                        {message.content}
                      </p>
                      {message.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-right">
                          <p className="text-xs text-red-600">
                            ❌ שגיאה: {message.error}
                          </p>
                        </div>
                      )}
                      {message.whatsappMessageId && (
                        <p className="text-xs opacity-50 mt-1 text-right">
                          ID: {message.whatsappMessageId}
                        </p>
                      )}
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
