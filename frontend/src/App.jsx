import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { UploadCloud, FileJson, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ReportView from './components/ReportView';

// In a real deployment, this comes from an env var.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);

  // Configuration for target column and protected attribute
  // For the prototype, these are hardcoded or could be simple inputs
  const [targetCol, setTargetCol] = useState('income'); // e.g. for Adult dataset
  const [protectedCol, setProtectedCol] = useState('sex');

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setResultData(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/analyze?target_column=${targetCol}&protected_attribute=${protectedCol}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResultData(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "An error occurred while analyzing the dataset.");
    } finally {
      setLoading(false);
    }
  }, [targetCol, protectedCol]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    maxFiles: 1
  });

  return (
    <div className="app-container">
      <header className="header">
        <h1>Unbiased AI</h1>
        <p>Ensure fairness with Gemini-powered Bias Detection</p>
      </header>

      {!resultData && !loading && (
        <motion.div 
          className="glass-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem'}}>Target Column</label>
              <input 
                type="text" 
                value={targetCol} 
                onChange={e => setTargetCol(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem'}}>Protected Attribute</label>
              <input 
                type="text" 
                value={protectedCol} 
                onChange={e => setProtectedCol(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              />
            </div>
          </div>

          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            <UploadCloud className="upload-icon" />
            <h3 style={{ marginBottom: '0.5rem' }}>Drop your dataset here</h3>
            <p style={{ color: 'var(--text-muted)' }}>Supports CSV or JSON (up to 10MB recommended)</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', color: 'var(--primary)' }}>
              <FileText size={24} />
              <FileJson size={24} />
            </div>
          </div>
        </motion.div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <div className="spinner"></div>
          <h3 style={{ color: 'var(--primary)' }}>Analyzing Dataset</h3>
          <p style={{ color: 'var(--text-muted)' }}>Calculating metrics and generating your Bias Story...</p>
        </div>
      )}

      {error && (
        <div className="glass-panel" style={{ marginTop: '2rem', borderLeft: '4px solid var(--secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--secondary)' }}>
            <AlertCircle size={24} />
            <h3>Analysis Error</h3>
          </div>
          <p style={{ marginTop: '1rem' }}>{error}</p>
          <button 
            onClick={() => setError(null)}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      )}

      {resultData && !loading && (
        <div style={{ animation: 'fadeInUp 0.8s ease-out' }}>
          <button 
            onClick={() => setResultData(null)}
            style={{ marginBottom: '1rem', padding: '0.5rem 1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            &larr; Analyze Another Dataset
          </button>
          <ReportView data={resultData} />
        </div>
      )}
    </div>
  );
}

export default App;
