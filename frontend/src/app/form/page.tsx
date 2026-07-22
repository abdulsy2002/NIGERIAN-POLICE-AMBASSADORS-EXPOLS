"use client";
import "./form.css";
import { useState, useRef, FormEvent } from "react";
import { registerAlumni, updateAlumniProfile } from "@/app/actions";

// State Base Codes mapping
const STATE_BASE_CODES: Record<string, string> = {
  "Abia": "ABA", "Adamawa": "ADM", "Akwa Ibom": "AKI", "Anambra": "ANB",
  "Bauchi": "BCH", "Bayelsa": "BYL", "Benue": "BNU", "Borno": "BRN",
  "Cross River": "CRS", "Delta": "DLT", "Ebonyi": "EBN", "Edo": "EDO",
  "Ekiti": "EKT", "Enugu": "ENG", "FCT - Abuja": "ABJ", "Gombe": "GMB",
  "Imo": "IMO", "Jigawa": "JGW", "Kaduna": "KDN", "Kano": "KNC",
  "Katsina": "KTS", "Kebbi": "KBB", "Kogi": "KGI", "Kwara": "KWR",
  "Lagos": "LOS", "Nasarawa": "NSR", "Niger": "NGR", "Ogun": "OGN",
  "Ondo": "OND", "Osun": "OSN", "Oyo": "OYO", "Plateau": "PLT",
  "Rivers": "RVR", "Sokoto": "SKT", "Taraba": "TRB", "Yobe": "YOB",
  "Zamfara": "ZMF", "Diaspora": "DIA"
};

