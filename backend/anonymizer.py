import pandas as pd
import re

def anonymize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Strips common PII from the dataframe before processing.
    For this prototype, we use regex to drop columns that look like PII (names, emails, IDs).
    """
    clean_df = df.copy()
    
    # 1. Drop obvious PII columns by name
    pii_keywords = ['name', 'email', 'phone', 'ssn', 'id', 'address', 'zip', 'ip']
    cols_to_drop = [col for col in clean_df.columns if any(keyword in col.lower() for keyword in pii_keywords)]
    
    clean_df.drop(columns=cols_to_drop, inplace=True, errors='ignore')
    
    # 2. Heuristic: Drop columns with entirely unique string values (likely IDs or Names)
    # Only if there are more than 10 rows (to avoid dropping useful categorical variables in tiny datasets)
    if len(clean_df) > 10:
        for col in clean_df.columns:
            if clean_df[col].dtype == 'object':
                if clean_df[col].nunique() == len(clean_df):
                    clean_df.drop(columns=[col], inplace=True)
                    
    return clean_df
