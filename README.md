# 💰 Expense Tracker

A **modern, secure, and cloud-powered** full-stack web application for tracking personal expenses. Built with **Firebase** (Authentication & Firestore), **Spring Boot** backend (optional), and **vanilla JavaScript** frontend featuring interactive charts, dark mode, responsive UI, and real-time data sync.

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.7.1-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.1.5-green)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![Status](https://img.shields.io/badge/status-production--ready-brightgreen)

## ✨ Key Highlights

- 🔥 **Firebase Powered** - Cloud authentication and real-time Firestore database
- 🎯 **Dual Backend Architecture** - Works with Firebase directly OR Spring Boot backend
- 🔐 **Secure Authentication** - Firebase Auth with email/password
- 📊 **Interactive Charts** - Beautiful visualizations with Chart.js
- 🌗 **Dark Mode** - Eye-friendly theme with persistent preference
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- ⚡ **Real-time Sync** - Instant data updates across all devices
- 🛡️ **Multi-Layer Validation** - Frontend + Backend validation
- 🚀 **Production Ready** - Deployed and tested

---

## 🌟 Features

### 💼 Core Functionality
- ✅ **User Authentication** - Secure login/signup with Firebase Auth
- ✅ **Add Expenses** - Quick expense entry with real-time validation
- ✏️ **Edit & Update** - Modify existing records seamlessly
- 🗑️ **Delete** - Remove expenses with confirmation
- 📋 **Real-time List** - Auto-updates when data changes
- 💰 **Summary Dashboard** - Total expenses, monthly spending, daily average
- 🔄 **Auto-Sync** - Firebase Firestore real-time synchronization
- 👤 **User Isolation** - Each user sees only their own expenses

### 📊 Data Visualization
- 🍩 **Category Distribution** - Doughnut chart showing spending breakdown
- 📊 **Category Comparison** - Bar chart for easy analysis
- 📈 **Monthly Trend** - Line chart tracking spending patterns
- 🎯 **Monthly Distribution** - Pie chart for monthly insights
- 📉 **Category Progress** - Visual progress bars per category

### 🎨 UI/UX Features
- 🌗 **Theme Toggle** - Seamless light/dark mode switching
- 🔍 **Filter & Sort** - By category, date, or amount
- 💫 **Smooth Animations** - Professional transitions and hover effects
- 🎭 **Empty States** - Beautiful placeholders when no data exists
- 📱 **Mobile Optimized** - Touch-friendly responsive design
- 🎨 **Modern Design** - Clean interface with gradient cards
- ⚡ **Fast Loading** - Optimized performance

### 🔒 Security & Validation
- 🔐 **Firebase Authentication** - Industry-standard user management
- ✔️ **Frontend Validation** - Instant feedback before submission
- 🛡️ **Backend Validation** - Server-side security (Spring Boot optional)
- 📏 **Firestore Security Rules** - Database-level access control
- 🔒 **XSS Prevention** - Input sanitization on all layers
- 🚫 **SQL Injection Safe** - No SQL database used (NoSQL Firestore)

---

## 🏗️ Architecture

### 🎯 Dual Backend Support

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Vanilla JS)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           api-service.js (Unified API Layer)         │   │
│  │  • ExpenseValidator (Frontend validation)            │   │
│  │  • ExpenseAPI (Backend abstraction)                  │   │
│  │  • Supports both Firebase & Spring Boot              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
┌───────▼────────┐              ┌───────────▼──────────┐
│  Firebase      │              │  Spring Boot Backend │
│  (Default)     │              │  (Optional)          │
├────────────────┤              ├──────────────────────┤
│ • Auth         │              │ • Firebase Admin SDK │
│ • Firestore DB │              │ • REST API           │
│ • Real-time    │              │ • Firestore DB       │
│ • Free tier    │              │ • Railway hosting    │
└────────────────┘              └──────────────────────┘
```

### 📁 Project Structure

```
Expense Tracker/
│
├── Frontend/                           # Client-side application
│   ├── index.html                      # Main HTML file
│   ├── styles.css                      # Modern CSS with animations
│   ├── app.js                          # UI logic and event handlers
│   ├── firebase-auth.js                # Authentication & user management
│   ├── api-service.js                  # Unified API layer (NEW!)
│   ├── firebase-config.js              # Firebase configuration
│   └── team.html                       # Team page
│
├── Backend/                            # Spring Boot (Optional)
│   ├── src/main/java/com/expensetracker/
│   │   ├── ExpenseTrackerApplication.java
│   │   ├── config/
│   │   │   └── FirebaseConfig.java     # Firebase Admin SDK setup
│   │   ├── controller/
│   │   │   └── ExpenseController.java  # REST endpoints
│   │   ├── model/
│   │   │   └── Expense.java            # Entity with validation
│   │   ├── service/
│   │   │   └── ExpenseService.java     # Business logic
│   │   └── dto/
│   │       └── ErrorResponse.java      # Error handling
│   ├── src/main/resources/
│   │   └── application.properties      # Configuration
│   ├── serviceAccountKey.json          # Firebase credentials (gitignored)
│   ├── pom.xml                         # Maven dependencies
│   └── target/
│       └── expense-tracker-1.0.0.jar   # Built artifact
│
├── Documentation/
│   ├── COMPLETE_DEPLOYMENT.md          # Full deployment guide
│   ├── RAILWAY_DEPLOYMENT.md           # Railway-specific guide
│   ├── FIREBASE_BACKEND_SETUP.md       # Backend Firebase setup
│   ├── FRONTEND_UPDATE_COMPLETE.md     # Frontend architecture
│   └── ERROR_FIXES.md                  # Common issues & solutions
│
└── README.md                           # This file
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| HTML5 | - | Structure and semantics |
| CSS3 | - | Styling, animations, theming |
| JavaScript | ES6+ | Logic, API calls, DOM manipulation |
| Chart.js | 4.4.0 | Data visualization |
| Firebase SDK | 10.7.1 | Authentication & Firestore |