export default function FormPage() {
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const [passportBase64, setPassportBase64] = useState<string>("");
  
  const [ssceBase64, setSsceBase64] = useState<string>("");
  const [ssceFileName, setSsceFileName] = useState<string>("");

  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const [stateBaseCode, setStateBaseCode] = useState<string>("");
  const [stateBaseName, setStateBaseName] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert Passport to Base64
  const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPassportPreview(result);
        setPassportBase64(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert SSCE Certificate to Base64
  const handleSsceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSsceFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSsceBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle State Selection -> Auto-assign Base Code
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedState = e.target.value;
    const code = STATE_BASE_CODES[selectedState] || "NAT";
    setStateBaseCode(code);
    setStateBaseName(selectedState === "Diaspora" ? "Diaspora Base" : `${selectedState} Base`);
  };

  // Handle Form Submission to MongoDB
  // Change this line at the top of your file:
 

// ... inside your component ...

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setFormStatus('loading');
  setStatusMessage('');

  const form = e.currentTarget;
  const formData = new FormData(form);
  
  // Append the Base64 strings for images
  formData.append("passportPhoto", passportBase64);
  formData.append("ssceCertificate", ssceBase64);

  // ✅ Call the new update function instead of registerAlumni
  const result = await updateAlumniProfile(formData);

  if (result.success) {
    setFormStatus('success');
    setStatusMessage(result.message || "Profile completed successfully!");
    form.reset();
    setPassportPreview(null);
    setPassportBase64("");
    setSsceBase64("");
    setSsceFileName("");
  } else {
    setFormStatus('error');
    setStatusMessage(result.message || "Failed to update profile.");
  }
};

  return (
    <div className="form-page-wrapper">
      <div className="container">
        <h1>
          NIGERIAN POLICE AMBASSADORS EXPOLS
          <br />
          <span style={{ fontSize: "1.2rem", color: "#666" }}>National Base Registration</span>
        </h1>

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
              style={{ display: "none" }}
              onChange={handlePassportChange}
              ref={fileInputRef}
              required
            />
          </div>

          {/* Section 1: Personal Identification */}
          <h2>Section 1: Personal Identification</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
            <div><label>Full Name</label><input type="text" name="fullName" required /></div>
            <div><label>Other Name</label><input type="text" name="otherName" /></div>
            <div>
              <label>Gender</label>
              <select name="gender" required defaultValue="">
                <option value="" disabled>Select</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div><label>Date of Birth</label><input type="date" name="dateOfBirth" required /></div>
            <div><label>NIN</label><input type="text" name="nin" required /></div>
            <div><label>Phone Number</label><input type="tel" name="phoneNumber" required /></div>
          
          </div>
          <div style={{ marginTop: "18px" }}>
            <label>Residential Address</label>
            <textarea name="residentialAddress" rows={3} required />
          </div>

          {/* Section 2: PSS Academic History */}
          <h2>Section 2: PSS Academic History</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label>School Attended</label>
              <select name="schoolAttended" required defaultValue="">
                <option value="" disabled>Select School</option>
                <option>Abia - Police Secondary School, Obeaku-Ndoki</option>
                <option>Abuja - Police Day Secondary School, Dei-Dei</option>
                <option>Abuja - Police Day Secondary School, Area 11</option>
                <option>Akwa Ibom - Police Secondary School, Ukana</option>
                <option>Cross River - Police Secondary School, Calabar</option>
                <option>Gombe - Police Secondary School, Kumo</option>
                <option>Imo - Police Secondary School, Isu-Nwangele</option>
                <option>Kaduna - Police Secondary School, Karau-Karau</option>
                <option>Kaduna - Police Secondary School, Tum-Kagoro</option>
                <option>Kano - Police Girls&apos; Secondary School, Shanono</option>
                <option>Kano - Police Secondary School, Dawakin-Kudu</option>
                <option>Katsina - Police Boys&apos; Secondary School, Mani</option>
                <option>Katsina - Police Basic Secondary School, Daura</option>
                <option>Kwara - Police Secondary School, Ballah</option>
                <option>Kwara - Police Day Secondary School, Ilorin</option>
                <option>Lafia - Police Secondary School, Lafia</option>
                <option>Niger - Police Secondary School, Minna</option>
                <option>Niger - Police Boys&apos; Secondary School, Bida</option>
                <option>Niger - Police Secondary School, Nami-Agaie</option>
                <option>Ogun - Police Secondary School, Erinja</option>
                <option>Ogun - Police Secondary School, Sagamu</option>
                <option>Ondo - Police Secondary School, Akure</option>
                <option>Ondo - Police Secondary School, Isua-Akoko</option>
                <option>Oyo - Police Secondary School, Igboora</option>
                <option>Plateau - Police Secondary School, Bashar</option>
                <option>Rivers - Police Comprehensive Secondary School</option>
                <option>Yobe - Police Secondary School, Damaturu</option>
                <option>Zamfara - Police Secondary School, Gusau</option>
              </select>
            </div>
            <div><label>Admission Number</label><input type="text" name="admissionNumber" required /></div>
            <div><label>Year of Admission</label><input type="number" name="yearOfAdmission" required /></div>
            <div><label>Year of Graduation</label><input type="number" name="yearOfGraduation" required /></div>
            <div><label>House/Hostel</label><input type="text" name="houseHostel" /></div>
            <div><label>Position(s) Held</label><input type="text" name="positionsHeld" /></div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label>Upload SSCE CERTIFICATE {ssceFileName && <span style={{color: 'green', fontSize: '0.9rem'}}>({ssceFileName} selected)</span>}</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleSsceChange} required />
            </div>
          </div>

          {/* Section 3: Professional & Contact Details */}
          <h2>Section 3: Professional &amp; Contact Details</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
            <div>
              <label>Highest Qualification</label>
              <select name="highestQualification" required defaultValue="">
                <option value="" disabled>Select</option>
                <option>SSCE</option><option>ND</option><option>NCE</option><option>B.Sc</option>
                <option>M.Sc</option><option>PhD</option><option>PROF</option><option>Professional Certificate</option>
              </select>
            </div>
            <div>
              <label>Current Occupation</label>
              <select name="currentOccupation" required defaultValue="">
                <option value="" disabled>Select</option>
                <optgroup label="Medical"><option>Doctor</option><option>Nurse</option><option>Pharmacist</option><option>Medical Laboratory Scientist</option><option>Radiographer</option><option>Physiotherapist</option><option>Dentist</option><option>Optometrist</option><option>Midwife</option><option>Community Health Worker</option></optgroup>
                <optgroup label="Security &amp; Military"><option>Soldier</option><option>Police Officer</option><option>Customs Officer</option><option>Immigration Officer</option><option>Civil Defence Officer</option><option>Navy Officer</option><option>Air Force Officer</option><option>Firefighter</option><option>Prison Officer</option><option>Road Safety Officer</option></optgroup>
                <optgroup label="Finance &amp; Business"><option>Banker</option><option>Accountant</option><option>Auditor</option><option>Business Analyst</option><option>Entrepreneur</option><option>Stock Broker</option><option>Financial Advisor</option><option>Loan Officer</option><option>Insurance Agent</option><option>Marketing Executive</option></optgroup>
                <optgroup label="Education &amp; Academia"><option>Teacher</option><option>Lecturer</option><option>School Administrator</option><option>Guidance Counselor</option><option>Education Consultant</option><option>Librarian</option><option>Researcher</option><option>Curriculum Developer</option><option>Tutor</option><option>Special Education Teacher</option></optgroup>
                <optgroup label="Technology &amp; Engineering"><option>Software Developer</option><option>Web Developer</option><option>Mobile App Developer</option><option>Data Analyst</option><option>Data Scientist</option><option>Cybersecurity Analyst</option><option>Network Engineer</option><option>IT Support Specialist</option><option>UI/UX Designer</option><option>Game Developer</option><option>Civil Engineer</option><option>Mechanical Engineer</option><option>Electrical Engineer</option><option>Petroleum Engineer</option><option>Chemical Engineer</option><option>Architect</option><option>Quantity Surveyor</option><option>Surveyor</option><option>Technician</option><option>Welder</option></optgroup>
                <optgroup label="Creative &amp; Media"><option>Graphic Designer</option><option>Photographer</option><option>Videographer</option><option>Musician</option><option>Actor</option><option>Fashion Designer</option><option>Tailor</option><option>Makeup Artist</option><option>Content Creator</option><option>Journalist</option></optgroup>
                <optgroup label="Agriculture"><option>Farmer</option><option>Agricultural Engineer</option><option>Agronomist</option><option>Fisherman</option><option>Livestock Farmer</option><option>Forestry Officer</option><option>Environmental Scientist</option><option>Horticulturist</option><option>Soil Scientist</option><option>Farm Manager</option></optgroup>
                <optgroup label="Transport &amp; Logistics"><option>Driver</option><option>Pilot</option><option>Ship Captain</option><option>Logistics Manager</option><option>Dispatch Rider</option><option>Transport Officer</option><option>Flight Attendant</option><option>Courier Service Worker</option><option>Warehouse Manager</option><option>Supply Chain Analyst</option></optgroup>
                <optgroup label="Services &amp; Others"><option>Chef</option><option>Hotel Manager</option><option>Waiter/Waitress</option><option>Cleaner</option><option>Security Guard</option><option>Hairdresser/Barber</option><option>Event Planner</option><option>Real Estate Agent</option><option>Plumber</option><option>Electrician</option><option>NILL</option></optgroup>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label>State of Residence (Your Base)</label>
              <select name="stateOfResidence" onChange={handleStateChange} required defaultValue="">
                <option value="" disabled>Select State</option>
                <option>Abia</option><option>Adamawa</option><option>Akwa Ibom</option><option>Anambra</option>
                <option>Bauchi</option><option>Bayelsa</option><option>Benue</option><option>Borno</option>
                <option>Cross River</option><option>Delta</option><option>Ebonyi</option><option>Edo</option>
                <option>Ekiti</option><option>Enugu</option><option>Gombe</option><option>Imo</option>
                <option>Jigawa</option><option>Kaduna</option><option>Kano</option><option>Katsina</option>
                <option>Kebbi</option><option>Kogi</option><option>Kwara</option><option>Lagos</option>
                <option>Nasarawa</option><option>Niger</option><option>Ogun</option><option>Ondo</option>
                <option>Osun</option><option>Oyo</option><option>Plateau</option><option>Rivers</option>
                <option>Sokoto</option><option>Taraba</option><option>Yobe</option><option>Zamfara</option>
                <option>FCT - Abuja</option><option>Diaspora</option>
              </select>
              {stateBaseCode && (
                <p style={{ marginTop: "8px", fontSize: "0.9rem", color: "#003366", fontWeight: "600" }}>
                  ✓ You will be registered under: <strong>{stateBaseName}</strong> (Code: {stateBaseCode})
                </p>
              )}
            </div>
          </div>

          {/* Section 4: Alumni Engagement */}
          <h2>Section 4: Alumni Engagement</h2>
          <div>
            <label>Member of Alumni Chapter?</label>
            <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "normal", cursor: "pointer", marginTop: "0" }}>
                <input type="radio" name="alumniMember" value="Yes" style={{ width: "auto" }} required /> Yes
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "normal", cursor: "pointer", marginTop: "0" }}>
                <input type="radio" name="alumniMember" value="No" style={{ width: "auto" }} /> No
              </label>
            </div>
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
            {formStatus === 'loading' ? 'Processing...' : 'Submit Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}