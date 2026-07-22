"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword, verifyResetToken } from '@/app/actions';
import Link from 'next/link';
import './login.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      return;
    }

    const checkToken = async () => {
      const result: any = await verifyResetToken(token);
      setIsValidToken(result.success);
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const form = new FormData();
    form.append('token', token || '');
    form.append('newPassword', formData.newPassword);
    form.append('confirmPassword', formData.confirmPassword);

    const result: any = await resetPassword(form);

    if (result.success) {
      setMessage(result.message);
      setIsSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } else {
      setMessage(result.error || 'Failed to reset password.');
    }

    setLoading(false);
  };

  if (isValidToken === null) {
    return (
      <section className="login-section">
        <div className="login-container">
          <p style={{ textAlign: 'center' }}>Verifying reset link...</p>
        </div>
      </section>
    );
  }

  if (!isValidToken) {
    return (
      <section className="login-section">
        <div className="login-container">
          <div className="logo-circle">
            <img src="/profile.jpeg" alt="NPAE Logo" />
          </div>
          
          <h2>Invalid Reset Link</h2>
          <p className="subtitle">This password reset link is invalid or has expired.</p>
          
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Please request a new password reset link.
          </div>
          
          <p className="link-text">
            <Link href="/forgot-password">Request New Reset Link</Link>
          </p>
          
          <p className="link-text">
            <Link href="/login">Back to Login</Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="login-section">
      <div className="login-container">
        <div className="logo-circle">
          <img src="/profile.jpeg" alt="NPAE Logo" />
        </div>
        
        <h2>Reset Password</h2>
        <p className="subtitle">Create a new password for your account</p>
        
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
              <label>New Password</label>
              <input 
                type="password" 
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Minimum 6 characters" 
                required 
                minLength={6}
              />
            </div>
            
            <div className="form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-enter your password" 
                required 
                minLength={6}
              />
            </div>
            
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#065f46', marginBottom: '20px' }}>
              ✅ Password reset successfully! Redirecting to login...
            </p>
          </div>
        )}
        
        <p className="link-text">
          <Link href="/login">Back to Login</Link>
        </p>
      </div>
    </section>
  );
}