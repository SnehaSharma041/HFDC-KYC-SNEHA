export type DocumentCategory = "id" | "address" | "dob";

export type DocumentType = {
  id: string;
  name: string;
  category: DocumentCategory;
  description: string;
  sampleImage: string;
  requirements: string[];
  enabled: boolean;
  disabledReason?: string;
};

export type SavedDocument = {
  id: string;
  name: string;
  type: DocumentType;
  uploadedAt: Date;
  thumbnail: string;
  verified: boolean;
  expiryDate?: Date;
};

export type ScanWarning = {
  type:
    | "blur"
    | "glare"
    | "motion"
    | "shadow"
    | "lighting"
    | "alignment"
    | "resolution";
  severity: "low" | "medium" | "high";
  message: string;
};

export type OCRField = {
  label: string;
  extracted: string;
  expected?: string;
  confidence: number;
  mismatch: boolean;
};

export type ValidationResult = {
  isValid: boolean;
  clarityScore: number;
  ocrFields: OCRField[];
  fraudFlags: string[];
  rejectionReasons: string[];
};

export type UploadState = {
  status:
    | "idle"
    | "compressing"
    | "converting"
    | "uploading"
    | "complete"
    | "error";
  progress: number;
  networkStrength: "weak" | "moderate" | "strong";
  originalSize?: number;
  compressedSize?: number;
  isDuplicate?: boolean;
};

export type KYCStep = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  completedAt?: Date;
};

export type KYCStatus = {
  overallStatus: "pending" | "in-progress" | "approved" | "rejected" | "review";
  qualityScore: number;
  steps: KYCStep[];
  rejectionReasons: string[];
};

export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  nationality: string;
  documentTypes: {
    id: DocumentType[];
    address: DocumentType[];
    dob: DocumentType[];
  };
};
