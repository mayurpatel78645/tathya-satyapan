# 🛡️ Tathya-Satyapan

````md
# 🛡️ Tathya-Satyapan

**Tathya-Satyapan** *(तथ्य-सत्यापन = Fact Verification)* is a Chrome Extension that detects **misleading, exaggerated, and suspicious claims on Instagram in real time** using a hybrid AI-powered verification engine.

It scans visible Instagram posts, analyzes captions, flags risky claims, and provides users with an explanation so they can think critically before trusting online content.

---

## 🚀 Features

### 🔍 Real-Time Claim Detection
Automatically scans Instagram posts as you scroll and analyzes captions in real time.

### ⚡ Hybrid Detection Engine
Uses a **3-layer detection pipeline**:

1. **Local Heuristic Rules** – Instant regex-based scam detection  
2. **AI Claim Analysis** – Gemini API checks misleading or false claims  
3. **Structured Verification Report** – Shows confidence score, category, and reasoning

### 🎯 Smart Performance Optimization
- Uses `MutationObserver` to detect newly loaded posts
- Uses `IntersectionObserver` to analyze only visible posts
- Prevents duplicate scans using caching
- API request queue prevents rate limits during rapid scrolling

### 🚨 Suspicious Claim Badges
Displays warning badges directly on suspicious Instagram posts.

Example:

⚠️ Suspicious [82%]

### 📄 Detailed Verification Modal
Click the badge to see:

- Flagged category
- Suspicious phrase
- AI reasoning
- Quick Google fact-check search

### 🔐 Private API Key Storage
Stores your Gemini API key securely in Chrome local storage.

---

## 🏗️ Tech Stack

- JavaScript
- Chrome Extension Manifest V3
- Google Gemini API
- HTML
- CSS
- MutationObserver
- IntersectionObserver

---

## 📂 Project Structure

```bash
Tathya-Satyapan/
│── manifest.json
│── background.js
│── content.js
│── popup.html
│── popup.js
│── styles.css
│── icons/
````

---

## ⚙️ How It Works

### 1️⃣ Instagram Post Appears

When a new post loads, the extension detects it automatically.

### 2️⃣ Caption Extracted

The visible text caption is captured.

### 3️⃣ Quick Scam Check

Regex rules instantly check for phrases like:

* Guaranteed income
* Miracle cure
* Doctors hate this trick
* Crypto gem
* Passive income secret

### 4️⃣ AI Verification

If suspicious or long enough, the text is sent to Gemini AI for deeper analysis.

### 5️⃣ Badge Injection

If risky, a warning badge appears on the post.

### 6️⃣ User Clicks Badge

Detailed explanation modal opens.

---

## 🧠 Example Detection Output

```json
{
  "is_suspicious": true,
  "confidence": 0.84,
  "category": "Financial Scam",
  "reasoning": "Promises unrealistic returns with guaranteed profits.",
  "flagged_phrase": "Earn money fast"
}
```

---

## 📦 Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/tathya-satyapan.git
```

### Step 2: Open Chrome Extensions

Go to:

```text
chrome://extensions/
```

Enable **Developer Mode**

### Step 3: Load Extension

Click **Load unpacked** and select the project folder.

---

## 🔑 Setup Gemini API Key

1. Open the extension popup
2. Enter your Google Gemini API Key
3. Click **Save Configuration**

---

## 🖥️ Usage

1. Open Instagram
2. Scroll normally
3. Suspicious posts will be flagged automatically
4. Click the badge for explanation

---

## 📸 Screenshots

Add screenshots here later:

* Popup UI
* Warning Badge
* Verification Modal
* Detection in Action

---

## 💡 Why This Project Matters

Social media is full of:

* Fake health advice
* Scam investment schemes
* False authority claims
* Misleading viral content

**Tathya-Satyapan helps users verify before they trust.**

---

## 🔥 Key Engineering Highlights

### ✅ Efficient DOM Monitoring

Uses MutationObserver + debounce for scalable infinite scroll handling.

### ✅ Viewport-Based Processing

Only analyzes posts actually visible to the user.

### ✅ Failover AI Models

Automatically switches Gemini models if one is busy or rate-limited.

### ✅ Non-Intrusive UI

Clean native-style badge + modal experience.

---

## 📈 Future Improvements

* Multi-platform support (YouTube / Facebook / X)
* Community reporting system
* Source credibility scoring
* Auto fact-check database integration
* Language detection
* Hindi / Marathi support
* Dashboard analytics

---

## 👨‍💻 Author

**Mayur Patel**
Aspiring Software Engineer | Automation Developer | Problem Solver

* GitHub: https://github.com/mayurpatel78645
* LinkedIn: https://www.linkedin.com/in/mayur-patel-762087216

---

## 📜 License

MIT License

---

## ⭐ Support

If you like this project, give it a **star** on GitHub and support the mission of fighting misinformation online.

```
```
