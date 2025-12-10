"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import {
  Camera,
  Zap,
  CheckCircle2,
  Sun,
  Move,
  Focus,
  RotateCcw,
  ImageIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useKYC } from "@/lib/kyc-context";
import { cn } from "@/lib/utils";
import type { ScanWarning } from "@/lib/kyc-types";

export function SmartScan() {
  const { selectedDocument, setCurrentView, setCapturedImage } = useKYC();
  const [isScanning, setIsScanning] = useState(false);
  const [clarityScore, setClarityScore] = useState(0);
  const [warnings, setWarnings] = useState<ScanWarning[]>([]);
  const [edgeDetection, setEdgeDetection] = useState({
    top: false,
    right: false,
    bottom: false,
    left: false,
  });
  const [isReadyToCapture, setIsReadyToCapture] = useState(false);
  const [lightingLevel, setLightingLevel] = useState<"low" | "good" | "high">(
    "good"
  );
  const [resolutionWarning, setResolutionWarning] = useState<boolean>(false);
  const [isDocumentDetected, setIsDocumentDetected] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const videoConstraints = {
    facingMode: "environment",
    width: { min: 640, ideal: 1920, max: 1920 },
    height: { min: 480, ideal: 1080, max: 1080 },
  };

  // Analysis state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analysisLoopRef = useRef<number | null>(null);
  const lastAnalysisTimeRef = useRef<number>(0);

  const handleStartScan = () => {
    setIsScanning(true);
    setClarityScore(50);
  };

  // Image enhancement logic
  const enhanceImage = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Apply simple contrast stretching and grayscale for better OCR
    // Calculate min/max luma for stretching
    let min = 255;
    let max = 0;

    for (let i = 0; i < data.length; i += 4) {
      // Grayscale
      const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = data[i + 1] = data[i + 2] = luma;

      if (luma < min) min = luma;
      if (luma > max) max = luma;
    }

    // Contrast stretch
    const range = max - min;
    if (range > 0) {
      const alpha = 255 / range;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i + 1] = data[i + 2] = (data[i] - min) * alpha;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const getFrameScore = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let totalGradient = 0;
    const stride = 4; // Check less pixels for speed

    for (let y = 0; y < height; y += stride) {
      for (let x = 0; x < width - stride; x += stride) {
        const i = (y * width + x) * 4;
        const nextI = (y * width + (x + stride)) * 4;
        const contrast = Math.abs(data[i] - data[nextI]);
        totalGradient += contrast;
      }
    }
    return totalGradient;
  };

  const handleCapture = useCallback(async () => {
    if (!webcamRef.current?.video) return;
    const video = webcamRef.current.video;

    // Burst mode: Capture 3 frames
    const frames: { score: number; dataUrl: string }[] = [];
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    setIsScanning(false); // Stop scanning UI updates

    // Take 3 shots with small delay
    for (let i = 0; i < 3; i++) {
      ctx.drawImage(video, 0, 0);
      const score = getFrameScore(ctx, canvas.width, canvas.height);
      frames.push({ score, dataUrl: canvas.toDataURL("image/jpeg", 0.9) });
      await new Promise((r) => setTimeout(r, 100));
    }

    // Pick best
    frames.sort((a, b) => b.score - a.score);
    const bestFrame = frames[0];

    // Enhance best frame
    const img = new Image();
    img.src = bestFrame.dataUrl;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      enhanceImage(ctx, canvas.width, canvas.height);
      setCapturedImage(canvas.toDataURL("image/jpeg", 0.9));
      setCurrentView("validation");
    };
  }, [setCapturedImage, setCurrentView]);

  // Core analysis function
  const analyzeFrame = useCallback(() => {
    if (!isScanning) return;

    // Always schedule next frame
    analysisLoopRef.current = requestAnimationFrame(analyzeFrame);

    if (!webcamRef.current || !webcamRef.current.video) return;

    const video = webcamRef.current.video;
    // content to ensure video is actually playing
    if (video.readyState !== 4) return;

    // Throttle analysis to ~5 times per second (every 200ms) to save CPU
    const now = Date.now();
    if (now - lastAnalysisTimeRef.current < 200) {
      return;
    }
    lastAnalysisTimeRef.current = now;

    // Setup canvas
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvasRef.current = canvas;
    }

    // Use a small resolution for performance (e.g., 320px wide)
    const scale = 320 / video.videoWidth;
    const width = 320;
    const height = Math.floor(video.videoHeight * scale);

    if (canvas.width !== width) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Analysis Variables
    let totalLuminance = 0;
    let totalGradient = 0;
    let textDensityCount = 0;

    // Region variables for edge detection
    const regions = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    };

    // Margins for edge detection (15% of width/height)
    const marginX = Math.floor(width * 0.15);
    const marginY = Math.floor(height * 0.15);

    // Pass 1: Luminance & Gradient (Clarity) & Edge Activity
    // We stride by 4 (every 4th pixel) or 2 for performance if needed,
    // but at 320x240, full loop is okay-ish. Let's do stride 2.
    const stride = 2; // Check every 2nd pixel
    let pixelCount = 0;

    for (let y = 0; y < height; y += stride) {
      for (let x = 0; x < width; x += stride) {
        const i = (y * width + x) * 4;

        // Luminance (human perception weighted)
        const luma =
          0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        totalLuminance += luma;
        pixelCount++;

        // Gradient (Clarity proxy) - horizontal diff
        // Compare with pixel to the right
        if (x < width - stride) {
          const nextI = (y * width + (x + stride)) * 4;
          const contrast =
            Math.abs(data[i] - data[nextI]) +
            Math.abs(data[i + 1] - data[nextI + 1]) +
            Math.abs(data[i + 2] - data[nextI + 2]);
          totalGradient += contrast;

          // Text Density Check (Center 50% only)
          // Text creates frequent high-contrast transitions
          if (
            y > marginY &&
            y < height - marginY &&
            x > marginX &&
            x < width - marginX
          ) {
            if (contrast > 20) {
              textDensityCount++;
            }
          }

          // Add to regional activity
          if (y < marginY) regions.top += contrast;
          if (y > height - marginY) regions.bottom += contrast;
          if (x < marginX) regions.left += contrast;
          if (x > width - marginX) regions.right += contrast;
        }
      }
    }

    // 1. Lighting Analysis
    const avgLuma = totalLuminance / pixelCount;
    let currentLighting: "low" | "good" | "high" = "good";
    if (avgLuma < 50) currentLighting = "low";
    else if (avgLuma > 220) currentLighting = "high";

    setLightingLevel(currentLighting);

    // 2. Clarity Analysis
    // Normalize gradient score. Empirical tweaking needed.
    // Average contrast per checked pixel pair.
    const avgGradient = totalGradient / pixelCount;
    // Heuristic: > 15 is okay, > 25 is sharp, < 10 is blurry
    const scoreRaw = Math.min(100, Math.max(0, (avgGradient - 5) * 4)); // Shift and scale

    // Smooth the score update
    setClarityScore((prev) => prev * 0.7 + scoreRaw * 0.3);

    // 3. Edge Detection
    // Normalize region scores by their area (roughly)
    const regionPixels = (width * marginY) / (stride * stride); // Approx pixels in top/bottom strip
    const sidePixels = (height * marginX) / (stride * stride); // Approx pixels in side strips

    // Threshold for "activity" that indicates an edge/content
    const edgeThreshold = 12;

    const newEdges = {
      top: regions.top / regionPixels > edgeThreshold,
      bottom: regions.bottom / regionPixels > edgeThreshold,
      left: regions.left / sidePixels > edgeThreshold,
      right: regions.right / sidePixels > edgeThreshold,
    };

    setEdgeDetection(newEdges);

    // 4. Generate Warnings
    const newWarnings: ScanWarning[] = [];

    if (scoreRaw < 40) {
      newWarnings.push({
        type: "blur",
        severity: currentLighting === "low" ? "high" : "medium",
        message: "Image is blurry",
      });
    }

    if (currentLighting === "low") {
      newWarnings.push({
        type: "lighting",
        severity: "high",
        message: "Too dark",
      });
    } else if (currentLighting === "high") {
      newWarnings.push({
        type: "glare",
        severity: "medium",
        message: "Potential glare",
      });
    }

    if (
      !newEdges.top ||
      !newEdges.bottom ||
      !newEdges.left ||
      !newEdges.right
    ) {
      newWarnings.push({
        type: "alignment",
        severity: "low",
        message: "Align edges",
      });
    }

    if (video.videoWidth < 960) {
      newWarnings.push({
        type: "resolution",
        severity: "medium",
        message: "Low resolution",
      });
      setResolutionWarning(true);
    } else {
      setResolutionWarning(false);
    }

    // 5. Document Content Check
    // Threshold calculation: Center area pixels / stride^2 * percentage
    // e.g. 320*240 -> Center is ~19,200 pixels. Stride 2 -> 4800 checks.
    // Text should cover at least 5-10% of center with transitions.
    // Heuristic: > 150-200 transitions in center usually means text/details.
    setIsDocumentDetected(textDensityCount > 150);

    setWarnings(newWarnings);
  }, [isScanning]);

  // Start/Stop analysis
  useEffect(() => {
    if (isScanning) {
      // Small delay to let camera warm up
      const timeout = setTimeout(() => {
        analysisLoopRef.current = requestAnimationFrame(analyzeFrame);
      }, 500);
      return () => {
        clearTimeout(timeout);
        if (analysisLoopRef.current)
          cancelAnimationFrame(analysisLoopRef.current);
      };
    } else {
      // Reset state
      setClarityScore(0);
      setWarnings([]);
      setLightingLevel("good");
      setEdgeDetection({
        top: false,
        right: false,
        bottom: false,
        left: false,
      });
      if (analysisLoopRef.current)
        cancelAnimationFrame(analysisLoopRef.current);
    }
  }, [isScanning, analyzeFrame]);

  // Check if ready to capture (Auto-capture logic)
  useEffect(() => {
    if (!isScanning) return;

    const allEdges = Object.values(edgeDetection).every(Boolean);
    const goodClarity = clarityScore >= 60; // Slightly lower threshold for real world usage
    const noHighWarnings = !warnings.some((w) => w.severity === "high");
    const goodLighting = lightingLevel === "good";

    const isReady =
      allEdges &&
      goodClarity &&
      noHighWarnings &&
      goodLighting &&
      isDocumentDetected; // Must have text content
    setIsReadyToCapture(isReady);
  }, [
    edgeDetection,
    clarityScore,
    warnings,
    lightingLevel,
    isScanning,
    isDocumentDetected,
  ]);

  // Countdown logic
  useEffect(() => {
    if (isReadyToCapture && countdown === null && isScanning) {
      setCountdown(3);
    } else if (!isReadyToCapture && countdown !== null) {
      setCountdown(null);
    }
  }, [isReadyToCapture, countdown, isScanning]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      handleCapture();
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, handleCapture]);

  const warningConfig = {
    blur: { icon: Focus, color: "text-warning" },
    glare: { icon: Zap, color: "text-warning" },
    motion: { icon: Move, color: "text-destructive" },
    shadow: { icon: Sun, color: "text-warning" },
    lighting: { icon: Sun, color: "text-warning" },
    alignment: { icon: Focus, color: "text-info" },
    resolution: { icon: ImageIcon, color: "text-warning" },
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Smart Scan</h1>
          <p className="text-muted-foreground mt-1">
            {selectedDocument?.name || "Document"} - Position within frame
          </p>
        </div>

        {/* Scanner View */}
        <Card className="overflow-hidden mb-6">
          <CardContent className="p-0">
            <div className="relative aspect-[4/3] bg-foreground/95">
              {/* Camera View / Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                {!isScanning ? (
                  <div className="text-center text-muted p-8">
                    <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Camera preview will appear here</p>
                  </div>
                ) : (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Edge Detection Frame */}
              {isScanning && (
                <div className="absolute inset-8 border-2 border-dashed rounded-lg pointer-events-none">
                  {/* Corner indicators */}
                  <div
                    className={cn(
                      "absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg transition-colors",
                      edgeDetection.top && edgeDetection.left
                        ? "border-success"
                        : "border-muted-foreground"
                    )}
                  />
                  <div
                    className={cn(
                      "absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg transition-colors",
                      edgeDetection.top && edgeDetection.right
                        ? "border-success"
                        : "border-muted-foreground"
                    )}
                  />
                  <div
                    className={cn(
                      "absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg transition-colors",
                      edgeDetection.bottom && edgeDetection.left
                        ? "border-success"
                        : "border-muted-foreground"
                    )}
                  />
                  <div
                    className={cn(
                      "absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 rounded-br-lg transition-colors",
                      edgeDetection.bottom && edgeDetection.right
                        ? "border-success"
                        : "border-muted-foreground"
                    )}
                  />

                  {/* Scan line animation */}
                  <div className="absolute left-0 right-0 h-0.5 bg-primary/50 animate-scan-line" />
                </div>
              )}

              {/* Auto-capture countdown */}
              {countdown !== null && countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <div className="text-6xl font-bold text-primary animate-pulse">
                    {countdown}
                  </div>
                </div>
              )}

              {/* Ready indicator */}
              {isReadyToCapture && countdown === null && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-success text-success-foreground gap-1 animate-pulse">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Ready to capture
                  </Badge>
                </div>
              )}

              {/* Document Detection feedback */}
              {!isReadyToCapture && isScanning && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 transition-opacity">
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1 backdrop-blur-md",
                      isDocumentDetected
                        ? "bg-success/20 border-success text-success"
                        : "bg-background/50 border-muted text-muted-foreground"
                    )}
                  >
                    {isDocumentDetected ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Document Connected
                      </>
                    ) : (
                      <>
                        <Focus className="h-3.5 w-3.5" />
                        Looking for document...
                      </>
                    )}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scan Metrics */}
        {isScanning && (
          <div className="space-y-4 mb-6">
            {/* Clarity Score */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Clarity Score</span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      clarityScore >= 70
                        ? "text-success"
                        : clarityScore >= 40
                        ? "text-warning"
                        : "text-destructive"
                    )}
                  >
                    {Math.round(clarityScore)}%
                  </span>
                </div>
                <Progress
                  value={clarityScore}
                  className={cn(
                    "h-2",
                    clarityScore >= 70
                      ? "[&>div]:bg-success"
                      : clarityScore >= 40
                      ? "[&>div]:bg-warning"
                      : "[&>div]:bg-destructive"
                  )}
                />
              </CardContent>
            </Card>

            {/* Lighting Indicator */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun
                      className={cn(
                        "h-5 w-5",
                        lightingLevel === "good"
                          ? "text-success"
                          : lightingLevel === "low"
                          ? "text-warning"
                          : "text-warning"
                      )}
                    />
                    <span className="text-sm font-medium">Lighting</span>
                  </div>
                  <Badge
                    variant={lightingLevel === "good" ? "default" : "secondary"}
                    className={cn(
                      lightingLevel === "good" &&
                        "bg-success text-success-foreground"
                    )}
                  >
                    {lightingLevel === "low"
                      ? "Too Dark"
                      : lightingLevel === "high"
                      ? "Too Bright"
                      : "Good"}
                  </Badge>
                </div>
                {lightingLevel !== "good" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {lightingLevel === "low"
                      ? "Move to a well-lit area or use flash"
                      : "Reduce direct light on the document"}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Warnings */}
            {warnings.length > 0 && (
              <Card className="border-warning/50">
                <CardContent className="p-4 space-y-2">
                  {warnings.map((warning, index) => {
                    const config = warningConfig[warning.type];
                    const Icon = config.icon;
                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center gap-2 text-sm",
                          warning.severity === "high"
                            ? "text-destructive"
                            : "text-warning"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{warning.message}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "ml-auto text-xs",
                            warning.severity === "high"
                              ? "border-destructive text-destructive"
                              : warning.severity === "medium"
                              ? "border-warning text-warning"
                              : "border-muted-foreground"
                          )}
                        >
                          {warning.severity}
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Edge Detection Status */}
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-3">Edge Detection</p>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(edgeDetection).map(([edge, detected]) => (
                    <div
                      key={edge}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-lg",
                        detected ? "bg-success/10" : "bg-muted"
                      )}
                    >
                      <div
                        className={cn(
                          "h-6 w-6 rounded-full flex items-center justify-center",
                          detected ? "bg-success" : "bg-muted-foreground/30"
                        )}
                      >
                        {detected ? (
                          <CheckCircle2 className="h-4 w-4 text-success-foreground" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-xs capitalize">{edge}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!isScanning ? (
            <>
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setCurrentView("document-selection")}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Change Document
              </Button>
              <Button className="flex-1" onClick={handleStartScan}>
                <Camera className="h-4 w-4 mr-2" />
                Start Scanning
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setIsScanning(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={!isReadyToCapture}
                onClick={handleCapture}
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture Now
              </Button>
            </>
          )}
        </div>

        {/* Tips */}
        {!isScanning && (
          <Card className="mt-6 bg-muted/50">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2 text-sm">
                Tips for best results
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-start gap-2">
                  <Sun className="h-4 w-4 shrink-0 mt-0.5" />
                  Ensure good, even lighting without shadows
                </li>
                <li className="flex items-start gap-2">
                  <Focus className="h-4 w-4 shrink-0 mt-0.5" />
                  Hold your device steady and in focus
                </li>
                <li className="flex items-start gap-2">
                  <ImageIcon className="h-4 w-4 shrink-0 mt-0.5" />
                  Place document on a flat, contrasting surface
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
