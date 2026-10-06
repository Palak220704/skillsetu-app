import React, { useState } from 'react';
import { generateNcertLecture } from './geminiClient';

export default function AiChatbot({ userClass }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: `Hi! I'm your SkillSetu AI Tutor. Ask me anything about Class ${userClass} NCERT topics!` }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setQuery('');
    setLoading(true);

    try {
      // Use Gemini to get an instant answer
      const response = await generateNcertLecture(`Explain concisely for Class ${userClass} student: ${userText}`, 'English', userClass);
      const aiReply = response?.summary || response?.slides?.[0]?.narration || 'I could not process that specific question. Please try asking again!';
      setMessages((prev) => [...prev, { sender: 'ai', text: aiReply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Sorry, I ran into an error getting that answer.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.botWrapper}>
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} style={styles.floatingBtn}>
          💬 AI Doubt Helper
        </button>
      ) : (
        <div style={styles.chatWindow}>
          <div style={styles.chatHeader}>
            <span>🤖 SkillSetu AI Tutor (Class {userClass})</span>
            <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>✖</button>
          </div>

          <div style={styles.messageBox}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={m.sender === 'user' ? styles.userMsg : styles.aiMsg}
              >
                {m.text}
              </div>
            ))}
            {loading && <div style={styles.aiMsg}><i>Thinking...</i></div>}
          </div>

          <form onSubmit={handleSend} style={styles.inputForm}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a doubt..."
              style={styles.input}
            />
            <button type="submit" style={styles.sendBtn}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  botWrapper: { position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 },
  floatingBtn: {
    padding: '12px 20px',
    borderRadius: '25px',
    backgroundColor: '#ff9d00',
    color: '#000',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
  },
  chatWindow: {
    width: '320px',
    height: '420px',
    backgroundColor: '#0d1f18',
    border: '2px solid #ff9d00',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
  },
  chatHeader: {
    backgroundColor: '#132820',
    padding: '12px',
    color: '#ff9d00',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    borderBottom: '1px solid #1e3a2b'
  },
  closeBtn: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer' },
  messageBox: {
    flex: 1,
    padding: '12px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  userMsg: {
    alignSelf: 'flex-end',
    backgroundColor: '#ff9d00',
    color: '#000',
    padding: '8px 12px',
    borderRadius: '12px 12px 0 12px',
    fontSize: '12px',
    maxWidth: '80%'
  },
  aiMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#132820',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '12px 12px 12px 0',
    fontSize: '12px',
    maxWidth: '80%',
    border: '1px solid #1e3a2b'
  },
  inputForm: { display: 'flex', padding: '8px', backgroundColor: '#132820', gap: '6px' },
  input: {
    flex: 1,
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #1e3a2b',
    backgroundColor: '#0d1f18',
    color: '#fff',
    fontSize: '12px'
  },
  sendBtn: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#22c55e',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '12px'
  }
};