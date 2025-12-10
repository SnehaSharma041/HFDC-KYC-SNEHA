"use client";

import { KYCProvider, useKYC } from "@/lib/kyc-context";
import { KYCHeader } from "@/components/header";
import { HomeScreen } from "@/components/home-screen";
import { DocumentSelection } from "@/components/document-selection";
import { SecurityAccess } from "@/components/security-access";
import { SavedDocuments } from "@/components/saved-documents";
import { SmartScan } from "@/components/smart-scan";
import { ValidationScreen } from "@/components/validation-screen";
import { UploadUI } from "@/components/upload-ui";
import { SelfieCapture } from "@/components/selfie-capture";
import { Dashboard } from "@/components/dashboard";

function KYCApp() {
  const { currentView } = useKYC();

  const renderView = () => {
    switch (currentView) {
      case "home":
        return <HomeScreen />;
      case "document-selection":
        return <DocumentSelection />;
      case "security-access":
        return <SecurityAccess />;
      case "saved-documents":
        return <SavedDocuments />;
      case "smart-scan":
        return <SmartScan />;
      case "validation":
        return <ValidationScreen />;
      case "upload":
        return <UploadUI />;
      case "selfie":
        return <SelfieCapture />;
      case "dashboard":
        return <Dashboard />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <KYCHeader />
      <main>{renderView()}</main>
    </div>
  );
}

export default function Page() {
  return (
    <KYCProvider>
      <KYCApp />
    </KYCProvider>
  );
}
