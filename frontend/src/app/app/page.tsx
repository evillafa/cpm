"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import CreditRequestForm from "@/components/credit-request-form";
import StatusPanel from "@/components/status-panel";

export default function AppPage() {
  const router = useRouter();
  
  // Check if user is authenticated
  useEffect(() => {
    const isAuth = localStorage.getItem("auth");
    if (!isAuth) {
      router.push("/");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Toaster />
      <div className="container mx-auto">
        <header className="flex justify-between items-center py-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">CP</span>
            </div>
            <h1 className="text-xl font-bold">Credit Rating System</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CreditRequestForm />
          <StatusPanel />
        </div>
      </div>
    </div>
  );
}
