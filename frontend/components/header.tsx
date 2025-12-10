"use client";

import { Shield, ArrowLeft, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKYC } from "@/lib/kyc-context";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function KYCHeader() {
  const { currentView, setCurrentView } = useKYC();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showBackButton = currentView !== "home";

  const handleBack = () => {
    const backMap: Record<string, string> = {
      "document-selection": "home",
      "saved-documents": "document-selection",
      "security-access": "document-selection",
      "smart-scan": "document-selection",
      validation: "smart-scan",
      upload: "validation",
      selfie: "home",
      dashboard: "home",
    };
    setCurrentView((backMap[currentView] || "home") as never);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="mr-1"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Go back</span>
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold tracking-tight">
                SecureKYC
              </h1>
              <p className="text-xs text-muted-foreground">
                Identity Verification
              </p>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {["home", "dashboard"].map((view) => (
            <Button
              key={view}
              variant={currentView === view ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setCurrentView(view as never)}
              className="capitalize"
            >
              {view}
            </Button>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-200 ease-in-out border-t border-border",
          mobileMenuOpen ? "max-h-40" : "max-h-0 border-t-0"
        )}
      >
        <div className="px-4 py-3 space-y-1">
          {["home", "dashboard"].map((view) => (
            <Button
              key={view}
              variant={currentView === view ? "secondary" : "ghost"}
              className="w-full justify-start capitalize"
              onClick={() => {
                setCurrentView(view as never);
                setMobileMenuOpen(false);
              }}
            >
              {view}
            </Button>
          ))}
        </div>
      </div>
    </header>
  );
}
