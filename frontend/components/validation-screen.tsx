"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  ChevronRight,
  Shield,
  RefreshCcw,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useKYC } from "@/lib/kyc-context";
import { cn } from "@/lib/utils";
import type { ValidationResult } from "@/lib/kyc-types";

const mockValidationResult: ValidationResult = {
  isValid: true,
  clarityScore: 87,
  ocrFields: [
    {
      label: "Full Name",
      extracted: "John Michael Smith",
      expected: "John Michael Smith",
      confidence: 98,
      mismatch: false,
    },
    {
      label: "Date of Birth",
      extracted: "15/03/1990",
      expected: "15/03/1990",
      confidence: 95,
      mismatch: false,
    },
    {
      label: "Document Number",
      extracted: "AB1234567",
      expected: "AB1234567",
      confidence: 99,
      mismatch: false,
    },
    {
      label: "Expiry Date",
      extracted: "20/01/2029",
      expected: undefined,
      confidence: 92,
      mismatch: false,
    },
    {
      label: "Address",
      extracted: "123 Main Street, City",
      expected: "123 Main St, City",
      confidence: 78,
      mismatch: true,
    },
    {
      label: "Nationality",
      extracted: "United States",
      expected: "United States",
      confidence: 96,
      mismatch: false,
    },
  ],
  fraudFlags: [],
  rejectionReasons: [],
};

const mockFailedValidation: ValidationResult = {
  isValid: false,
  clarityScore: 45,
  ocrFields: [
    {
      label: "Full Name",
      extracted: "John M. Smith",
      expected: "John Michael Smith",
      confidence: 65,
      mismatch: true,
    },
    {
      label: "Date of Birth",
      extracted: "Unreadable",
      expected: "15/03/1990",
      confidence: 20,
      mismatch: true,
    },
    {
      label: "Document Number",
      extracted: "AB12???67",
      expected: "AB1234567",
      confidence: 45,
      mismatch: true,
    },
  ],
  fraudFlags: [
    "Document edges appear manipulated",
    "Inconsistent font detected",
  ],
  rejectionReasons: [
    "Document clarity too low for verification",
    "Unable to extract all required fields",
    "Potential document tampering detected",
  ],
};

