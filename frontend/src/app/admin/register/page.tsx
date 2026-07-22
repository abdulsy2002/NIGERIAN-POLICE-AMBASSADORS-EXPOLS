// src/app/admin/register/page.tsx
import Link from 'next/link';
import './register.css';
export default function AdminRegisterPage() {
  return (
    <div className="admin-auth-wrapper">
      <div className="admin-auth-card">
        <div className="logo-circle">
  <img src="/profile.jpeg" alt="EX-POLS Logo" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
</div>
        <h2>Create Admin Account</h2>
        <p className="subtitle">Join EX-POLS Kano Base Admin Team</p>
        
        <form className="admin-form">
          <div>
            <label>Full Name</label>
            <input type="text" placeholder="Enter your full name" required />
          </div>
          <div>
            <label>Admin Email</label>
            <input type="email" placeholder="admin@expols-kano.org" required />
          </div>
          <div>
            <label>Phone Number</label>
            <input type="tel" placeholder="+234 XXX XXX XXXX" required />
          </div>
          <div>
            <label>Password</label>
            <input type="password" placeholder="Create a strong password" required />
          </div>
          <div>
            <label>Confirm Password</label>
            <input type="password" placeholder="Confirm your password" required />
          </div>
          <button type="submit">Create Admin Account</button>
        </form>
        
        <p className="auth-link">
          Already have an account? <Link href="/admin/login">Login</Link>
        </p>
      </div>
    </div>
  );
}