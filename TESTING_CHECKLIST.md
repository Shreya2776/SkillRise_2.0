# ✅ SkillRise India - Testing Checklist

## Pre-Testing Setup
- [ ] Backend server running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] MongoDB connected successfully
- [ ] All environment variables configured
- [ ] Health check endpoint returns success: `http://localhost:8000/api/health`

---

## 🔐 Authentication & Authorization

### User Registration
- [ ] Navigate to `/register`
- [ ] Fill in all required fields
- [ ] Submit form
- [ ] Verify OTP email received (if email configured)
- [ ] Verify user created in database
- [ ] Verify redirect to login page

### User Login
- [ ] Navigate to `/login`
- [ ] Enter valid credentials
- [ ] Submit form
- [ ] Verify JWT token stored in localStorage
- [ ] Verify redirect to dashboard
- [ ] Verify user data displayed correctly

### Google OAuth
- [ ] Click "Sign in with Google" button
- [ ] Complete Google authentication
- [ ] Verify redirect to dashboard
- [ ] Verify user profile created
- [ ] Verify JWT token stored

### Logout
- [ ] Click logout button
- [ ] Verify token removed from localStorage
- [ ] Verify redirect to login page
- [ ] Verify protected routes are inaccessible

---

## 👤 Profile Management

### View Profile
- [ ] Navigate to `/profile/dashboard`
- [ ] Verify user information displayed
- [ ] Verify profile completion percentage
- [ ] Verify skills displayed
- [ ] Verify work experience displayed
- [ ] Verify education displayed

### Edit Profile
- [ ] Navigate to `/profile` or click "Edit Profile"
- [ ] Update personal information
- [ ] Add/remove skills
- [ ] Add/remove work experience
- [ ] Add/remove education
- [ ] Upload profile picture (if implemented)
- [ ] Save changes
- [ ] Verify changes reflected in database
- [ ] Verify changes displayed on profile page

---

## 🗺️ Career Roadmap

### Generate Roadmap (Without Resume)
- [ ] Navigate to roadmap page
- [ ] Enter target role (e.g., "Full Stack Developer")
- [ ] Select duration (e.g., "6 months")
- [ ] Click "Generate Roadmap"
- [ ] Verify loading indicator appears
- [ ] Verify roadmap generated successfully
- [ ] Verify roadmap items displayed with:
  - [ ] Month/timeline
  - [ ] Skills to learn
  - [ ] Resources/courses
  - [ ] Milestones
- [ ] Verify roadmap can be marked as complete

### Update Roadmap (With Resume)
- [ ] Upload PDF resume
- [ ] Enter target role
- [ ] Select duration
- [ ] Click "Update Roadmap"
- [ ] Verify resume parsed successfully
- [ ] Verify personalized roadmap generated
- [ ] Verify roadmap considers current skills from resume

### Career Switch Roadmap
- [ ] Upload resume
- [ ] Enter current role
- [ ] Enter target role
- [ ] Select duration
- [ ] Click "Generate Career Switch Roadmap"
- [ ] Verify transition plan generated
- [ ] Verify transferable skills identified
- [ ] Verify skill gaps highlighted

---

## 📄 Resume Analyzer

### Upload and Analyze Resume
- [ ] Navigate to Resume Analyzer page
- [ ] Upload PDF resume
- [ ] Click "Analyze Resume"
- [ ] Verify loading indicator
- [ ] Verify ATS score displayed (0-100)
- [ ] Verify missing keywords listed
- [ ] Verify section-by-section feedback provided
- [ ] Verify improvement suggestions displayed
- [ ] Verify skill extraction working

### Test Different Formats
- [ ] Test with PDF file
- [ ] Test with DOCX file (if supported)
- [ ] Test with large file (>5MB) - should show error
- [ ] Test with invalid file type - should show error

---

## 🎙️ Mock Interview

### Create Interview Session
- [ ] Navigate to Mock Interview page
- [ ] Click "Create New Interview"
- [ ] Select interview type (Technical/Behavioral/Mixed)
- [ ] Select domain/role
- [ ] Select difficulty level
- [ ] Set number of questions
- [ ] Click "Start Interview"
- [ ] Verify interview session created

### Conduct Interview
- [ ] Verify first question displayed
- [ ] Answer question (text or voice)
- [ ] Click "Next Question"
- [ ] Verify next question generated dynamically
- [ ] Complete all questions
- [ ] Submit interview

