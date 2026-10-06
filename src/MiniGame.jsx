import React, { useState, useEffect } from 'react';

// Fisher-Yates Shuffle Helper Function
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Mini-Game Datasets
const GAME_DATABASE = {
  matching: {
    title: '🧪 NCERT Lab Matcher',
    instruction: 'Match each NCERT scientific term on the left with its correct definition on the right!',
    pairs: [
      { term: 'Photosynthesis', definition: 'Process where green plants synthesize food using sunlight & chlorophyll' },
      { term: 'Chlorophyll', definition: 'Green pigment in plant leaves responsible for light absorption' },
      { term: 'Stomata', definition: 'Microscopic pores on leaf surfaces governing gas exchange' },
      { term: 'Transpiration', definition: 'Evaporation of water vapor through specialized plant aerial pores' }
    ]
  },
  classifier: {
    title: '⚡ Speed Term Classifier',
    instruction: 'Identify whether the displayed NCERT concept is a Physical Change or Chemical Change!',
    questions: [
      { concept: 'Rusting of Iron', correctCategory: 'Chemical Change' },
      { concept: 'Melting of Ice', correctCategory: 'Physical Change' },
      { concept: 'Burning of Magnesium Ribbon', correctCategory: 'Chemical Change' },
      { concept: 'Dissolving Sugar in Water', correctCategory: 'Physical Change' },
      { concept: 'Digestion of Food', correctCategory: 'Chemical Change' }
    ]
  },
  formulas: {
    title: '📐 Formula & Law Challenge',
    instruction: 'Match the fundamental law or physical quantity with its correct formula or SI unit!',
    pairs: [
      { term: 'Newton Second Law of Motion', definition: 'F = m × a' },
      { term: 'Ohm Law', definition: 'V = I × R' },
      { term: 'Kinetic Energy', definition: 'E = ½ × m × v²' },
      { term: 'SI Unit of Electric Current', definition: 'Ampere (A)' }
    ]
  }
};

