import pandas as pd
from fairlearn.metrics import demographic_parity_difference, demographic_parity_ratio

def calculate_fairness_metrics(df: pd.DataFrame, target_column: str, protected_attribute: str) -> dict:
    """
    Calculates statistical fairness metrics using Fairlearn.
    We assume a binary classification outcome for the prototype.
    """
    if target_column not in df.columns or protected_attribute not in df.columns:
        return {"error": "Target or Protected Attribute not found in dataset."}
        
    y_raw = df[target_column]
    
    # Convert target to numeric if it's not
    if not pd.api.types.is_numeric_dtype(y_raw):
        y_true = pd.Series(pd.factorize(y_raw)[0], index=df.index)
    else:
        y_true = y_raw
        
    # For a real application, y_pred would be required. Since we are evaluating the dataset itself (historical bias),
    # we use the historical outcomes (y_true) as a proxy to measure representation bias in the existing data.
    y_pred = y_true 
    sensitive_features = df[protected_attribute]
    
    # Calculate group-level metrics using the numeric y_true
    groups = y_true.groupby(sensitive_features).mean().to_dict()
    
    try:
        dp_diff = demographic_parity_difference(y_true=y_true, y_pred=y_pred, sensitive_features=sensitive_features)
        dp_ratio = demographic_parity_ratio(y_true=y_true, y_pred=y_pred, sensitive_features=sensitive_features)
    except Exception as e:
        dp_diff = None
        dp_ratio = None
        print(f"Error calculating Fairlearn metrics: {e}")

    return {
        "demographic_parity_difference": dp_diff,
        "demographic_parity_ratio": dp_ratio,
        "group_success_rates": groups,
        "dataset_size": len(df)
    }
