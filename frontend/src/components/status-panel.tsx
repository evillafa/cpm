"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { getWebSocketUrl } from "../config/websocket";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Assessment {
  assessmentId: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  score?: {
    model: string;
    value: number;
    riskTier: "LOW" | "MEDIUM" | "HIGH";
  };
}

export default function StatusPanel() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket server using environment-based configuration
    const ws = new WebSocket(getWebSocketUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      console.log("Connected to WebSocket server");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle welcome message
        if (data.type === "connection") {
          console.log(data.message);
          return;
        }
        
        // Handle assessment update
        if (data.assessmentId) {
          setAssessments(prev => {
            // Check if assessment already exists
            const existingIndex = prev.findIndex(a => a.assessmentId === data.assessmentId);
            
            if (existingIndex >= 0) {
              // Update existing assessment
              const updated = [...prev];
              updated[existingIndex] = data;
              
              // Show toast notification for completed assessments
              if (data.status === "COMPLETED" && prev[existingIndex].status !== "COMPLETED") {
                toast.success(`Assessment ${data.assessmentId} completed`);
              } else if (data.status === "FAILED" && prev[existingIndex].status !== "FAILED") {
                toast.error(`Assessment ${data.assessmentId} failed`);
              }
              
              return updated;
            } else {
              // Add new assessment
              return [...prev, data];
            }
          });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("Disconnected from WebSocket server");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnected(false);
    };

    // Clean up on unmount
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  // Function to get risk tier badge color
  const getRiskColor = (tier: string) => {
    switch (tier) {
      case "LOW":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "HIGH":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Assessment Status</CardTitle>
            <CardDescription>Real-time credit assessment status</CardDescription>
          </div>
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-muted-foreground">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {assessments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No assessments yet. Submit a request to see results here.
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div key={assessment.assessmentId} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{assessment.assessmentId}</div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(assessment.status)}`}>
                    {assessment.status}
                  </span>
                </div>
                
                {assessment.score && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Model:</span>
                      <span>{assessment.score.model}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Score:</span>
                      <span>{assessment.score.value}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Risk Tier:</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getRiskColor(assessment.score.riskTier)}`}>
                        {assessment.score.riskTier}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
