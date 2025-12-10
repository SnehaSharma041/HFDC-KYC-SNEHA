import { createWorker } from "tesseract.js";

export const extractTextCheck = async (imageBuffer) => {
  const worker = await createWorker("eng");
  const ret = await worker.recognize(imageBuffer);
  await worker.terminate();
  return ret.data.text;
};

// --- Helper Parsers ---

const parseAadhaarData = (text, lines) => {
  const result = {
    ocrFields: [],
    rejectionReasons: [],
    isValid: true,
  };

  // 1. Aadhaar UID (12 digits, often 4-4-4)
  // Regex to match 12 digits, allowing for spaces or dashes
  const uidRegex = /\b\d{4}\s?\d{4}\s?\d{4}\b/;
  const uidMatch = text.match(uidRegex);

  if (uidMatch) {
    result.ocrFields.push({
      label: "Aadhaar Number",
      extracted: uidMatch[0],
      confidence: 90,
      mismatch: false,
    });
  } else {
    result.isValid = false;
    result.rejectionReasons.push("Could not find 12-digit Aadhaar number.");
  }

  // 2. Gender
  if (/female/i.test(text)) {
    result.ocrFields.push({
      label: "Gender",
      extracted: "Female",
      confidence: 85,
      mismatch: false,
    });
  } else if (/male/i.test(text)) {
    result.ocrFields.push({
      label: "Gender",
      extracted: "Male",
      confidence: 85,
      mismatch: false,
    });
  }

  // 3. Year of Birth or DOB
  const yobMatch = text.match(/\b\d{4}\b/);
  const dobMatch = text.match(/\b\d{2}[\/\-]\d{2}[\/\-]\d{4}\b/);

  if (dobMatch) {
    result.ocrFields.push({
      label: "DOB",
      extracted: dobMatch[0],
      confidence: 85,
      mismatch: false,
    });
  } else if (yobMatch) {
    result.ocrFields.push({
      label: "Year of Birth",
      extracted: yobMatch[0],
      confidence: 80,
      mismatch: false,
    });
  }

  return result;
};

