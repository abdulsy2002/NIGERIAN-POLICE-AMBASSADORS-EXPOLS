"use client";

import { useState, useEffect } from 'react';
import { initializePayment, verifyPayment, getPaymentSettings } from '@/app/actions';
import dynamic from 'next/dynamic';
import './payment.css';

const PaystackButton = dynamic(
  () => import('react-paystack').then((mod) => mod.PaystackButton),
  { ssr: false }
);

export default function PaymentPage() {
  const [formData, setFormData] = useState({
    expolIdNumber: '',
    fullName: '',
    email: '',
    phone: '',
    purpose: '',
    customReason: '',
    amount: '',
    notes: ''
  });
  
  const [paymentPurposes, setPaymentPurposes] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [message, setMessage] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    loadPaymentPurposes();
  }, []);

  const loadPaymentPurposes = async () => {
    const result: any = await getPaymentSettings();
    if (result.success) {
      setPaymentPurposes(result.data.purposes);
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'purpose') {
      const selectedPurpose = paymentPurposes.find(p => p.value === value);
      if (selectedPurpose && selectedPurpose.amount > 0) {
        setFormData(prev => ({ ...prev, amount: selectedPurpose.amount.toString() }));
      } else {
        setFormData(prev => ({ ...prev, amount: '' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setMessage('');

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });

    const result: any = await initializePayment(form);

    if (result.success) {
      setPaymentReference(result.data.reference);
      setShowPaymentModal(true);
    } else {
      setMessage('❌ ' + result.error);
    }

    setIsProcessing(false);
  };

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  
  if (!publicKey) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <div className="payment-header">
            <h1>⚠️ Configuration Error</h1>
          </div>
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: '#991b1b', fontSize: '1.1rem' }}>
              Paystack public key is not configured.
            </p>
            <p style={{ color: '#666', marginTop: '10px' }}>
              Please add <code>NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY</code> to your <code>.env.local</code> file.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading payment options...</p>
          </div>
        </div>
      </div>
    );
  }

  const paystackConfig = {
    reference: paymentReference,
    email: formData.email,
    amount: Math.round(parseFloat(formData.amount) * 100),
    publicKey: publicKey,
    text: "Pay Now",
    metadata: {
      custom_fields: [
        { display_name: "Expol ID", variable_name: "expol_id", value: formData.expolIdNumber },
        { display_name: "Purpose", variable_name: "purpose", value: formData.purpose },
        { display_name: "Full Name", variable_name: "full_name", value: formData.fullName }
      ]
    },
    onSuccess: async (reference: any) => {
      try {
        const result: any = await verifyPayment(reference.reference);
        if (result.success) {
          setMessage('✅ Payment successful! Thank you for your payment.');
          setShowPaymentModal(false);
          setFormData({
            expolIdNumber: '',
            fullName: '',
            email: '',
            phone: '',
            purpose: '',
            customReason: '',
            amount: '',
            notes: ''
          });
        } else {
          setMessage('⚠️ Payment completed but verification failed. Please contact support.');
        }
      } catch (error) {
        setMessage('❌ Error verifying payment. Please contact support with reference: ' + reference.reference);
      }
    },
    onClose: () => {
      setMessage('⚠️ Payment window closed. Please try again.');
      setShowPaymentModal(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h1>💳 Make a Payment</h1>
          <p>Secure payment powered by Paystack</p>
        </div>

        {message && (
          <div className={`payment-message ${message.includes('✅') ? 'success' : message.includes('❌') ? 'error' : 'warning'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label>Expol ID Number *</label>
            <input
              type="text"
              name="expolIdNumber"
              value={formData.expolIdNumber}
              onChange={handleInputChange}
              placeholder="e.g., NPAE/KNC/2024/0001"
              required
            />
            <small>Your official NPAE identity number</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="08012345678"
              required
            />
          </div>

          <div className="form-group">
            <label>Payment Purpose *</label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Select Payment Purpose --</option>
              {paymentPurposes.map(purpose => (
                <option key={purpose.value} value={purpose.value}>
                  {purpose.label} {purpose.amount > 0 && `(₦${purpose.amount.toLocaleString()})`}
                </option>
              ))}
            </select>
          </div>

          {formData.purpose === 'other' && (
            <div className="form-group">
              <label>Specify Reason for Payment *</label>
              <textarea
                name="customReason"
                value={formData.customReason}
                onChange={handleInputChange}
                placeholder="Please describe the reason for this payment..."
                rows={3}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Amount (₦) *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              min="100"
              step="100"
              required
              disabled={formData.purpose && paymentPurposes.find(p => p.value === formData.purpose)?.amount! > 0}
            />
            <small>
              {formData.purpose && paymentPurposes.find(p => p.value === formData.purpose)?.amount! > 0 
                ? 'Amount is fixed for this purpose' 
                : 'Minimum amount: ₦100'}
            </small>
          </div>

          <div className="form-group">
            <label>Additional Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional information..."
              rows={2}
            />
          </div>

          <button type="submit" className="payment-submit-btn" disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </form>

        {showPaymentModal && isClient && (
          <div className="payment-modal">
            <div className="modal-content">
              <h3>Complete Your Payment</h3>
              <div className="payment-summary">
                <p><strong>Reference:</strong> {paymentReference}</p>
                <p><strong>Amount:</strong> ₦{parseFloat(formData.amount).toLocaleString()}</p>
                <p><strong>Purpose:</strong> {formData.purpose}</p>
              </div>
              <PaystackButton {...paystackConfig} className="paystack-btn" />
              <button onClick={() => setShowPaymentModal(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}