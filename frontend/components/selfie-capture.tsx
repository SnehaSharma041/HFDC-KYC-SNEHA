"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import {
  Camera,
  Sun,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  User,
  Move,
  Smile,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useKYC } from "@/lib/kyc-context";
import { cn } from "@/lib/utils";

type FacePosition = {
  centered: boolean;
  distance: "too-close" | "too-far" | "good";
  angle: "left" | "right" | "up" | "down" | "good";
};

type CaptureConditions = {
  lighting: "low" | "good" | "high";
  faceDetected: boolean;
  facePosition: FacePosition;
  blinkDetected: boolean;
};

export function SelfieCapture() {
  const { setCurrentView, capturedSelfie, setCapturedSelfie } = useKYC();
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [conditions, setConditions] = useState<CaptureConditions>({
    lighting: "good",
    faceDetected: false,
    facePosition: { centered: false, distance: "good", angle: "good" },
    blinkDetected: false,
  });
  const [countdown, setCountdown] = useState<number | null>(null);
  // const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null) // Removed local state
  const [qualityScore, setQualityScore] = useState(0);

  // Simulate readiness for now (mock face detection)
  // In a real app with face-api.js, this would check real landmarks.
  useEffect(() => {
    if (!isCapturing || capturedSelfie) return;

    // Wait a bit to simulate "finding face"
    const timer = setTimeout(() => {
      setConditions({
        lighting: "good",
        faceDetected: true,
        facePosition: { centered: true, distance: "good", angle: "good" },
        blinkDetected: true,
      });
      setQualityScore(85);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isCapturing, capturedSelfie]);

  // Check if ready for auto-capture
  const isReadyToCapture =
    conditions.faceDetected &&
    conditions.lighting === "good" &&
    conditions.facePosition.centered &&
    conditions.facePosition.distance === "good" &&
    conditions.facePosition.angle === "good" &&
    qualityScore >= 75;

  // Auto-capture countdown
  useEffect(() => {
    if (
      isReadyToCapture &&
      countdown === null &&
      isCapturing &&
      !capturedSelfie
    ) {
      setCountdown(3);
    } else if (!isReadyToCapture && countdown !== null) {
      setCountdown(null);
    }
  }, [isReadyToCapture, countdown, isCapturing, capturedSelfie]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      handleCapture();
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleStartCapture = () => {
    setIsCapturing(true);
    setCapturedSelfie(null);
    setQualityScore(50);
  };

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedSelfie(imageSrc);
      setCountdown(null);
    }
  }, [setCapturedSelfie]);

  const handleRetake = () => {
    setCapturedSelfie(null);
    setQualityScore(50);
    setCountdown(null);
  };

  const handleConfirm = () => {
    setCurrentView("upload");
  };

  const getAnglePrompt = () => {
    const { angle } = conditions.facePosition;
    if (angle === "good") return null;
    const prompts = {
      left: "Turn slightly right",
      right: "Turn slightly left",
      up: "Lower your chin",
      down: "Raise your chin",
    };
    return prompts[angle];
  };

  const getDistancePrompt = () => {
    const { distance } = conditions.facePosition;
    if (distance === "good") return null;
    return distance === "too-close" ? "Move back slightly" : "Move closer";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Selfie Verification
          </h1>
          <p className="text-muted-foreground mt-1">
            Position your face within the frame
          </p>
        </div>

        {/* Camera View */}
        <Card className="overflow-hidden mb-6">
          <CardContent className="p-0">
            <div className="relative aspect-square bg-foreground/95">
              {/* Camera View / Captured Image */}
              <div className="absolute inset-0 flex items-center justify-center">
                {capturedSelfie ? (
                  <img
                    src={capturedSelfie || "/placeholder.svg"}
                    alt="Captured selfie"
                    className="w-full h-full object-cover"
                  />
                ) : !isCapturing ? (
                  <div className="text-center text-muted p-8">
                    <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Camera preview will appear here</p>
                  </div>
                ) : (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: "user",
                      width: 720,
                      height: 720,
                    }}
                    className="w-full h-full object-cover mirror"
                  />
                )}
              </div>

              {/* Face Alignment Frame */}
              {isCapturing && !capturedSelfie && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className={cn(
                      "w-64 h-80 rounded-[50%] border-4 transition-colors",
                      isReadyToCapture
                        ? "border-success"
                        : conditions.faceDetected
                        ? "border-primary"
                        : "border-muted-foreground/50"
                    )}
                  >
                    {/* Corner guides */}
                    {!conditions.facePosition.centered && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Move className="h-8 w-8 text-warning animate-pulse" />
                      </div>
                    )}
                  </div>
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
              {isReadyToCapture && countdown === null && !capturedSelfie && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-success text-success-foreground gap-1 animate-pulse">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Perfect! Hold still
                  </Badge>
                </div>
              )}

              {/* Captured overlay */}
              {capturedSelfie && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-success text-success-foreground gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Photo captured
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Feedback */}
        {isCapturing && !capturedSelfie && (
          <div className="space-y-4 mb-6">
            {/* Quality Score */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Photo Quality</span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      qualityScore >= 75
                        ? "text-success"
                        : qualityScore >= 50
                        ? "text-warning"
                        : "text-destructive"
                    )}
                  >
                    {Math.round(qualityScore)}%
                  </span>
                </div>
                <Progress
                  value={qualityScore}
                  className={cn(
                    "h-2",
                    qualityScore >= 75
                      ? "[&>div]:bg-success"
                      : qualityScore >= 50
                      ? "[&>div]:bg-warning"
                      : "[&>div]:bg-destructive"
                  )}
                />
              </CardContent>
            </Card>

            {/* Condition Indicators */}
            <div className="grid grid-cols-2 gap-3">
              {/* Face Detection */}
              <Card
                className={cn(
                  "transition-colors",
                  conditions.faceDetected
                    ? "bg-success/10 border-success/30"
                    : "bg-muted/50"
                )}
              >
                <CardContent className="p-3 flex items-center gap-2">
                  <User
                    className={cn(
                      "h-5 w-5",
                      conditions.faceDetected
                        ? "text-success"
                        : "text-muted-foreground"
                    )}
                  />
                  <span className="text-sm">
                    {conditions.faceDetected
                      ? "Face detected"
                      : "No face found"}
                  </span>
                </CardContent>
              </Card>

              {/* Lighting */}
              <Card
                className={cn(
                  "transition-colors",
                  conditions.lighting === "good"
                    ? "bg-success/10 border-success/30"
                    : "bg-warning/10 border-warning/30"
                )}
              >
                <CardContent className="p-3 flex items-center gap-2">
                  <Sun
                    className={cn(
                      "h-5 w-5",
                      conditions.lighting === "good"
                        ? "text-success"
                        : "text-warning"
                    )}
                  />
                  <span className="text-sm">
                    {conditions.lighting === "good"
                      ? "Good lighting"
                      : conditions.lighting === "low"
                      ? "Too dark"
                      : "Too bright"}
                  </span>
                </CardContent>
              </Card>
            </div>

            {/* Position Prompts */}
            {(getAnglePrompt() ||
              getDistancePrompt() ||
              !conditions.facePosition.centered) && (
              <Card className="border-warning/50 bg-warning/5">
                <CardContent className="p-4 space-y-2">
                  {!conditions.facePosition.centered && (
                    <div className="flex items-center gap-2 text-sm text-warning">
                      <Move className="h-4 w-4" />
                      <span>Center your face in the frame</span>
                    </div>
                  )}
                  {getAnglePrompt() && (
                    <div className="flex items-center gap-2 text-sm text-warning">
                      <RotateCcw className="h-4 w-4" />
                      <span>{getAnglePrompt()}</span>
                    </div>
                  )}
                  {getDistancePrompt() && (
                    <div className="flex items-center gap-2 text-sm text-warning">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{getDistancePrompt()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Blink Detection Notice */}
            {conditions.blinkDetected && (
              <div className="flex items-center justify-center gap-2 text-sm text-info">
                <Smile className="h-4 w-4" />
                <span>Liveness check passed</span>
              </div>
            )}
          </div>
        )}

        {/* Captured Photo Review */}
        {capturedSelfie && (
          <Card className="mb-6 bg-success/5 border-success/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-success shrink-0" />
                <div>
                  <p className="font-medium">Great photo!</p>
                  <p className="text-sm text-muted-foreground">
                    Your selfie meets all quality requirements
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!isCapturing ? (
            <>
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setCurrentView("home")}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleStartCapture}>
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            </>
          ) : capturedSelfie ? (
            <>
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={handleRetake}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
              <Button className="flex-1" onClick={handleConfirm}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setIsCapturing(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={!conditions.faceDetected}
                onClick={handleCapture}
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
            </>
          )}
        </div>

        {/* Tips */}
        {!isCapturing && (
          <Card className="mt-6 bg-muted/50">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2 text-sm">
                Tips for best results
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-start gap-2">
                  <Sun className="h-4 w-4 shrink-0 mt-0.5" />
                  Face a light source for even lighting
                </li>
                <li className="flex items-start gap-2">
                  <User className="h-4 w-4 shrink-0 mt-0.5" />
                  Remove glasses, hats, or face coverings
                </li>
                <li className="flex items-start gap-2">
                  <Smile className="h-4 w-4 shrink-0 mt-0.5" />
                  Keep a neutral expression
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
