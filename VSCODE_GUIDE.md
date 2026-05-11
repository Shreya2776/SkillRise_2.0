# 🚀 VS Code Quick Start Guide

## One-Click Run & Debug

Your project is now configured for **one-click debugging** in VS Code!

---

## 🎯 Quick Start (Easiest Way)

### Method 1: Run Both Backend + Frontend Together

1. Press `F5` or click the **Run** button in VS Code
2. Select **"🚀 Full Stack (Backend + Frontend)"**
3. Both servers will start automatically!

**That's it!** Your application is now running:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

---

## 🎮 Available Debug Configurations

Press `F5` and choose from:

### 1. 🚀 Full Stack (Backend + Frontend)
**Recommended for development**
- Starts both backend and frontend together
- Perfect for full-stack development
- One-click to start everything

### 2. 🚀 Backend Server
- Starts only the backend server
- Includes hot-reload with nodemon
- Debugging enabled

### 3. 🎨 Frontend (Vite)
- Starts only the frontend
- Fast HMR (Hot Module Replacement)
- Perfect for UI development

### 4. 🧪 Test Backend API
- Runs comprehensive API tests
- Tests all endpoints
- Shows detailed results

### 5. 👨💼 Seed Admin User
- Creates admin user in database
- Useful for first-time setup
- Email: admin@skillrise.com
- Password: admin123

---

## 📋 Available Tasks

Press `Ctrl+Shift+P` → Type "Tasks: Run Task" → Choose:

### Development Tasks
- **🚀 Start Backend** - Start backend server
- **🎨 Start Frontend** - Start frontend server
- **🚀 Full Stack - Start Both** - Start both servers

### Setup Tasks
- **📦 Install Backend Dependencies** - npm install in backend
- **📦 Install Frontend Dependencies** - npm install in client
- **📦 Install All Dependencies** - Install both

### Testing Tasks
- **🧪 Verify API Endpoints** - Test all API endpoints
- **👨💼 Seed Admin User** - Create admin user

### Maintenance Tasks
- **🧹 Clean Node Modules** - Delete all node_modules
- **🔄 Reinstall Everything** - Clean and reinstall all dependencies

---

## 🔧 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F5` | Start debugging |
| `Shift+F5` | Stop debugging |
| `Ctrl+Shift+F5` | Restart debugging |
| `Ctrl+Shift+P` | Command palette (run tasks) |
| `Ctrl+Shift+B` | Run build task |
| `Ctrl+` ` | Toggle terminal |

---

## 📝 Step-by-Step: First Time Setup

### 1. Install Dependencies

**Option A: Using VS Code Task**
1. Press `Ctrl+Shift+P`
2. Type "Tasks: Run Task"
3. Select "📦 Install All Dependencies"

**Option B: Using Terminal**
```bash
# Backend
cd backend
npm install

# Frontend
cd client
npm install
```

### 2. Configure Environment Variables

Make sure `.env` files exist:
- `backend/.env` - Backend configuration
- `client/.env` - Frontend configuration

### 3. Create Admin User (Optional)

**Option A: Using VS Code**
1. Press `F5`
2. Select "👨💼 Seed Admin User"

**Option B: Using Terminal**
```bash
cd backend
npm run seed:admin
```

### 4. Start Development

**Option A: One-Click (Recommended)**
1. Press `F5`
2. Select "🚀 Full Stack (Backend + Frontend)"

**Option B: Separate Terminals**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

---

## 🧪 Testing Your Setup

### Quick Health Check

1. **Start the application** (Press F5 → Full Stack)

2. **Check backend health:**
   - Open browser: http://localhost:8000/api/health
   - Should see: `{"success": true, "status": "SkillRise API Online"}`

3. **Check frontend:**
   - Open browser: http://localhost:5173
   - Should see the SkillRise India homepage

### Comprehensive Testing

**Option A: Using VS Code**
1. Press `F5`
2. Select "🧪 Test Backend API"
3. View results in terminal

**Option B: Using Terminal**
```bash
cd backend
npm run test:all
```

This will test:
- ✅ Health check
- ✅ Authentication (register/login)
- ✅ Profile management
- ✅ Roadmap generation
- ✅ AI Chatbot
- ✅ Mock Interview
- ✅ Admin endpoints

---

## 🐛 Debugging Tips

### Backend Debugging

1. **Set breakpoints** in your code (click left of line number)
2. Press `F5` → Select "🚀 Backend Server"
3. Trigger the code path (make API call)
4. Debugger will pause at breakpoint
5. Inspect variables, step through code

### Frontend Debugging

1. Start frontend: Press `F5` → "🎨 Frontend (Vite)"
2. Open browser DevTools (F12)
3. Use browser debugger for frontend code

### View Logs

- **Backend logs:** Check "Debug Console" in VS Code
- **Frontend logs:** Check browser console (F12)

---

## 🔍 Troubleshooting

### "Cannot find module" error

**Solution:**
```bash
# Run this task:
Ctrl+Shift+P → Tasks: Run Task → 📦 Install All Dependencies
```

### Port already in use

**Solution:**
1. Stop all running servers (Shift+F5)
2. Kill any Node.js processes:
   - Task Manager → End "Node.js" processes
3. Try again (F5)

### Backend won't start

**Check:**
- [ ] MongoDB connection string in `backend/.env`
- [ ] All environment variables set
- [ ] Dependencies installed (`npm install`)

### Frontend won't start

**Check:**
- [ ] `VITE_API_URL` in `client/.env`
- [ ] Dependencies installed (`npm install`)
- [ ] Port 5173 is available

---

## 📊 VS Code Extensions (Recommended)

Install these for better experience:

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **ES7+ React/Redux/React-Native snippets** - React snippets
- **MongoDB for VS Code** - MongoDB management
- **REST Client** - Test APIs from VS Code
- **GitLens** - Git supercharged

---

## 🎨 Customization

### Change Ports

**Backend (default: 8000):**
Edit `backend/.env`:
```env
PORT=8000
```

**Frontend (default: 5173):**
Edit `client/vite.config.js`:
```javascript
export default {
  server: {
    port: 5173
  }
}
```

### Add More Debug Configurations

Edit `.vscode/launch.json` to add custom configurations.

### Add More Tasks

Edit `.vscode/tasks.json` to add custom tasks.

---

## 🚀 Production Build

### Build Frontend
```bash
cd client
npm run build
```
Output: `client/dist/`

### Start Production Backend
```bash
cd backend
npm start
```

---

## 📚 Additional Resources

- `QUICK_START.md` - General quick start guide
- `TESTING_CHECKLIST.md` - Manual testing checklist
- `DEPLOYMENT_GUIDE.md` - Production deployment
- `backend/README.md` - Backend API documentation

---

## 🎉 You're All Set!

**To start developing:**

1. Press `F5`
2. Select "🚀 Full Stack (Backend + Frontend)"
3. Start coding!

**Happy coding! 🚀**

---

*Last updated: January 2025*