const parsePANData = (text, lines) => {
  const result = {
    ocrFields: [],
    rejectionReasons: [],
    isValid: true,
  };

  // 1. Fuzzy PAN Number Search
  // Allow 'O' for '0' and 'I' for '1' etc.
  // Pattern: 5 letters, 4 numbers, 1 letter
  const fuzzyPanRegex = /\b[A-Z]{5}[0-9O]{4}[A-Z]{1}\b/;
  const rawPanMatch = text.match(fuzzyPanRegex);

  if (rawPanMatch) {
    let pan = rawPanMatch[0];
    // Auto-correct common OCR errors in the numeric part
    const numericPart = pan.substring(5, 9);
    const correctedNumeric = numericPart.replace(/O/g, "0").replace(/I/g, "1");
    pan = pan.substring(0, 5) + correctedNumeric + pan.substring(9);

    result.ocrFields.push({
      label: "PAN Number",
      extracted: pan,
      confidence: 92,
      mismatch: false,
    });
  } else {
    result.isValid = false;
    result.rejectionReasons.push("Could not find valid PAN number.");
  }

  // 2. Date of Birth (DOB)
  // Look for common date formats anywhere in the text
  const dobMatch = text.match(/\b\d{2}[\/\-]\d{2}[\/\-]\d{4}\b/);
  if (dobMatch) {
    result.ocrFields.push({
      label: "DOB",
      extracted: dobMatch[0],
      confidence: 90,
      mismatch: false,
    });
  } else {
    // Try to find just Yob if full DOB fails
    const yobMatch = text.match(/\b\d{4}\b/);
    if (yobMatch) {
      result.ocrFields.push({
        label: "Year of Birth",
        extracted: yobMatch[0],
        confidence: 70,
        mismatch: false,
      });
    }
  }

  // 3. Name & Father's Name (Positional Heuristic)
  // Standard PAN Layout often:
  // [HEADER: INCOME TAX...]
  // [NAME]
  // [FATHER'S NAME]
  // [DOB]
  // [PAN NUMBER]

  // Find index of DOB line (or PAN line if DOB missing)
  const dobIndex = lines.findIndex((l) =>
    /\b\d{2}[\/\-]\d{2}[\/\-]\d{4}\b/.test(l)
  );
  const panIndex = lines.findIndex((l) => fuzzyPanRegex.test(l));

  // Determine the "bottom" anchor for names
  const anchorIndex = dobIndex !== -1 ? dobIndex : panIndex;

  if (anchorIndex > 1) {
    // Father's Name is usually immediately above DOB
    const fathersNameIdx = anchorIndex - 1;
    const nameIdx = anchorIndex - 2;

    if (lines[fathersNameIdx] && lines[fathersNameIdx].length > 3) {
      // Improve filter to avoid catching "Permanent Account Number Card" or "Govt of India"
      const text = lines[fathersNameIdx];
      const isBlacklisted =
        /Permanent|Account|Number|Card|Govt|India|Signature|Income|Tax/i.test(
          text
        );
      if (!isBlacklisted) {
        result.ocrFields.push({
          label: "Father's Name",
          extracted: text,
          confidence: 75,
          mismatch: false,
        });
      }
    }

    if (lines[nameIdx] && lines[nameIdx].length > 3) {
      const text = lines[nameIdx];
      // Basic filter to ensure it's not "INCOME TAX" or other headers
      const isBlacklisted =
        /INCOME|TAX|Who|Govt|India|Permanent|Account|Number|Card/i.test(text);
      if (!isBlacklisted) {
        result.ocrFields.push({
          label: "Name",
          extracted: text,
          confidence: 75,
          mismatch: false,
        });
      }
    }
  } else {
    // Fallback: Find "Name" by simple uppercase check if positional failed
    const nameLine = lines.find(
      (l) =>
        /^[A-Z\s\.]+$/.test(l) &&
        !/INCOME|TAX|INDIA|GOVT|ACCOUNT|NUMBER|CARD|Permanent/i.test(l) &&
        l.length > 3
    );
    if (nameLine) {
      result.ocrFields.push({
        label: "Name",
        extracted: nameLine,
        confidence: 60,
        mismatch: false,
      });
    }
  }

  return result;
};

export const parseKYCData = (text, documentType) => {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const baseResult = {
    isValid: true,
    clarityScore: 85,
    ocrFields: [],
    fraudFlags: [],
    rejectionReasons: [],
  };

  let specificResult = {};

  if (documentType === "aadhaar-card") {
    specificResult = parseAadhaarData(text, lines);
  } else if (documentType === "pan-card") {
    specificResult = parsePANData(text, lines);
  } else {
    // Default heuristic (Passport/Others)
    // ... existing logic ...
    const datePattern = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/;
    const idPattern = /\b[A-Z0-9]{6,12}\b/;
    const dates = text.match(datePattern);
    const ids = (text.match(idPattern) || []).filter(
      (id) => !id.match(/\d{1,2}[\/\-]\d{1,2}/)
    );

    if (ids.length > 0) {
      baseResult.ocrFields.push({
        label: "Document Number",
        extracted: ids[0],
        confidence: 80,
        mismatch: false,
      });
    }
  }

  // Merge results
  const finalResult = {
    ...baseResult,
    isValid:
      specificResult.isValid !== undefined
        ? specificResult.isValid
        : baseResult.isValid,
    ocrFields: [...baseResult.ocrFields, ...(specificResult.ocrFields || [])],
    rejectionReasons: [
      ...baseResult.rejectionReasons,
      ...(specificResult.rejectionReasons || []),
    ],
  };

  // Overall validity check
  if (finalResult.ocrFields.length === 0) {
    finalResult.isValid = false;
    finalResult.rejectionReasons.push("No recognizable data found.");
  }

  return finalResult;
};
