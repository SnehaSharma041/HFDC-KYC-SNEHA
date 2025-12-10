"use client"

import { FileText, Camera, LayoutDashboard, Shield, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useKYC } from "@/lib/kyc-context"
import { cn } from "@/lib/utils"

export function HomeScreen() {
  const { setCurrentView, kycStatus } = useKYC()

  const statusConfig = {
    pending: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted", label: "Pending" },
    "in-progress": { icon: Clock, color: "text-info", bg: "bg-info/10", label: "In Progress" },
    approved: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Approved" },
    rejected: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", label: "Rejected" },
    review: { icon: Clock, color: "text-warning", bg: "bg-warning/10", label: "Under Review" },
  }

  const status = statusConfig[kycStatus.overallStatus]
  const StatusIcon = status.icon

  const actions = [
    {
      title: "Upload Documents",
      description: "Submit ID, address, and date of birth proof",
      icon: FileText,
      onClick: () => setCurrentView("document-selection"),
      primary: true,
    },
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-6">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance mb-3">Verify Your Identity</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto text-pretty">
            Complete your KYC verification quickly and securely. Your data is encrypted and protected.
          </p>
        </div>

        {/* Status Card */}
        <Card className="mb-8 border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Verification Status</CardTitle>
              <Badge variant="outline" className={cn("gap-1.5", status.color, status.bg)}>
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Quality Score</span>
                  <span className="font-medium">{kycStatus.qualityScore}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      kycStatus.qualityScore >= 80
                        ? "bg-success"
                        : kycStatus.qualityScore >= 50
                          ? "bg-warning"
                          : "bg-destructive",
                    )}
                    style={{ width: `${kycStatus.qualityScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Mini Progress Steps */}
            <div className="flex items-center gap-1">
              {kycStatus.steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div
                    className={cn(
                      "h-1.5 flex-1 rounded-full",
                      step.status === "completed"
                        ? "bg-success"
                        : step.status === "in-progress"
                          ? "bg-primary"
                          : step.status === "failed"
                            ? "bg-destructive"
                            : "bg-muted",
                    )}
                  />
                  {index < kycStatus.steps.length - 1 && <div className="w-1" />}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {kycStatus.steps.filter((s) => s.status === "completed").length} of {kycStatus.steps.length} steps
              completed
            </p>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Card
                key={action.title}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
                  action.primary && "border-primary/30 bg-primary/5",
                )}
                onClick={action.onClick}
              >
                <CardHeader className="pb-2">
                  <div
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-lg mb-2",
                      action.primary ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription className="text-sm">{action.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant={action.primary ? "default" : "outline"} className="w-full" size="sm">
                    {action.primary ? "Start Now" : "Open"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Trust Indicators */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>256-bit encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>GDPR compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>2-minute process</span>
          </div>
        </div>
      </div>
    </div>
  )
}
