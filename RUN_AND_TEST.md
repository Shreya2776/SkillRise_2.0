# 🚀 Run & Test Guide - SkillRise India

## 🎯 Quick Start (One Command)

### Using VS Code (Recommended)

1. **Open VS Code** in the project folder
2. **Press F5**
3. **Select:** "🚀 Full Stack (Backend + Frontend)"
4. **Done!** Both servers are running

**URLs:**
- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- Health Check: http://localhost:8000/api/health

---

## 📋 Manual Start (Terminal)

### Terminal 1 - Backend
```bash
cd backend
npm install  # First time only
npm run dev
```
✅ Backend running on http://localhost:8000

### Terminal 2 - Frontend
```bash
cd client
npm install  # First time only
npm run dev
```
✅ Frontend running on http://localhost:5173

---

## 🧪 Testing All Features

### Automated Testing

**Using VS Code:**
1. Press `F5`
2. Select "🧪 Test Backend API"

**Using Terminal:**
```bash
cd backend
npm run test:all
```

This will test:
- ✅ Health Check
- ✅ Authentication (Register/Login)
- ✅ Profile Management
- ✅ Roadmap Generation
- ✅ AI Chatbot
- ✅ Mock Interview
- ✅ Admin Endpoints

### Manual Testing Checklist

#### 1. Health Check ✅
```bash
# Visit in browser
http://localhost:8000/api/health

# Expected response:
{
  "success": true,
  "status": "SkillRise API Online",
  "services": ["auth", "resume", "interview", "chatbot"]
}
```

#### 2. Frontend Loading ✅
```bash
# Visit in browser
http://localhost:5173

# Should see:
- SkillRise India homepage
- Navigation menu
- Login/Register buttons
```

#### 3. User Registration ✅
1. Go to http://localhost:5173/register
2. Fill in:
   - Email: test@example.com
   - Password: Test@123456
   - Name: Test User
3. Click "Register"
4. Should redirect to login

#### 4. User Login ✅
1. Go to http://localhost:5173/login
2. Enter credentials from registration
3. Click "Login"
4. Should redirect to dashboard
5. Check localStorage for token

#### 5. Profile Management ✅
1. Navigate to Profile page
2. Fill in profile details:
   - Skills
   - Education
   - Work Experience
   - Target Role
3. Save profile
4. Verify data saved

#### 6. Career Roadmap ✅
1. Navigate to Roadmap page
2. Enter target role: "Full Stack Developer"
3. Select duration: "6 months"
4. Click "Generate Roadmap"
5. Wait 10-30 seconds
6. Verify roadmap displayed with:
   - Monthly breakdown
   - Skills to learn
   - Resources
   - Milestones

#### 7. Resume Analyzer ✅
1. Navigate to Resume Analyzer
2. Upload a PDF resume
3. Click "Analyze"
4. Wait 5-15 seconds
5. Verify results show:
   - ATS Score (0-100)
   - Missing keywords
   - Improvement suggestions
   - Section-by-section feedback

#### 8. AI Chatbot ✅
1. Navigate to Chatbot page
2. Send message: "What skills do I need for web development?"
3. Verify:
   - Message sent
   - Streaming response appears
   - Response is relevant
   - Markdown formatting works
4. Try uploading resume to chatbot
5. Ask follow-up questions

#### 9. Mock Interview ✅
1. Navigate to Mock Interview
2. Click "Create New Interview"
3. Select:
   - Type: Technical
   - Domain: Web Development
   - Difficulty: Intermediate
4. Start interview
5. Answer questions
6. Submit interview
7. Verify feedback report shows:
   - Overall score
   - Per-question feedback
   - Strengths
   - Areas for improvement

#### 10. Admin Dashboard ✅
1. Login as admin (if admin user exists)
2. Navigate to Admin Dashboard
3. Verify displays:
   - Total users
   - Total NGOs
   - Platform statistics
   - Charts and graphs

---

## 🔍 Feature-by-Feature Testing

### Authentication Features

**Test Cases:**
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Google OAuth login
- [ ] Logout
- [ ] Protected routes redirect to login
- [ ] JWT token stored in localStorage
- [ ] Token expires after 1 day

### Profile Features

**Test Cases:**
- [ ] Create new profile
- [ ] View profile
- [ ] Edit profile
- [ ] Add skills
- [ ] Add education
- [ ] Add work experience
- [ ] Upload profile picture (if implemented)
- [ ] Profile completion percentage

### Roadmap Features

**Test Cases:**
- [ ] Generate roadmap without resume
- [ ] Generate roadmap with resume upload
- [ ] Career switch roadmap
- [ ] Roadmap displays correctly
- [ ] Can mark items as complete
- [ ] Roadmap saves to database

### Resume Analyzer Features

**Test Cases:**
- [ ] Upload PDF resume
- [ ] Upload DOCX resume (if supported)
- [ ] ATS score calculated
- [ ] Missing keywords identified
- [ ] Improvement suggestions provided
- [ ] Section-by-section feedback
- [ ] Large file rejected (>10MB)
- [ ] Invalid file type rejected

### Chatbot Features