### View Feedback
- [ ] Verify feedback report generated
- [ ] Verify overall score displayed
- [ ] Verify per-question feedback shown
- [ ] Verify strengths highlighted
- [ ] Verify areas for improvement listed
- [ ] Verify suggestions provided

### Interview History
- [ ] Navigate to interview history
- [ ] Verify all past interviews listed
- [ ] Verify interview details (date, score, type)
- [ ] Click on past interview
- [ ] Verify detailed feedback accessible

### Interview Statistics
- [ ] Navigate to stats page
- [ ] Verify total interviews count
- [ ] Verify average score
- [ ] Verify performance trends chart
- [ ] Verify breakdown by interview type

---

## 🤖 AI Career Chatbot

### Start Conversation
- [ ] Navigate to Chatbot page
- [ ] Verify welcome message displayed
- [ ] Verify suggested prompts shown
- [ ] Click a suggested prompt
- [ ] Verify message sent
- [ ] Verify AI response received

### Send Messages
- [ ] Type custom message
- [ ] Send message
- [ ] Verify streaming response (text appears gradually)
- [ ] Verify markdown formatting works
- [ ] Verify code blocks formatted correctly
- [ ] Verify links clickable

### Upload Resume to Chatbot
- [ ] Click attachment icon
- [ ] Upload PDF resume
- [ ] Verify file preview shown
- [ ] Send message with resume
- [ ] Verify resume parsed
- [ ] Verify AI provides resume-based insights

### Test Different Queries
- [ ] Ask for learning roadmap
- [ ] Ask for skill gap analysis
- [ ] Ask for job recommendations
- [ ] Ask for interview preparation tips
- [ ] Ask for course recommendations
- [ ] Ask about government schemes

### Conversation Memory
- [ ] Send multiple messages
- [ ] Reference previous messages
- [ ] Verify chatbot remembers context
- [ ] Verify thread ID maintained
- [ ] Start new chat
- [ ] Verify new thread created

### Chat History
- [ ] Verify recent chats listed in sidebar
- [ ] Click on past chat
- [ ] Verify conversation loaded
- [ ] Verify can continue conversation

---

## 🏢 NGO Features

### NGO Registration (Admin)
- [ ] Login as admin
- [ ] Navigate to admin dashboard
- [ ] Click "Register NGO"
- [ ] Fill in NGO details
- [ ] Submit form
- [ ] Verify NGO created
- [ ] Verify NGO credentials sent (if email configured)

### NGO Login
- [ ] Login with NGO credentials
- [ ] Verify redirect to NGO dashboard
- [ ] Verify NGO-specific features accessible

### Post Blog
- [ ] Navigate to NGO dashboard
- [ ] Click "Create Blog Post"
- [ ] Enter title and content
- [ ] Optionally use AI generation
- [ ] Add tags/categories
- [ ] Publish blog
- [ ] Verify blog appears in feed

### Post Training Program
- [ ] Click "Create Program"
- [ ] Enter program details:
  - [ ] Title
  - [ ] Description
  - [ ] Skills covered
  - [ ] Location
  - [ ] Duration
  - [ ] Eligibility
  - [ ] Deadline
- [ ] Publish program
- [ ] Verify program appears in opportunities feed

### Post Job Opportunity
- [ ] Click "Create Opportunity"
- [ ] Enter job details
- [ ] Set location and skills
- [ ] Add application link
- [ ] Publish opportunity
- [ ] Verify opportunity appears in feed

---

## 👨💼 Admin Features

### View Dashboard
- [ ] Login as admin
- [ ] Navigate to admin dashboard
- [ ] Verify statistics displayed:
  - [ ] Total users
  - [ ] Total NGOs
  - [ ] Active programs
  - [ ] Platform activity
- [ ] Verify charts/graphs rendered
- [ ] Verify state-wise distribution shown

### Manage Users
- [ ] Navigate to users list
- [ ] Verify all users displayed
- [ ] Search for specific user
- [ ] View user details
- [ ] Verify user actions available (if implemented)

### Manage NGOs
- [ ] Navigate to NGOs list
- [ ] Verify all NGOs displayed
- [ ] View NGO details
- [ ] Verify NGO activity metrics
- [ ] Approve/reject NGO (if workflow exists)

### Platform Analytics
- [ ] View trending skills
- [ ] View top demand roles
- [ ] View user engagement metrics
- [ ] Export reports (if implemented)

---

## 📱 Personalized Feed

