# KYC Verification System

A comprehensive *Know Your Customer (KYC)* verification system designed to streamline document verification with intelligent scanning, OCR extraction, and real-time validation. This system addresses common KYC challenges through smart automation and user-friendly interfaces.

## 🎯 Overview

This KYC system tackles the major pain points in traditional verification processes:

- *35%* of failures from poor document scans
- *25%* from upload issues
- *15%* from incorrect document selection
- *15%* from validation failures
- *10%* from unclear rejection reasons

Our solution provides an end-to-end verification platform with smart scanning, automated quality checks, and clear user guidance.

## ✨ Key Features

### 📄 Smart Document Selection

- Clear categorization (ID Proof, Address Proof, DOB Proof)
- Sample images for each document type
- Validation to prevent wrong document uploads
- Support for Aadhaar Card and PAN Card

### 📸 Intelligent Document Scanning

- *Smart Scan Tunnel* with guided capture
- Auto-edge detection for proper framing
- Real-time quality analysis (clarity, brightness, stability)
- Live warnings for blur, glare, motion, shadows, cutoff
- AI-powered clarity scoring
- Auto-capture when optimal conditions are met

### 📤 Optimized Upload System

- Auto-compression without quality loss
- Format conversion (HEIC → JPG → PDF)
- Dynamic packet sizing based on network strength
- Duplicate document detection
- Server-side pre-validation

### 🔍 OCR & Validation

- Automated text extraction using Tesseract.js
- Support for Aadhaar UID and PAN number extraction
- Real-time data validation
- Mismatch highlighting
- User confirmation screens

### 🤳 Selfie Verification

- Face alignment guides
- Live capture prompts
- Auto-brightness and shadow correction
- Quality validation before submission

### 📊 Status Tracking

- Clear progress timeline: Submitted → Under Review → Approved
- Detailed rejection reasons
- Auto-fix suggestions
- KYC quality score

## 🛠 Tech Stack

### Frontend

- *Framework:* Next.js 16.0.7 (React 19.2.0)
- *Styling:* Tailwind CSS 4.1.9
- *UI Components:* Radix UI
- *Camera:* react-webcam
- *Form Handling:* React Hook Form + Zod validation
- *Icons:* Lucide React

### Backend

- *Runtime:* Node.js with Express 5.2.1
- *Database:* MongoDB (Mongoose 9.0.1)
- *Storage:* Supabase
- *OCR Engine:* Tesseract.js 6.0.1
- *CORS:* Enabled for cross-origin requests

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB instance
- Supabase account

### Backend Setup

1. Navigate to the backend directory:

bash
cd backend


2. Install dependencies:

bash
npm install


3. Create a .env file with the following variables:

env
MONGODB_URI=your_mongodb_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
PORT=5000


4. Start the development server:

bash
npm run dev


The backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:

bash
cd frontend


2. Install dependencies:

bash
npm install


3. Create a .env.local file:

env
NEXT_PUBLIC_API_URL=http://localhost:5000


4. Start the development server:

bash
npm run dev


The frontend will run on http://localhost:3000

## 📁 Project Structure

```
kyc/
├── frontend/                     # Next.js application
│   ├── app/                      # App Router pages
│   ├── components/               # Reusable React components
│   │   ├── smart-scan.tsx
│   │   ├── document-upload.tsx
│   │   └── ...
│   ├── lib/                      # Utilities & helper functions
│   ├── public/                   # Static assets
│   │   ├── aadhaar.png
│   │   └── pan-card.webp
│   └── package.json
│
├── backend/                      # Express server (Node.js)
│   ├── src/
│   │   ├── index.js              # Server entry point
│   │   ├── routes/               # API routes
│   │   ├── models/               # MongoDB models
│   │   └── controllers/          # Business logic handlers
│   └── package.json
│
└── README.md                     # Main documentation
```



## 🔄 System Flow


User Login
    ↓
Document Type Selection
    ↓
Smart Scan (Camera with AI quality checks)
    ↓
Preview & Upload (Compression + Validation)
    ↓
OCR Extraction & User Confirmation
    ↓
Selfie Capture (Face alignment)
    ↓
KYC Submission & Status Tracking
    ↓
Backend Processing (MongoDB + Supabase)
    ↓
Approval/Rejection with Detailed Feedback


## 🎨 Features in Detail

### Smart Scan Technology

- *Edge Detection:* Ensures all document corners are visible
- *Clarity Score:* AI-based quality assessment (0-100%)
- *Lighting Indicator:* Guides users to optimal lighting
- *Motion Detection:* Prevents blurry captures
- *Auto-Capture:* Triggers when all conditions are met

### Upload Optimization

- *Strong Network:* Large packets for faster upload
- *Weak Network:* Small packets for stable upload
- *Format Support:* JPEG, PNG, HEIC, PDF
- *Size Limit:* Auto-compression for files >2MB

### OCR Capabilities

- *Aadhaar Card:* UID extraction
- *PAN Card:* PAN number extraction
- *Accuracy:* Pre-processing for better recognition
- *Validation:* Real-time format checking

## 🔐 Security Features

- Secure document storage in Supabase
- MongoDB for metadata and audit logs
- Input validation and sanitization
- CORS configuration for API security

## 📝 API Endpoints

- POST /api/upload - Upload document
- POST /api/ocr - Extract text from document
- POST /api/verify - Submit KYC for verification
- GET /api/status/:id - Check KYC status

## 🤝 Contributing

This is a private project. For any questions or issues, please contact the development team.

## 📄 License

Proprietary - All rights reserved

## 🙏 Acknowledgments

- Tesseract.js for OCR capabilities
- Supabase for storage solutions
- Radix UI for accessible components
- Next.js team for the amazing framework

---

*Built with ❤ for seamless KYC verification*