export default function MiniGame({ initialGameMode = 'matching', onGameComplete }) {
  const [activeMode, setActiveMode] = useState(initialGameMode);
  
  // Matching Game State
  const [shuffledTerms, setShuffledTerms] = useState([]);
  const [shuffledDefs, setShuffledDefs] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [matchedTerms, setMatchedTerms] = useState([]);
  
  // Classifier Game State
  const [classifierQuestions, setClassifierQuestions] = useState([]);
  const [currentClassifierIdx, setCurrentClassifierIdx] = useState(0);
  const [classifierScore, setClassifierScore] = useState(0);

  const [attempts, setAttempts] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  // Initialize and shuffle game data whenever activeMode changes
  useEffect(() => {
    startNewGame(activeMode);
  }, [activeMode]);

  const startNewGame = (mode) => {
    setGameWon(false);
    setAttempts(0);
    setSelectedTerm(null);
    setMatchedTerms([]);
    setCurrentClassifierIdx(0);
    setClassifierScore(0);

    if (mode === 'matching' || mode === 'formulas') {
      const data = GAME_DATABASE[mode];
      setShuffledTerms(shuffleArray(data.pairs));
      setShuffledDefs(shuffleArray(data.pairs));
    } else if (mode === 'classifier') {
      setClassifierQuestions(shuffleArray(GAME_DATABASE.classifier.questions));
    }
  };

  // Matching Logic (Game 1 & 3)
  const handleTermClick = (item) => {
    if (matchedTerms.includes(item.term)) return;
    setSelectedTerm(item);
  };

  const handleDefClick = (item) => {
    if (!selectedTerm || matchedTerms.includes(item.term)) return;
    setAttempts((prev) => prev + 1);

    if (selectedTerm.term === item.term) {
      const newMatched = [...matchedTerms, item.term];
      setMatchedTerms(newMatched);
      setSelectedTerm(null);

      if (newMatched.length === GAME_DATABASE[activeMode].pairs.length) {
        setGameWon(true);
        if (onGameComplete) onGameComplete(100);
      }
    } else {
      setSelectedTerm(null);
    }
  };

  // Classifier Logic (Game 2)
  const handleClassifierChoice = (category) => {
    const currentQ = classifierQuestions[currentClassifierIdx];
    setAttempts((prev) => prev + 1);

    let updatedScore = classifierScore;
    if (currentQ.correctCategory === category) {
      updatedScore += 1;
      setClassifierScore(updatedScore);
    }

    if (currentClassifierIdx + 1 < classifierQuestions.length) {
      setCurrentClassifierIdx((prev) => prev + 1);
    } else {
      setGameWon(true);
      if (onGameComplete) onGameComplete(updatedScore * 25);
    }
  };

  return (
    <div style={styles.container}>
      {/* Game Mode Selector Bar */}
      <div style={styles.modeBar}>
        <button
          onClick={() => setActiveMode('matching')}
          style={activeMode === 'matching' ? styles.activeModeBtn : styles.modeBtn}
        >
          🧪 Lab Matcher
        </button>
        <button
          onClick={() => setActiveMode('classifier')}
          style={activeMode === 'classifier' ? styles.activeModeBtn : styles.modeBtn}
        >
          ⚡ Term Classifier
        </button>
        <button
          onClick={() => setActiveMode('formulas')}
          style={activeMode === 'formulas' ? styles.activeModeBtn : styles.modeBtn}
        >
          📐 Formulas & Laws
        </button>
      </div>

      <div style={styles.header}>
        <h2 style={styles.title}>{GAME_DATABASE[activeMode].title}</h2>
        <p style={styles.subtitle}>{GAME_DATABASE[activeMode].instruction}</p>
      </div>

      {!gameWon ? (
        <div>
          {/* RENDER MATCHING / FORMULA GAMES */}
          {(activeMode === 'matching' || activeMode === 'formulas') && (
            <div style={styles.gameBoard}>
              <div style={styles.column}>
                <h4 style={styles.colHeader}>Terms / Concepts</h4>
                {shuffledTerms.map((item, idx) => {
                  const isMatched = matchedTerms.includes(item.term);
                  const isSelected = selectedTerm?.term === item.term;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleTermClick(item)}
                      disabled={isMatched}
                      style={
                        isMatched
                          ? styles.btnMatched
                          : isSelected
                          ? styles.btnSelected
                          : styles.btnDefault
                      }
                    >
                      {isMatched ? `✅ ${item.term}` : item.term}
                    </button>
                  );
                })}
              </div>

              <div style={styles.column}>
                <h4 style={styles.colHeader}>Definitions / Formulas</h4>
                {shuffledDefs.map((item, idx) => {
                  const isMatched = matchedTerms.includes(item.term);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleDefClick(item)}
                      disabled={isMatched}
                      style={isMatched ? styles.btnMatched : styles.btnDefault}
                    >
                      {isMatched ? `✅ ${item.definition}` : item.definition}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* RENDER CLASSIFIER GAME */}
          {activeMode === 'classifier' && classifierQuestions.length > 0 && (
            <div style={styles.classifierCard}>
              <span style={styles.questionCounter}>
                Question {currentClassifierIdx + 1} of {classifierQuestions.length}
              </span>
              <h3 style={styles.conceptTitle}>
                "{classifierQuestions[currentClassifierIdx].concept}"
              </h3>

              <div style={styles.classifierBtnGroup}>
                <button
                  onClick={() => handleClassifierChoice('Physical Change')}
                  style={styles.choiceBtn}
                >
                  🧊 Physical Change
                </button>
                <button
                  onClick={() => handleClassifierChoice('Chemical Change')}
                  style={styles.choiceBtn}
                >
                  🔥 Chemical Change
                </button>
              </div>
            </div>
          )}

          <p style={styles.attemptsText}>
            Attempts: {attempts} | Mode: {activeMode.toUpperCase()}
          </p>
        </div>
      ) : (
        <div style={styles.winBox}>
          <h2 style={styles.winTitle}>🎉 Challenge Cleared!</h2>
          <p style={styles.winXp}>+100 Bonus XP Claimed!</p>
          <button onClick={() => startNewGame(activeMode)} style={styles.resetBtn}>
            🔄 Play Again (Shuffle Questions)
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#0d1f18',
    borderRadius: '16px',
    border: '2px solid #ff9d00',
    color: '#ffffff',
    fontFamily: 'sans-serif',
    maxWidth: '750px',
    margin: '20px auto'
  },
  modeBar: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  modeBtn: {
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #1e3a2b',
    backgroundColor: '#132820',
    color: '#cbd5e1',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  activeModeBtn: {
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #ff9d00',
    backgroundColor: '#ff9d00',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '13px'
  },
  header: { textAlign: 'center', marginBottom: '16px' },
  title: { color: '#ff9d00', margin: '0 0 6px 0', fontSize: '20px' },
  subtitle: { color: '#94a3b8', fontSize: '13px', margin: 0 },
  gameBoard: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  column: { flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '10px' },
  colHeader: { color: '#22c55e', margin: '0 0 6px 0', fontSize: '13px', textAlign: 'center' },
  btnDefault: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #1e3a2b',
    backgroundColor: '#132820',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    textAlign: 'left'
  },
  btnSelected: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ff9d00',
    backgroundColor: '#ff9d0022',
    color: '#ff9d00',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '13px',
    textAlign: 'left'
  },
  btnMatched: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #22c55e',
    backgroundColor: '#22c55e22',
    color: '#22c55e',
    cursor: 'not-allowed',
    fontSize: '13px',
    textAlign: 'left',
    opacity: 0.8
  },
  classifierCard: {
    backgroundColor: '#132820',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #1e3a2b',
    textAlign: 'center',
    margin: '16px 0'
  },
  questionCounter: { color: '#22c55e', fontSize: '12px', fontWeight: 'bold' },
  conceptTitle: { color: '#ff9d00', fontSize: '22px', margin: '16px 0' },
  classifierBtnGroup: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  choiceBtn: {
    padding: '12px 20px',
    borderRadius: '8px',
    border: '1px solid #ff9d00',
    backgroundColor: '#0d1f18',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px'
  },
  attemptsText: { textAlign: 'center', color: '#cbd5e1', fontSize: '12px', marginTop: '16px' },
  winBox: { textAlign: 'center', padding: '20px' },
  winTitle: { color: '#22c55e', margin: '0 0 8px 0' },
  winXp: { color: '#ff9d00', fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' },
  resetBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ff9d00',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};