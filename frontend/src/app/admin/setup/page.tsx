"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFirstAdmin } from '@/app/actions';
import Link from 'next/link';

export default function AdminSetupPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ✅ Client-side validation
  const passwordsMatch = password === confirmPassword;
  const isPasswordStrong = password.length >= 6;
  const isFormValid = fullName && email && passwordsMatch && isPasswordStrong;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    if (!isFormValid) {
      setError('Please fill all fields correctly.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(event.currentTarget);
    const result: any = await createFirstAdmin(formData);

    if (result.success) {
      setSuccess("✅ Super Admin created successfully! Redirecting to login...");
      setTimeout(() => router.push('/admin/login'), 2000);
    } else {
      setError(result.error || 'Failed to create admin.');
      setIsLoading(false);
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease',
    background: '#f9fafb',
    boxSizing: 'border-box' as const,
    fontFamily: 'Poppins, sans-serif'
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #003366 0%, #001a33 100%)',
      padding: '20px',
      fontFamily: 'Poppins, sans-serif'
    }}>
      <div style={{
        background: '#ffffff',
        padding: '40px 35px',
        borderRadius: '20px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '450px',
        textAlign: 'center',
        animation: 'fadeIn 0.6s ease-out'
      }}>
        {/* Header */}
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🛡️</div>
        <h2 style={{ color: '#003366', marginBottom: '10px', fontSize: '1.8rem' }}>Initial Admin Setup</h2>
        <p style={{ color: '#dc2626', fontSize: '0.9rem', fontWeight: 600, marginBottom: '25px' }}>
          Create the First Super Admin Account
        </p>
        
        {/* Security Warning */}
        <div style={{ 
          color: '#92400e', 
          fontSize: '0.85rem', 
          marginBottom: '25px', 
          background: '#fef3c7', 
          padding: '12px', 
          borderRadius: '8px',
          borderLeft: '4px solid #f59e0b',
          textAlign: 'left'
        }}>
          <strong>⚠️ Security Notice:</strong> This page will automatically disable itself once the first admin is created. Only one Super Admin can exist initially.
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#991b1b', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px', 
            fontSize: '0.9rem',
            borderLeft: '4px solid #dc2626',
            textAlign: 'left'
          }}>
            ❌ {error}
          </div>
        )}
        
        {/* Success Message */}
        {success && (
          <div style={{ 
            background: '#dcfce7', 
            color: '#166534', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px', 
            fontSize: '0.9rem',
            borderLeft: '4px solid #16a34a',
            textAlign: 'left'
          }}>
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          {/* ✅ NEW: Full Name Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
              Full Name
            </label>
            <input 
              type="text" 
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., John Doe" 
              required 
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#003366';
                e.target.style.background = '#ffffff';
                e.target.style.boxShadow = '0 0 0 4px rgba(0, 51, 102, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.background = '#f9fafb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Email Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
              Admin Email
            </label>
            <input 
              type="email" 
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="superadmin@npae.org.ng" 
              required 
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#003366';
                e.target.style.background = '#ffffff';
                e.target.style.boxShadow = '0 0 0 4px rgba(0, 51, 102, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.background = '#f9fafb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          {/* Password Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
              Create Password
            </label>
            <input 
              type="password" 
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required 
              minLength={6}
              style={{
                ...inputStyle,
                border: `1px solid ${password.length > 0 && !isPasswordStrong ? '#dc2626' : '#d1d5db'}`
              }}
              onFocus={(e) => {
                e.target.style.background = '#ffffff';
                e.target.style.boxShadow = '0 0 0 4px rgba(0, 51, 102, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.background = '#f9fafb';
                e.target.style.boxShadow = 'none';
              }}
            />
            {password.length > 0 && !isPasswordStrong && (
              <p style={{ color: '#dc2626', fontSize: '0.8rem', margin: '5px 0 0 0' }}>
                ⚠️ Password must be at least 6 characters
              </p>
            )}
            {isPasswordStrong && (
              <p style={{ color: '#16a34a', fontSize: '0.8rem', margin: '5px 0 0 0' }}>
                ✓ Password strength: Good
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
              Confirm Password
            </label>
            <input 
              type="password" 
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required 
              minLength={6}
              style={{
                ...inputStyle,
                border: `1px solid ${confirmPassword.length > 0 && !passwordsMatch ? '#dc2626' : passwordsMatch ? '#16a34a' : '#d1d5db'}`
              }}
              onFocus={(e) => {
                e.target.style.background = '#ffffff';
                e.target.style.boxShadow = '0 0 0 4px rgba(0, 51, 102, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.background = '#f9fafb';
                e.target.style.boxShadow = 'none';
              }}
            />
            {confirmPassword.length > 0 && (
              <p style={{ 
                color: passwordsMatch ? '#16a34a' : '#dc2626', 
                fontSize: '0.8rem', 
                margin: '5px 0 0 0'
              }}>
                {passwordsMatch ? '✓ Passwords match' : '❌ Passwords do not match'}
              </p>
            )}
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading || !isFormValid}
            style={{
              width: '100%', 
              padding: '14px', 
              background: (!isFormValid || isLoading) ? '#6b7280' : '#003366', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '10px', 
              fontSize: '1rem', 
              fontWeight: 600, 
              cursor: (!isFormValid || isLoading) ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.3s ease',
              marginTop: '10px',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            {isLoading ? 'Creating Admin...' : '🛡️ Create Super Admin'}
          </button>
        </form>
        
        {/* Back Link */}
        <p style={{ marginTop: '25px', fontSize: '0.85rem', color: '#6b7280' }}>
          <Link href="/admin/login" style={{ color: '#003366', textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Admin Login
          </Link>
        </p>

        {/* Info Box */}
        <div style={{ 
          marginTop: '25px', 
          padding: '15px', 
          background: '#f0f9ff', 
          borderRadius: '8px',
          borderLeft: '4px solid #003366',
          textAlign: 'left',
          fontSize: '0.8rem',
          color: '#374151'
        }}>
          <strong>📋 What happens next?</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
            <li>Super Admin account is created with full privileges</li>
            <li>You'll be redirected to login page</li>
            <li>This setup page will be permanently disabled</li>
            <li>You can then create National and State Admins</li>
          </ul>
        </div>
      </div>
    </div>
  );
}