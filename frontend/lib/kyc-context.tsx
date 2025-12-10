"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type {
  DocumentType,
  SavedDocument,
  KYCStatus,
  ValidationResult,
  UploadState,
} from "./kyc-types";

type KYCView =
  | "home"
  | "document-selection"
  | "saved-documents"
  | "security-access"
  | "smart-scan"
  | "validation"
  | "upload"
  | "selfie"
  | "dashboard";

type KYCContextType = {
  currentView: KYCView;
  setCurrentView: (view: KYCView) => void;
  selectedDocument: DocumentType | null;
  setSelectedDocument: (doc: DocumentType | null) => void;
  savedDocuments: SavedDocument[];
  kycStatus: KYCStatus;
  validationResult: ValidationResult | null;
  setValidationResult: (result: ValidationResult | null) => void;
  uploadState: UploadState;
  setUploadState: (state: UploadState) => void;
  securityStep: "password" | "mpin" | "otp" | "complete";
  setSecurityStep: (step: "password" | "mpin" | "otp" | "complete") => void;
  capturedImage: string | null;
  setCapturedImage: (image: string | null) => void;
  capturedSelfie: string | null;
  setCapturedSelfie: (image: string | null) => void;
};

const KYCContext = createContext<KYCContextType | undefined>(undefined);

const mockSavedDocuments: SavedDocument[] = [
  {
    id: "1",
    name: "Passport",
    type: {
      id: "passport",
      name: "Passport",
      category: "id",
      description: "International travel document",
      sampleImage: "/passport-document-sample.jpg",
      requirements: ["Clear photo page", "All corners visible", "No glare"],
      enabled: true,
    },
    uploadedAt: new Date("2024-01-15"),
    thumbnail: "/passport-thumbnail.png",
    verified: true,
    expiryDate: new Date("2029-01-15"),
  },
  {
    id: "2",
    name: "Utility Bill",
    type: {
      id: "utility-bill",
      name: "Utility Bill",
      category: "address",
      description: "Recent utility bill showing address",
      sampleImage: "/generic-utility-bill.png",
      requirements: [
        "Within last 3 months",
        "Full name visible",
        "Address clearly shown",
      ],
      enabled: true,
    },
    uploadedAt: new Date("2024-02-20"),
    thumbnail: "/utility-bill-thumbnail.jpg",
    verified: true,
  },
];

const mockKYCStatus: KYCStatus = {
  overallStatus: "in-progress",
  qualityScore: 72,
  steps: [
    {
      id: "1",
      title: "Identity Document",
      description: "Upload government-issued ID",
      status: "completed",
      completedAt: new Date(),
    },
    {
      id: "2",
      title: "Address Proof",
      description: "Verify your residential address",
      status: "completed",
      completedAt: new Date(),
    },
    {
      id: "3",
      title: "Selfie Verification",
      description: "Take a selfie for face match",
      status: "in-progress",
    },
    {
      id: "4",
      title: "Final Review",
      description: "Automated verification check",
      status: "pending",
    },
  ],
  rejectionReasons: [],
};

export function KYCProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<KYCView>("document-selection");
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(
    null
  );
  const [savedDocuments] = useState<SavedDocument[]>(mockSavedDocuments);
  const [kycStatus] = useState<KYCStatus>(mockKYCStatus);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
    networkStrength: "strong",
  });
  const [securityStep, setSecurityStep] = useState<
    "password" | "mpin" | "otp" | "complete"
  >("password");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);

  return (
    <KYCContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedDocument,
        setSelectedDocument,
        savedDocuments,
        kycStatus,
        validationResult,
        setValidationResult,
        uploadState,
        setUploadState,
        securityStep,
        setSecurityStep,
        capturedImage,
        setCapturedImage,
        capturedSelfie,
        setCapturedSelfie,
      }}
    >
      {children}
    </KYCContext.Provider>
  );
}

export function useKYC() {
  const context = useContext(KYCContext);
  if (context === undefined) {
    throw new Error("useKYC must be used within a KYCProvider");
  }
  return context;
}
