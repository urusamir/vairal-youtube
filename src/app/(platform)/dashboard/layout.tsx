"use client";
import React from "react";
import { AuthProvider } from "@/providers/auth.provider";
import { DummyDataProvider } from "@/providers/dummy-data.provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { PrefetchProvider } from "@/providers/prefetch.provider";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PrefetchProvider>
        <DummyDataProvider>
          <SidebarProvider>
            <div className="flex h-screen bg-background w-full overflow-hidden print:h-auto print:overflow-visible print:block">
              <AppSidebar />
              <main className="flex-1 overflow-y-auto bg-hero-gradient relative print:h-auto print:overflow-visible">
                {/* Global Decorative Orbs */}
                <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none z-0 print:hidden" />
                <div className="absolute top-[35%] right-[25%] w-[550px] h-[550px] rounded-full bg-emerald-400/10 blur-[160px] pointer-events-none z-0 print:hidden" />
                <div className="absolute bottom-[10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-purple-400/15 blur-[150px] pointer-events-none z-0 print:hidden" />
                <div className="relative z-10 w-full min-h-full">
                  {children}
                </div>
              </main>
            </div>
          </SidebarProvider>
        </DummyDataProvider>
      </PrefetchProvider>
      {/* Global toast notifications — must be outside scroll containers */}
      <Toaster />
    </AuthProvider>
  );
}