### View Recommendations
- [ ] Navigate to dashboard/feed
- [ ] Verify personalized recommendations shown
- [ ] Verify match scores displayed
- [ ] Verify recommendations include:
  - [ ] Job opportunities
  - [ ] Training programs
  - [ ] Courses
  - [ ] NGO events
  - [ ] Blog posts

### Filter Recommendations
- [ ] Filter by type (jobs/programs/courses)
- [ ] Filter by location
- [ ] Filter by skills
- [ ] Verify filtered results correct

### Interact with Recommendations
- [ ] Click on recommendation
- [ ] Verify details page opens
- [ ] Verify "Apply" or "Learn More" link works
- [ ] Save recommendation (if implemented)
- [ ] Share recommendation (if implemented)

---

## 🔔 Notifications (If Implemented)

- [ ] Verify notification icon shows count
- [ ] Click notification icon
- [ ] Verify notifications list displayed
- [ ] Click on notification
- [ ] Verify redirect to relevant page
- [ ] Mark notification as read
- [ ] Clear all notifications

---

## 🌐 Responsive Design

### Desktop (1920x1080)
- [ ] Verify all pages render correctly
- [ ] Verify navigation works
- [ ] Verify no horizontal scroll
- [ ] Verify images load properly

### Tablet (768x1024)
- [ ] Verify responsive layout
- [ ] Verify sidebar collapses (if applicable)
- [ ] Verify touch interactions work
- [ ] Verify forms usable

### Mobile (375x667)
- [ ] Verify mobile menu works
- [ ] Verify all features accessible
- [ ] Verify text readable
- [ ] Verify buttons tappable
- [ ] Verify forms usable

---

## ⚡ Performance

### Page Load Times
- [ ] Dashboard loads in <3 seconds
- [ ] Chatbot loads in <2 seconds
- [ ] Resume analyzer loads in <2 seconds
- [ ] Interview page loads in <2 seconds

### API Response Times
- [ ] Auth endpoints respond in <500ms
- [ ] Profile endpoints respond in <1s
- [ ] Roadmap generation completes in <30s
- [ ] Resume analysis completes in <15s
- [ ] Chatbot streaming starts in <2s

### Resource Usage
- [ ] Backend memory usage <500MB
- [ ] Frontend bundle size reasonable
- [ ] No memory leaks in long sessions
- [ ] Images optimized

---

## 🔒 Security

### Authentication
- [ ] Protected routes redirect to login
- [ ] JWT tokens expire correctly
- [ ] Refresh token mechanism works (if implemented)
- [ ] XSS protection in place
- [ ] CSRF protection in place

### Authorization
- [ ] Users can only access own data
- [ ] Admin routes protected
- [ ] NGO routes protected
- [ ] Role-based access control works

### Data Validation
- [ ] Input validation on all forms
- [ ] File upload validation (type, size)
- [ ] SQL injection prevention
- [ ] NoSQL injection prevention

---

## 🐛 Error Handling

### Network Errors
- [ ] Backend offline - shows error message
- [ ] Slow connection - shows loading state
- [ ] Timeout - shows retry option

### Validation Errors
- [ ] Invalid email - shows error
- [ ] Weak password - shows requirements
- [ ] Missing required fields - highlights fields

### API Errors
- [ ] 400 errors - shows user-friendly message
- [ ] 401 errors - redirects to login
- [ ] 403 errors - shows access denied
- [ ] 404 errors - shows not found page
- [ ] 500 errors - shows generic error message

---

## 🎨 UI/UX

### Visual Design
- [ ] Consistent color scheme
- [ ] Readable fonts
- [ ] Proper spacing
- [ ] Aligned elements
- [ ] Smooth animations

### User Experience
- [ ] Intuitive navigation
- [ ] Clear call-to-action buttons
- [ ] Helpful error messages
- [ ] Loading indicators
- [ ] Success confirmations
- [ ] Breadcrumbs (if applicable)

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Sufficient color contrast
- [ ] Alt text on images
- [ ] ARIA labels present

---

## 📊 Test Results Summary

**Date:** _____________

**Tester:** _____________

**Total Tests:** _____________

**Passed:** _____________

**Failed:** _____________

**Critical Issues:** _____________

**Minor Issues:** _____________

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

---

## 🚨 Critical Issues Found

| Issue | Severity | Page/Feature | Status |
|-------|----------|--------------|--------|
|       |          |              |        |
|       |          |              |        |
|       |          |              |        |

---

## ✅ Sign-off

- [ ] All critical features tested
- [ ] All critical issues resolved
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Ready for deployment

**Approved by:** _____________

**Date:** _____________

---

**Testing completed! 🎉**
