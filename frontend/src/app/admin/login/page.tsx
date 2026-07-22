"use client";

import { useState } from 'react';
import { loginAdmin } from '@/app/actions';
import { useRouter } from 'next/navigation';
import './login.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const result: any = await loginAdmin(formData);

    if (result.success) {
      if (result.mustChangePassword) {
        // Redirect to change password page
        window.location.href = '/admin/change-password';
      } else {
        // Redirect to admin dashboard
        window.location.href = '/admin';
      }
    } else {
      setError(result.error || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <section className="login-section">
      <div className="login-container">
        <div className="logo-circle">
          <img src="/profile.jpeg" alt="Admin Logo" />
        </div>
        
        <h2>Admin Login</h2>
        <p className="subtitle">Access the management panel</p>
        
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
              placeholder="admin@example.com" 
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
          </div>
          
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </section>
  );
}