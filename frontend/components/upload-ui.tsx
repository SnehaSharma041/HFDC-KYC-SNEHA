"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Upload,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Loader2,
  RefreshCcw,
  Minimize2,
  ArrowRight,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useKYC } from "@/lib/kyc-context";
import { cn } from "@/lib/utils";

export function UploadUI() {
  const { setCurrentView, uploadState, setUploadState } = useKYC();
  const [isDuplicate, setIsDuplicate] = useState(false);

  const simulateUpload = useCallback(async () => {
    // Check for duplicate
    setIsDuplicate(Math.random() > 0.7);

    // Compression phase
    setUploadState({
      status: "compressing",
      progress: 0,
      networkStrength: "strong",
      originalSize: 4.2,
      compressedSize: undefined,
    });

    await new Promise((r) => setTimeout(r, 1000));

    // Conversion phase
    setUploadState({
      status: "converting",
      progress: 25,
      networkStrength: "strong",
      originalSize: 4.2,
      compressedSize: 1.8,
    });

    await new Promise((r) => setTimeout(r, 800));

    // Upload phase with varying network
    const networks: ("weak" | "moderate" | "strong")[] = [
      "strong",
      "moderate",
      "weak",
      "moderate",
      "strong",
    ];

    for (let i = 0; i < 100; i += 5) {
      await new Promise((r) => setTimeout(r, 150));
      const networkIndex = Math.floor((i / 100) * networks.length);
      setUploadState({
        status: "uploading",
        progress: 25 + i * 0.75,
        networkStrength: networks[networkIndex] || "strong",
        originalSize: 4.2,
        compressedSize: 1.8,
      });
    }

    setUploadState({
      status: "complete",
      progress: 100,
      networkStrength: "strong",
      originalSize: 4.2,
      compressedSize: 1.8,
    });
  }, [setUploadState]);

  useEffect(() => {
    simulateUpload();
  }, [simulateUpload]);

  const networkConfig = {
    weak: {
      icon: WifiOff,
      color: "text-destructive",
      bg: "bg-destructive/10",
      label: "Weak Connection",
      speed: "~50 KB/s",
    },
    moderate: {
      icon: Wifi,
      color: "text-warning",
      bg: "bg-warning/10",
      label: "Moderate",
      speed: "~200 KB/s",
    },
    strong: {
      icon: Wifi,
      color: "text-success",
      bg: "bg-success/10",
      label: "Strong",
      speed: "~1 MB/s",
    },
  };

  const network = networkConfig[uploadState.networkStrength];
  const NetworkIcon = network.icon;

  const statusConfig = {
    idle: { label: "Ready to upload", color: "text-muted-foreground" },
    compressing: { label: "Compressing file...", color: "text-info" },
    converting: { label: "Converting format...", color: "text-info" },
    uploading: { label: "Uploading...", color: "text-primary" },
    complete: { label: "Upload complete", color: "text-success" },
    error: { label: "Upload failed", color: "text-destructive" },
  };

  const status = statusConfig[uploadState.status];

  const handleRetry = () => {
    setUploadState({
      status: "idle",
      progress: 0,
      networkStrength: "strong",
    });
    setTimeout(simulateUpload, 500);
  };

  const handleContinue = () => {
    setCurrentView("dashboard");
  };

  const handleUseDuplicate = () => {
    setIsDuplicate(false);
    setUploadState({
      ...uploadState,
      status: "complete",
      progress: 100,
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Uploading Document
          </h1>
          <p className="text-muted-foreground mt-1">
            Your document is being securely uploaded
          </p>
        </div>

        {/* Duplicate Detection Alert */}
        {isDuplicate && (
          <Alert className="mb-6 border-warning/50 bg-warning/5">
            <Copy className="h-4 w-4 text-warning" />
            <AlertTitle className="text-warning">Duplicate Detected</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              This document appears to have been uploaded before. Would you like
              to use the existing copy?
            </AlertDescription>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDuplicate(false)}
              >
                Upload New
              </Button>
              <Button size="sm" onClick={handleUseDuplicate}>
                Use Existing
              </Button>
            </div>
          </Alert>
        )}

        {/* Main Upload Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              <div
                className={cn(
                  "relative w-20 h-20 rounded-full flex items-center justify-center",
                  uploadState.status === "complete"
                    ? "bg-success/10"
                    : uploadState.status === "error"
                    ? "bg-destructive/10"
                    : "bg-primary/10"
                )}
              >
                {uploadState.status === "complete" ? (
                  <CheckCircle2 className="h-10 w-10 text-success" />
                ) : uploadState.status === "error" ? (
                  <AlertTriangle className="h-10 w-10 text-destructive" />
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-primary" />
                    {uploadState.status !== "idle" && (
                      <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Status Label */}
            <p className={cn("text-center font-medium mb-4", status.color)}>
              {status.label}
            </p>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {Math.round(uploadState.progress)}%
                </span>
              </div>
              <Progress
                value={uploadState.progress}
                className={cn(
                  "h-3",
                  uploadState.status === "complete"
                    ? "[&>div]:bg-success"
                    : uploadState.status === "error"
                    ? "[&>div]:bg-destructive"
                    : ""
                )}
              />
            </div>

            {/* File Compression Info */}
            {(uploadState.status === "compressing" ||
              uploadState.status === "converting" ||
              uploadState.status === "uploading" ||
              uploadState.status === "complete") && (
              <Card className="bg-muted/50 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                      {uploadState.status === "compressing" ? (
                        <Minimize2 className="h-5 w-5 text-info" />
                      ) : (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">document-scan.jpg</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{uploadState.originalSize?.toFixed(1)} MB</span>
                        {uploadState.compressedSize && (
                          <>
                            <ArrowRight className="h-3 w-3" />
                            <span className="text-success">
                              {uploadState.compressedSize.toFixed(1)} MB
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(
                                (1 -
                                  uploadState.compressedSize /
                                    (uploadState.originalSize || 1)) *
                                  100
                              )}
                              % smaller
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Network Status */}
            {uploadState.status === "uploading" && (
              <Card className={cn("border", network.bg)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", network.bg)}>
                        <NetworkIcon className={cn("h-5 w-5", network.color)} />
                      </div>
                      <div>
                        <p className={cn("text-sm font-medium", network.color)}>
                          {network.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Upload speed: {network.speed}
                        </p>
                      </div>
                    </div>

                    {/* Network strength bars */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          className={cn(
                            "w-1.5 rounded-full transition-all",
                            bar <=
                              (uploadState.networkStrength === "strong"
                                ? 4
                                : uploadState.networkStrength === "moderate"
                                ? 2
                                : 1)
                              ? network.color.replace("text-", "bg-")
                              : "bg-muted"
                          )}
                          style={{ height: `${bar * 5}px` }}
                        />
                      ))}
                    </div>
                  </div>

                  {uploadState.networkStrength === "weak" && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Upload may take longer due to poor connection. Please stay
                      on this page.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Upload Stages */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Upload Stages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: "compress", label: "File Compression", threshold: 25 },
                { id: "convert", label: "Format Conversion", threshold: 50 },
                { id: "upload", label: "Secure Upload", threshold: 100 },
              ].map((stage) => {
                const isComplete = uploadState.progress >= stage.threshold;
                const isActive =
                  uploadState.progress > 0 &&
                  uploadState.progress < stage.threshold;

                return (
                  <div
                    key={stage.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors",
                      isComplete
                        ? "bg-success/10"
                        : isActive
                        ? "bg-primary/10"
                        : "bg-muted/50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full shrink-0",
                        isComplete
                          ? "bg-success"
                          : isActive
                          ? "bg-primary"
                          : "bg-muted"
                      )}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-success-foreground" />
                      ) : isActive ? (
                        <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-sm",
                        isComplete
                          ? "text-success font-medium"
                          : isActive
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {uploadState.status === "error" && (
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={handleRetry}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Retry Upload
            </Button>
          )}
          {uploadState.status === "complete" && (
            <Button className="w-full" onClick={handleContinue}>
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Security Notice */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          Your document is encrypted during transfer and storage.
          <br />
          We use bank-grade AES-256 encryption.
        </p>
      </div>
    </div>
  );
}
