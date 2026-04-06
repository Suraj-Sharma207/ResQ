//Backend

import express from "express";
import cors from "cors";
import twilio from "twilio";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Twilio credentials
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = twilio(accountSid, authToken);

app.post("/send-sos", async (req, res) => {
  const { contacts, message } = req.body;

  try {
    for (let number of contacts) {
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE, // Your Twilio number
        to: number,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});