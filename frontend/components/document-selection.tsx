"use client";

import { useState } from "react";
import {
  FileText,
  CreditCard,
  Home,
  Calendar,
  ChevronRight,
  FolderOpen,
  Info,
  Lock,
  Check,
  PlayCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useKYC } from "@/lib/kyc-context";
import { cn } from "@/lib/utils";
import type { DocumentType, DocumentCategory } from "@/lib/kyc-types";

const documentTypes: Record<DocumentCategory, DocumentType[]> = {
  id: [
    {
      id: "passport",
      name: "Passport",
      category: "id",
      description: "International travel document with photo",
      sampleImage: "/passport-document-sample-with-photo-page.jpg",
      requirements: [
        "Photo page clearly visible",
        "All corners in frame",
        "No glare or shadows",
      ],
      enabled: true,
    },
    {
      id: "aadhaar-card",
      name: "Aadhaar Card",
      category: "id",
      description: "Generic 12-digit identification card",
      sampleImage: "/aadhaar.png",
      requirements: [
        "Front and back required",
        "12-digit UID visible",
        "QR code clear (if present)",
      ],
      enabled: true,
    },
    {
      id: "pan-card",
      name: "PAN Card",
      category: "id",
      description: "Permanent Account Number card",
      sampleImage: "/pan-card.webp",
      requirements: [
        "PAN number clearly visible",
        "Name and DOB readable",
        "Signature visible",
      ],
      enabled: true,
    },
    {
      id: "drivers-license",
      name: "Driver's License",
      category: "id",
      description: "Valid driving license with photo",
      sampleImage: "/drivers-license-sample-front.jpg",
      requirements: [
        "Photo clearly visible",
        "License number readable",
        "Valid expiry date",
      ],
      enabled: true,
    },
    {
      id: "voter-id",
      name: "Voter ID",
      category: "id",
      description: "Electoral identification card",
      sampleImage: "/voter-id-card-sample.jpg",
      requirements: ["Photo visible", "ID number readable"],
      enabled: false,
      disabledReason: "Not available for your region",
    },
  ],
  address: [
    {
      id: "utility-bill",
      name: "Utility Bill",
      category: "address",
      description: "Electricity, gas, or water bill",
      sampleImage: "/utility-bill-document-sample.jpg",
      requirements: [
        "Within last 3 months",
        "Full name visible",
        "Complete address shown",
      ],
      enabled: true,
    },
    {
      id: "bank-statement",
      name: "Bank Statement",
      category: "address",
      description: "Recent bank account statement",
      sampleImage: "/bank-statement-document-sample.jpg",
      requirements: [
        "Within last 3 months",
        "Bank letterhead visible",
        "Address on statement",
      ],
      enabled: true,
    },
    {
      id: "tax-document",
      name: "Tax Document",
      category: "address",
      description: "Government tax correspondence",
      sampleImage: "/tax-document-letter-sample.jpg",
      requirements: [
        "Current tax year",
        "Official letterhead",
        "Full address visible",
      ],
      enabled: true,
    },
    {
      id: "rental-agreement",
      name: "Rental Agreement",
      category: "address",
      description: "Valid lease or rental contract",
      sampleImage: "/rental-agreement-document-sample.jpg",
      requirements: [
        "Current agreement",
        "Both parties signed",
        "Property address visible",
      ],
      enabled: false,
      disabledReason: "Profile shows property ownership",
    },
  ],
  dob: [
    {
      id: "birth-certificate",
      name: "Birth Certificate",
      category: "dob",
      description: "Official birth registration document",
      sampleImage: "/birth-certificate-document-sample.jpg",
      requirements: [
        "Official seal visible",
        "Full name matches",
        "Date clearly shown",
      ],
      enabled: true,
    },
    {
      id: "passport-dob",
      name: "Passport (DOB page)",
      category: "dob",
      description: "Passport showing date of birth",
      sampleImage: "/passport-date-of-birth-page-sample.jpg",
      requirements: ["Bio data page", "DOB clearly visible", "Not expired"],
      enabled: true,
    },
    {
      id: "school-certificate",
      name: "School Certificate",
      category: "dob",
      description: "Educational certificate with DOB",
      sampleImage: "/school-leaving-certificate-sample.jpg",
      requirements: [
        "Official certificate",
        "DOB printed",
        "Institution name visible",
      ],
      enabled: false,
      disabledReason: "Age verified through other documents",
    },
  ],
};

