import express from "express";
import { processOCR } from "../controllers/ocrController.js";

const router = express.Router();

router.post("/process", processOCR);

export default router;
