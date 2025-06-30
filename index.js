const { WebhookClient } = require('dialogflow-fulfillment');
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config(); // ✅ Load .env variables
const XLSX = require("xlsx");
const fs = require("fs");

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY,project: "",});
// The client gets the API key from the environment variable `GEMINI_API_KEY`.
console.log("🌐 Running on Railway. Using Gemini API Key:", process.env.GEMINI_API_KEY ? "✅ Set" : "❌ Missing");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Dialogflow webhook is running.");
});

app.post("/webhook", async (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });

  function hi(agent) {
    agent.add("Hello! How can I help you today?");
  }


  async function forms(agent) {
    const { name, number, CnicNum, email, gender, course } = agent.parameters;
    console.log("Received parameters:", { name, number, CnicNum, email,gender, course });

    if (!name || !email || !CnicNum || !number || !course) {
      agent.add("⚠️ Please provide your name, email, CNIC, and phone number.");
      return;
    }

    agent.add(`✅ Thank you, ${name}. Your registration is received. email send to ${email}`);
    // Prepare registration data
    const registrationData = [
      {
        Name: name,
        Email: email,
        Number: number,
        CNIC: CnicNum,
        Gender: gender,
        Course: course,
        Date: new Date().toLocaleString()
      }
    ];

    // File path for Excel file
    const filePath = "registrations.xlsx";

    let workbook;
    let worksheet;

    // If file already exists, read it and append
    if (fs.existsSync(filePath)) {
      workbook = XLSX.readFile(filePath);
      worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const existingData = XLSX.utils.sheet_to_json(worksheet);
      const updatedData = existingData.concat(registrationData);
      const newSheet = XLSX.utils.json_to_sheet(updatedData);
      workbook.Sheets[workbook.SheetNames[0]] = newSheet;
    } else {
      // If file does not exist, create new
      worksheet = XLSX.utils.json_to_sheet(registrationData);
      workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
    }

    // Save the workbook
    XLSX.writeFile(workbook, filePath);

    console.log("📁 Student registered and saved to Excel.");


    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Saylani Registration" <${process.env.GOOGLE_EMAIL}>`,
      to: email,
      subject: "🎓 SMIT Registration Successful",
      html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>SMIT ID Card</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    <div style="display: flex; justify-content: center; align-items: flex-start; gap: 40px; padding: 50px;">
      <div style="width: 280px; border-radius: 12px; background: white; box-shadow: 0 4px 10px rgba(0,0,0,0.15); overflow: hidden; border-top: 6px solid #0e76a8;">
        <div style="text-align: center; padding: 20px 15px 10px;">
          <img src="https://i.ibb.co/WvbtMCB/smit-logo.png" alt="SMIT Logo" style="height: 40px;">
          <div style="font-size: 12px; font-weight: bold; background-color: #0E76A8; color: white; padding: 3px 10px; margin-top: 6px; display: inline-block; border-radius: 3px;">
            SAYLANI MASS IT TRAINING PROGRAM
          </div>
        </div>
        <div style="text-align: center; padding: 10px 15px;">
          <img src="https://i.ibb.co/Ky5XnXG/avatar-boy.jpg" alt="Profile" style="width: 80px; height: 90px; border: 2px solid #ddd; border-radius: 6px; object-fit: cover;">
          <h3 style="margin: 10px 0 5px; font-size: 18px; color: #333;">${name}</h3>
          <p style="margin: 0; font-size: 13px; color: #777;">${course}</p>
          <p style="margin: 6px 0; font-size: 14px; font-weight: bold; color: #0E76A8;">GD-83236</p>
        </div>
      </div>

      <div style="width: 280px; border-radius: 12px; background: white; box-shadow: 0 4px 10px rgba(0,0,0,0.15); overflow: hidden; border-top: 6px solid #0e76a8;">
        <div style="padding: 20px 20px;">
          <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 8px 0;"><strong>CNIC:</strong> ${CnicNum}</p>
          <p style="margin: 8px 0;"><strong>Course:</strong> GD BATCH (8)</p>
          <div style="text-align: center; margin: 15px 0;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?data=GD-83236&size=90x90" alt="QR Code">
          </div>
          <p style="font-size: 12px; color: #555; text-align: justify;">
            <strong>Note:</strong> This card is for SMIT’s premises only. If found, please return to SMIT.
          </p>
          <p style="text-align: center; margin-top: 30px; font-style: italic;">
            Issuing authority
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `,
    };
    

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("📩 Email sent:", info.messageId);
    } catch (error) {
      console.error("❌ Email failed:", error.message);
      agent.add("⚠️ Registration complete, but email delivery failed.");
    }
  }


  async function fallback(agent) {
    try {
      const queryText = agent.query; // ✅ Add this line

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: queryText }] }],
        config: {
          thinkingConfig: {
            thinkingBudget: 0,
          },
        }
      });
      agent.add(result.candidates[0].content.parts[0].text); // ✅ Gemini v2 structure
    } catch (err) {
      console.error("❌ Gemini error:", err.message);
      agent.add("I couldn’t find an answer. Please try again.");
    }
  }


  // ✅ Intent Map
  const intentMap = new Map();
  intentMap.set("hi", hi);
  intentMap.set("forms", forms);
  intentMap.set("Default Fallback Intent", fallback);

  try {
    await agent.handleRequest(intentMap);
  } catch (err) {
    console.error("❌ Error in handler:", err.message);
    if (!res.headersSent) {
      res.status(500).send("Internal server error.");
    }
  }

});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
