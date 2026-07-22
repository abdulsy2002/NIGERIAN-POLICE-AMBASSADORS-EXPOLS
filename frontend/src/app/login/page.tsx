"use client";

import '../login/login.css';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUser } from '@/app/actions';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 👇 FIXED: Changed from '/profile' to '/dashboard'
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const result = await loginUser(formData);

    if (result.success) {
      // 👇 FIXED: Use window.location.href for full page reload
      // This ensures the cookie is sent with the request
      window.location.href = redirectUrl;
    } else {
      setError((result as any).error || (result as any).message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <>
      <section className="login-section">
        <div className="login-container">
          <div className="logo-circle">
            <img src="/profile.jpeg" alt="EX-POLS Logo" />
          </div>
          
          <h2>Welcome Back</h2>
          <p className="subtitle">Login to access your alumni dashboard</p>
          
          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.9rem',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email"
                placeholder="your.email@example.com" 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                name="password"
                placeholder="Enter your password" 
                required 
              />
              
              <Link href="/forgot-password" className="forgot-password-link">
           Forgot Password?
          </Link>
            </div>
            
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <p className="link-text">
            Don't have an account? <Link href="/register">Register</Link>
          </p>
          
          <p className="admin-link">
            <Link href="/admin/login">Admin Login →</Link>
          </p>
        </div>
      </section>
    </>
  );
}