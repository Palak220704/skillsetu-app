import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function Leaderboard({ currentUserEmail = '', currentXp = 0, currentClass = '12' }) {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveLeaderboard();
  }, [currentClass, currentXp]);

  const fetchLiveLeaderboard = async () => {
    try {
      setLoading(true);

      // Fetch all real registered profiles for the logged-in student's class, sorted by XP descending
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('student_class', currentClass)
        .order('xp', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setRankings(data);
      } else {
        // Fallback row showing current student if no other records exist yet
        setRankings([
          {
            id: 'current_user',
            first_name: 'You',
            email: currentUserEmail,
            student_class: currentClass,
            xp: currentXp,
            streak: 1
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching live leaderboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeTitle = (rank) => {
    if (rank === 1) return '🥇 Gold Scholar';
    if (rank === 2) return '🥈 Silver Scholar';
    if (rank === 3) return '🥉 Bronze Scholar';
    return '⚡ Campus Contender';
  };

  return (
    <div style={{ backgroundColor: '#0d1f18', padding: '24px', borderRadius: '14px', border: '1px solid #ff9d00' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#ff9d00', margin: '0 0 4px 0' }}>🏆 SkillSetu Live Inter-School Campus Leaderboard</h2>
          <p style={{ color: '#cbd5e1', margin: 0, fontSize: '13px' }}>
            Live rankings for Class {currentClass} students registered on SkillSetu
          </p>
        </div>
        <span style={{ backgroundColor: '#22c55e22', color: '#22c55e', border: '1px solid #22c55e', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
          LIVE Class {currentClass} League
        </span>
      </div>

      {loading ? (
        <p style={{ color: '#cbd5e1', textAlign: 'center', padding: '20px' }}>⚡ Querying live student database rankings...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1e3a2b', color: '#ff9d00', fontSize: '13px' }}>
                <th style={{ padding: '12px' }}>Rank</th>
                <th style={{ padding: '12px' }}>Student Name</th>
                <th style={{ padding: '12px' }}>Registered Email</th>
                <th style={{ padding: '12px' }}>Enrolled Class</th>
                <th style={{ padding: '12px' }}>Live XP Score</th>
                <th style={{ padding: '12px' }}>Streak</th>
                <th style={{ padding: '12px' }}>Honor Badge</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((student, idx) => {
                const rank = idx + 1;
                const isCurrentUser = student.email === currentUserEmail;

                return (
                  <tr key={student.id || idx} style={{ borderBottom: '1px solid #1e3a2b', backgroundColor: isCurrentUser ? '#ff9d0022' : 'transparent' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: rank <= 3 ? '#ff9d00' : '#fff' }}>#{rank}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#fff' }}>
                      {student.first_name || 'Student'} {isCurrentUser ? '(You)' : ''}
                    </td>
                    <td style={{ padding: '12px', color: '#cbd5e1', fontSize: '13px' }}>{student.email || 'N/A'}</td>
                    <td style={{ padding: '12px', color: '#22c55e', fontWeight: 'bold', fontSize: '13px' }}>Class {student.student_class || currentClass}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#ff9d00' }}>{student.xp || 0} XP</td>
                    <td style={{ padding: '12px', color: '#cbd5e1', fontSize: '13px' }}>🔥 {student.streak || 1} Days</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ backgroundColor: '#132820', color: '#ff9d00', border: '1px solid #ff9d00', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>
                        {getBadgeTitle(rank)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}