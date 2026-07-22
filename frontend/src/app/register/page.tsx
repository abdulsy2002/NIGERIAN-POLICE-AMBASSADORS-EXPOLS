"use client";

import { useState } from 'react';
import { registerUser } from '@/app/actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './register.css';

export default function RegisterPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'alumni' | 'ambassador'>('alumni');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    stateBase: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const states = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
    "Taraba", "Yobe", "Zamfara"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    const form = new FormData();
    form.append('email', formData.email);
    form.append('password', formData.password);
    form.append('userType', userType);
    form.append('stateBase', formData.stateBase);

    const result: any = await registerUser(form);

    if (result.success) {
      // Redirect to the appropriate profile completion page
      if (userType === 'alumni') {
        router.push('/form');
      } else {
        router.push('/ambassador');
      }
    } else {
      setError(result.error || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <div className="logo-circle">
          <img src="/profile.jpeg" alt="NPAE Logo" />
        </div>
        
        <h2>Join NPAE</h2>
        <p className="subtitle">Nigerian Police Ambassadors Expols</p>

        {/* Role Selector Tabs */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-tab ${userType === 'alumni' ? 'active' : ''}`}
            onClick={() => setUserType('alumni')}
          >
            <span className="role-icon">🎓</span>
            <span className="role-label">Alumni / Expols</span>
            <span className="role-desc">Former Police School Students</span>
          </button>
          <button
            type="button"
            className={`role-tab ${userType === 'ambassador' ? 'active' : ''}`}
            onClick={() => setUserType('ambassador')}
          >
            <span className="role-icon">🌟</span>
            <span className="role-label">Ambassador</span>
            <span className="role-desc">Supporters & Patrons</span>
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>State Base</label>
            <select
              value={formData.stateBase}
              onChange={(e) => setFormData({ ...formData, stateBase: e.target.value })}
              required
            >
              <option value="">-- Select Your State Base --</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <p className="field-hint">
              {userType === 'alumni' 
                ? 'Select the state base where you want to be registered'
                : 'Select the state base you want to represent/serve'}
            </p>
          </div>

          <div className="form-group">
            <label>Create Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Re-enter your password"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="register-btn" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : `Continue as ${userType === 'alumni' ? 'Alumni' : 'Ambassador'}`}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link href="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}