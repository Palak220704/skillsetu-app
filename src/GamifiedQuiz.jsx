import React, { useState, useEffect } from 'react';

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function GamifiedQuiz({ lecture, onQuizComplete }) {
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Initialize and shuffle questions whenever lecture data changes
  useEffect(() => {
    const rawQuestions = lecture?.quizQuestions || [
      {
        id: 1,
        question: `What is the primary topic covered in ${lecture?.title || 'this lesson'}?`,
        options: ['Fundamental Principles & Concepts', 'Irrelevant Subject Matter', 'Unrelated Theory', 'None of these'],
        correctIndex: 0
      },
      {
        id: 2,
        question: 'Which NCERT class level is this lesson curated for?',
        options: ['Class 6-8', 'Class 9-10', 'Class 11-12', 'As selected in syllabus'],
        correctIndex: 3
      },
      {
        id: 3,
        question: 'What is essential for scoring well on this NCERT topic?',
        options: ['Memorizing facts only', 'Understanding core principles & definitions', 'Skipping key concepts', 'None'],
        correctIndex: 1
      }
    ];

    // Shuffle questions order
    setShuffledQuestions(shuffleArray(rawQuestions));
    setSelectedAnswers({});
    setSubmitted(false);
  }, [lecture]);

  const handleOptionSelect = (qIdx, optionIdx) => {
    if (submitted) return;
    setSelectedAnswers({ ...selectedAnswers, [qIdx]: optionIdx });
  };

  const handleSubmitQuiz = () => {
    let currentScore = 0;
    shuffledQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        currentScore += 1;
      }
    });

    setScore(currentScore);
    setSubmitted(true);

    const xpEarned = currentScore * 50 + 50;
    if (onQuizComplete) onQuizComplete(xpEarned);
  };

  return (
    <div style={styles.quizContainer}>
      <h3 style={styles.quizTitle}>🎯 Post-Lesson Knowledge Check</h3>
      <p style={styles.quizSubtitle}>Complete the quiz to earn XP and boost your Campus Rank!</p>

      {!submitted ? (
        <div style={styles.questionsList}>
          {shuffledQuestions.map((q, qIdx) => (
            <div key={qIdx} style={styles.questionCard}>
              <p style={styles.questionText}>
                <strong>Q{qIdx + 1}:</strong> {q.question}
              </p>
              <div style={styles.optionsGrid}>
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[qIdx] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleOptionSelect(qIdx, optIdx)}
                      style={isSelected ? styles.optionBtnSelected : styles.optionBtn}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmitQuiz}
            disabled={Object.keys(selectedAnswers).length < shuffledQuestions.length}
            style={
              Object.keys(selectedAnswers).length < shuffledQuestions.length
                ? styles.submitBtnDisabled
                : styles.submitBtn
            }
          >
            🏆 Submit & Claim XP
          </button>
        </div>
      ) : (
        <div style={styles.resultBox}>
          <h2 style={styles.scoreHeading}>
            🎉 Quiz Completed! Score: {score} / {shuffledQuestions.length}
          </h2>
          <p style={styles.xpText}>+ {score * 50 + 50} XP Added to your profile!</p>
          <p style={styles.streakNotice}>🔥 Daily Streak Maintained!</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  quizContainer: {
    marginTop: '24px',
    padding: '20px',
    backgroundColor: '#132820',
    borderRadius: '12px',
    border: '2px solid #22c55e'
  },
  quizTitle: { color: '#22c55e', margin: '0 0 6px 0' },
  quizSubtitle: { color: '#94a3b8', fontSize: '13px', margin: '0 0 16px 0' },
  questionsList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  questionCard: {
    backgroundColor: '#0d1f18',
    padding: '14px',
    borderRadius: '8px',
    borderLeft: '3px solid #ff9d00'
  },
  questionText: { color: '#fff', fontSize: '14px', margin: '0 0 10px 0' },
  optionsGrid: { display: 'flex', flexDirection: 'column', gap: '8px' },
  optionBtn: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #1e3a2b',
    backgroundColor: '#132820',
    color: '#cbd5e1',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '13px'
  },
  optionBtnSelected: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ff9d00',
    backgroundColor: '#ff9d0022',
    color: '#ff9d00',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '13px'
  },
  submitBtn: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#22c55e',
    color: '#000',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  submitBtnDisabled: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#334155',
    color: '#94a3b8',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'not-allowed',
    marginTop: '10px'
  },
  resultBox: { textAlign: 'center', padding: '20px' },
  scoreHeading: { color: '#ff9d00', margin: '0 0 8px 0' },
  xpText: { color: '#22c55e', fontSize: '18px', fontWeight: 'bold', margin: '8px 0' },
  streakNotice: { color: '#ef4444', fontWeight: 'bold', fontSize: '14px', margin: 0 }
};