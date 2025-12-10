import "dotenv/config";

import express from "express";
import cors from "cors";
import { connectMongoDB } from "./config/mongo.js";
import { supabase } from "./config/supabase.js";
import ocrRoutes from "./routes/ocrRoutes.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increased limit for base64 images

// 🔗 Connect MongoDB
connectMongoDB();

// Routes
app.use("/api/ocr", ocrRoutes);

// 🧪 Test Supabase Connection
app.get("/test-supabase", async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("*").limit(1);

    if (error)
      return res.status(500).json({ success: false, error: error.message });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
