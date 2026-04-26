# Unbiased AI Decision

An automated auditing platform designed to detect, explain, and mitigate algorithmic bias in datasets before they are used to train machine learning models. Built for the Google Solution Challenge.

## 🚀 Overview
Traditional fairness tools output dense mathematical matrices that only specialized data scientists can interpret. **Unbiased AI Decision** democratizes AI ethics by leveraging the **Google Gemini API** to translate statistical fairness metrics into human-readable **"Bias Stories"** and actionable **"Remediation Blueprints"**. 

It allows non-technical stakeholders, HR teams, and product managers to drag-and-drop datasets and instantly verify if protected groups are being disadvantaged.

## 🛠️ Technologies Used
- **Frontend:** React, Vite, Framer Motion
- **Backend:** Python, FastAPI, Pandas
- **Machine Learning / Statistics:** Microsoft Fairlearn
- **Generative AI:** Google GenAI SDK (Gemini 2.5 Flash)

## ⚙️ Architecture Workflow
1. User uploads a raw dataset (CSV/JSON).
2. The FastAPI backend automatically strips out PII (Personally Identifiable Information).
3. The Fairlearn engine calculates core fairness metrics (Demographic Parity Difference and Ratio).
4. The statistical metadata is passed to the Gemini 2.5 Flash model.
5. Gemini generates an executive summary (Bias Story) and mitigation steps (Remediation Blueprints).
6. The React frontend presents a beautifully formatted, easy-to-read dashboard.

---

## 💻 How to Run Locally

### Prerequisites
- Node.js installed
- Python 3.9+ installed
- A Google Gemini API Key

### 1. Backend Setup
Navigate to the backend directory:
```bash
cd backend
```
Create a `.env` file and add your Gemini API Key:
```env
GEMINI_API_KEY=your_api_key_here
```
Install dependencies and run the FastAPI server:
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```
*The backend will now be running on `http://localhost:8000`*

### 2. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```
Install dependencies and start the Vite development server:
```bash
npm install
npm run dev
```
*The frontend will now be running on `http://localhost:5173`*

---

## 🌐 Live Prototype
The application is designed to be easily containerized and deployed.
- **Frontend Prototype:** [Insert Vercel Link Here]
- **Backend Prototype:** [Insert Render Link Here]
