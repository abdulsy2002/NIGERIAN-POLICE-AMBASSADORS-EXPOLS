"use client";

import './reunion.css';
import Link from 'next/link';
import { useState, useEffect, FormEvent } from 'react';
import { submitReunionRegistration, getReunionSettings } from '@/app/actions';
import { useRouter } from 'next/navigation';

import Script from 'next/script';
export default function ReunionPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<any>(null);
  const [typingText, setTypingText] = useState("");
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [formDataObj, setFormDataObj] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const result = await getReunionSettings();
      if (result.success && result.data) {
        setSettings(result.data);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      let i = 0;
      const fullText = settings.heroTitle;
      const timer = setInterval(() => {
        if (i < fullText.length) {
          setTypingText(fullText.substring(0, i + 1));
          i++;
        } else {
          clearInterval(timer);
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, [settings]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/check-auth');
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(true);
          setUserName(data.user?.fullName || '');
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
      setCheckingAuth(false);
    };
    checkAuth();
  }, []);

  const getAmountToPay = () => {
    if (!settings) return 20000;
    // Simple logic: if before Oct 31, 2026, use early bird
    const now = new Date();
    const cutoff = new Date('2026-10-31');
    const priceStr = now < cutoff ? settings.earlyBirdPrice : settings.regularPrice;
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''));
    return isNaN(num) ? 20000 : num;
  };

  const handlePaymentSuccess = async (reference: any) => {
    const formData = new FormData();
    Object.keys(formDataObj).forEach(key => formData.append(key, formDataObj[key]));
    formData.append('paymentReference', reference.reference);
    formData.append('amountPaid', getAmountToPay().toString());

    const result = await submitReunionRegistration(formData);

    if (result.success) {
      setFormStatus('success');
      setTimeout(() => setFormStatus('idle'), 4000);
    } else {
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 4000);
    }
  };

  const handlePaymentClose = () => {
    setFormStatus('idle');
    alert("Payment cancelled.");
  };

  const triggerPaystack = () => {
    const paystackConfig = {
      reference: (new Date()).getTime().toString(),
      email: formDataObj?.email || 'user@example.com',
      amount: getAmountToPay() * 100,
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder',
    };

    if (paystackConfig.publicKey === 'pk_test_placeholder') {
      console.warn("Paystack Public Key not found. Submitting as pending payment.");
      handlePaymentSuccess({ reference: 'offline_' + paystackConfig.reference });
      return;
    }

    if (typeof window !== 'undefined' && (window as any).PaystackPop) {
      const handler = (window as any).PaystackPop.setup({
        key: paystackConfig.publicKey,
        email: paystackConfig.email,
        amount: paystackConfig.amount,
        ref: paystackConfig.reference,
        callback: function(response: any){
          handlePaymentSuccess(response);
        },
        onClose: function(){
          handlePaymentClose();
        }
      });
      handler.openIframe();
    } else {
      alert("Payment gateway could not be loaded. Please try again later.");
      setFormStatus('idle');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      alert('Please login first to register for the reunion!');
      router.push('/login?redirect=/reunion#register');
      return;
    }

    setFormStatus('loading');
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const obj: any = {};
    formData.forEach((value, key) => obj[key] = value);
    setFormDataObj(obj);

    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
       console.warn("Paystack Public Key not found. Submitting as pending payment.");
       const result = await submitReunionRegistration(formData);
       if (result.success) {
         setFormStatus('success');
         form.reset();
         setTimeout(() => setFormStatus('idle'), 4000);
       } else {
         setFormStatus('error');
         setTimeout(() => setFormStatus('idle'), 4000);
       }
       return;
    }

    // Delay initialization slightly to allow state to update email
    setTimeout(() => {
       triggerPaystack();
    }, 100);
  };

  if (!settings) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
          <p>Loading reunion details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      {/* Hero Section */}
      <section className="hero-reunion">
        <div className="container">
          <div className="hero-content">
            <span className="badge">{settings.heroBadge}</span>
            <h1 id="reunion-typing">
              {typingText} <span className="animate-pulse">|</span>
            </h1>
            <p id="reunion-description">{settings.heroDescription}</p>
            <div className="hero-buttons">
              <a href="#register" className="btn btn-primary">Reserve Your Spot</a>
              <a href="#schedule" className="btn btn-outline">View Schedule</a>
            </div>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>{settings.eventTitle}</h2>
            <p>{settings.eventSubtitle}</p>
          </div>
          <div className="details-grid">
            <div className="detail-card"><i>📅</i><h3>Date</h3><p>{settings.eventDate}</p></div>
            <div className="detail-card"><i>📍</i><h3>Venue</h3><p style={{ whiteSpace: 'pre-line' }}>{settings.eventVenue}</p></div>
            <div className="detail-card"><i>⏰</i><h3>Time</h3><p>{settings.eventTime}</p></div>
            <div className="detail-card"><i>👥</i><h3>Expected Attendance</h3><p>{settings.expectedAttendance}</p></div>
          </div>
          <div className="cta-box">
            <h3>{settings.earlyBirdTitle}</h3>
            <p>{settings.earlyBirdDescription}</p>
            <a href="#register" className="btn btn-primary">Register Now - Early Bird Discount!</a>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="section" id="schedule" style={{background: 'var(--primary)', color: 'white'}}>
        <div className="container">
          <div className="section-header">
            <h2 style={{color: 'white'}}>{settings.scheduleTitle}</h2>
            <p style={{color: 'rgba(255,255,255,0.8)'}}>{settings.scheduleSubtitle}</p>
          </div>
          <div className="schedule-grid">
            <div className="schedule-day">
              <h3>Friday <span>{settings.scheduleFriday.date}</span></h3>
              {settings.scheduleFriday.items.map((item: any, idx: number) => (
                <div key={idx} className="schedule-item">
                  <div className="time">{item.time}</div>
                  <div className="info"><h4>{item.title}</h4><p>{item.description}</p></div>
                </div>
              ))}
            </div>
            <div className="schedule-day">
              <h3>Saturday <span>{settings.scheduleSaturday.date}</span></h3>
              {settings.scheduleSaturday.items.map((item: any, idx: number) => (
                <div key={idx} className="schedule-item">
                  <div className="time">{item.time}</div>
                  <div className="info"><h4>{item.title}</h4><p>{item.description}</p></div>
                </div>
              ))}
            </div>
            <div className="schedule-day">
              <h3>Sunday <span>{settings.scheduleSunday.date}</span></h3>
              {settings.scheduleSunday.items.map((item: any, idx: number) => (
                <div key={idx} className="schedule-item">
                  <div className="time">{item.time}</div>
                  <div className="info"><h4>{item.title}</h4><p>{item.description}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section className="section" id="register">
        <div className="container">
          <div className="register-container">
            <div className="register-info">
              <h2>Secure Your Spot Today</h2>
              <p>Early bird registration ends October 31. Limited seats available.</p>
              <div className="price-box">
                <div className="price">
                  <span className="amount">{settings.earlyBirdPrice}</span>
                  <span className="label">{settings.earlyBirdLabel}</span>
                </div>
                <div className="price">
                  <span className="amount">{settings.regularPrice}</span>
                  <span className="label">{settings.regularLabel}</span>
                </div>
              </div>
              <p className="secure-note">{settings.secureNote}</p>
            </div>

            <div className="register-form">
              <h3>Register for Reunion</h3>
              
              {!checkingAuth && !isLoggedIn && (
                <div style={{ background: '#fef3c7', border: '2px solid #fcd34d', color: '#92400e', padding: '20px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔒</div>
                  <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '10px' }}>Login Required</strong>
                  <p style={{ margin: '0 0 15px 0', fontSize: '0.95rem' }}>You must be logged in to register for the reunion.</p>
                  <Link href="/login?redirect=/reunion#register" className="btn btn-primary" style={{ display: 'inline-block', padding: '12px 30px', textDecoration: 'none' }}>Login to Register</Link>
                </div>
              )}

              {!checkingAuth && isLoggedIn && userName && (
                <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                  <strong>Welcome back, {userName}!</strong> Fill out the form below to complete your registration.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="fullName" placeholder="Your full name" required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" placeholder="your.email@example.com" required onChange={(e) => setFormDataObj({...formDataObj, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" placeholder="+234 XXX XXX XXXX" required />
                </div>
                <div className="form-group">
                  <label>School Attended</label>
                  <select name="school" required>
                    <option value="">Select your school</option>
                    <option>Police Secondary School, Kano</option>
                    <option>Police Secondary School, Kaduna</option>
                    <option>Police Secondary School, Lagos</option>
                    <option>Police Secondary School, Abeokuta</option>
                    <option>Police Secondary School, Ibadan</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Year of Graduation</label>
                  <input type="number" name="graduationYear" placeholder="e.g., 2010" required />
                </div>
                <div className="form-group">
                  <label>Attendance Type</label>
                  <select name="attendanceType" required>
                    <option value="">Select option</option>
                    <option>In-Person (Kano)</option>
                    <option>Virtual Attendance</option>
                  </select>
                </div>
                
                <button type="submit" className="btn btn-primary btn-block" disabled={formStatus === 'loading' || !isLoggedIn || checkingAuth} style={{ opacity: (formStatus === 'loading' || !isLoggedIn || checkingAuth) ? 0.5 : 1, cursor: (formStatus === 'loading' || !isLoggedIn || checkingAuth) ? 'not-allowed' : 'pointer' }}>
                  {checkingAuth ? 'Checking...' : !isLoggedIn ? '🔒 Login Required' : formStatus === 'loading' ? 'Processing Payment...' : formStatus === 'success' ? '✅ Paid & Registered Successfully!' : formStatus === 'error' ? '❌ Failed to Register' : `Pay ₦${getAmountToPay().toLocaleString()} & Register`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section" style={{background: 'var(--white)'}}>
        <div className="container">
          <div className="section-header">
            <h2>{settings.faqTitle}</h2>
            <p>{settings.faqSubtitle}</p>
          </div>
          <div className="faq-grid">
            {settings.faqs.map((faq: any, idx: number) => (
              <div key={idx} className="faq-item">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}