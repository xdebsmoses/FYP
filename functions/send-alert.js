const express = require("express");
const cors = require("cors");
const twilio = require("twilio");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Debug .env loading
console.log("🌍 ENV loaded:", {
  SID: process.env.TWILIO_ACCOUNT_SID,
  TOKEN: process.env.TWILIO_AUTH_TOKEN,
  FROM: process.env.TWILIO_PHONE_NUMBER,
});

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) return trimmed;
  if (trimmed.startsWith("0")) return `+44${trimmed.slice(1)}`;
  return trimmed;
};

app.post("/send-alert", async (req, res) => {
  const { contacts, message } = req.body;

  if (!contacts || contacts.length === 0 || !message) {
    return res.status(400).json({ error: "Missing contacts or message" });
  }

  try {
    const results = [];

    for (const contact of contacts) {
      const formatted = formatPhoneNumber(contact.phone);
      console.log("📞 Sending to:", formatted);

      const response = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formatted,
      });

      results.push({
        to: formatted,
        sid: response.sid,
        status: response.status,
      });
    }

    return res.status(200).json({ success: true, results });
  } catch (error) {
    console.error("❌ Twilio SMS failed:", error.message);
    return res.status(500).json({
      error: "Failed to send SMS",
      details: error,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 CARE backend running on http://172.20.10.2:${PORT}`);
});