"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, MessageSquare, Clock, User } from 'lucide-react';

interface IncomingMessage {
  _id: string;
  messageId: string;
  from: string;
  type: string;
  text?: string;
  timestamp: string;
  processed: boolean;
  replied: boolean;
}

export default function IncomingMessagesPage() {
  const [messages, setMessages] = useState<IncomingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<Date>(new Date());

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/messages/incoming');
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
        setLastFetch(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchMessages, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPhone = (phone: string) => {
    if (phone.startsWith('972')) {
      return `+972 ${phone.substring(3, 5)}-${phone.substring(5)}`;
    }
    return phone;
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">הודעות נכנסות מוואטסאפ</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                עדכון אחרון: {lastFetch.toLocaleTimeString('he-IL')}
              </p>
            </div>
            <Button
              onClick={fetchMessages}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
              רענן
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && messages.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">טוען הודעות...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">אין הודעות נכנסות</p>
              <p className="text-sm text-muted-foreground mt-2">
                שלח הודעה ל-+972 53-533-1770 כדי לראות אותה כאן
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {messages.map((message) => (
                  <Card key={message._id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {formatPhone(message.from)}
                          </span>
                          <Badge variant="outline">{message.type}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                      
                      {message.text && (
                        <div className="bg-muted p-3 rounded-md text-right">
                          <p className="text-sm">{message.text}</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-3">
                        {message.processed && (
                          <Badge variant="secondary" className="text-xs">
                            ✓ עובד
                          </Badge>
                        )}
                        {message.replied && (
                          <Badge variant="secondary" className="text-xs">
                            ✓ נענה
                          </Badge>
                        )}
                        {!message.processed && !message.replied && (
                          <Badge variant="outline" className="text-xs">
                            חדש
                          </Badge>
                        )}
                      </div>
                      
                      <div className="mt-2 text-xs text-muted-foreground">
                        Message ID: {message.messageId}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

