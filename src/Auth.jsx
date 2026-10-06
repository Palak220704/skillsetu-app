import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function Auth({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentClass, setStudentClass] = useState('8');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // CAPTCHA State
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userCaptcha, setUserCaptcha] = useState('');
  const [isHumanVerified, setIsHumanVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Generate random CAPTCHA equation
  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    setNum1(n1);
    setNum2(n2);
    setUserCaptcha('');
    setIsHumanVerified(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, [isSignUp]);

  const handleVerifyCaptcha = () => {
    if (parseInt(userCaptcha, 10) === num1 + num2) {
      setIsHumanVerified(true);
      setMessage('✅ Human verification successful!');
    } else {
      setIsHumanVerified(false);
      setMessage('❌ Incorrect CAPTCHA answer. Please try again.');
      generateCaptcha();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!isHumanVerified) {
      setMessage('⚠️ Please verify you are not a robot before proceeding.');
      return;
    }

    setLoading(true);

    if (isSignUp) {
      if (password !== confirmPassword) {
        setMessage('❌ Passwords do not match.');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setMessage('❌ Password must be at least 6 characters.');
        setLoading(false);
        return;
      }

      // Sign up with Supabase and store first name, last name, & class grade
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            student_class: studentClass
          }
        }
      });

      if (error) {
        setMessage(`❌ ${error.message}`);
      } else {
        setMessage('🎉 Account created successfully! Logging you in...');
        if (data?.session && onLoginSuccess) {
          onLoginSuccess(data.session);
        }
      }
    } else {
      // Existing User Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setMessage(`❌ ${error.message}`);
      } else {
        if (data?.session && onLoginSuccess) {
          onLoginSuccess(data.session);
        }
      }
    }

    setLoading(false);
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.authBox}>
        <div style={styles.brandingHeader}>
          <h1 style={styles.logo}>🏫 SkillSetu</h1>
          <p style={styles.tagline}>NCERT AI Gamified Campus — Student Portal</p>
        </div>

        <h3 style={styles.formTitle}>
          {isSignUp ? '📝 Create Student Account' : '🔐 Student Login'}
        </h3>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Sign Up Fields: First Name, Last Name & Class */}
          {isSignUp && (
            <>
              <div style={styles.rowGroup}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Rahul"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Sharma"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              {/* Class Selection */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Class / Grade</label>
                <select
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  style={styles.select}
                  required
                >
                  <option value="6">Class 6</option>
                  <option value="7">Class 7</option>
                  <option value="8">Class 8</option>
                  <option value="9">Class 9</option>
                  <option value="10">Class 10</option>
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                </select>
              </div>
            </>
          )}

          {/* Email Field */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@school.com"
              style={styles.input}
              required
            />
          </div>

          {/* Password Field */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>

          {/* Confirm Password (Only for Sign Up) */}
          {isSignUp && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                required
              />
            </div>
          )}

          {/* CAPTCHA Robot Verification */}
          <div style={styles.captchaBox}>
            <div style={styles.captchaHeader}>
              <input
                type="checkbox"
                checked={isHumanVerified}
                readOnly
                style={styles.checkbox}
              />
              <span style={styles.captchaText}>I am not a robot 🤖</span>
            </div>

            {!isHumanVerified ? (
              <div style={styles.captchaChallenge}>
                <p style={styles.challengeQuestion}>
                  Solve math puzzle: <strong>{num1} + {num2} = ?</strong>
                </p>
                <div style={styles.captchaInputGroup}>
                  <input
                    type="number"
                    value={userCaptcha}
                    onChange={(e) => setUserCaptcha(e.target.value)}
                    placeholder="Answer"
                    style={styles.captchaInput}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCaptcha}
                    style={styles.verifyBtn}
                  >
                    Verify
                  </button>
                </div>
              </div>
            ) : (
              <p style={styles.verifiedText}>✓ Human Verification Complete</p>
            )}
          </div>

          {message && <p style={styles.message}>{message}</p>}

          <button
            type="submit"
            disabled={loading || !isHumanVerified}
            style={isHumanVerified ? styles.authButton : styles.authButtonDisabled}
          >
            {loading
              ? 'Processing...'
              : isSignUp
              ? 'Create Account'
              : 'Enter Campus Floor'}
          </button>
        </form>

        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setMessage('');
          }}
          style={styles.toggleButton}
        >
          {isSignUp
            ? 'Already have an account? Log in here'
            : "Don't have an account? Create one here"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  authContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06110d',
    fontFamily: 'sans-serif',
    padding: '20px'
  },
  authBox: {
    width: '100%',
    maxWidth: '460px',
    padding: '32px',
    backgroundColor: '#0d1f18',
    borderRadius: '16px',
    border: '2px solid #ff9d00',
    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
    textAlign: 'center'
  },
  brandingHeader: { marginBottom: '20px' },
  logo: { color: '#ff9d00', margin: '0 0 6px 0', fontSize: '32px' },
  tagline: { color: '#22c55e', fontSize: '13px', margin: 0 },
  formTitle: { color: '#ffffff', fontSize: '18px', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  rowGroup: { display: 'flex', gap: '10px' },
  inputGroup: { textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  label: { fontSize: '12px', color: '#ff9d00', fontWeight: 'bold' },
  input: {
    padding: '11px',
    borderRadius: '8px',
    border: '1px solid #1e3a2b',
    backgroundColor: '#132820',
    color: '#fff',
    fontSize: '14px',
    outline: 'none'
  },
  select: {
    padding: '11px',
    borderRadius: '8px',
    border: '1px solid #1e3a2b',
    backgroundColor: '#132820',
    color: '#fff',
    fontSize: '14px',
    outline: 'none'
  },
  captchaBox: {
    backgroundColor: '#132820',
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid #1e3a2b',
    textAlign: 'left',
    marginTop: '6px'
  },
  captchaHeader: { display: 'flex', alignItems: 'center', gap: '10px' },
  checkbox: { width: '18px', height: '18px', cursor: 'pointer' },
  captchaText: { color: '#ffffff', fontSize: '14px', fontWeight: 'bold' },
  captchaChallenge: { marginTop: '10px', borderTop: '1px solid #1e3a2b', paddingTop: '10px' },
  challengeQuestion: { color: '#cbd5e1', fontSize: '13px', margin: '0 0 8px 0' },
  captchaInputGroup: { display: 'flex', gap: '8px' },
  captchaInput: {
    width: '80px',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #1e3a2b',
    backgroundColor: '#0d1f18',
    color: '#fff',
    fontSize: '14px'
  },
  verifyBtn: {
    padding: '8px 14px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#22c55e',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '12px'
  },
  verifiedText: { color: '#22c55e', fontSize: '12px', fontWeight: 'bold', margin: '8px 0 0 0' },
  message: { color: '#ef4444', fontSize: '13px', margin: '6px 0 0 0' },
  authButton: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ff9d00',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '15px',
    marginTop: '10px'
  },
  authButtonDisabled: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#334155',
    color: '#94a3b8',
    fontWeight: 'bold',
    cursor: 'not-allowed',
    fontSize: '15px',
    marginTop: '10px'
  },
  toggleButton: {
    marginTop: '20px',
    background: 'none',
    border: 'none',
    color: '#ff9d00',
    cursor: 'pointer',
    fontSize: '13px',
    textDecoration: 'underline'
  }
};