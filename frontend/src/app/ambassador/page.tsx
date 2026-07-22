"use client";
import './ambassador.css';
import { useState, useRef, FormEvent } from 'react';
import { submitAmbassadorRegistration } from '@/app/actions';

export default function AmbassadorPage() {
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const [passportBase64, setPassportBase64] = useState<string>("");
  
  const [docBase64, setDocBase64] = useState<string>("");
  const [docFileName, setDocFileName] = useState<string>("");

  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert Passport to Base64
  const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPassportPreview(reader.result as string);
        setPassportBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert Supporting Document to Base64
  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Form Submission to MongoDB
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('loading');
    setStatusMessage('');

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Append the Base64 strings to FormData
    formData.append("passportPhoto", passportBase64);
    formData.append("supportingDocument", docBase64);

    const result = await submitAmbassadorRegistration(formData);

    if (result.success) {
      setFormStatus('success');
      setStatusMessage(result.message || "Profile completed successfully!");
      form.reset();
      setPassportPreview(null);
      setPassportBase64("");
      setDocBase64("");
      setDocFileName("");
    } else {
      setFormStatus('error');
      setStatusMessage(result.message || "Failed to complete profile.");
    }
  };

  return (
    <div className="ambassador-page-wrapper">
      <div className="ambassador-container">
        <h1>NIGERIAN POLICE AMBASSADORS</h1>
        <p className="subtitle">COMPLETE YOUR AMBASSADOR PROFILE</p>
        
        <form onSubmit={handleSubmit}>
          {/* Passport Upload */}
          <div className="photo-preview-container">
            {passportPreview ? (
              <img id="passportPreview" src={passportPreview} alt="Passport Preview" />
            ) : (
              <div id="passportPreview">Passport</div>
            )}
            <br />
            <label className="upload-btn" htmlFor="passportInput">
              Upload Passport
            </label>
            <input 
              type="file" 
              id="passportInput" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handlePassportChange}
              ref={fileInputRef}
              required
            />
          </div>

          {/* Section 1: Personal Information */}
          <h2>Section 1: Personal Information</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px'}}>
            <div><label>Full Name</label><input type="text" name="fullName" required /></div>
            <div>
              <label>Gender</label>
              <select name="gender" required defaultValue="">
                <option value="" disabled>Select</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div><label>Date of Birth</label><input type="date" name="dateOfBirth" required /></div>
            <div><label>Phone Number</label><input type="tel" name="phoneNumber" required /></div>
            <div><label>Email Address</label><input type="email" name="email" required /></div>
            <div>
              <label>State of Residence</label>
              <select name="state" required defaultValue="">
                <option value="" disabled>Select State</option>
                <option>Abia</option>
                <option>Adamawa</option>
                <option>Akwa Ibom</option>
                <option>Anambra</option>
                <option>Bauchi</option>
                <option>Bayelsa</option>
                <option>Benue</option>
                <option>Borno</option>
                <option>Cross River</option>
                <option>Delta</option>
                <option>Ebonyi</option>
                <option>Edo</option>
                <option>Ekiti</option>
                <option>Enugu</option>
                <option>FCT - Abuja</option>
                <option>Gombe</option>
                <option>Imo</option>
                <option>Jigawa</option>
                <option>Kaduna</option>
                <option>Kano</option>
                <option>Katsina</option>
                <option>Kebbi</option>
                <option>Kogi</option>
                <option>Kwara</option>
                <option>Lagos</option>
                <option>Nasarawa</option>
                <option>Niger</option>
                <option>Ogun</option>
                <option>Ondo</option>
                <option>Osun</option>
                <option>Oyo</option>
                <option>Plateau</option>
                <option>Rivers</option>
                <option>Sokoto</option>
                <option>Taraba</option>
                <option>Yobe</option>
                <option>Zamfara</option>
                <option>Diaspora</option>
              </select>
            </div>
          </div>
          <div style={{marginTop: '18px'}}>
            <label>Residential Address</label>
            <textarea name="residentialAddress" rows={3} required></textarea>
          </div>

          {/* Section 2: Professional Details */}
          <h2>Section 2: Professional Details</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px'}}>
            <div><label>Occupation / Profession</label><input type="text" name="occupation" required /></div>
            <div><label>Organization / Company Name</label><input type="text" name="organization" /></div>
            <div><label>Position / Title</label><input type="text" name="position" /></div>
            <div><label>Years of Experience</label><input type="number" name="yearsOfExperience" /></div>
          </div>

          {/* Section 3: Ambassador Role */}
          <h2>Section 3: Ambassador Role</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px'}}>
            <div>
              <label>Type of Ambassador</label>
              <select name="ambassadorType" required defaultValue="">
                <option value="" disabled>Select Category</option>
                <option>Patron</option>
                <option>Board of Trustee</option>
                <option>Advisory Board Member</option>
                <option>Sponsor</option>
                <option>Donor</option>
                <option>Corporate Ambassador</option>
                <option>Partner</option>
                <option>Mentor</option>
                <option>Technical Advisor</option>
                <option>Legal Advisor</option>
                <option>Health Ambassador</option>
                <option>Education Ambassador</option>
                <option>Youth Ambassador</option>
                <option>Community Liaison</option>
                <option>Alumni Representative</option>
                <option>Media Ambassador</option>
                <option>Sports Ambassador</option>
                <option>Cultural Ambassador</option>
                <option>Volunteer</option>
                <option>Supporter</option>
              </select>
            </div>
            <div>
              <label>Estimated Support Commitment</label>
              <select name="supportCommitment" required defaultValue="">
                <option value="" disabled>Select Option</option>
                <option>One-Time Donation</option>
                <option>Monthly Support</option>
                <option>Yearly Sponsorship</option>
                <option>Project-Based Support</option>
              </select>
            </div>
            <div style={{gridColumn: '1 / -1'}}>
              <label>How would you like to support the organization?</label>
              <select name="supportType" required defaultValue="">
                <option value="" disabled>Select Support Type</option>
                <option>Financial Support</option>
                <option>Mentorship</option>
                <option>Educational Programs</option>
                <option>Career Development</option>
                <option>Scholarship Support</option>
                <option>Training & Workshops</option>
                <option>Networking Opportunities</option>
                <option>Technical Expertise</option>
                <option>Legal Services</option>
                <option>Health Services</option>
                <option>Media & Publicity</option>
                <option>Community Outreach</option>
              </select>
            </div>
          </div>

          {/* Section 4: Contribution & Message */}
          <h2>Section 4: Contribution & Message</h2>
          <div>
            <label>Why do you want to become an Ambassador?</label>
            <textarea name="whyAmbassador" rows={4} required></textarea>
          </div>
          <div>
            <label>Message to EX-POLS Students</label>
            <textarea name="messageToStudents" rows={4}></textarea>
          </div>
          <div style={{marginTop: '18px'}}>
            <label>Upload Supporting Document (Optional) {docFileName && <span style={{color: 'green', fontSize: '0.9rem'}}>({docFileName} selected)</span>}</label>
            <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" onChange={handleDocChange} />
          </div>

          {/* Real Database Status Message */}
          {formStatus !== 'idle' && formStatus !== 'loading' && (
            <div style={{
              padding: '15px',
              borderRadius: '8px',
              marginTop: '20px',
              background: formStatus === 'success' ? '#dcfce7' : '#fee2e2',
              color: formStatus === 'success' ? '#166534' : '#991b1b',
              textAlign: 'center',
              fontWeight: 500
            }}>
              {statusMessage}
            </div>
          )}

          <button type="submit" disabled={formStatus === 'loading'} style={{ opacity: formStatus === 'loading' ? 0.7 : 1, marginTop: '20px' }}>
            {formStatus === 'loading' ? 'Processing...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}