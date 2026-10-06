import React, { useState, useEffect } from 'react';
import { speechEngine } from './speechEngine';

export default function AiVideoPlayer({ lecture, language }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const slides = lecture?.slides || [];

  useEffect(() => {
    // Reset player state when lecture changes
    setCurrentSlide(0);
    setIsPlaying(false);
    speechEngine.stop();
  }, [lecture]);

  const handlePlay = () => {
    if (!slides.length) return;

    if (isPlaying) {
      speechEngine.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playSlideAudio(currentSlide);
    }
  };

  const playSlideAudio = (slideIndex) => {
    if (slideIndex >= slides.length) {
      setIsPlaying(false);
      setCurrentSlide(0);
      return;
    }

    setCurrentSlide(slideIndex);
    const slide = slides[slideIndex];

    speechEngine.speak(slide.narration, language, () => {
      // Auto-advance to next scene slide when speech finishes
      if (slideIndex + 1 < slides.length) {
        playSlideAudio(slideIndex + 1);
      } else {
        setIsPlaying(false);
      }
    });
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      const nextIdx = currentSlide + 1;
      setCurrentSlide(nextIdx);
      if (isPlaying) playSlideAudio(nextIdx);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      const prevIdx = currentSlide - 1;
      setCurrentSlide(prevIdx);
      if (isPlaying) playSlideAudio(prevIdx);
    }
  };

  if (!slides.length) return null;

  const activeSlide = slides[currentSlide];

  return (
    <div style={styles.playerContainer}>
      {/* Video Canvas Display Screen */}
      <div style={styles.screen}>
        <div style={styles.topBar}>
          <span style={styles.liveTag}>🔴 AI VIDEO CLASSROOM</span>
          <span style={styles.slideCounter}>Scene {currentSlide + 1} of {slides.length}</span>
        </div>

        <div style={styles.slideContent}>
          <h3 style={styles.slideHeading}>{activeSlide.heading}</h3>
          
          {/* Dynamic Visual Scene Graphic with Fallback */}
          <div style={styles.visualGraphic}>
            <img
              src={`https://image.pollinations.ai/prompt/educational%20diagram%20of%20${encodeURIComponent(
                activeSlide.heading || 'science lesson'
              )}?width=600&height=300&nologo=true`}
              alt={activeSlide.heading}
              style={styles.slideImage}
              onError={(e) => {
                // If Pollinations API fails, load a clean educational illustration fallback
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80';
              }}
            />
            <p style={styles.graphicText}>🖼️ {activeSlide.visualDescription}</p>
          </div>

          <ul style={styles.bulletList}>
            {activeSlide.bulletPoints?.map((bullet, idx) => (
              <li key={idx} style={styles.bulletItem}>✨ {bullet}</li>
            ))}
          </ul>
        </div>

        {/* Dynamic Subtitle Narration Bar */}
        <div style={styles.subtitleBar}>
          <p style={styles.subtitleText}>🎙️ "{activeSlide.narration}"</p>
        </div>
      </div>

      {/* Video Player Control Bar */}
      <div style={styles.controlsBar}>
        <button onClick={handlePrev} disabled={currentSlide === 0} style={styles.controlBtn}>
          ⏮️ Prev
        </button>

        <button onClick={handlePlay} style={styles.playBtn}>
          {isPlaying ? '⏸️ Pause Video' : '▶️ Play Video Lesson'}
        </button>

        <button onClick={handleNext} disabled={currentSlide === slides.length - 1} style={styles.controlBtn}>
          Next ⏭️
        </button>
      </div>
    </div>
  );
}

const styles = {
  playerContainer: {
    marginTop: '20px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '2px solid #ff9d00',
    backgroundColor: '#0a1712'
  },
  screen: {
    padding: '20px',
    minHeight: '320px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#11221a',
    position: 'relative'
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px'
  },
  liveTag: {
    backgroundColor: '#ef4444',
    color: '#fff',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold'
  },
  slideCounter: {
    color: '#ff9d00',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  slideContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  slideHeading: {
    color: '#ff9d00',
    margin: '0 0 12px 0',
    fontSize: '22px',
    textAlign: 'center'
  },
  visualGraphic: {
    backgroundColor: '#0d1f18',
    padding: '12px',
    borderRadius: '8px',
    border: '1px dashed #22c55e',
    margin: '10px 0',
    textAlign: 'center'
  },
  slideImage: {
    width: '100%',
    maxHeight: '220px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '8px',
    border: '1px solid #1e3a2b'
  },
  graphicText: {
    color: '#22c55e',
    fontSize: '13px',
    margin: 0,
    fontStyle: 'italic'
  },
  bulletList: {
    listStyleType: 'none',
    paddingLeft: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    margin: '14px 0'
  },
  bulletItem: {
    color: '#ffffff',
    fontSize: '14px',
    backgroundColor: '#0d1f18',
    padding: '8px 12px',
    borderRadius: '6px'
  },
  subtitleBar: {
    backgroundColor: '#000000aa',
    padding: '10px 14px',
    borderRadius: '6px',
    borderLeft: '3px solid #ff9d00',
    marginTop: '12px'
  },
  subtitleText: {
    color: '#cbd5e1',
    fontSize: '13px',
    margin: 0,
    fontStyle: 'italic',
    textAlign: 'center'
  },
  controlsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    backgroundColor: '#0d1f18',
    borderTop: '1px solid #1e3a2b'
  },
  playBtn: {
    padding: '10px 20px',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#ff9d00',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px'
  },
  controlBtn: {
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#132820',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px'
  }
};