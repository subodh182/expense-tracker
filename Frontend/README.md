# Expense Tracker - Frontend

A modern, responsive expense tracking application built with HTML, CSS, JavaScript, and Firebase.

## 🚀 Features

- **User Authentication** - Secure login/signup with Firebase Auth
- **Real-time Data** - Live expense updates using Firestore
- **Beautiful UI** - Modern, responsive design with dark/light themes
- **Visual Analytics** - Charts and graphs for expense insights
- **Category Management** - Organize expenses by categories
- **Multi-user Support** - Each user has isolated data
- **Team Page** - Meet the developers behind the project

## 📋 Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account
- Web server or hosting service

## 🛠️ Setup Instructions

### 1. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password method)
3. Enable **Firestore Database**
4. Copy your Firebase configuration

### 2. Configure the App

1. Rename `firebase-config.example.js` to `firebase-config.js`
2. Add your Firebase credentials:

```javascript
window.firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Firestore Security Rules

Go to Firebase Console → Firestore Database → Rules and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null 
        && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### 4. Deploy

#### Option A: GitHub Pages
```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main

# Enable GitHub Pages in repository settings
```

#### Option B: Netlify
1. Drag and drop the `Frontend` folder to [Netlify Drop](https://app.netlify.com/drop)
2. Done! Your app is live

#### Option C: Vercel
```bash
npm install -g vercel
cd Frontend
vercel
```

#### Option D: Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 📁 Project Structure

```
Frontend/
├── index.html              # Main application page
├── team.html               # Team members page
├── styles.css              # All styling
├── app.js                  # Main application logic
├── firebase-auth.js        # Firebase authentication & database
├── firebase-config.js      # Firebase credentials (gitignored)
└── README.md              # This file
```

## 🔒 Security Notes

**IMPORTANT:** Never commit `firebase-config.js` to public repositories!

- ✅ Added to `.gitignore`
- ✅ Use example file for reference
- ✅ Each developer needs their own config

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## 👥 Team

- **Raj Solanki** - Frontend Developer
- **Subodh Singh** - Backend Developer
- **Anuj Prajapati** - Backend Developer
- **Aarif** - Database Engineer
- **Suraj** - Testing Engineer

## 📝 Environment Variables

No environment variables needed! Firebase config is loaded directly in the browser.

## 🐛 Troubleshooting

### Authentication Issues
- Check Firebase Console → Authentication → Sign-in method
- Ensure Email/Password is enabled

### Permission Errors
- Verify Firestore security rules are published
- Check user is logged in

### Data Not Loading
- Open browser console (F12)
- Check for Firebase errors
- Verify Firebase config is correct

## 📄 License

All rights reserved © 2025 Expense Tracker Team

## 🤝 Contributing

This is a student project. For questions, contact the team members.

## 📞 Support

For issues, please check:
1. Browser console for errors
2. Firebase Console for service status
3. `FIX_PERMISSIONS.md` for Firestore issues

---

Built with ❤️ by the Expense Tracker Team
