"use client";

import { useState, useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Play, Plus, MessageCircle } from "lucide-react";

// Define initial nodes for WhatsApp conversation flow
const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: {
      label: (
        <div className="p-2">
          <div className="font-bold">התחלה</div>
          <div className="text-xs text-gray-500">לקוח שולח הודעה</div>
        </div>
      )
    },
    position: { x: 250, y: 5 },
  },
  {
    id: "2",
    data: {
      label: (
        <div className="p-2">
          <div className="font-bold">ברוכים הבאים</div>
          <div className="text-xs text-gray-500">שלח הודעת קבלת פנים</div>
          <Badge className="mt-1" variant="outline">welcome</Badge>
        </div>
      )
    },
    position: { x: 250, y: 100 },
  },
  {
    id: "3",
    data: {
      label: (
        <div className="p-2">
          <div className="font-bold">בחירת קטגוריה</div>
          <div className="text-xs text-gray-500">הצג קטגוריות מהתפריט</div>
          <Badge className="mt-1" variant="outline">category_selection</Badge>
        </div>
      )
    },
    position: { x: 250, y: 200 },
  },
  {
    id: "4",
    data: {
      label: (
        <div className="p-2">
          <div className="font-bold">בחירת מוצר</div>
          <div className="text-xs text-gray-500">הצג מוצרים בקטגוריה</div>
          <Badge className="mt-1" variant="outline">product_selection</Badge>
        </div>
      )
    },
    position: { x: 250, y: 300 },
  },
  {
    id: "5",
    data: {
      label: (
        <div className="p-2">
          <div className="font-bold">בחירת אפשרויות</div>
          <div className="text-xs text-gray-500">גודל, תוספות וכו'</div>
          <Badge className="mt-1" variant="outline">variant_selection</Badge>
        </div>
      )
    },
    position: { x: 100, y: 400 },
  },
  {
    id: "6",
    data: {
      label: (
        <div className="p-2">
          <div className="font-bold">עגלת קניות</div>
          <div className="text-xs text-gray-500">סיכום ואפשרויות</div>
          <Badge className="mt-1" variant="outline">cart</Badge>
        </div>
      )
    },
    position: { x: 400, y: 400 },
  },
  {
    id: "7",
    data: {
      label: (
        <div className="p-2">
          <div className="font-bold">תשלום</div>
          <div className="text-xs text-gray-500">יצירת הזמנה וקישור</div>
          <Badge className="mt-1" variant="outline">checkout</Badge>
        </div>
      )
    },
    position: { x: 400, y: 500 },
  },
  {
    id: "8",
    type: "output",
    data: {
      label: (
        <div className="p-2">
          <div className="font-bold">הושלם</div>
          <div className="text-xs text-gray-500">הזמנה נוצרה</div>
        </div>
      )
    },
    position: { x: 400, y: 600 },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true, label: "הודעה ראשונה" },
  { id: "e2-3", source: "2", target: "3", animated: true },
  { id: "e3-4", source: "3", target: "4", animated: true, label: "נבחרה קטגוריה" },
  { id: "e4-5", source: "4", target: "5", animated: true, label: "מוצר עם אפשרויות" },
  { id: "e4-6", source: "4", target: "6", animated: true, label: "מוצר פשוט" },
  { id: "e5-6", source: "5", target: "6", animated: true, label: "נבחרו אפשרויות" },
  { id: "e6-3", source: "6", target: "3", label: "הוסף עוד", style: { stroke: "#93c5fd" } },
  { id: "e6-7", source: "6", target: "7", animated: true, label: "לתשלום" },
  { id: "e7-8", source: "7", target: "8", animated: true },
];

export default function ConversationTemplateTab() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleSave = async () => {
    // TODO: Save template to database
    alert("התבנית נשמרה בהצלחה!");
  };

  const handleTest = () => {
    // TODO: Test flow with sample data
    alert("בדיקת התבנית תתחיל בקרוב...");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              תבנית שיחה - WhatsApp
            </h1>
            <p className="text-muted-foreground">
              עצב את תהליך ההזמנה באמצעות WhatsApp
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleTest} variant="outline" className="gap-2">
              <Play className="h-4 w-4" />
              בדוק תבנית
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              שמור תבנית
            </Button>
          </div>
        </div>

        {/* Flow Info */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{nodes.length}</div>
                  <div className="text-xs text-muted-foreground">שלבים</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <div>
                  <div className="text-2xl font-bold">{edges.length}</div>
                  <div className="text-xs text-muted-foreground">מעברים</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div>
                <div className="text-sm font-semibold text-green-600">פעיל</div>
                <div className="text-xs text-muted-foreground">סטטוס</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div>
                <div className="text-sm font-semibold">התפריט</div>
                <div className="text-xs text-muted-foreground">מקור מוצרים</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Flow Canvas */}
      <div className="flex-1 bg-gray-50" dir="ltr">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>

      {/* Instructions */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-start gap-4 text-sm">
          <div className="flex-1">
            <div className="font-semibold mb-1">💡 איך זה עובד?</div>
            <p className="text-muted-foreground">
              התבנית מגדירה את תהליך השיחה עם הלקוח. כל שלב מייצג הודעה או פעולה בשיחה.
            </p>
          </div>
          <div className="flex-1">
            <div className="font-semibold mb-1">🎯 שלבים עיקריים</div>
            <p className="text-muted-foreground">
              ברוכים הבאים → בחירת קטגוריה → בחירת מוצר → אפשרויות → עגלה → תשלום
            </p>
          </div>
          <div className="flex-1">
            <div className="font-semibold mb-1">⚡ עדכון אוטומטי</div>
            <p className="text-muted-foreground">
              התבנית מתעדכנת אוטומטית מהתפריט שלך - קטגוריות, מוצרים ואפשרויות
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
