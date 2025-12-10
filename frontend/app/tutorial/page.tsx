"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Play } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TutorialPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to KYC
          </Button>
          <h1 className="text-2xl font-bold">KYC Verification Tutorial</h1>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-video w-full bg-muted relative flex items-center justify-center group cursor-pointer">
              {/* This is a placeholder for the actual video player */}
              <div className="absolute inset-0 bg-black/5" />
              <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                <Play className="h-8 w-8 text-primary-foreground ml-1" />
              </div>
              <p className="absolute bottom-4 text-sm text-muted-foreground font-medium">
                Click to play tutorial video
              </p>
            </div>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-2">
                How to complete your KYC
              </h2>
              <p className="text-muted-foreground">
                Watch this short video to learn how to properly scan your
                documents and complete the identity verification process quickly
                and securely.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
