import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import AiClassroom from './AiClassroom';
import GamifiedQuiz from './GamifiedQuiz';
import Leaderboard from './Leaderboard';
import MiniGame from './MiniGame';
import AiChatbot from './AiChatbot';
import ProgressPieChart from './ProgressPieChart';
import { MSB_CURRICULUM, MSB_PYQ_DATABASE } from './msbSyllabusData';
import { generateNcertLecture } from './geminiClient';

export default function App() {
  const [session, setSession] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Network Connectivity State
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Subject Navigation Mode: 'chapters' or 'pyq'
  const [subjectViewMode, setSubjectViewMode] = useState('chapters');

  // Selected Chapter & Active Tab View
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterViewMode, setChapterViewMode] = useState('textbook');
  const [selectedMiniGameMode, setSelectedMiniGameMode] = useState('matching');

  // Help & Refer Modals
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showReferModal, setShowReferModal] = useState(false);
  const [referCodeInput, setReferCodeInput] = useState('');
  const [referSuccess, setReferSuccess] = useState('');

  // Search & Navigation
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultLecture, setSearchResultLecture] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Gamification Stats
  const [userXp, setUserXp] = useState(0);
  const [streakDays, setStreakDays] = useState(1);
  const completionPercentage = Math.min(100, Math.floor((userXp / 2000) * 100));

  // Homework Tracker State
  const [homeworkList, setHomeworkList] = useState([]);
  const [newHomeworkTitle, setNewHomeworkTitle] = useState('');
  const [newHomeworkSubject, setNewHomeworkSubject] = useState('');
  const [homeworkLoading, setHomeworkLoading] = useState(false);

  // Theme & Settings
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('English');
  const [profilePic, setProfilePic] = useState('🎓');

  // Network & Session Listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user);
        fetchHomework(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user);
        fetchHomework(session.user.id);
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      subscription.unsubscribe();
    };
  }, []);

  // Fetch or Initialise Student Profile from Supabase
  const fetchUserProfile = async (user) => {
    try {
      const userClass = user.user_metadata?.student_class || '12';
      const firstName = user.user_metadata?.first_name || 'Student';

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error.message);
      }

      if (data) {
        setUserXp(data.xp || 0);
        setStreakDays(data.streak || 1);
      } else {
        await syncProfileToSupabase(user.id, user.email, firstName, userClass, 0, 1);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  };

  // Live Auto-Sync to Supabase Database
  const syncProfileToSupabase = async (userId, userEmail, firstName, userClass, newXp, currentStreak = 1) => {
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        email: userEmail,
        first_name: firstName,
        student_class: userClass,
        xp: newXp,
        streak: currentStreak,
        updated_at: new Date().toISOString()
      });
      if (error) console.error('Profile sync error:', error.message);
    } catch (err) {
      console.error('Error syncing user profile:', err);
    }
  };

  const handleAwardXp = (amount) => {
    setUserXp((prevXp) => {
      const updatedXp = prevXp + amount;
      if (session?.user) {
        const uClass = session.user.user_metadata?.student_class || '12';
        const fName = session.user.user_metadata?.first_name || 'Student';
        syncProfileToSupabase(session.user.id, session.user.email, fName, uClass, updatedXp, streakDays);
      }
      return updatedXp;
    });
  };

  const fetchHomework = async (userId) => {
    try {
      setHomeworkLoading(true);
      const { data, error } = await supabase
        .from('homework')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHomeworkList(data || []);
    } catch (err) {
      console.error('Error fetching homework:', err.message);
    } finally {
      setHomeworkLoading(false);
    }
  };

  const handleAddHomework = async (e) => {
    e.preventDefault();
    if (!newHomeworkTitle.trim() || !session) return;

    const assignedSubject = newHomeworkSubject || availableSubjects[0] || 'General';

    try {
      const { data, error } = await supabase
        .from('homework')
        .insert([
          {
            user_id: session.user.id,
            title: newHomeworkTitle.trim(),
            subject: assignedSubject,
            completed: false
          }
        ])
        .select();

      if (error) throw error;
      if (data) {
        setHomeworkList([data[0], ...homeworkList]);
        setNewHomeworkTitle('');
        handleAwardXp(30);
      }
    } catch (err) {
      console.error('Error adding homework:', err.message);
    }
  };

  const handleToggleHomework = async (id, currentCompletedStatus) => {
    try {
      const { error } = await supabase
        .from('homework')
        .update({ completed: !currentCompletedStatus })
        .eq('id', id);

      if (error) throw error;
      setHomeworkList(
        homeworkList.map((hw) =>
          hw.id === id ? { ...hw, completed: !currentCompletedStatus } : hw
        )
      );

      if (!currentCompletedStatus) {
        handleAwardXp(50);
      }
    } catch (err) {
      console.error('Error updating homework:', err.message);
    }
  };

  const handleDeleteHomework = async (id) => {
    try {
      const { error } = await supabase.from('homework').delete().eq('id', id);
      if (error) throw error;
      setHomeworkList(homeworkList.filter((hw) => hw.id !== id));
    } catch (err) {
      console.error('Error deleting homework:', err.message);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setCurrentPage('search');
    setSelectedSubject(null);

    const fullQuery = `Maharashtra State Board Class ${userClass}: ${searchQuery}`;
    const lectureData = await generateNcertLecture(fullQuery, language, userClass);
    setSearchResultLecture(lectureData);
    setSearchLoading(false);
  };

  const handleRedeemReferral = (e) => {
    e.preventDefault();
    if (!referCodeInput.trim()) return;

    handleAwardXp(10);
    setReferSuccess('🎉 Referral Code Redeemed! +10 XP added directly to your Live Scoreboard!');
    setReferCodeInput('');
  };

  const handleLaunchMiniGame = (mode) => {
    setSelectedMiniGameMode(mode);
    setCurrentPage('minigames');
  };

  if (!session) {
    return <Auth onLoginSuccess={(newSession) => setSession(newSession)} />;
  }

  const userClass = session.user.user_metadata?.student_class || '12';
  const firstName = session.user.user_metadata?.first_name || 'Student';
  const lastName = session.user.user_metadata?.last_name || '';

  const classSyllabus = MSB_CURRICULUM[userClass] || MSB_CURRICULUM['12'];
  const availableSubjects = Object.keys(classSyllabus);
  const classPyqs = MSB_PYQ_DATABASE[userClass] || MSB_PYQ_DATABASE['12'];

  const colors = theme === 'light' ? {
    bg: '#f8fafc', card: '#ffffff', inputBg: '#f1f5f9', text: '#0f172a', textSecondary: '#475569', accent: '#d97706', border: '#e2e8f0', success: '#16a34a'
  } : {
    bg: '#06110d', card: '#0d1f18', inputBg: '#132820', text: '#ffffff', textSecondary: '#cbd5e1', accent: '#ff9d00', border: '#1e3a2b', success: '#22c55e'
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', backgroundColor: colors.bg, color: colors.text, fontFamily: 'sans-serif', overflowX: 'hidden' }}>
      {/* Universal Responsive CSS Rules */}
      <style>{`
        /* Desktop & Laptop Views (Min-width: 769px) */
        @media (min-width: 769px) {
          .app-header {
            padding: 14px 40px !important;
            flex-direction: row !important;
          }
          .app-search-form {
            max-width: 500px !important;
            margin: 0 24px !important;
          }
          .app-main-content {
            padding: 28px 40px !important;
          }
          .app-grid-stats {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .app-grid-subjects {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
          }
          .app-grid-games {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .app-pyq-card {
            flex-direction: row !important;
            align-items: center !important;
          }
          .app-pyq-btn {
            width: auto !important;
          }
        }

        /* Mobile Views (Max-width: 768px) */
        @media (max-width: 768px) {
          .app-header {
            padding: 12px 16px !important;
            flex-wrap: wrap !important;
            gap: 10px !important;
          }
          .app-search-form {
            order: 3 !important;
            max-width: 100% !important;
            margin: 8px 0 0 0 !important;
            width: 100% !important;
          }
          .app-main-content {
            padding: 16px 14px !important;
          }
          .app-grid-stats, .app-grid-subjects, .app-grid-games {
            grid-template-columns: 1fr !important;
          }
          .app-header-actions {
            gap: 8px !important;
          }
          .app-refer-btn {
            padding: 6px 10px !important;
            font-size: 11px !important;
          }
          .app-pyq-card {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .app-pyq-btn {
            width: 100% !important;
            text-align: center !important;
          }
        }
      `}</style>

      {/* Responsive Universal Header */}
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <div onClick={() => { setCurrentPage('dashboard'); setSelectedSubject(null); setSelectedChapter(null); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '24px' }}>🏫</span>
          <span style={{ color: colors.accent, fontWeight: 'bold', fontSize: '20px' }}>SkillSetu</span>
          <span style={{ fontSize: '11px', padding: '2px 8px', border: `1px solid ${colors.accent}`, borderRadius: '12px', color: colors.accent, fontWeight: 'bold' }}>
            Class {userClass}
          </span>
          {!isOnline && (
            <span style={{ backgroundColor: '#eab308', color: '#000', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>
              ⚡ Offline
            </span>
          )}
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="app-search-form" style={{ flex: 1 }}>
          <input
            type="text"
            placeholder={`🔍 Search Class ${userClass} topics...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 16px', borderRadius: '24px', border: `1px solid ${colors.border}`, backgroundColor: colors.inputBg, color: colors.text, fontSize: '13px', boxSizing: 'border-box' }}
          />
        </form>

        <div className="app-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setShowReferModal(true)} className="app-refer-btn" style={{ backgroundColor: colors.success, color: '#000', padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
            🎁 Refer (+10 XP)
          </button>

          <button onClick={() => setShowHelpModal(true)} style={{ backgroundColor: 'transparent', border: `1px solid ${colors.border}`, color: colors.textSecondary, padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
            ❓ Help
          </button>

          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: colors.accent, fontSize: '24px', cursor: 'pointer', fontWeight: 'bold' }}>⋮</button>
            {menuOpen && (
              <div style={{ position: 'absolute', right: 0, top: '40px', backgroundColor: colors.card, border: `1px solid ${colors.accent}`, borderRadius: '8px', width: '200px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 6px 16px rgba(0,0,0,0.4)', zIndex: 200 }}>
                <div style={{ padding: '12px', fontSize: '12px', color: colors.success, backgroundColor: colors.inputBg, fontWeight: 'bold' }}>Logged in as {firstName}</div>
                <button onClick={() => { setCurrentPage('profile'); setMenuOpen(false); }} style={{ ...styles.menuItem, color: colors.text }}>👤 Profile</button>
                <button onClick={() => { setCurrentPage('leaderboard'); setMenuOpen(false); }} style={{ ...styles.menuItem, color: colors.text }}>🏆 Campus Leaderboard</button>
                <button onClick={() => { setCurrentPage('minigames'); setMenuOpen(false); }} style={{ ...styles.menuItem, color: colors.text }}>🎮 Mini Games</button>
                <button onClick={() => { setCurrentPage('homework'); setMenuOpen(false); }} style={{ ...styles.menuItem, color: colors.text }}>📝 Homework Tracker</button>
                <button onClick={() => { setCurrentPage('badges'); setMenuOpen(false); }} style={{ ...styles.menuItem, color: colors.text }}>🏅 My Badges</button>
                <button onClick={() => { setCurrentPage('settings'); setMenuOpen(false); }} style={{ ...styles.menuItem, color: colors.text }}>⚙️ Settings</button>
                <button onClick={() => supabase.auth.signOut()} style={{ ...styles.menuItem, color: '#ef4444', fontWeight: 'bold' }}>🚪 Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HELP MODAL */}
      {showHelpModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 300, padding: '16px', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: colors.card, padding: '24px', borderRadius: '14px', border: `1px solid ${colors.accent}`, maxWidth: '450px', width: '100%' }}>
            <h3 style={{ color: colors.accent, margin: '0 0 10px 0' }}>❓ SkillSetu Help & Support</h3>
            <p style={{ color: colors.textSecondary, fontSize: '13px', lineHeight: '1.5' }}>
              Welcome to SkillSetu! Quizzes, games, and videos completed directly sync your live score with our Supabase database.
            </p>
            <button onClick={() => setShowHelpModal(false)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: colors.accent, color: '#000', fontWeight: 'bold', cursor: 'pointer', marginTop: '12px' }}>Close Window</button>
          </div>
        </div>
      )}

      {/* REFER & EARN MODAL */}
      {showReferModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 300, padding: '16px', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: colors.card, padding: '24px', borderRadius: '14px', border: `1px solid ${colors.accent}`, maxWidth: '400px', width: '100%' }}>
            <h3 style={{ color: colors.accent, margin: '0 0 10px 0' }}>🎁 Refer & Earn 10 XP</h3>
            <p style={{ color: colors.textSecondary, fontSize: '13px' }}>Redeem a friend's referral code to add +10 XP live to your profile!</p>

            <div style={{ backgroundColor: colors.inputBg, padding: '10px', borderRadius: '8px', textAlign: 'center', margin: '12px 0', border: '1px dashed #22c55e', color: '#22c55e', fontWeight: 'bold', fontSize: '13px' }}>
              Your Code: SKILL-{firstName.toUpperCase()}-10
            </div>

            <form onSubmit={handleRedeemReferral} style={{ display: 'flex', gap: '8px', margin: '12px 0' }}>
              <input
                type="text"
                placeholder="Referral Code..."
                value={referCodeInput}
                onChange={(e) => setReferCodeInput(e.target.value)}
                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: `1px solid ${colors.border}`, backgroundColor: colors.inputBg, color: colors.text, fontSize: '13px' }}
                required
              />
              <button type="submit" style={{ padding: '10px 14px', borderRadius: '6px', border: 'none', backgroundColor: colors.success, color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Redeem</button>
            </form>

            {referSuccess && <p style={{ color: colors.success, fontSize: '12px', margin: '6px 0' }}>{referSuccess}</p>}

            <button onClick={() => setShowReferModal(false)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: colors.inputBg, color: colors.textSecondary, cursor: 'pointer', marginTop: '10px', fontSize: '13px' }}>Close Window</button>
          </div>
        </div>
      )}

      {/* Responsive Main View */}
      <main className="app-main-content" style={{ width: '100%', boxSizing: 'border-box' }}>
        {/* SEARCH VIEW */}
        {currentPage === 'search' && (
          <div>
            <button onClick={() => setCurrentPage('dashboard')} style={{ ...styles.backBtn, backgroundColor: colors.inputBg, color: colors.accent }}>← Back to Dashboard</button>
            <h2 style={{ color: colors.accent, fontSize: '20px' }}>🔍 Search Results for: "{searchQuery}"</h2>

            {searchLoading ? (
              <div style={{ padding: '30px', textAlign: 'center' }}>
                <h3>✨ Generating Detailed Lesson...</h3>
              </div>
            ) : searchResultLecture ? (
              <div style={{ backgroundColor: colors.card, padding: '20px', borderRadius: '12px', border: `1px solid ${colors.accent}` }}>
                <h3 style={{ color: colors.accent }}>{searchResultLecture.title}</h3>
                <p style={{ color: colors.textSecondary, fontSize: '13px' }}>{searchResultLecture.summary}</p>
                <AiClassroom defaultTopic={searchQuery} onVideoWatched={handleAwardXp} />
                <GamifiedQuiz lecture={searchResultLecture} onQuizComplete={handleAwardXp} />
              </div>
            ) : null}
          </div>
        )}

        {/* MAIN DASHBOARD */}
        {currentPage === 'dashboard' && !selectedSubject && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ color: colors.accent, fontSize: '24px', margin: '0 0 4px 0' }}>Welcome back, {firstName}! 👋</h2>
              <p style={{ color: colors.textSecondary, margin: 0, fontSize: '14px' }}>Maharashtra Board Class {userClass} Portal</p>
            </div>

            {/* Scoreboard + Leaderboard Grid */}
            <div className="app-grid-stats" style={{ display: 'grid', gap: '20px', marginBottom: '28px' }}>
              <div style={{ backgroundColor: colors.card, padding: '20px', borderRadius: '14px', border: `1px solid ${colors.border}`, textAlign: 'center' }}>
                <h4 style={{ color: colors.accent, margin: '0 0 10px 0', fontSize: '16px' }}>📊 Live Scoreboard & Mastery %</h4>
                <ProgressPieChart percentage={completionPercentage} />
                <p style={{ color: colors.success, fontWeight: 'bold', fontSize: '14px', margin: '10px 0 0 0' }}>
                  Live Database XP: {userXp} XP
                </p>
              </div>

              <div style={{ backgroundColor: colors.card, padding: '20px', borderRadius: '14px', border: `1px solid ${colors.border}` }}>
                <h4 style={{ color: colors.accent, margin: '0 0 10px 0', fontSize: '16px' }}>🏆 Class {userClass} Leaderboard</h4>
                <p style={{ color: colors.textSecondary, fontSize: '13px', margin: '0 0 14px 0' }}>
                  Real-time rankings for Class {userClass} registered students across schools
                </p>
                <button onClick={() => setCurrentPage('leaderboard')} style={{ width: '100%', padding: '12px', backgroundColor: colors.inputBg, color: colors.success, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                  Open Live Leaderboard →
                </button>
              </div>
            </div>

            {/* Subjects Grid */}
            <h3 style={{ color: colors.accent, marginBottom: '16px', fontSize: '20px' }}>📚 Class {userClass} Official Balbharati Textbooks</h3>
            <div className="app-grid-subjects" style={{ display: 'grid', gap: '20px' }}>
              {availableSubjects.map((sub, idx) => (
                <div key={idx} onClick={() => { setSelectedSubject(sub); setSubjectViewMode('chapters'); setSelectedChapter(null); }} style={{ backgroundColor: colors.card, padding: '20px', borderRadius: '14px', border: `1px solid ${colors.accent}`, cursor: 'pointer' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📘</div>
                  <h3 style={{ margin: '0 0 6px 0', color: colors.text, fontSize: '18px' }}>{sub}</h3>
                  <p style={{ color: colors.textSecondary, fontSize: '13px', margin: '0 0 14px 0' }}>{classSyllabus[sub].length} Chapters • Balbharati Approved</p>
                  <span style={{ color: colors.success, fontWeight: 'bold', fontSize: '13px' }}>Open Subject Workspace →</span>
                </div>
              ))}
            </div>

            {/* Mini Games Grid */}
            <h3 style={{ color: colors.success, margin: '32px 0 16px 0', fontSize: '20px' }}>🎮 Practice Mini-Games (Earn +100 XP)</h3>
            <div className="app-grid-games" style={{ display: 'grid', gap: '20px' }}>
              <div onClick={() => handleLaunchMiniGame('matching')} style={{ backgroundColor: colors.card, padding: '20px', borderRadius: '14px', border: `1px solid ${colors.success}`, cursor: 'pointer', textAlign: 'center' }}>
                <span style={{ fontSize: '32px' }}>🧪</span>
                <h4 style={{ color: colors.accent, margin: '8px 0', fontSize: '16px' }}>NCERT Lab Matcher</h4>
                <p style={{ color: colors.textSecondary, fontSize: '13px', margin: '0 0 12px 0' }}>Match terms with definitions</p>
                <span style={{ color: colors.success, fontSize: '13px', fontWeight: 'bold' }}>Play Game (+100 XP) →</span>
              </div>

              <div onClick={() => handleLaunchMiniGame('classifier')} style={{ backgroundColor: colors.card, padding: '20px', borderRadius: '14px', border: `1px solid ${colors.success}`, cursor: 'pointer', textAlign: 'center' }}>
                <span style={{ fontSize: '32px' }}>⚡</span>
                <h4 style={{ color: colors.accent, margin: '8px 0', fontSize: '16px' }}>Term Classifier</h4>
                <p style={{ color: colors.textSecondary, fontSize: '13px', margin: '0 0 12px 0' }}>Classify changes & concepts</p>
                <span style={{ color: colors.success, fontSize: '13px', fontWeight: 'bold' }}>Play Game (+100 XP) →</span>
              </div>

              <div onClick={() => handleLaunchMiniGame('formulas')} style={{ backgroundColor: colors.card, padding: '20px', borderRadius: '14px', border: `1px solid ${colors.success}`, cursor: 'pointer', textAlign: 'center' }}>
                <span style={{ fontSize: '32px' }}>📐</span>
                <h4 style={{ color: colors.accent, margin: '8px 0', fontSize: '16px' }}>Formulas & Laws</h4>
                <p style={{ color: colors.textSecondary, fontSize: '13px', margin: '0 0 12px 0' }}>Match scientific laws & units</p>
                <span style={{ color: colors.success, fontSize: '13px', fontWeight: 'bold' }}>Play Game (+100 XP) →</span>
              </div>
            </div>
          </div>
        )}

        {/* SUBJECT WORKSPACE */}
        {currentPage === 'dashboard' && selectedSubject && (
          <div>
            <button onClick={() => { setSelectedSubject(null); setSelectedChapter(null); }} style={{ ...styles.backBtn, backgroundColor: colors.inputBg, color: colors.accent }}>← Back to Dashboard</button>
            <h2 style={{ color: colors.accent, margin: '8px 0 16px 0', fontSize: '22px' }}>Class {userClass} {selectedSubject}</h2>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <button onClick={() => setSubjectViewMode('chapters')} style={subjectViewMode === 'chapters' ? { ...styles.activeTab, backgroundColor: colors.accent } : { ...styles.tab, backgroundColor: colors.inputBg, color: colors.textSecondary }}>
                📖 Chapters Directory
              </button>
              <button onClick={() => setSubjectViewMode('pyq')} style={subjectViewMode === 'pyq' ? { ...styles.activeTab, backgroundColor: colors.accent } : { ...styles.tab, backgroundColor: colors.inputBg, color: colors.textSecondary }}>
                📄 Board Question Papers (PYQs)
              </button>
            </div>

            {subjectViewMode === 'chapters' && !selectedChapter && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {classSyllabus[selectedSubject]?.map((chData) => (
                  <div key={chData.ch} style={{ backgroundColor: colors.card, padding: '20px', borderRadius: '12px', borderLeft: `6px solid ${colors.accent}`, border: `1px solid ${colors.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <h3 style={{ margin: 0, color: colors.text, fontSize: '18px' }}>Chapter {chData.ch}: {chData.title}</h3>
                      <span style={{ backgroundColor: '#ff9d0022', color: colors.accent, border: `1px solid ${colors.accent}`, padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                        {chData.weightage}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                      <button onClick={() => { setSelectedChapter(chData); setChapterViewMode('lecture'); }} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                        🎥 AI Video (+50 XP)
                      </button>
                      <button onClick={() => { setSelectedChapter(chData); setChapterViewMode('textbook'); }} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#22c55e', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                        📘 Read Textbook
                      </button>
                      <button onClick={() => { setSelectedChapter(chData); setChapterViewMode('solutions'); }} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#ff9d00', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                        📝 Shaalaa Solutions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CHAPTER VIEW */}
            {subjectViewMode === 'chapters' && selectedChapter && (
              <div style={{ backgroundColor: colors.card, padding: '20px', borderRadius: '14px', border: `1px solid ${colors.accent}` }}>
                <button onClick={() => setSelectedChapter(null)} style={{ ...styles.backBtn, backgroundColor: colors.inputBg, color: colors.accent }}>← Back to Index</button>
                <h3 style={{ color: colors.accent, margin: '0 0 16px 0', fontSize: '20px' }}>Chapter {selectedChapter.ch}: {selectedChapter.title}</h3>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  <button onClick={() => setChapterViewMode('lecture')} style={chapterViewMode === 'lecture' ? styles.activeTab : styles.tab}>🎥 AI Lecture</button>
                  <button onClick={() => setChapterViewMode('textbook')} style={chapterViewMode === 'textbook' ? styles.activeTab : styles.tab}>📘 Read Textbook</button>
                  <button onClick={() => setChapterViewMode('solutions')} style={chapterViewMode === 'solutions' ? styles.activeTab : styles.tab}>📝 Shaalaa Solutions</button>
                </div>

                {chapterViewMode === 'lecture' && <AiClassroom defaultTopic={selectedChapter.title} onVideoWatched={handleAwardXp} />}

                {chapterViewMode === 'textbook' && (
                  <div style={{ backgroundColor: colors.inputBg, padding: '20px', borderRadius: '10px', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: colors.text, fontSize: '14px' }}>
                    {selectedChapter.textbookContent || "Official Balbharati textbook reading section loaded for this chapter."}
                  </div>
                )}

                {chapterViewMode === 'solutions' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={{ color: colors.success, fontWeight: 'bold', fontSize: '13px', margin: 0 }}>✓ Balbharati Exercise Solutions (Shaalaa.com Verification Model)</p>
                    {selectedChapter.solutions?.map((s, idx) => (
                      <div key={idx} style={{ backgroundColor: colors.inputBg, padding: '16px', borderRadius: '10px', borderLeft: `4px solid ${colors.success}` }}>
                        <h4 style={{ color: colors.accent, margin: '0 0 8px 0', fontSize: '15px' }}>{s.q}</h4>
                        <p style={{ whiteSpace: 'pre-line', margin: 0, color: colors.text, fontSize: '13px', lineHeight: '1.5' }}>{s.ans}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PYQ VIEW */}
            {subjectViewMode === 'pyq' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ color: colors.accent, fontSize: '20px' }}>📄 Class {userClass} Previous Year Papers</h3>
                {classPyqs.map((paper, idx) => (
                  <div key={idx} className="app-pyq-card" style={{ backgroundColor: colors.card, padding: '18px', borderRadius: '12px', border: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ backgroundColor: '#ff9d0022', color: colors.accent, border: `1px solid ${colors.accent}`, padding: '3px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>
                        {paper.year}
                      </span>
                      <h4 style={{ margin: '8px 0 4px 0', color: colors.text, fontSize: '15px' }}>{paper.title}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: colors.textSecondary }}>Marks: {paper.marks} | Duration: {paper.time}</p>
                    </div>
                    <a href={paper.downloadUrl} target="_blank" rel="noopener noreferrer" className="app-pyq-btn" style={{ backgroundColor: colors.success, color: '#000', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '13px', display: 'inline-block' }}>
                      📥 Download PDF
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DEDICATED ROUTE: PROFILE */}
        {currentPage === 'profile' && (
          <div style={{ backgroundColor: colors.card, padding: '24px', borderRadius: '14px', border: `1px solid ${colors.accent}` }}>
            <h2>👤 Student Profile</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <span style={{ fontSize: '56px' }}>{profilePic}</span>
              <button onClick={() => setProfilePic(profilePic === '🎓' ? '👨‍🎓' : '🎓')} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: colors.accent, color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                Change Avatar
              </button>
            </div>
            <p><strong>Name:</strong> {firstName} {lastName}</p>
            <p><strong>Enrolled Class:</strong> Class {userClass}</p>
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>Live Database XP:</strong> {userXp} XP</p>
            <p><strong>Streak:</strong> {streakDays} Days 🔥</p>
            <button onClick={() => setCurrentPage('dashboard')} style={{ ...styles.backBtn, backgroundColor: colors.inputBg, color: colors.accent, marginTop: '14px' }}>← Return to Dashboard</button>
          </div>
        )}

        {/* DEDICATED ROUTE: LEADERBOARD */}
        {currentPage === 'leaderboard' && (
          <div>
            <button onClick={() => setCurrentPage('dashboard')} style={{ ...styles.backBtn, backgroundColor: colors.inputBg, color: colors.accent }}>← Return to Dashboard</button>
            <Leaderboard currentUserEmail={session.user.email} currentXp={userXp} currentClass={userClass} />
          </div>
        )}

        {/* DEDICATED ROUTE: MINI GAMES */}
        {currentPage === 'minigames' && (
          <div>
            <button onClick={() => setCurrentPage('dashboard')} style={{ ...styles.backBtn, backgroundColor: colors.inputBg, color: colors.accent }}>← Return to Dashboard</button>
            <MiniGame initialGameMode={selectedMiniGameMode} onGameComplete={handleAwardXp} />
          </div>
        )}

        {/* DEDICATED ROUTE: HOMEWORK TRACKER */}
        {currentPage === 'homework' && (
          <div style={{ backgroundColor: colors.card, padding: '24px', borderRadius: '14px', border: `1px solid ${colors.accent}` }}>
            <button onClick={() => setCurrentPage('dashboard')} style={{ ...styles.backBtn, backgroundColor: colors.inputBg, color: colors.accent }}>← Return to Dashboard</button>
            <h2 style={{ color: colors.accent }}>📝 Homework & Assignment Tracker</h2>

            <form onSubmit={handleAddHomework} style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0' }}>
              <input
                type="text"
                placeholder="Assignment details..."
                value={newHomeworkTitle}
                onChange={(e) => setNewHomeworkTitle(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.inputBg, color: colors.text, fontSize: '13px', boxSizing: 'border-box' }}
                required
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={newHomeworkSubject}
                  onChange={(e) => setNewHomeworkSubject(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.inputBg, color: colors.text, fontSize: '13px' }}
                >
                  {availableSubjects.map((sub, idx) => (
                    <option key={idx} value={sub}>{sub}</option>
                  ))}
                </select>
                <button type="submit" style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', backgroundColor: colors.success, color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>+ Add Task</button>
              </div>
            </form>

            {homeworkLoading ? (
              <p>Loading database homework...</p>
            ) : homeworkList.length === 0 ? (
              <p style={{ color: colors.textSecondary }}>🎉 No pending homework! You are all caught up.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {homeworkList.map((hw) => (
                  <div key={hw.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: colors.inputBg, borderRadius: '8px', borderLeft: `5px solid ${hw.completed ? colors.success : colors.accent}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="checkbox"
                        checked={hw.completed}
                        onChange={() => handleToggleHomework(hw.id, hw.completed)}
                      />
                      <div>
                        <span style={{ fontSize: '12px', color: colors.accent, fontWeight: 'bold' }}>{hw.subject}</span>
                        <p style={{ margin: 0, textDecoration: hw.completed ? 'line-through' : 'none', color: hw.completed ? colors.textSecondary : colors.text, fontSize: '13px' }}>{hw.title}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteHomework(hw.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>🗑</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DEDICATED ROUTE: BADGES */}
        {currentPage === 'badges' && (
          <div style={{ backgroundColor: colors.card, padding: '24px', borderRadius: '14px', border: `1px solid ${colors.accent}` }}>
            <h2>🏅 My Achieved Badges</h2>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
              <div style={{ backgroundColor: colors.inputBg, padding: '14px 20px', borderRadius: '10px', border: `1px solid ${colors.success}`, color: colors.success, fontWeight: 'bold', fontSize: '14px' }}>🥇 State Board Scholar (Class {userClass})</div>
              <div style={{ backgroundColor: colors.inputBg, padding: '14px 20px', borderRadius: '10px', border: `1px solid ${colors.success}`, color: colors.success, fontWeight: 'bold', fontSize: '14px' }}>🔥 5-Day Streak Master</div>
            </div>
            <button onClick={() => setCurrentPage('dashboard')} style={{ ...styles.backBtn, backgroundColor: colors.inputBg, color: colors.accent, marginTop: '20px' }}>← Return to Dashboard</button>
          </div>
        )}

        {/* DEDICATED ROUTE: SETTINGS */}
        {currentPage === 'settings' && (
          <div style={{ backgroundColor: colors.card, padding: '24px', borderRadius: '14px', border: `1px solid ${colors.accent}` }}>
            <h2>⚙️ Platform Settings</h2>
            <div style={{ margin: '20px 0' }}>
              <label style={{ display: 'block', color: colors.accent, marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Theme Mode:</label>
              <select value={theme} onChange={(e) => setTheme(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.inputBg, color: colors.text, width: '100%', maxWidth: '250px' }}>
                <option value="dark">Dark Theme (Default)</option>
                <option value="light">Light Theme</option>
              </select>
            </div>

            <div style={{ margin: '20px 0' }}>
              <label style={{ display: 'block', color: colors.accent, marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Instruction Language:</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.inputBg, color: colors.text, width: '100%', maxWidth: '250px' }}>
                <option value="English">English</option>
                <option value="Marathi">Marathi / Semi-English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
            <button onClick={() => setCurrentPage('dashboard')} style={{ ...styles.backBtn, backgroundColor: colors.inputBg, color: colors.accent }}>← Return to Dashboard</button>
          </div>
        )}
      </main>

      {/* Floating Doubt Assistant Chatbot */}
      <AiChatbot userClass={userClass} />
    </div>
  );
}

const styles = {
  menuItem: { padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', width: '100%' },
  backBtn: { padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' },
  tab: { padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px' },
  activeTab: { padding: '10px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#ff9d00', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }
};