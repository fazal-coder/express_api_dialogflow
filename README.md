# SMIT Registration Chatbot Webhook

A Node.js Express server that serves as a webhook for Dialogflow, enabling automated student registration for the Saylani Mass IT Training (SMIT) program. This project integrates with Google Gemini AI for intelligent fallback responses and sends registration confirmation emails with digital ID cards.

## 🚀 Features

- **Dialogflow Integration**: Handles user intents for greetings and registration
- **Student Registration System**: Collects and stores user details in Excel format
- **Email Notifications**: Sends confirmation emails with digital ID cards
- **AI-Powered Fallback**: Uses Google Gemini AI for handling unmatched queries
- **CORS Support**: Enables cross-origin requests
- **Environment Configuration**: Secure management of sensitive data via `.env`

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Platform account (for Dialogflow)
- Google Gemini API key
- Gmail account (for sending emails)

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/fazal-coder/express_api_dialogflow.git
   cd express_api_dialogflow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory with the following variables:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GOOGLE_EMAIL=your_gmail_address@gmail.com
   GOOGLE_PASSWORD=your_gmail_app_password
   PORT=8080
   ```

4. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npx nodemon index.js
   
   # Production mode
   node index.js
   ```

## 📁 Project Structure

```
mid_hackthon/
├── index.js              # Main server file
├── package.json          # Dependencies and scripts
├── package-lock.json     # Locked dependency versions
├── registrations.xlsx    # Student registration data
├── .env                 # Environment variables (create this)
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |
| `GOOGLE_EMAIL` | Gmail address for sending emails | Yes |
| `GOOGLE_PASSWORD` | Gmail app password (not regular password) | Yes |
| `PORT` | Server port (default: 8080) | No |

### Gmail Setup

To use Gmail for sending emails, you need to:
1. Enable 2-factor authentication on your Google account
2. Generate an App Password for this application
3. Use the App Password in the `GOOGLE_PASSWORD` environment variable

## 🎯 API Endpoints

### GET `/`
- **Description**: Health check endpoint
- **Response**: "Dialogflow webhook is running."

### POST `/webhook`
- **Description**: Dialogflow webhook endpoint
- **Content-Type**: `application/json`
- **Body**: Dialogflow webhook request

## 🤖 Dialogflow Intents

### 1. Greeting Intent (`hi`)
- **Purpose**: Responds to user greetings
- **Response**: "Hello! How can I help you today?"

### 2. Registration Intent (`forms`)
- **Purpose**: Handles student registration
- **Required Parameters**:
  - `name`: Student's full name
  - `email`: Student's email address
  - `CnicNum`: CNIC number
  - `number`: Phone number
  - `course`: Selected course
  - `gender`: Student's gender

### 3. Fallback Intent (`Default Fallback Intent`)
- **Purpose**: Handles unmatched queries using Gemini AI
- **Response**: AI-generated response based on user input

## 📊 Data Storage

Student registrations are stored in `registrations.xlsx` with the following columns:
- Name
- Email
- Number
- CNIC
- Gender
- Course
- Date

## 📧 Email Features

The system sends confirmation emails containing:
- Digital ID card with student photo
- Registration details
- QR code for student ID
- SMIT branding and styling

## 🚀 Deployment

### Railway Deployment
This project is configured for Railway deployment. The server automatically detects the Railway environment and uses the provided port.

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npx nodemon index.js

# Start production server
node index.js
```

## 🔍 Troubleshooting

### Common Issues

1. **Email not sending**: Check Gmail app password and 2FA settings
2. **Gemini API errors**: Verify API key is correct and has proper permissions
3. **Port conflicts**: Change PORT in .env file
4. **CORS issues**: Ensure proper CORS configuration for your domain

### Logs
The application provides detailed console logs for:
- Server startup
- Registration processing
- Email sending status
- API errors