const categoryConfig = {
  id: {
    icon: CreditCard,
    label: "Identity Proof",
    description: "Government-issued photo ID",
  },
  address: {
    icon: Home,
    label: "Address Proof",
    description: "Proof of residential address",
  },
  dob: {
    icon: Calendar,
    label: "DOB Proof",
    description: "Date of birth verification",
  },
};

export function DocumentSelection() {
  const router = useRouter();
  const { setCurrentView, setSelectedDocument, savedDocuments } = useKYC();
  const [activeCategory, setActiveCategory] = useState<DocumentCategory>("id");
  const [previewDoc, setPreviewDoc] = useState<DocumentType | null>(null);

  const handleDocumentSelect = (doc: DocumentType) => {
    if (!doc.enabled) return;
    setSelectedDocument(doc);
    setCurrentView("smart-scan");
  };

  const hasSavedDocs = savedDocuments.length > 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Select Document Type
            </h1>
            <p className="text-muted-foreground mt-1">
              Choose the document you want to upload for verification
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push("/tutorial")}
          >
            <PlayCircle className="h-4 w-4" />
            Watch KYC Tutorial
          </Button>
        </div>

        {/* Saved Documents Button */}
        {hasSavedDocs && (
          <Card
            className="mb-6 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setCurrentView("security-access")}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Use Saved Documents</p>
                  <p className="text-sm text-muted-foreground">
                    {savedDocuments.length} document
                    {savedDocuments.length !== 1 ? "s" : ""} available
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4" />
                <ChevronRight className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Tabs */}
        <Tabs
          value={activeCategory}
          onValueChange={(v) => setActiveCategory(v as DocumentCategory)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {Object.entries(categoryConfig).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <TabsTrigger key={key} value={key} className="gap-2">
                  <Icon className="h-4 w-4 hidden sm:block" />
                  <span className="truncate">{config.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(documentTypes).map(([category, docs]) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid gap-3 sm:grid-cols-2">
                {docs.map((doc) => (
                  <Card
                    key={doc.id}
                    className={cn(
                      "transition-all",
                      doc.enabled
                        ? "cursor-pointer hover:border-primary/50 hover:shadow-sm"
                        : "opacity-60 cursor-not-allowed"
                    )}
                    onClick={() => doc.enabled && handleDocumentSelect(doc)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg",
                              doc.enabled ? "bg-primary/10" : "bg-muted"
                            )}
                          >
                            <FileText
                              className={cn(
                                "h-5 w-5",
                                doc.enabled
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              )}
                            />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {doc.name}
                            </CardTitle>
                            <CardDescription className="text-sm mt-0.5">
                              {doc.description}
                            </CardDescription>
                          </div>
                        </div>
                        {!doc.enabled && (
                          <Badge
                            variant="secondary"
                            className="text-xs shrink-0"
                          >
                            Unavailable
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewDoc(doc);
                          }}
                        >
                          <Info className="h-3.5 w-3.5 mr-1" />
                          View Sample
                        </Button>
                        {doc.enabled ? (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      {!doc.enabled && doc.disabledReason && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          {doc.disabledReason}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Sample Document Preview Dialog */}
        <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {previewDoc?.name} - Sample
              </DialogTitle>
              <DialogDescription>
                Review the sample and requirements before uploading
              </DialogDescription>
            </DialogHeader>
            {previewDoc && (
              <div className="space-y-4">
                <div className="aspect-[3/2] rounded-lg overflow-hidden bg-muted">
                  <img
                    src={previewDoc.sampleImage || "/placeholder.svg"}
                    alt={`${previewDoc.name} sample`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-sm">Requirements</h4>
                  <ul className="space-y-1.5">
                    {previewDoc.requirements.map((req, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setPreviewDoc(null)}
                  >
                    Close
                  </Button>
                  {previewDoc.enabled && (
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setPreviewDoc(null);
                        handleDocumentSelect(previewDoc);
                      }}
                    >
                      Select Document
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
