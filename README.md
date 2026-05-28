# Cal AI

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![React Version](https://img.shields.io/badge/react-v19.0-61dafb?logo=react)](#)
[![Vite Version](https://img.shields.io/badge/vite-v8.0-646cff?logo=vite)](#)
[![Capacitor Version](https://img.shields.io/badge/capacitor-v8.3-blue?logo=capacitor)](#)
[![License](https://img.shields.io/badge/license-MIT-green)](#)

> Snap. Track. Compete. A high-performance, mobile-first AI calorie tracker designed to make healthy habits compound.

---

Cal AI was built to solve a single, frustrating problem: manual calorie tracking is tedious, rigid, and ultimately leads to burnout. By bringing together advanced visual AI recognition, a sleek responsive frontend, and native mobile packaging, Cal AI lets you photograph your meal and immediately receive a detailed macronutrient breakdown. 

Designed to look and feel like an elite, high-revenue App Store product, Cal AI features smooth custom physics-based button scaling, dynamic local session isolation, and real-time habits tracking. Whether accessed via a standard web browser or compiled into a lightweight native Android APK, Cal AI delivers a seamless, polished wellness journey.

---

## ✨ Core Features

* 📸 **AI-Powered Photo Scanner**: Snap or upload a meal picture to receive an instant breakdown of calories, protein, carbs, and fats in under two seconds. Powered by the Google Gemini 2.5 Flash API.
* 🔵 **Macro Progress Rings**: Premium, custom-designed SVG circular progress indicators that dynamically fill as you log meals, keeping your macro budget visually aligned.
* 📊 **Weekly Calorie Chart**: A gorgeous, pixel-perfect vertical bar chart showing a rolling 7-day consumption timeline, complete with a dotted goal threshold indicator line.
* 🕒 **Live Welcome Clock**: A ticking digital welcome card on the dashboard showing the exact weekday, date, and real-time seconds.
* ⚡ **Dynamic Streak System**: An active habits tracker starting from a default 12-day streak (for visual showcase) that automatically increments or resets on consecutive logging days.
* 💧 **Interactive Hydration Card**: A fluid water intake tracker where a single-tap increments daily water logs in real-time, persisting dynamically in local storage.
* ⚖️ **Weight Tracker Timeline**: Record daily weigh-ins and populate a scrollable history timeline pill list to track body composition trends.
* 📜 **Scroll-Reset Router**: A global scroll-control wrapper ensuring that page transitions (like opening the AI Coach chat) cleanly mount from the absolute top of the screen.
* 🔐 **Hybrid Authentication**: Fully operational web-based Google Authentication (using `signInWithRedirect` fallback on mobile browsers to bypass sessionStorage limitations) alongside native Capacitor Google Sign-in inside the compiled app!

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend Framework** | React 19 + Vite 8 | Rapid dev cycles, reactive UI components, and modern hooks |
| **Mobile Bridge** | Capacitor 8 | Native native wrapper for compilation on Android & iOS devices |
| **Routing** | React Router 7 | Client-side routing with custom scroll-to-top hooks |
| **Auth Engine** | Firebase Auth | Dynamic session persistence and Google OAuth |
| **AI Integration** | Google Gemini 2.5 Flash | Multimodal meal analysis and conversational assistant |
| **Database Lookup** | USDA FoodData Central | Rich nutritional API fallback |
| **Styling** | Custom Vanilla CSS | Premium glassmorphism, spring button transitions, and fluid grid layouts |

---

## 📁 Project Structure

```bash
├── android/               # Native Android Studio project folder (Gradle builds)
├── ios/                   # Native Xcode iOS workspace files (SwiftPM)
├── public/                # Static public assets
├── src/
│   ├── context/           # Global React AuthContext (handles both Native & Web logins)
│   ├── lib/               # Firebase config and clients
│   ├── pages/
│   │   ├── Login.jsx      # Premium onboarding landing and Google Auth CTA
│   │   ├── Dashboard.jsx  # Main user dashboard, SVG macro rings, weekly chart, and water log
│   │   ├── Analysis.jsx   # Gemini Food photo scanning and diary adder
│   │   └── Interactive.jsx# Multi-turn AI coaching chatbot
│   ├── App.jsx            # Application Router, layouts, and Scroll-Reset hooks
│   ├── main.jsx           # Entry mount
│   └── App.css            # Custom UI transitions, hover physics, and styling layout
├── capacitor.config.json  # Capacitor configurations (App ID, Web directory, Plugins)
└── package.json           # Application dependencies and build scripts
```

---

## ⚡ Prerequisites & Installation

Before running the application, make sure you have [Node.js](https://nodejs.org/) (v22 or higher) and [Git](https://git-scm.com/) installed.

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/aniketsahu07/Cal-Ai.git
cd Cal-Ai
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory based on the `.env.example` file:

```bash
cp .env.example .env
```

Open `.env` and fill in your developer API keys and Firebase settings:

```env
# Firebase Web API Configurations
VITE_FIREBASE_API_KEY=AIzaSyAY9eh5...
VITE_FIREBASE_AUTH_DOMAIN=studio-5469230958-a8a21.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=studio-5469230958-a8a21
VITE_FIREBASE_STORAGE_BUCKET=studio-5469230958-a8a21.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=593013670944
VITE_FIREBASE_APP_ID=1:593013670944:web:63601d25...
VITE_FIREBASE_MEASUREMENT_ID=

# Google Generative AI (Gemini Core)
VITE_GEMINI_MODEL=gemini-2.5-flash
VITE_GEMINI_API_KEY=AIzaSyDYdjWq_...

# Nutritional Lookup API (USDA)
VITE_USDA_API_KEY=ofoAcmgnlmk6...
```

### 3. Launch Development Server

Run the development server on localhost:

```bash
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your web browser to test the responsive web layout.

---

## 📲 How to Compile the Native Android APK

Cal AI compiles into a fully functional, lightweight native Android application in four steps:

### 1. Generate Production Web Assets
Compile the React frontend into highly optimized assets inside the `dist/` directory:
```bash
npm run build
```

### 2. Synchronize Assets with Capacitor
Copy the web bundles and register Capacitor plugins (`@capacitor-firebase/authentication`):
```bash
npx cap sync android
```

### 3. Setup Android Studio Credentials
To enable native Google Sign-in on your Android device:
1. Generate your computer's debug certificate SHA-1 fingerprint. Open **PowerShell** and run:
   ```powershell
   keytool -list -v -alias androiddebugkey -keystore "$env:USERPROFILE\.android\debug.keystore" -storepass android
   ```
2. Go to **Firebase Console > Project Settings** under your registered Android App (`com.calai.app`).
3. Add the **SHA-1 fingerprint** to your app settings.
4. Download the updated **`google-services.json`** file and place it exactly inside the Android app module folder:
   📁 `android/app/google-services.json`

### 4. Build debug APK
1. Open the `android/` directory in **Android Studio**:
   ```bash
   npx cap open android
   ```
2. In Android Studio, select **File > Sync Project with Gradle Files** (or click the blue elephant icon) to register the updated `google-services.json`.
3. Go to **Build > Clean Project**.
4. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. Once complete, copy the compiled `app-debug.apk` to your phone and install it!

---

## 📱 Screenshots & Demo

| Onboarding & Login | Personal Dashboard | AI Food Recognition | Interactive AI Coach |
| :---: | :---: | :---: | :---: |
| ![Onboarding](https://raw.githubusercontent.com/aniketsahu07/Cal-Ai/main/public/screenshots/onboarding.png) | ![Dashboard](https://raw.githubusercontent.com/aniketsahu07/Cal-Ai/main/public/screenshots/dashboard.png) | ![Analysis](https://raw.githubusercontent.com/aniketsahu07/Cal-Ai/main/public/screenshots/analysis.png) | ![Coach](https://raw.githubusercontent.com/aniketsahu07/Cal-Ai/main/public/screenshots/coach.png) |

---

## 🤝 Contributing

Contributions are always welcome to improve features, polish UI elements, or optimize the backend proxy engines. Feel free to open a Pull Request or reference the [Contributing Guidelines](CONTRIBUTING.md).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