export function ValidationScreen() {
  const {
    setCurrentView,
    capturedImage,
    validationResult,
    setValidationResult,
    selectedDocument,
  } = useKYC();
  const [isValidating, setIsValidating] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Analyzing document...");

  useEffect(() => {
    const validateDocument = async () => {
      if (!capturedImage) return;

      try {
        setIsValidating(true);
        setCurrentStep("Uploading image...");
        setProgress(10);

        // Simulate upload progress
        const progressTimer = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) return prev;
            return prev + 5;
          });
        }, 500);

        setCurrentStep("Processing OCR...");

        const response = await fetch("http://localhost:5000/api/ocr/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: capturedImage,
            documentType: selectedDocument?.id || "unknown",
          }),
        });

        clearInterval(progressTimer);
        setProgress(100);

        const data = await response.json();

        if (data.success && data.validationResult) {
          setValidationResult(data.validationResult);
        } else {
          // Fallback to error state
          setValidationResult(mockFailedValidation);
        }
      } catch (error) {
        console.error("Validation error:", error);
        setValidationResult(mockFailedValidation);
      } finally {
        setIsValidating(false);
      }
    };

    validateDocument();
  }, [capturedImage, setValidationResult]);

  const handleRetry = () => {
    setValidationResult(null);
    setCurrentView("smart-scan");
  };

  const handleContinue = () => {
    setCurrentView("selfie");
  };

  if (isValidating) {
    return (
      <div className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-muted" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <Shield className="absolute inset-0 m-auto h-10 w-10 text-primary" />
              </div>

              <h2 className="text-xl font-semibold mb-2">
                Validating Document
              </h2>
              <p className="text-muted-foreground mb-6">{currentStep}</p>

              <Progress value={progress} className="h-2 mb-2" />
              <p className="text-sm text-muted-foreground">
                {progress}% complete
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!validationResult) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Status Header */}
        <Card
          className={cn(
            "mb-6 border-2",
            validationResult.isValid
              ? "border-success/50 bg-success/5"
              : "border-destructive/50 bg-destructive/5"
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full shrink-0",
                  validationResult.isValid ? "bg-success" : "bg-destructive"
                )}
              >
                {validationResult.isValid ? (
                  <CheckCircle2 className="h-6 w-6 text-success-foreground" />
                ) : (
                  <XCircle className="h-6 w-6 text-destructive-foreground" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {validationResult.isValid
                    ? "Document Verified"
                    : "Verification Failed"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {validationResult.isValid
                    ? "Your document has been successfully validated and is ready for submission."
                    : "We encountered issues validating your document. Please review and try again."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Preview */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Scanned Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[3/2] rounded-lg overflow-hidden bg-muted">
              <img
                src={
                  capturedImage ||
                  "/placeholder.svg?height=300&width=450&query=scanned document preview"
                }
                alt="Scanned document"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-sm font-medium">Clarity Score</p>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    validationResult.clarityScore >= 70
                      ? "text-success"
                      : validationResult.clarityScore >= 40
                      ? "text-warning"
                      : "text-destructive"
                  )}
                >
                  {validationResult.clarityScore}%
                </p>
              </div>
              <Progress
                value={validationResult.clarityScore}
                className={cn(
                  "w-32 h-2",
                  validationResult.clarityScore >= 70
                    ? "[&>div]:bg-success"
                    : validationResult.clarityScore >= 40
                    ? "[&>div]:bg-warning"
                    : "[&>div]:bg-destructive"
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* OCR Extraction Preview */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Extracted Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validationResult.ocrFields.map((field, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start justify-between p-3 rounded-lg",
                    field.mismatch
                      ? "bg-warning/10 border border-warning/30"
                      : "bg-muted/50"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{field.label}</p>
                      {field.mismatch && (
                        <Badge
                          variant="outline"
                          className="text-warning border-warning text-xs"
                        >
                          Mismatch
                        </Badge>
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-sm mt-0.5",
                        field.mismatch
                          ? "text-warning"
                          : "text-muted-foreground"
                      )}
                    >
                      {field.extracted}
                    </p>
                    {field.mismatch && field.expected && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Expected: {field.expected}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        field.confidence >= 90
                          ? "text-success"
                          : field.confidence >= 70
                          ? "text-warning"
                          : "text-destructive"
                      )}
                    >
                      {field.confidence}%
                    </span>
                    {field.confidence >= 90 ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : field.confidence >= 70 ? (
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fraud Flags */}
        {validationResult.fraudFlags.length > 0 && (
          <Card className="mb-6 border-destructive/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Security Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {validationResult.fraudFlags.map((flag, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg"
                  >
                    <Shield className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <span className="text-sm text-destructive">{flag}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rejection Reasons */}
        {validationResult.rejectionReasons.length > 0 && (
          <Accordion type="single" collapsible className="mb-6">
            <AccordionItem value="reasons" className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-muted-foreground" />
                  <span>Why was my document rejected?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-2">
                  {validationResult.rejectionReasons.map((reason, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="font-medium text-foreground">
                        {index + 1}.
                      </span>
                      {reason}
                    </li>
                  ))}
                </ul>
                <Separator className="my-4" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">
                    Tips to improve:
                  </p>
                  <ul className="space-y-1">
                    <li>• Ensure the document is flat and well-lit</li>
                    <li>• Avoid glare and shadows on the document</li>
                    <li>• Make sure all text is clearly visible</li>
                    <li>• Use an original document, not a photocopy</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={handleRetry}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Scan Again
          </Button>
          {validationResult.isValid && (
            <Button className="flex-1" onClick={handleContinue}>
              Continue
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
