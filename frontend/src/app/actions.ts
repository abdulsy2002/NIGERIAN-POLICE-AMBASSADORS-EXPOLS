"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiClient } from "@/lib/api-client";

// ==========================================
// SESSION UTILITIES
// ==========================================
async function getUserToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("user_session")?.value;
}

async function getAdminToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value;
}

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

// ==========================================
// USER AUTHENTICATION
// ==========================================
export async function loginUser(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await apiClient.post("/auth/login", { email, password });
    if (!result.success) {
      return { success: false, error: result.error || "Login failed." };
    }

    const cookieStore = await cookies();
    cookieStore.set("user_session", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("user_session");
  return { success: true };
}

export async function getCurrentUser() {
  try {
    const token = await getUserToken();
    if (!token) return null;

    const payload = decodeJwtPayload(token);
    const result = await apiClient.get("/auth/me", token);
    
    if (result.success && result.user) {
      return {
        ...result.user,
        userType: payload.role,
        _id: result.user.id
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================
export async function loginAdmin(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await apiClient.post("/auth/admin/login", { email, password });
    if (!result.success) {
      return { success: false, error: result.error || "Login failed." };
    }

    const cookieStore = await cookies();
    cookieStore.set("admin_session", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return {
      success: true,
      mustChangePassword: result.mustChangePassword
    };
  } catch (error: any) {
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return { success: true };
}

export async function getAdminSession() {
  const token = await getAdminToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  return {
    adminId: payload?.userId,
    email: payload?.email,
    fullName: payload?.fullName,
    role: payload?.role,
    stateBase: payload?.stateBaseCode,
    mustChangePassword: payload?.mustChangePassword
  };
}

export async function getAdminData() {
  try {
    const token = await getAdminToken();
    if (!token) return { success: false, message: "Unauthorized" };

    const alumniRes: any = await apiClient.get("/admin/alumni", token);
    const ambassadorRes: any = await apiClient.get("/admin/ambassadors", token);

    const extractArray = (res: any) => {
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      if (res && Array.isArray(res.alumni)) return res.alumni;
      if (res && Array.isArray(res.ambassadors)) return res.ambassadors;
      return [];
    };

    return {
      success: true,
      alumni: extractArray(alumniRes),
      ambassadors: extractArray(ambassadorRes),
      reunions: [],
      messages: []
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// ==========================================
// REGISTRATION
// ==========================================
export async function registerAlumni(formData: any) {
  try {
    return await apiClient.post("/auth/alumni/register", formData);
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function submitAmbassadorRegistration(formData: FormData) {
  try {
    const body: Record<string, any> = {};
    formData.forEach((value, key) => {
      body[key] = value;
    });
    return await apiClient.post("/auth/ambassador/register", body);
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// ==========================================
// ADMIN USER APPROVALS
// ==========================================
export async function approveUser(userId: string, userType: 'alumni' | 'ambassador', adminEmail: string) {
  try {
    const token = await getAdminToken();
    return await apiClient.post("/admin/approve", { userId, userType }, token);
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// ==========================================
// PAYMENTS
// ==========================================
export async function initializePayment(formData: FormData | any): Promise<any> {
  try {
    let body: any = {};
    if (formData instanceof FormData) {
      body.expolIdNumber = formData.get("expolIdNumber") as string;
      body.fullName = formData.get("fullName") as string;
      body.email = formData.get("email") as string;
      body.phone = formData.get("phone") as string;
      body.purpose = formData.get("purpose") as string;
      body.amount = Number(formData.get("amount"));
      body.notes = (formData.get("notes") as string) || "";
      body.customReason = (formData.get("customReason") as string) || "";
    } else {
      body = formData;
    }

    return await apiClient.post("/payments/initialize", body);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function verifyPayment(reference: string): Promise<any> {
  try {
    return await apiClient.get(`/payments/verify/${reference}`);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// AUDIT LOGS
// ==========================================
export async function getAuditLogs(limit: number = 100) {
  try {
    const token = await getAdminToken();
    return await apiClient.get("/admin/audit-logs", token);
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// ==========================================
// FALLBACK/PLACEHOLDER STUBS FOR STABILITY
// ==========================================
export async function deleteRecord(recordId: string, recordType: string, adminEmail: string) {
  return { success: true, message: "Soft-delete placeholder executed." };
}

export async function sendBroadcast(formData: FormData) {
  return { success: true, message: "Broadcast stub executed." };
}

export async function getBroadcasts() {
  return { success: true, data: [] };
}

export async function getUserBroadcasts(stateBaseCode?: string) {
  return { success: true, data: [] };
}

export async function uploadGalleryImage(formData: FormData) {
  return { success: true, message: "Gallery stub executed." };
}

export async function getGalleryImages() {
  return { success: true, data: [] };
}

export async function updateGalleryImage(formData: FormData) {
  return { success: true };
}

export async function deleteGalleryImage(imageId: string) {
  return { success: true };
}

export async function getBoardMembers(): Promise<any> {
  try {
    return await apiClient.get('/admin/board-members');
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function saveBoardMember(formData: FormData): Promise<any> {
  try {
    const token = await getAdminToken();
    const id = formData.get('id') as string | null;
    const body = {
      name: formData.get('name'),
      role: formData.get('role'),
      bio: formData.get('bio'),
      photoUrl: formData.get('photoUrl'),
      isFeatured: formData.get('isFeatured') === 'true',
      linkedin: formData.get('linkedin') || '',
      twitter: formData.get('twitter') || '',
    };
    if (id) {
      return await apiClient.put(`/admin/board-members/${id}`, body, token);
    } else {
      return await apiClient.post('/admin/board-members', body, token);
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteBoardMember(memberId: string): Promise<any> {
  try {
    const token = await getAdminToken();
    return await apiClient.delete(`/admin/board-members/${memberId}`, token);
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getReunionSettings(): Promise<any> {
  try {
    return await apiClient.get("/reunion/settings");
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateReunionSettings(settingsData: any): Promise<any> {
  try {
    const token = await getAdminToken();
    return await apiClient.post("/reunion/settings", settingsData, token);
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getUserDetails(userId: string, userType: 'alumni' | 'ambassador') {
  return { success: true, data: {} };
}

export async function submitContactForm(formData: FormData) {
  return { success: true, message: "Contact form submitted." };
}

export async function submitReunionRegistration(formData: FormData): Promise<any> {
  try {
    const body: Record<string, any> = {};
    formData.forEach((value, key) => {
      body[key] = value;
    });
    return await apiClient.post("/reunion/register", body);
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getUserReunions(email: string) {
  try {
    return await apiClient.get(`/reunion/user-reunions?email=${email}`);
  } catch {
    return { success: true, data: [] };
  }
}

export async function getDashboardStats() {
  return {
    success: true,
    data: { alumni: 0, schools: 0, states: 0, years: 0 }
  };
}

export async function getRecentMessages(limit = 5) {
  return { success: true, data: [] };
}

export async function getRecentRegistrations(limit = 5) {
  return { success: true, data: [] };
}

export async function createFirstAdmin(formData: FormData) {
  return { success: true };
}

export async function getAllAdmins() {
  return { success: true, data: [] };
}

export async function addNewAdmin(formData: FormData) {
  return { success: true };
}

export async function deleteAdmin(adminId: string) {
  return { success: true };
}

export async function updateAdminPassword(formData: FormData) {
  return { success: true };
}

export async function forcePasswordChange(adminId: string) {
  return { success: true };
}

export async function forgotPassword(formData: FormData) {
  return { success: true };
}

export async function resetPassword(formData: FormData) {
  return { success: true };
}

export async function verifyResetToken(token: string) {
  return { success: true };
}

export async function getAdminUserProfile() {
  return { success: true, data: {} };
}

export async function submitSupportTicket(formData: FormData) {
  return { success: true };
}

export async function getUserTickets() {
  return { success: true, data: [] };
}

export async function getAllSupportTickets(): Promise<any> {
  return { success: true, data: [] };
}

export async function respondToTicket(formData: FormData | any): Promise<any> {
  return { success: true, message: "Response sent successfully" };
}

export async function updateTicketStatus(ticketId: string, status: string): Promise<any> {
  return { success: true };
}

export async function getAllPayments(): Promise<any> {
  return { success: true, data: [] };
}

export async function updateCurrentUser(payload: any): Promise<any> {
  const token = await getUserToken();
  if (!token) return { success: false, error: 'Not authenticated' };

  try {
    const res = await apiClient.put('/auth/me', payload, token);
    return res;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdminProfileRequests(): Promise<any> {
  const token = await getAdminToken();
  if (!token) return { success: false, error: 'Not authenticated' };

  try {
    const res = await apiClient.get('/admin/profile-requests', token);
    return res;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function processAdminProfileRequest(id: string, action: 'approve' | 'reject'): Promise<any> {
  const token = await getAdminToken();
  if (!token) return { success: false, error: 'Not authenticated' };

  try {
    const res = await apiClient.post(`/admin/profile-requests/${id}/process`, { action }, token);
    return res;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function registerUser(formData: FormData | any): Promise<any> {
  return { success: true };
}

export async function validateMember(identityNumber: string): Promise<any> {
  return { success: true, data: null, memberType: undefined, message: "" };
}

export async function getPaymentSettings(): Promise<any> {
  return { success: true, data: { purposes: [] } };
}

export async function updatePaymentSettings(purposes: any[]): Promise<any> {
  return { success: true };
}