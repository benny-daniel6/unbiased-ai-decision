import os
import asyncio
from google import genai
from google.genai import types
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

# Rate limiting semaphores (simplified for prototype)
# Flash-Lite limit: 15 RPM. Pro limit: 5 RPM.
# We will use simple asyncio semaphores to prevent bursting, though a real implementation 
# would need a time-based token bucket or similar queue.
FLASH_SEMAPHORE = asyncio.Semaphore(15)
PRO_SEMAPHORE = asyncio.Semaphore(5)

client = genai.Client() # Assumes GEMINI_API_KEY is in environment

async def analyze_bias_with_gemini(df: pd.DataFrame, metrics: dict, target_col: str, protected_col: str) -> dict:
    """
    Two-stage Gemini pipeline.
    Stage 1: Flash-Lite summarizes data shape/patterns (heavy lifting).
    Stage 2: Pro writes the executive "Bias Story" and "Remediation Blueprints".
    """
    
    # --- STAGE 1: Data Pattern Extraction (Flash-Lite) ---
    # We chunk the data by taking a statistical summary instead of sending raw rows.
    # This optimizes context window and TPM.
    data_summary = df.describe(include='all').to_string()
    
    flash_prompt = f"""
    Analyze the following dataset summary. Focus on the relationship between the target variable '{target_col}' 
    and the protected attribute '{protected_col}'.
    
    Dataset Metrics:
    {metrics}
    
    Data Summary:
    {data_summary}
    
    Identify any potential correlations, skewness, or historical biases in this data. 
    Keep your analysis concise and technical.
    """
    
    async with FLASH_SEMAPHORE:
        try:
            flash_response = await asyncio.to_thread(
                client.models.generate_content,
                model='gemini-2.5-flash',
                contents=flash_prompt
            )
            technical_analysis = flash_response.text
        except Exception as e:
            print("Error in initial scan (trying fallback):", e)
            try:
                flash_response = await asyncio.to_thread(
                    client.models.generate_content,
                    model='gemini-2.5-flash-lite',
                    contents=flash_prompt
                )
                technical_analysis = flash_response.text
            except Exception as e_fallback:
                technical_analysis = f"Flash analysis failed: {str(e_fallback)}"
            
    # --- STAGE 2: "Senior Consultant" Report (Pro) ---
    pro_prompt = f"""
    You are an expert AI Ethicist and Data Scientist (Senior Consultant).
    I have a dataset analyzed for bias regarding the protected attribute '{protected_col}' against the outcome '{target_col}'.
    
    Here is the technical summary from our initial scan:
    {technical_analysis}
    
    Here are the base fairness metrics (calculated via Fairlearn):
    {metrics}
    
    Your task is to generate:
    1. A "Bias Story": A human-readable, non-technical executive summary (max 3 paragraphs) explaining if bias exists, what it means for the '{protected_col}' groups, and the real-world impact.
    2. "Remediation Blueprints": Provide 2-3 specific, actionable steps (e.g., re-sampling, feature exclusion, threshold tuning) the development team should take to mitigate this bias.
    
    Format the output as a JSON object with keys "bias_story" and "remediation_blueprints" (a list of strings).
    """
    
    async with PRO_SEMAPHORE:
        try:
            pro_response = await asyncio.to_thread(
                client.models.generate_content,
                model='gemini-2.5-flash',
                contents=pro_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                )
            )
            final_report = pro_response.text
        except Exception as e:
            print("Error in report generation (trying fallback):", e)
            try:
                pro_response = await asyncio.to_thread(
                    client.models.generate_content,
                    model='gemini-2.5-flash-lite',
                    contents=pro_prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                    )
                )
                final_report = pro_response.text
            except Exception as e_fallback:
                print("Fallback also failed:", e_fallback)
                final_report = '{"bias_story": "Failed to generate story due to high API demand. Please try again later.", "remediation_blueprints": ["API Unavailable"]}'
             
    import json
    try:
        report_dict = json.loads(final_report)
    except json.JSONDecodeError:
        report_dict = {"bias_story": final_report, "remediation_blueprints": []}

    return report_dict
