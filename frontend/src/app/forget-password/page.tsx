"use client";

import { useState } from 'react';
import { forgotPassword } from '@/app/actions';
import Link from 'next/link';
import './login.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('email', email);

    const result: any = await forgotPassword(formData);

    if (result.success) {
      setMessage(result.message);
      setIsSuccess(true);
    } else {
      setMessage(result.error || 'Failed to process request.');
      setIsSuccess(false);
    }

    setLoading(false);
  };

  return (
    <section className="login-section">
      <div className="login-container">
        <div className="logo-circle">
          <img src="/profile.jpeg" alt="NPAE Logo" />
        </div>
        
        <h2>Forgot Password</h2>
        <p className="subtitle">Enter your email to receive a password reset link</p>
        
        {message && (
          <div style={{
            background: isSuccess ? '#d1fae5' : '#fee2e2',
            color: isSuccess ? '#065f46' : '#991b1b',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            {message}
          </div>
        )}
        
        {!isSuccess ? (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com" 
                required 
              />
            </div>
            
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#065f46', marginBottom: '20px' }}>
              ✅ Check your email for the reset link
            </p>
          </div>
        )}
        
        <p className="link-text">
          Remember your password? <Link href="/login">Back to Login</Link>
        </p>
      </div>
    </section>
  );
}