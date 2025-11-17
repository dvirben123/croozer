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
  X,
  Plus,
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

interface PhoneConversation {
  phoneNumber: string;
  messages: Message[];
  unreadCount: number;
}

export default function InteractiveMessagesTab() {
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [conversations, setConversations] = useState<PhoneConversation[]>([]);
  const [activePhoneTab, setActivePhoneTab] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingIncoming, setIsLoadingIncoming] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, activePhoneTab]);

  useEffect(() => {
    // Load incoming messages on mount
    fetchIncomingMessages();
    
    // Auto-refresh incoming messages every 10 seconds
    const interval = setInterval(fetchIncomingMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatPhoneNumber = (phone: string): string => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, "");
    
    // Add + if not present
    if (!phone.startsWith("+")) {
      return "+" + cleaned;
    }
    return phone;
  };

  const fetchIncomingMessages = async () => {
    try {
      setIsLoadingIncoming(true);
      const response = await fetch("/api/messages/incoming?limit=100");
      const data = await response.json();
      
      if (data.success && data.data) {
        // Group messages by phone number
        const messagesByPhone: { [key: string]: IncomingMessage[] } = {};
        
        data.data.forEach((msg: IncomingMessage) => {
          const phone = formatPhoneNumber(msg.from);
          if (!messagesByPhone[phone]) {
            messagesByPhone[phone] = [];
          }
          messagesByPhone[phone].push(msg);
        });

        // Update conversations
        setConversations((prevConversations) => {
          const updatedConversations = [...prevConversations];

          Object.entries(messagesByPhone).forEach(([phone, msgs]) => {
            let conversation = updatedConversations.find(
              (c) => c.phoneNumber === phone
            );

            if (!conversation) {
              // Create new conversation
              conversation = {
                phoneNumber: phone,
                messages: [],
                unreadCount: 0,
              };
              updatedConversations.push(conversation);
            }

            // Add incoming messages that don't exist yet
            msgs.forEach((incomingMsg) => {
              const exists = conversation!.messages.some(
                (m) => m.whatsappMessageId === incomingMsg.messageId
              );

              if (!exists) {
                conversation!.messages.push({
                  id: incomingMsg._id,
                  phoneNumber: phone,
                  content: incomingMsg.text || `(${incomingMsg.type} message)`,
                  timestamp: new Date(incomingMsg.timestamp),
                  status: "read",
                  direction: "incoming",
                  type: "text",
                  whatsappMessageId: incomingMsg.messageId,
                });
                
                // Increment unread count if not active tab
                if (activePhoneTab !== phone) {
                  conversation!.unreadCount++;
                }
              }
            });

            // Sort messages by timestamp
            conversation.messages.sort(
              (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
            );
          });

          // Sort conversations by latest message
          updatedConversations.sort((a, b) => {
            const aLatest = a.messages[a.messages.length - 1]?.timestamp || new Date(0);
            const bLatest = b.messages[b.messages.length - 1]?.timestamp || new Date(0);
            return bLatest.getTime() - aLatest.getTime();
          });

          return updatedConversations;
        });

        // Set active tab to first conversation if none selected
        if (!activePhoneTab && Object.keys(messagesByPhone).length > 0) {
          const firstPhone = Object.keys(messagesByPhone)[0];
          setActivePhoneTab(firstPhone);
        }
      }
    } catch (error) {
      console.error("Error fetching incoming messages:", error);
    } finally {
      setIsLoadingIncoming(false);
    }
  };

  const handleSendMessage = async () => {
    if (!activePhoneTab || !messageContent.trim() || isSending) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      phoneNumber: activePhoneTab,
      content: messageContent.trim(),
      timestamp: new Date(),
      status: "sending",
      direction: "outgoing",
      type: "text",
    };

    // Add message to conversation
    setConversations((prev) =>
      prev.map((conv) =>
        conv.phoneNumber === activePhoneTab
          ? { ...conv, messages: [...conv.messages, newMessage] }
          : conv
      )
    );
    setMessageContent("");
    setIsSending(true);

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: activePhoneTab,
          message: messageContent.trim(),
          type: "text",
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.phoneNumber === activePhoneTab
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === newMessage.id
                      ? {
                          ...msg,
                          status: "sent",
                          whatsappMessageId: data.data?.messages?.[0]?.id,
                        }
                      : msg
                  ),
                }
              : conv
          )
        );

        setTimeout(() => {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.phoneNumber === activePhoneTab
                ? {
                    ...conv,
                    messages: conv.messages.map((msg) =>
                      msg.id === newMessage.id
                        ? { ...msg, status: "delivered" }
                        : msg
                    ),
                  }
                : conv
            )
          );
        }, 2000);
      } else {
        throw new Error(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.phoneNumber === activePhoneTab
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === newMessage.id
                    ? {
                        ...msg,
                        status: "failed",
                        error:
                          error instanceof Error
                            ? error.message
                            : "Unknown error",
                      }
                    : msg
                ),
              }
            : conv
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTemplate = async () => {
    if (!activePhoneTab || isSending) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      phoneNumber: activePhoneTab,
      content: "Template: hello_world",
      timestamp: new Date(),
      status: "sending",
      direction: "outgoing",
      type: "template",
      templateName: "hello_world",
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.phoneNumber === activePhoneTab
          ? { ...conv, messages: [...conv.messages, newMessage] }
          : conv
      )
    );
    setIsSending(true);

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: activePhoneTab,
          type: "template",
          templateName: "hello_world",
          languageCode: "en_US",
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.phoneNumber === activePhoneTab
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === newMessage.id
                      ? {
                          ...msg,
                          status: "sent",
                          whatsappMessageId: data.data?.messages?.[0]?.id,
                        }
                      : msg
                  ),
                }
              : conv
          )
        );

        setTimeout(() => {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.phoneNumber === activePhoneTab
                ? {
                    ...conv,
                    messages: conv.messages.map((msg) =>
                      msg.id === newMessage.id
                        ? { ...msg, status: "delivered" }
                        : msg
                    ),
                  }
                : conv
            )
          );
        }, 2000);
      } else {
        throw new Error(data.error || "Failed to send template message");
      }
    } catch (error) {
      console.error("Error sending template:", error);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.phoneNumber === activePhoneTab
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === newMessage.id
                    ? {
                        ...msg,
                        status: "failed",
                        error:
                          error instanceof Error
                            ? error.message
                            : "Unknown error",
                      }
                    : msg
                ),
              }
            : conv
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleStartNewConversation = () => {
    if (!newPhoneNumber.trim()) return;

    const formattedPhone = formatPhoneNumber(newPhoneNumber.trim());

    // Check if conversation already exists
    const exists = conversations.some(
      (c) => c.phoneNumber === formattedPhone
    );

    if (!exists) {
      setConversations((prev) => [
        {
          phoneNumber: formattedPhone,
          messages: [],
          unreadCount: 0,
        },
        ...prev,
      ]);
    }

    setActivePhoneTab(formattedPhone);
    setNewPhoneNumber("");
    setShowNewConversation(false);
  };

  const handleTabChange = (phoneNumber: string) => {
    setActivePhoneTab(phoneNumber);
    
    // Clear unread count for this conversation
    setConversations((prev) =>
      prev.map((conv) =>
        conv.phoneNumber === phoneNumber
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  const getStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "sending":
        return <Loader2 className="h-3 w-3 animate-spin text-gray-400" />;
      case "sent":
        return <CheckCircle2 className="h-3 w-3 text-gray-400" />;
      case "delivered":
        return (
          <div className="flex">
            <CheckCircle2 className="h-3 w-3 text-blue-500 -mr-1" />
            <CheckCircle2 className="h-3 w-3 text-blue-500" />
          </div>
        );
      case "read":
        return (
          <div className="flex">
            <CheckCircle2 className="h-3 w-3 text-green-500 -mr-1" />
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          </div>
        );
      case "failed":
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const activeConversation = conversations.find(
    (c) => c.phoneNumber === activePhoneTab
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">הודעות WhatsApp</h2>
          <p className="text-muted-foreground">
            נהל שיחות עם לקוחות בזמן אמת
          </p>
        </div>
        <Button
          onClick={fetchIncomingMessages}
          variant="outline"
          size="sm"
          disabled={isLoadingIncoming}
        >
          {isLoadingIncoming ? (
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          ) : (
            <RefreshCw className="h-4 w-4 ml-2" />
          )}
          רענן
        </Button>
      </div>

      {/* Conversations */}
      {conversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquareIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">אין שיחות פעילות</h3>
            <p className="text-muted-foreground text-center mb-4">
              התחל שיחה חדשה עם לקוח
            </p>
            <Button onClick={() => setShowNewConversation(true)}>
              <Plus className="h-4 w-4 ml-2" />
              שיחה חדשה
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>שיחות</CardTitle>
              <Button
                onClick={() => setShowNewConversation(true)}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 ml-2" />
                שיחה חדשה
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activePhoneTab || undefined} onValueChange={handleTabChange}>
              <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
                {conversations.map((conv) => (
                  <TabsTrigger
                    key={conv.phoneNumber}
                    value={conv.phoneNumber}
                    className="relative"
                  >
                    <Phone className="h-4 w-4 ml-2" />
                    {conv.phoneNumber}
                    {conv.unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="mr-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {conversations.map((conv) => (
                <TabsContent
                  key={conv.phoneNumber}
                  value={conv.phoneNumber}
                  className="space-y-4 mt-4"
                >
                  {/* Messages Area */}
                  <ScrollArea className="h-[400px] border rounded-lg p-4 bg-muted/20">
                    {conv.messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <MessageSquareIcon className="h-8 w-8 mx-auto mb-2" />
                          <p>אין הודעות עדיין</p>
                          <p className="text-sm">שלח הודעה כדי להתחיל שיחה</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {conv.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.direction === "outgoing"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                msg.direction === "outgoing"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {msg.content}
                              </p>
                              <div className="flex items-center justify-end gap-2 mt-1">
                                <span className="text-xs opacity-70">
                                  {msg.timestamp.toLocaleTimeString("he-IL", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {msg.direction === "outgoing" &&
                                  getStatusIcon(msg.status)}
                              </div>
                              {msg.error && (
                                <Alert className="mt-2 py-1 px-2">
                                  <AlertDescription className="text-xs">
                                    {msg.error}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="הקלד הודעה..."
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="min-h-[80px] resize-none"
                      />
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={handleSendMessage}
                          disabled={!messageContent.trim() || isSending}
                          className="flex-1"
                        >
                          {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          onClick={handleSendTemplate}
                          disabled={isSending}
                          variant="outline"
                          className="flex-1"
                          title="שלח תבנית hello_world"
                        >
                          תבנית
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      לחץ Enter לשליחה, Shift+Enter לשורה חדשה
                    </p>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* New Conversation Dialog */}
      {showNewConversation && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>שיחה חדשה</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewConversation(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPhone">מספר טלפון</Label>
              <div className="flex gap-2">
                <Input
                  id="newPhone"
                  type="tel"
                  placeholder="+972526581731"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleStartNewConversation();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleStartNewConversation}
                  disabled={!newPhoneNumber.trim()}
                >
                  <Phone className="h-4 w-4 ml-2" />
                  התחל
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                הזן מספר טלפון בפורמט בינלאומי (לדוגמה: +972526581731)
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
