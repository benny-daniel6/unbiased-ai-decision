import React from 'react';
import { ShieldAlert, CheckCircle, Activity, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReportView({ data }) {
  const { metrics, report } = data;
  const { bias_story, remediation_blueprints } = report;

  // Formatting metrics for display
  const dpDiff = metrics.demographic_parity_difference;
  const dpRatio = metrics.demographic_parity_ratio;

  return (
    <div className="report-grid">
      {/* Sidebar: Metrics */}
      <motion.div 
        className="glass-panel"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={24} color="var(--accent)" /> Base Metrics
        </h3>
        
        <div className="metric-card">
          <div className="metric-label">Demographic Parity Diff</div>
          <div className="metric-value">
            {dpDiff !== null && dpDiff !== undefined ? dpDiff.toFixed(3) : 'N/A'}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Ideal: 0.0 (Closer to 0 is fairer)
          </p>
        </div>

        <div className="metric-card">
          <div className="metric-label">Demographic Parity Ratio</div>
          <div className="metric-value">
            {dpRatio !== null && dpRatio !== undefined ? dpRatio.toFixed(3) : 'N/A'}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Ideal: 1.0 (Must be &gt; 0.8 by standard)
          </p>
        </div>

        <div className="metric-card" style={{ borderLeftColor: 'var(--secondary)' }}>
          <div className="metric-label">Dataset Size</div>
          <div className="metric-value">{metrics.dataset_size}</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Total rows analyzed
          </p>
        </div>
      </motion.div>

      {/* Main Content: Story and Blueprints */}
      <motion.div 
        className="glass-panel"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>The Bias Story</h2>
        <div className="story-content">
          {bias_story.split('\n').map((paragraph, idx) => (
            <p key={idx} style={{ marginBottom: '1rem' }}>{paragraph}</p>
          ))}
        </div>

        <h3 style={{ marginTop: '3rem', marginBottom: '1.5rem', color: 'var(--secondary)' }}>
          Remediation Blueprints
        </h3>
        <ul className="blueprint-list">
          {remediation_blueprints && remediation_blueprints.length > 0 ? (
            remediation_blueprints.map((bp, idx) => (
              <motion.li 
                key={idx} 
                className="blueprint-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + (idx * 0.1) }}
              >
                <div className="blueprint-icon">
                  <ShieldAlert size={24} />
                </div>
                <div>{bp}</div>
              </motion.li>
            ))
          ) : (
            <li className="blueprint-item">
              <CheckCircle size={24} color="var(--accent)" />
              <div>No critical issues found or unable to generate blueprints.</div>
            </li>
          )}
        </ul>
      </motion.div>
    </div>
  );
}
