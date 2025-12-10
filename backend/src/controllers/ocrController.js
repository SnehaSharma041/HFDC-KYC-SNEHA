import { extractTextCheck, parseKYCData } from "../services/ocrService.js";

export const processOCR = async (req, res) => {
  try {
    const { image, documentType } = req.body;

    if (!image) {
      return res
        .status(400)
        .json({ success: false, error: "No image provided" });
    }

    // Handle base64 image
    // Remove header if present (e.g., "data:image/jpeg;base64,")
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    const text = await extractTextCheck(imageBuffer);
    const validationResult = parseKYCData(text, documentType);

    // console.log("Extracted Text:", text); // Debugging

    res.json({ success: true, validationResult });
  } catch (error) {
    console.error("OCR Error:", error);
    res.status(500).json({ success: false, error: "Failed to process image" });
  }
};
