"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Lock,
  KeyRound,
  Smartphone,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  RefreshCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useKYC } from "@/lib/kyc-context"
import { cn } from "@/lib/utils"

export function SecurityAccess() {
  const { securityStep, setSecurityStep, setCurrentView } = useKYC()
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [mpin, setMpin] = useState(["", "", "", "", "", ""])
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const mpinRefs = useRef<(HTMLInputElement | null)[]>([])
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const steps = [
    { id: "password", label: "Password", icon: Lock },
    { id: "mpin", label: "MPIN", icon: KeyRound },
    { id: "otp", label: "OTP", icon: Smartphone },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === securityStep)

  const handlePasswordSubmit = async () => {
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    setIsLoading(true)
    setError("")
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsLoading(false)
    setSecurityStep("mpin")
  }

  const handleMpinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newMpin = [...mpin]
    newMpin[index] = value.slice(-1)
    setMpin(newMpin)
    setError("")

    if (value && index < 5) {
      mpinRefs.current[index + 1]?.focus()
    }
  }

  const handleMpinSubmit = async () => {
    if (mpin.some((d) => !d)) {
      setError("Please enter complete MPIN")
      return
    }
    setIsLoading(true)
    setError("")
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsLoading(false)
    setSecurityStep("otp")
    setCountdown(30)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError("")

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpSubmit = async () => {
    if (otp.some((d) => !d)) {
      setError("Please enter complete OTP")
      return
    }
    setIsLoading(true)
    setError("")
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsLoading(false)
    setSecurityStep("complete")
    setCurrentView("saved-documents")
  }

  const handleResendOtp = () => {
    setCountdown(30)
    setOtp(["", "", "", "", "", ""])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, type: "mpin" | "otp") => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      const refs = type === "mpin" ? mpinRefs : otpRefs
      refs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Secure Access</h1>
          <p className="text-muted-foreground mt-1">3-layer verification to access your saved documents</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isComplete = index < currentStepIndex
            const isCurrent = step.id === securityStep

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all",
                    isComplete
                      ? "bg-success border-success"
                      : isCurrent
                        ? "border-primary bg-primary/10"
                        : "border-muted bg-muted",
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-success-foreground" />
                  ) : (
                    <Icon className={cn("h-5 w-5", isCurrent ? "text-primary" : "text-muted-foreground")} />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={cn("w-8 h-0.5 mx-1", index < currentStepIndex ? "bg-success" : "bg-muted")} />
                )}
              </div>
            )
          })}
        </div>

        {/* Security Forms */}
        <Card>
          {/* Password Step */}
          {securityStep === "password" && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Enter Password
                </CardTitle>
                <CardDescription>Enter your account password to continue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setError("")
                      }}
                      placeholder="Enter your password"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button className="w-full" onClick={handlePasswordSubmit} disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Continue"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </>
          )}

          {/* MPIN Step */}
          {securityStep === "mpin" && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5" />
                  Enter MPIN
                </CardTitle>
                <CardDescription>Enter your 6-digit mobile PIN</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center gap-2">
                  {mpin.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        mpinRefs.current[index] = el
                      }}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleMpinChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, "mpin")}
                      className="w-12 h-12 text-center text-lg font-mono"
                    />
                  ))}
                </div>
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                <Button className="w-full" onClick={handleMpinSubmit} disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Continue"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </>
          )}

          {/* OTP Step */}
          {securityStep === "otp" && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Enter OTP
                </CardTitle>
                <CardDescription>Enter the 6-digit code sent to your phone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, "otp")}
                      className="w-12 h-12 text-center text-lg font-mono"
                    />
                  ))}
                </div>
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                <Button className="w-full" onClick={handleOtpSubmit} disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Access Documents"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-muted-foreground">Resend OTP in {countdown}s</p>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={handleResendOtp} className="text-primary">
                      <RefreshCcw className="h-4 w-4 mr-1" />
                      Resend OTP
                    </Button>
                  )}
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* Security Notice */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          Your documents are protected with bank-grade security.
          <br />
          We never share your data without consent.
        </p>
      </div>
    </div>
  )
}