### Backend (Optional - Spring Boot)
| Technology | Version | Purpose |
|-----------|---------|---------|
| Java | 17+ | Core language |
| Spring Boot | 3.1.5 | Web framework |
| Firebase Admin SDK | 9.2.0 | Firestore operations |
| Maven | 3.6+ | Build tool |
| Jakarta Validation | 3.0.2 | Input validation |

### Database
| Technology | Type | Features |
|-----------|------|----------|
| Firebase Firestore | NoSQL | Real-time sync, offline support, scalable |

---

## 📋 Prerequisites

### For Frontend Only (Firebase Direct)
- ✅ Modern web browser (Chrome, Firefox, Edge, Safari)
- ✅ Firebase project (free tier available)
- ✅ Internet connection

### For Backend (Spring Boot + Firebase)
- ✅ Java 17 or higher ([Download](https://adoptium.net/))
- ✅ Maven 3.6+ ([Download](https://maven.apache.org/download.cgi))
- ✅ Firebase project with service account
- ✅ Modern web browser

**Check installations:**
```powershell
java -version
mvn -version
```

---

## 🚀 Quick Start

### Option 1: Firebase Only (Recommended for Beginners)

#### 1. Setup Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database** (Start in test mode)

#### 2. Configure Frontend
Update `Frontend/firebase-config.js`:
```javascript
window.firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

#### 3. Run Locally
```powershell
cd Frontend
npx serve .
# Or use VS Code Live Server
```

#### 4. Deploy to Firebase Hosting
```powershell
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

**Done!** ✅ Your app is live on Firebase!

---

### Option 2: Spring Boot Backend + Firebase

#### 1. Setup Firebase (Same as Option 1)

#### 2. Get Service Account Key
1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save as `Backend/serviceAccountKey.json`

#### 3. Configure Backend
Ensure `Backend/src/main/resources/application.properties`:
```properties
server.port=8080
logging.level.com.expensetracker=INFO
```

#### 4. Build & Run Backend
```powershell
cd Backend
mvn clean package
mvn spring-boot:run
```

Backend will run on **http://localhost:8080**

#### 5. Switch Frontend to Backend Mode
In `Frontend/api-service.js`:
```javascript
const API_CONFIG = {
    USE_FIREBASE: false,  // ← Change to false
    BACKEND_URL: 'http://localhost:8080/api/expenses'
};
```

#### 6. Run Frontend
```powershell
cd Frontend
npx serve .
```

#### 7. Deploy Backend to Railway
See `RAILWAY_DEPLOYMENT.md` for detailed instructions.

---

## 🔌 API Reference (Spring Boot Backend)

### Base URL
```
Production: https://your-app.railway.app/api/expenses
Local: http://localhost:8080/api/expenses
```

### Endpoints

#### 1️⃣ Get All Expenses
```http
GET /api/expenses
Headers: X-User-Id: {userId}
```
**Response:**
```json
[
  {
    "id": "abc123",
    "title": "Groceries",
    "amount": 1200.50,
    "category": "Food",
    "date": "2025-11-11",
    "userId": "user123"
  }
]
```

#### 2️⃣ Create Expense
```http
POST /api/expenses
Headers: 
  Content-Type: application/json
  X-User-Id: {userId}
Body:
{
  "title": "Lunch",
  "amount": 350.00,
  "category": "Food",
  "date": "2025-11-11"
}
```
**Response:** `201 Created` with created expense

#### 3️⃣ Update Expense
```http
PUT /api/expenses/{id}
Headers:
  Content-Type: application/json
  X-User-Id: {userId}
Body: (same as create)
```
**Response:** `200 OK` with updated expense

#### 4️⃣ Delete Expense
```http
DELETE /api/expenses/{id}
Headers: X-User-Id: {userId}
```
**Response:** `204 No Content`

---

## 🎨 Available Categories

| Icon | Category | Use Cases |
|------|----------|-----------|
| 🍕 | Food | Meals, groceries, restaurants |
| 🚗 | Transport | Fuel, taxi, bus, metro |
| 🎬 | Entertainment | Movies, games, Netflix |
| 💡 | Utilities | Electricity, water, internet |
| 🏥 | Healthcare | Medicine, doctor, insurance |
| 🛍️ | Shopping | Clothes, gadgets, accessories |
| 📚 | Education | Books, courses, tuition |
| 📌 | Other | Everything else |

---

## 🔒 Security Implementation

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| **Title** | Required, 1-100 chars | "Title is required" / "Title too long" |
| **Amount** | 0.01 - 999,999,999.99 | "Amount must be greater than 0" |
| **Category** | Alphanumeric + spaces/hyphens | "Invalid characters in category" |
| **Date** | Not in future | "Date cannot be in the future" |

### Security Layers

1. **Frontend Validation** (`api-service.js`)
   - Instant user feedback
   - Prevents invalid submissions
   - Reduces server load

2. **Backend Validation** (Spring Boot - Optional)
   - Jakarta Bean Validation
   - Custom business rules
   - Server-side enforcement

3. **Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /expenses/{expense} {
         allow read, write: if request.auth != null && 
                             resource.data.userId == request.auth.uid;
       }
     }
   }
   ```

4. **Authentication**
   - Firebase Auth tokens
   - Session management
   - Secure logout

---

## 🧪 Testing

### Frontend Testing
Open browser console and run:
```javascript
// Test validation
ExpenseValidator.validateExpense({
    title: 'Test',
    amount: 100,
    category: 'Food',
    date: '2025-11-11'
});

// Test API (if using Firebase)
await ExpenseAPI.getAll(userId);
```

### Backend Testing (Spring Boot)
```powershell
cd Backend
mvn test
mvn clean test jacoco:report
```

Coverage report: `Backend/target/site/jacoco/index.html`

---

## 💾 Data Storage

### Firestore Structure
```
firestore/
└── expenses/ (collection)
    ├── {documentId}
    │   ├── userId: "user123"
    │   ├── title: "Groceries"
    │   ├── amount: 1200
    │   ├── category: "Food"
    │   ├── date: Timestamp
    │   └── createdAt: Timestamp
    └── ...
```

### Features
- ✅ **Real-time sync** - Changes appear instantly
- ✅ **Offline support** - Works without internet
- ✅ **Scalable** - Handles millions of records
- ✅ **Secure** - Built-in security rules
- ✅ **Multi-device** - Same data everywhere

---

## ⚙️ Configuration

### Frontend Config (`api-service.js`)
```javascript
const API_CONFIG = {
    USE_FIREBASE: true,  // Switch to false for Spring Boot
    BACKEND_URL: 'http://localhost:8080/api/expenses',
    PRODUCTION_URL: 'https://your-app.railway.app/api/expenses'
};
```

### Backend Config (`application.properties`)
```properties
server.port=8080
logging.level.com.expensetracker=INFO
```

### Environment Variables (Railway)
```
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
PORT=8080
```

---

## 🐛 Troubleshooting

### Common Frontend Issues

| Problem | Solution |
|---------|----------|
| Login not working | Check Firebase config in `firebase-config.js` |
| Charts not showing | Clear cache (Ctrl+F5), check Chart.js CDN |
| Expenses not loading | Check browser console, verify Firebase rules |
| "Modules not loaded" error | Wait a few seconds, refresh page |

### Common Backend Issues

| Problem | Solution |
|---------|----------|
| Backend won't start | Check Java 17+, verify `serviceAccountKey.json` |
| Port 8080 in use | Change port in `application.properties` |
| Firebase errors | Verify service account key is valid |
| Build fails | Run `mvn clean install -U` |

### Debug Steps

1. **Check Console Logs**
   ```
   ✅ Firebase initialized successfully
   ✅ Firestore modules set
   ✅ API Service initialized
   ```

2. **Verify Firebase Connection**
   ```javascript
   console.log(window.db);  // Should show Firestore instance
   console.log(window.auth);  // Should show Auth instance
   ```

3. **Test Backend (if using)**
   ```powershell
   curl http://localhost:8080/api/expenses
   ```

---

## 📦 Deployment

### Frontend → Firebase Hosting
```powershell
firebase login
firebase init hosting
# Select Frontend folder
firebase deploy
```
**Live at:** `https://your-project.web.app`

### Backend → Railway
```powershell
# Push to GitHub
git add .
git commit -m "Deploy to Railway"
git push origin main

# In Railway:
# 1. Connect GitHub repo
# 2. Add GOOGLE_APPLICATION_CREDENTIALS_JSON env var
# 3. Deploy
```
**Live at:** `https://your-app.railway.app`

See `COMPLETE_DEPLOYMENT.md` for detailed guides!

---

## 🚀 Future Enhancements

- [ ] Budget limits & alerts
- [ ] Export to CSV/PDF
- [ ] Recurring expenses
- [ ] Multi-currency support
- [ ] Receipt upload with OCR
- [ ] Mobile app (React Native)
- [ ] Expense categories customization
- [ ] Email/SMS notifications
- [ ] Shared expenses with family/friends
- [ ] Financial insights & AI suggestions

---

## 📚 Documentation

- 📖 [Complete Deployment Guide](COMPLETE_DEPLOYMENT.md)
- 🚂 [Railway Deployment](RAILWAY_DEPLOYMENT.md)
- 🔥 [Firebase Backend Setup](Backend/FIREBASE_BACKEND_SETUP.md)
- 🏗️ [Frontend Architecture](FRONTEND_UPDATE_COMPLETE.md)
- 🔧 [Error Fixes & Solutions](ERROR_FIXES.md)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing`)
3. ✨ Make your changes
4. 🧪 Test thoroughly
5. 📝 Update documentation
6. 🚀 Submit a pull request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Authors & Team

Built with ❤️ by a passionate development team demonstrating:
- Clean code architecture
- Modern web development practices
- Cloud-native application design
- Security-first approach
- User-centric design

Check out our [Team Page](Frontend/team.html) to meet the developers!

---

## 🙏 Acknowledgments

- **Firebase** - Google's app development platform
- **Spring Boot** - Java's powerful framework
- **Chart.js** - Beautiful JavaScript charts
- **GitHub Copilot** - AI pair programmer
- **Railway** - Modern deployment platform
- **Open Source Community** - For amazing tools and libraries

---

## 📞 Support & Contact

### Having Issues?

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review [Error Fixes](ERROR_FIXES.md) documentation
3. Check browser console for errors
4. Verify Firebase configuration
5. Test with fresh cache (Ctrl+F5)

### Need Help?

- 📧 Open an issue on GitHub
- 💬 Check existing documentation
- 🔍 Search for similar issues
- 📖 Read the deployment guides

---

## 🎯 Project Status

**Current Version:** 3.0.0

**Status:** ✅ Production Ready

**Last Updated:** November 2025

### Recent Updates
- ✅ Migrated from PostgreSQL to Firebase Firestore
- ✅ Added Firebase Authentication
- ✅ Created unified API service layer
- ✅ Fixed timezone issues in date validation
- ✅ Improved error handling and logging
- ✅ Updated all documentation
- ✅ Added dual backend support

---

**Happy Expense Tracking! 💰✨**

*Built with ☕ Java, 🔥 Firebase, and 💻 JavaScript*

---

### 📊 Quick Stats

- **Lines of Code:** ~2,500+
- **Files:** 20+
- **Features:** 15+ major features
- **Deployment Platforms:** Firebase, Railway
- **Security Layers:** 4 (Auth, Frontend, Backend, Database)
- **Supported Devices:** Mobile, Tablet, Desktop

### 🏆 Achievements

- ✅ Real-time data synchronization
- ✅ Multi-platform deployment
- ✅ Comprehensive validation
- ✅ Modern responsive design
- ✅ Production-ready code
- ✅ Complete documentation

---

*"Track every penny, visualize your spending, achieve your financial goals!"* 🎯💰
