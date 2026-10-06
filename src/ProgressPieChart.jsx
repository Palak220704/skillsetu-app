import React from 'react';

export default function ProgressPieChart({ percentage = 68 }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  // Clamp percentage between 0 and 100
  const validPercentage = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (validPercentage / 100) * circumference;

  return (
    <div style={styles.chartContainer}>
      <svg width="140" height="140" viewBox="0 0 120 120">
        {/* Background Track Circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="transparent"
          stroke="#132820"
          strokeWidth="12"
        />
        {/* Dynamic Progress Stroke Circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="transparent"
          stroke="#22c55e"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
        {/* Percentage Label */}
        <text
          x="60"
          y="66"
          fontSize="20"
          fontWeight="bold"
          fill="#ff9d00"
          textAnchor="middle"
        >
          {validPercentage}%
        </text>
      </svg>
      <span style={styles.label}>Syllabus Mastery Progress</span>
    </div>
  );
}

const styles = {
  chartContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px'
  },
  label: { marginTop: '8px', fontSize: '13px', color: '#cbd5e1', fontWeight: 'bold' }
};