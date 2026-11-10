"use client";

import { useState, useEffect } from 'react';
import { initializePayment, verifyPayment, getPaymentSettings } from '@/app/actions';
import { STATE_BASE_OPTIONS } from '@/lib/stateBaseCodes';
import dynamic from 'next/dynamic';
import './payment.css';

interface PaymentReceiptData {
  stateBaseCode: string;
  expolIdNumber: string;
  fullName: string;
  email: string;
  phone: string;
  purpose: string;
  customReason: string | null;
  amount: number;
  currency: string;
  paystackReference: string;
  paystackTransactionId: string;
  paymentDate: string;
  status: string;
}

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
    notes: '',
    stateBaseCode: 'NAT'
  });
  
  const [paymentPurposes, setPaymentPurposes] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [message, setMessage] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settingsError, setSettingsError] = useState('');
  const [chapterLocked, setChapterLocked] = useState(false);
  const [receipt, setReceipt] = useState<PaymentReceiptData | null>(null);

  useEffect(() => {
    setIsClient(true);
    fetch('/api/check-auth').then(async (response) => {
      if (!response.ok) return loadPaymentPurposes();
      const session = await response.json();
      const code = session.user?.stateBaseCode;
      if (!code) return loadPaymentPurposes();
      setChapterLocked(true);
      setFormData((current) => ({ ...current, stateBaseCode: code }));
      loadPaymentPurposes(code);
    }).catch(() => loadPaymentPurposes());
  }, []);

  const loadPaymentPurposes = async (stateBaseCode = 'NAT') => {
    try {
      const result: any = await getPaymentSettings(stateBaseCode);
      if (result.success && Array.isArray(result.data?.purposes)) {
        setPaymentPurposes(result.data.purposes.filter((purpose: any) => purpose.enabled));
      } else {
        setSettingsError(result.error || 'Unable to load payment options. Please try again later.');
      }
    } catch {
      setSettingsError('Unable to load payment options. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'stateBaseCode') {
      setPaymentPurposes([]);
      setSettingsError('');
      setFormData((prev) => ({ ...prev, stateBaseCode: value, purpose: '', amount: '' }));
      loadPaymentPurposes(value);
    }
    
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

    try {
      const result: any = await initializePayment(form);
      if (result.success) {
        setReceipt(null);
        setPaymentReference(result.data.reference);
        setShowPaymentModal(true);
      } else {
        setMessage('❌ ' + (result.error || result.message || 'Unable to initialize payment.'));
      }
    } catch {
      setMessage('❌ Unable to initialize payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  const fixedPaymentPurposes = paymentPurposes.filter(purpose => purpose.amount > 0);
  const fixedAmount = formData.purpose ? paymentPurposes.find(p => p.value === formData.purpose)?.amount ?? 0 : 0;

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

  if (receipt) {
    const receiptPurpose = paymentPurposes.find((purpose) => purpose.value === receipt.purpose);
    const receiptDate = new Date(receipt.paymentDate);

    return (
      <main className="payment-page receipt-page">
        <section className="payment-container payment-receipt" aria-labelledby="receipt-title">
          <div className="payment-header receipt-header">
            <h1 id="receipt-title">Payment receipt</h1>
            <p>EX-POLS Kano · Payment confirmed</p>
          </div>
          <div className="receipt-body">
            <p className="receipt-confirmed" role="status">Payment confirmed successfully</p>
            <p className="receipt-amount">
              {new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: receipt.currency,
                maximumFractionDigits: 2,
              }).format(receipt.amount)}
            </p>
            <dl className="receipt-details">
              <div><dt>Receipt reference</dt><dd>{receipt.paystackReference}</dd></div>
              <div><dt>Transaction ID</dt><dd>{receipt.paystackTransactionId}</dd></div>
              <div><dt>Payment date</dt><dd>{Number.isNaN(receiptDate.getTime()) ? '—' : receiptDate.toLocaleString('en-NG')}</dd></div>
              <div><dt>Paid by</dt><dd>{receipt.fullName}</dd></div>
              <div><dt>EX-POLS ID</dt><dd>{receipt.expolIdNumber}</dd></div>
              <div><dt>Chapter</dt><dd>{STATE_BASE_OPTIONS.find((base) => base.code === receipt.stateBaseCode)?.name || receipt.stateBaseCode}</dd></div>
              <div><dt>Email</dt><dd>{receipt.email}</dd></div>
              <div><dt>Phone</dt><dd>{receipt.phone}</dd></div>
              <div><dt>Purpose</dt><dd>{receipt.customReason || receiptPurpose?.label || receipt.purpose}</dd></div>
              <div><dt>Status</dt><dd className="receipt-status">{receipt.status.toUpperCase()}</dd></div>
            </dl>
            <div className="receipt-actions">
              <button type="button" className="payment-submit-btn" onClick={() => window.print()}>
                Print / Save receipt
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setReceipt(null);
                  setMessage('');
                  setPaymentReference('');
                }}
              >
                Make another payment
              </button>
            </div>
          </div>
        </section>
      </main>
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
        if (result.success && result.receipt?.status === 'success') {
          setReceipt(result.receipt);
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
            notes: '',
            stateBaseCode: formData.stateBaseCode
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
          {settingsError && (
            <div className="payment-message error" role="alert">{settingsError}</div>
          )}
          <div className="form-group">
            <label htmlFor="payment-state-base">Chapter *</label>
            <select id="payment-state-base" name="stateBaseCode" value={formData.stateBaseCode} onChange={handleInputChange} disabled={chapterLocked} required>
              {STATE_BASE_OPTIONS.map(({ name, code }) => <option key={code} value={code}>{name}</option>)}
            </select>
            {chapterLocked && <input type="hidden" name="stateBaseCode" value={formData.stateBaseCode} />}
          </div>
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
            {paymentPurposes.length === 0 && (
              <small role="alert">No payment options are currently available.</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="fixed-payment-amount">Choose a fixed amount</label>
            <select
              id="fixed-payment-amount"
              name="purpose"
              value={fixedAmount > 0 ? formData.purpose : ''}
              onChange={handleInputChange}
              disabled={fixedPaymentPurposes.length === 0}
            >
              <option value="">
                {fixedPaymentPurposes.length > 0
                  ? '-- Select a fixed amount --'
                  : '-- No fixed amounts configured --'}
              </option>
              {fixedPaymentPurposes.map(purpose => (
                <option key={purpose.value} value={purpose.value}>
                  {purpose.label} — ₦{purpose.amount.toLocaleString('en-NG')}
                </option>
              ))}
            </select>
            <small>Fixed amounts and payment purposes are configured by an administrator.</small>
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
              disabled={fixedAmount > 0}
            />
            <small>
              {fixedAmount > 0
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

          <button
            type="submit"
            className="payment-submit-btn"
            disabled={isProcessing || paymentPurposes.length === 0 || Boolean(settingsError)}
          >
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