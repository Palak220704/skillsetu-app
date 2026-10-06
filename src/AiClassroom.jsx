import React, { useState, useEffect } from 'react';
import { generateNcertLecture } from './geminiClient';

export default function AiClassroom({ defaultTopic = 'Rotational Dynamics', onVideoWatched }) {
  const [topic, setTopic] = useState(defaultTopic);
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [awardedVideoXp, setAwardedVideoXp] = useState(false);

  const handleGenerateLecture = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setIsPlaying(false);
    setAwardedVideoXp(false);
    window.speechSynthesis.cancel();

    const data = await generateNcertLecture(topic, 'English', '12');
    setLecture(data);
    setCurrentSlideIndex(0);
    setLoading(false);
  };

  const speakSlideNarration = (text) => {
    window.speechSynthesis.cancel();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => {
      if (lecture && currentSlideIndex < lecture.slides.length - 1) {
        setCurrentSlideIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false);
        // Award 50 XP upon watching full video
        if (!awardedVideoXp && onVideoWatched) {
          onVideoWatched(50);
          setAwardedVideoXp(true);
        }
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isPlaying && lecture?.slides[currentSlideIndex]) {
      speakSlideNarration(lecture.slides[currentSlideIndex].narration);
    }
  }, [currentSlideIndex, isPlaying]);

  const handlePlayVideo = () => {
    setIsPlaying(true);
    if (!awardedVideoXp && onVideoWatched) {
      onVideoWatched(50);
      setAwardedVideoXp(true);
    }
    if (lecture?.slides[currentSlideIndex]) {
      speakSlideNarration(lecture.slides[currentSlideIndex].narration);
    }
  };

  const handlePauseVideo = () => {
    setIsPlaying(false);
    window.speechSynthesis.cancel();
  };

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ color: '#ff9d00', margin: 0 }}>🎥 AI Interactive Blackboard Engine</h3>
        {awardedVideoXp && (
          <span style={{ backgroundColor: '#22c55e22', color: '#22c55e', border: '1px solid #22c55e', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
            🎉 +50 XP Added to Scoreboard!
          </span>
        )}
      </div>
      
      <form onSubmit={handleGenerateLecture} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Prompt any topic (e.g., Moment of Inertia, Kepler Laws)..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.generateBtn} disabled={loading}>
          {loading ? '✨ Rendering Lesson...' : '🎥 Generate AI Video'}
        </button>
      </form>

      {lecture && (
        <div style={styles.videoPlayerBox}>
          <div style={styles.screenFrame}>
            <div style={styles.badge}>SCENE {currentSlideIndex + 1} / {lecture.slides.length}</div>
            <h3 style={styles.slideHeading}>{lecture.slides[currentSlideIndex]?.heading}</h3>

            {/* DYNAMIC SVG & GRAPHICAL CHALKBOARD VISUALS */}
            <div style={styles.visualBoard}>
              <svg width="100%" height="150" viewBox="0 0 400 150" style={{ background: '#091812', borderRadius: '8px' }}>
                <rect x="10" y="10" width="380" height="130" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="6 6" rx="8"/>
                {currentSlideIndex === 0 && (
                  <g>
                    <circle cx="200" cy="75" r="45" fill="none" stroke="#ff9d00" strokeWidth="3" />
                    <line x1="200" y1="75" x2="245" y2="75" stroke="#22c55e" strokeWidth="2" />
                    <text x="210" y="70" fill="#22c55e" fontSize="12" fontWeight="bold">r (Radius)</text>
                    <text x="200" y="135" fill="#ff9d00" fontSize="13" textAnchor="middle" fontWeight="bold">Circular Axis & Centripetal Force</text>
                  </g>
                )}
                {currentSlideIndex === 1 && (
                  <g>
                    <rect x="130" y="45" width="140" height="50" rx="6" fill="#132820" stroke="#ff9d00" strokeWidth="2"/>
                    <text x="200" y="75" fill="#ff9d00" fontSize="16" textAnchor="middle" fontWeight="bold">I = ∑ mᵢ rᵢ²</text>
                    <text x="200" y="135" fill="#cbd5e1" fontSize="12" textAnchor="middle">Moment of Inertia Derivation</text>
                  </g>
                )}
                {currentSlideIndex >= 2 && (
                  <g>
                    <path d="M 50 100 Q 200 20 350 100" fill="none" stroke="#22c55e" strokeWidth="3" />
                    <circle cx="200" cy="60" r="8" fill="#ff9d00" />
                    <text x="200" y="40" fill="#ff9d00" fontSize="12" textAnchor="middle" fontWeight="bold">Maximum Peak / Equilibrium</text>
                    <text x="200" y="135" fill="#ff9d00" fontSize="13" textAnchor="middle" fontWeight="bold">Board Exam Practice Mindmap</text>
                  </g>
                )}
              </svg>
            </div>

            <ul style={styles.bulletList}>
              {lecture.slides[currentSlideIndex]?.bulletPoints?.map((pt, idx) => (
                <li key={idx} style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '6px' }}>
                  • {pt}
                </li>
              ))}
            </ul>
          </div>

          <div style={styles.controlsBar}>
            <button onClick={isPlaying ? handlePauseVideo : handlePlayVideo} style={styles.playBtn}>
              {isPlaying ? '⏸ Pause Lesson' : '▶ Play AI Lesson (+50 XP)'}
            </button>
            <span style={{ color: '#cbd5e1', fontSize: '13px' }}>
              Scene: {lecture.slides[currentSlideIndex]?.heading}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#0d1f18', padding: '20px', borderRadius: '12px', border: '1px solid #1e3a2b' },
  input: { flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #1e3a2b', backgroundColor: '#132820', color: '#fff' },
  generateBtn: { padding: '10px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#ff9d00', color: '#000', fontWeight: 'bold', cursor: 'pointer' },
  videoPlayerBox: { backgroundColor: '#06110d', borderRadius: '12px', padding: '20px', border: '1px solid #ff9d00' },
  screenFrame: { backgroundColor: '#0a1612', padding: '20px', borderRadius: '10px', minHeight: '260px', position: 'relative' },
  badge: { position: 'absolute', top: '14px', right: '14px', backgroundColor: '#ff9d0022', color: '#ff9d00', border: '1px solid #ff9d00', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' },
  slideHeading: { color: '#ff9d00', fontSize: '18px', margin: '0 0 14px 0' },
  visualBoard: { marginBottom: '16px' },
  bulletList: { paddingLeft: '20px', margin: 0 },
  controlsBar: { display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #1e3a2b' },
  playBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#22c55e', color: '#000', fontWeight: 'bold', cursor: 'pointer' }
};