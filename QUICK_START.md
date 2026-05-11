# 🚀 Quick Start Guide - SkillRise India

## Prerequisites
- Node.js v18+ installed
- MongoDB Atlas account (or local MongoDB)
- API Keys:
  - Groq API Key
  - Google Generative AI (Gemini) API Key
  - Google OAuth credentials

---

## 1️⃣ Clone & Setup

```bash
# Clone the repository
git clone https://github.com/Shreya2776/SkillRise_India.git
cd SkillRise_India
```

---

## 2️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your credentials
# Required variables:
# - MONGO_URI
# - JWT_SECRET
# - GROQ_API_KEY
# - GEMINI_API_KEY
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET

# Start the backend server
npm run dev
```

**Backend will run on:** `http://localhost:8000`

---

## 3️⃣ Frontend Setup

```bash
# Open a new terminal
cd client

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000/api/auth" > .env

# Start the frontend
npm run dev
```

**Frontend will run on:** `http://localhost:5173`

---

## 4️⃣ Verify Installation

### Check Backend Health
Open browser: `http://localhost:8000/api/health`

Expected response:
```json
{
  "success": true,
  "status": "SkillRise API Online",
  "services": ["auth", "resume", "interview", "chatbot"]
}
```

### Check Frontend
Open browser: `http://localhost:5173`

You should see the SkillRise India landing page.

---

## 5️⃣ Test Features

### Register a User
1. Go to `http://localhost:5173/register`
2. Fill in the registration form
3. Check your email for OTP (if email is configured)

### Test Chatbot
1. Login to your account
2. Navigate to "Career Assistant"
3. Send a message: "Generate a web development roadmap"

### Test Resume Analyzer
1. Navigate to "Resume Analyzer"
2. Upload a PDF resume
3. View ATS score and suggestions

### Test Mock Interview
1. Navigate to "Mock Interview"
2. Create a new interview session
3. Answer questions and get feedback

---

## 📁 Project Structure

```
SkillRise_India/
├── backend/              # Single consolidated backend
│   ├── server.js         # Main entry point
│   ├── services/         # Microservices
│   │   ├── auth/         # Authentication
│   │   ├── chatbot/      # AI Chatbot
│   │   ├── resume/       # Resume Analysis
│   │   └── interview/    # Mock Interviews
│   └── shared/           # Shared resources
│       ├── config/       # Database, Passport
│       ├── models/       # Mongoose models
│       └── utils/        # Utilities
│
└── client/               # React frontend
    └── src/
        ├── pages/        # Page components
        ├── components/   # Reusable components
        └── services/     # API services
```

---

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=1d

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama3-8b-8192
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api/auth
```

---

## 🐛 Troubleshooting

### Backend won't start
- Check if MongoDB is accessible
- Verify all required environment variables are set
- Check if port 8000 is available

### Frontend can't connect to backend
- Verify backend is running on port 8000
- Check CORS configuration in `backend/server.js`
- Verify `VITE_API_URL` in `client/.env`

### Chatbot not responding
- Check Groq API key is valid
- Verify MongoDB connection (chatbot uses MongoDB for memory)
- Check browser console for errors

### Resume upload fails
- Verify file is PDF or DOCX format
- Check file size (max 10MB)
- Ensure `pdf-parse` package is installed

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Endpoints

#### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/google` - Google OAuth

#### Profile
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile

#### Roadmap
- `POST /roadmap/generate` - Generate career roadmap
- `POST /roadmap/update` - Update with resume

#### Resume
- `POST /resume/analyze` - Analyze resume

#### Interview
- `POST /interview/interviews/create` - Create interview
- `GET /interview/interviews` - Get all interviews
- `GET /interview/stats` - Get statistics

#### Chatbot
- `POST /chatbot/message` - Send message (streaming)

#### Admin
- `GET /admin/stats` - Platform statistics
- `GET /admin/users` - Users list
- `POST /admin/register-ngo` - Register NGO

---

## 🚀 Deployment

### Backend (Render/Railway/Heroku)
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend-url.com/api/auth`
6. Deploy

---

## 🎯 Default Credentials

### Admin Account
After running seed script:
```
Email: admin@skillrise.com
Password: admin123
```

### Test User
```
Email: test@example.com
Password: test123
```

---

## 📞 Support

- GitHub Issues: [Report a bug](https://github.com/Shreya2776/SkillRise_India/issues)
- Documentation: See `RESTRUCTURE_COMPLETE.md`

---

**Happy Coding! 🎉**
