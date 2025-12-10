"use client"

import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Shield,
  FileText,
  Camera,
  ChevronRight,
  RefreshCcw,
  Download,
  HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useKYC } from "@/lib/kyc-context"
import { cn } from "@/lib/utils"

export function Dashboard() {
  const { kycStatus, setCurrentView } = useKYC()

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-muted-foreground",
      bg: "bg-muted",
      borderColor: "border-muted",
      label: "Pending",
      description: "Your verification has not started yet",
    },
    "in-progress": {
      icon: Clock,
      color: "text-info",
      bg: "bg-info/10",
      borderColor: "border-info/30",
      label: "In Progress",
      description: "Your verification is being processed",
    },
    approved: {
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
      borderColor: "border-success/30",
      label: "Approved",
      description: "Your identity has been verified",
    },
    rejected: {
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      borderColor: "border-destructive/30",
      label: "Rejected",
      description: "Your verification was unsuccessful",
    },
    review: {
      icon: AlertTriangle,
      color: "text-warning",
      bg: "bg-warning/10",
      borderColor: "border-warning/30",
      label: "Under Review",
      description: "Additional review is required",
    },
  }

  const status = statusConfig[kycStatus.overallStatus]
  const StatusIcon = status.icon

  const getStepIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-success" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-primary" />
      case "failed":
        return <XCircle className="h-5 w-5 text-destructive" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
    }
  }

  const qualityScoreColor =
    kycStatus.qualityScore >= 80
      ? "text-success"
      : kycStatus.qualityScore >= 60
        ? "text-warning"
        : kycStatus.qualityScore >= 40
          ? "text-warning"
          : "text-destructive"

  const qualityScoreLabel =
    kycStatus.qualityScore >= 80
      ? "Excellent"
      : kycStatus.qualityScore >= 60
        ? "Good"
        : kycStatus.qualityScore >= 40
          ? "Fair"
          : "Poor"

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">KYC Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your verification progress</p>
        </div>

        {/* Status Overview Card */}
        <Card className={cn("mb-6 border-2", status.borderColor, status.bg)}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={cn("flex h-14 w-14 items-center justify-center rounded-full shrink-0", status.bg)}>
                <StatusIcon className={cn("h-7 w-7", status.color)} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold">{status.label}</h2>
                  <Badge variant="outline" className={status.color}>
                    {kycStatus.overallStatus.replace("-", " ")}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{status.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality Score Meter */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">KYC Quality Score</CardTitle>
              <Badge variant="secondary" className={qualityScoreColor}>
                {qualityScoreLabel}
              </Badge>
            </div>
            <CardDescription>Based on document clarity, data accuracy, and verification checks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-6">
              {/* Score Display */}
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${kycStatus.qualityScore * 2.51} 251`}
                    className={qualityScoreColor}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn("text-3xl font-bold", qualityScoreColor)}>{kycStatus.qualityScore}</span>
                  <span className="text-xs text-muted-foreground">out of 100</span>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="flex-1 space-y-3">
                {[
                  { label: "Document Quality", value: 85 },
                  { label: "Data Accuracy", value: 78 },
                  { label: "Face Match", value: 92 },
                  { label: "Fraud Check", value: 65 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                    <Progress
                      value={item.value}
                      className={cn(
                        "h-1.5",
                        item.value >= 80
                          ? "[&>div]:bg-success"
                          : item.value >= 60
                            ? "[&>div]:bg-warning"
                            : "[&>div]:bg-destructive",
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Steps Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Verification Steps</CardTitle>
            <CardDescription>Complete all steps to finish your KYC verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kycStatus.steps.map((step, index) => (
                <div key={step.id} className="flex gap-4">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2",
                        step.status === "completed"
                          ? "bg-success/10 border-success"
                          : step.status === "in-progress"
                            ? "bg-primary/10 border-primary"
                            : step.status === "failed"
                              ? "bg-destructive/10 border-destructive"
                              : "bg-muted border-muted-foreground/30",
                      )}
                    >
                      {getStepIcon(step.status)}
                    </div>
                    {index < kycStatus.steps.length - 1 && (
                      <div
                        className={cn("w-0.5 flex-1 my-2", step.status === "completed" ? "bg-success" : "bg-muted")}
                      />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3
                          className={cn(
                            "font-medium",
                            step.status === "completed"
                              ? "text-success"
                              : step.status === "in-progress"
                                ? "text-primary"
                                : step.status === "failed"
                                  ? "text-destructive"
                                  : "text-muted-foreground",
                          )}
                        >
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                      </div>
                      {step.status === "completed" && step.completedAt && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          {step.completedAt.toLocaleDateString()}
                        </Badge>
                      )}
                      {step.status === "in-progress" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            if (step.title.includes("Selfie")) {
                              setCurrentView("selfie")
                            } else {
                              setCurrentView("document-selection")
                            }
                          }}
                        >
                          Continue
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                      {step.status === "failed" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setCurrentView("document-selection")
                          }}
                        >
                          <RefreshCcw className="h-4 w-4 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Verification Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Identity document uploaded", completed: true, icon: FileText },
                { label: "Address proof submitted", completed: true, icon: FileText },
                { label: "Selfie captured", completed: false, icon: Camera },
                { label: "Face match verified", completed: false, icon: Shield },
                { label: "Document authenticity", completed: true, icon: CheckCircle2 },
                { label: "Final review complete", completed: false, icon: Clock },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg",
                      item.completed ? "bg-success/10" : "bg-muted/50",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        item.completed ? "bg-success" : "bg-muted",
                      )}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-success-foreground" />
                      ) : (
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <span
                      className={cn("text-sm", item.completed ? "text-success font-medium" : "text-muted-foreground")}
                    >
                      {item.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Rejection Reasons (if applicable) */}
        {kycStatus.rejectionReasons.length > 0 && (
          <Card className="mb-6 border-destructive/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Rejection Reasons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {kycStatus.rejectionReasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Accordion type="single" collapsible>
          <AccordionItem value="help" className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                <span>Need Help?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Common Issues</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Document not clear - Try scanning in better lighting</li>
                    <li>• Face match failed - Ensure same person as ID photo</li>
                    <li>• Data mismatch - Check all details match exactly</li>
                  </ul>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download Guide
                  </Button>
                  <Button size="sm">Contact Support</Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Action Button */}
        {kycStatus.overallStatus === "in-progress" && (
          <div className="mt-6">
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                const inProgressStep = kycStatus.steps.find((s) => s.status === "in-progress")
                if (inProgressStep?.title.includes("Selfie")) {
                  setCurrentView("selfie")
                } else {
                  setCurrentView("document-selection")
                }
              }}
            >
              Continue Verification
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
