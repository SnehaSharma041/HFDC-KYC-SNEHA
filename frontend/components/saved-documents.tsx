"use client"

import { FileText, CheckCircle2, Clock, Calendar, ChevronRight, ShieldCheck, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useKYC } from "@/lib/kyc-context"
import { cn } from "@/lib/utils"

export function SavedDocuments() {
  const { savedDocuments, setSelectedDocument, setCurrentView } = useKYC()

  const handleSelectDocument = (doc: (typeof savedDocuments)[0]) => {
    setSelectedDocument(doc.type)
    setCurrentView("validation")
  }

  const isExpiringSoon = (date?: Date) => {
    if (!date) return false
    const threeMonths = 90 * 24 * 60 * 60 * 1000
    return date.getTime() - Date.now() < threeMonths
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
            <ShieldCheck className="h-5 w-5 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Saved Documents</h1>
            <p className="text-muted-foreground text-sm">Select a document to use for verification</p>
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-3">
          {savedDocuments.map((doc) => {
            const expiringSoon = isExpiringSoon(doc.expiryDate)

            return (
              <Card
                key={doc.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleSelectDocument(doc)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={doc.thumbnail || "/placeholder.svg"}
                        alt={doc.name}
                        className="w-16 h-16 rounded-lg object-cover bg-muted"
                      />
                      {doc.verified && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-success flex items-center justify-center">
                          <CheckCircle2 className="h-3 w-3 text-success-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium">{doc.name}</h3>
                          <p className="text-sm text-muted-foreground">{doc.type.category.toUpperCase()} Proof</p>
                        </div>
                        <Badge
                          variant={doc.verified ? "default" : "secondary"}
                          className={cn("shrink-0", doc.verified && "bg-success text-success-foreground")}
                        >
                          {doc.verified ? "Verified" : "Pending"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Uploaded {doc.uploadedAt.toLocaleDateString()}
                        </span>
                        {doc.expiryDate && (
                          <span className={cn("flex items-center gap-1", expiringSoon && "text-warning")}>
                            {expiringSoon && <AlertTriangle className="h-3 w-3" />}
                            <Calendar className="h-3 w-3" />
                            Expires {doc.expiryDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 self-center" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Upload New Button */}
        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => setCurrentView("document-selection")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Upload New Document
          </Button>
        </div>
      </div>
    </div>
  )
}
