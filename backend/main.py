from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from anonymizer import anonymize_dataframe
from bias_engine import calculate_fairness_metrics
from gemini_service import analyze_bias_with_gemini

app = FastAPI(title="Unbiased AI Decision API")

# Setup CORS for the Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the Firebase Hosting URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "healthy"}

@app.post("/analyze")
async def analyze_dataset(file: UploadFile = File(...), target_column: str = "target", protected_attribute: str = "group"):
    if not file.filename.endswith(('.csv', '.json')):
        raise HTTPException(status_code=400, detail="Only CSV and JSON files are supported.")
    
    try:
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_json(io.BytesIO(contents))
            
        # 1. Anonymize data (Remove PII)
        clean_df = anonymize_dataframe(df)
        
        # 2. Calculate Base Fairness Metrics
        # This function will handle the fairlearn logic
        metrics = calculate_fairness_metrics(clean_df, target_column, protected_attribute)
        
        # 3. Get AI Analysis (Gemini Flash-Lite + Pro)
        ai_report = await analyze_bias_with_gemini(clean_df, metrics, target_column, protected_attribute)
        
        return {
            "status": "success",
            "metrics": metrics,
            "report": ai_report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