**Test Cases:**
- [ ] Send text message
- [ ] Receive streaming response
- [ ] Markdown formatting works
- [ ] Code blocks formatted
- [ ] Upload resume to chatbot
- [ ] Resume parsed correctly
- [ ] Context maintained across messages
- [ ] Can start new conversation
- [ ] Chat history saved
- [ ] Can load previous conversations

### Interview Features

**Test Cases:**
- [ ] Create technical interview
- [ ] Create behavioral interview
- [ ] Create mixed interview
- [ ] Questions generated dynamically
- [ ] Can answer questions
- [ ] Can skip questions
- [ ] Submit interview
- [ ] Feedback report generated
- [ ] Score calculated
- [ ] View past interviews
- [ ] View interview statistics

### Admin Features

**Test Cases:**
- [ ] View platform statistics
- [ ] View users list
- [ ] View NGOs list
- [ ] Register new NGO
- [ ] View charts and graphs
- [ ] Filter and search data

### NGO Features

**Test Cases:**
- [ ] NGO login
- [ ] Create blog post
- [ ] Create training program
- [ ] Create job opportunity
- [ ] View own posts
- [ ] Edit posts
- [ ] Delete posts
- [ ] View engagement metrics

---

## 🐛 Common Issues & Solutions

### Issue: Backend won't start

**Symptoms:**
- Error: "Cannot connect to MongoDB"
- Error: "Port 8000 already in use"

**Solutions:**
1. Check MongoDB connection string in `backend/.env`
2. Verify MongoDB Atlas IP whitelist
3. Kill process on port 8000:
   ```bash
   # Windows
   netstat -ano | findstr :8000
   taskkill /PID <PID> /F
   ```

### Issue: Frontend won't start

**Symptoms:**
- Error: "Port 5173 already in use"
- Blank page

**Solutions:**
1. Kill process on port 5173
2. Check `client/.env` has correct API URL
3. Clear browser cache
4. Try incognito mode

### Issue: Chatbot not responding

**Symptoms:**
- Loading forever
- Error: "Failed to connect"

**Solutions:**
1. Check Groq API key in `backend/.env`
2. Verify MongoDB connection (chatbot uses MongoDB for memory)
3. Check browser console for errors
4. Verify backend is running

### Issue: Resume upload fails

**Symptoms:**
- Error: "Failed to parse PDF"
- Upload hangs

**Solutions:**
1. Check file is PDF or DOCX
2. Check file size (<10MB)
3. Verify `pdf-parse` package installed
4. Check backend logs for errors

### Issue: Roadmap generation fails

**Symptoms:**
- Error: "Failed to generate roadmap"
- Timeout

**Solutions:**
1. Check Groq API key valid
2. Check API rate limits
3. Try again (retry logic implemented)
4. Check backend logs

---

## 📊 Performance Benchmarks

### Expected Response Times

| Feature | Expected Time |
|---------|---------------|
| Health Check | <50ms |
| Login/Register | <500ms |
| Profile Operations | <1s |
| Roadmap Generation | 10-30s |
| Resume Analysis | 5-15s |
| Chatbot Response | 2-10s |
| Interview Creation | <2s |

### Resource Usage

| Metric | Expected |
|--------|----------|
| Backend Memory | ~200MB |
| Frontend Memory | ~100MB |
| CPU (Idle) | <5% |
| CPU (Active) | <30% |

---

## ✅ Complete Testing Checklist

### Pre-Testing
- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] All environment variables set

### Core Features
- [ ] Health check passes
- [ ] User registration works
- [ ] User login works
- [ ] Profile CRUD operations work
- [ ] Roadmap generation works
- [ ] Resume analysis works
- [ ] Chatbot responds correctly
- [ ] Mock interview works
- [ ] Admin dashboard accessible

### Edge Cases
- [ ] Invalid login credentials rejected
- [ ] Large files rejected
- [ ] Invalid file types rejected
- [ ] Protected routes secured
- [ ] Error messages user-friendly
- [ ] Loading states shown

### Performance
- [ ] Pages load quickly (<3s)
- [ ] No memory leaks
- [ ] API responses timely
- [ ] Smooth animations

### UI/UX
- [ ] Responsive design works
- [ ] Mobile view functional
- [ ] Buttons clickable
- [ ] Forms validate input
- [ ] Error messages clear

---

## 🎉 Success Criteria

Your application is working correctly if:

✅ All automated tests pass
✅ All manual test cases pass
✅ No console errors
✅ Performance within benchmarks
✅ UI/UX smooth and responsive

---

## 📞 Need Help?

If tests fail:

1. **Check logs:**
   - Backend: Terminal running backend
   - Frontend: Browser console (F12)

2. **Verify configuration:**
   - `backend/.env` - All variables set
   - `client/.env` - API URL correct

3. **Check documentation:**
   - `VSCODE_GUIDE.md` - VS Code setup
   - `QUICK_START.md` - General setup
   - `TROUBLESHOOTING.md` - Common issues

4. **Run automated tests:**
   ```bash
   cd backend
   npm run test:all
   ```

---

**Happy Testing! 🚀**

*Last updated: January 2025*
