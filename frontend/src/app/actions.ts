"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// ==========================================
// SESSION UTILITIES
// ==========================================
async function getUserToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("user_session")?.value;
}

async function getUserRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('user_refresh')?.value;
}

async function getAdminToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("admin_session")?.value;
  if (adminCookie) return adminCookie;

  const userCookie = cookieStore.get("user_session")?.value;
  if (userCookie) {
    const payload = decodeJwtPayload(userCookie);
    const adminRoles = ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_ADMIN'];
    if (payload && adminRoles.includes(payload.role)) {
      return userCookie;
    }
  }
  return undefined;
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

    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.message || result.error || "Login failed." };
    }

    const cookieStore = await cookies();
    cookieStore.set("user_session", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    cookieStore.set('user_refresh', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

export async function logoutUser() {
  const refreshToken = await getUserRefreshToken();
  if (refreshToken) {
    await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    }).catch(() => undefined);
  }
  const cookieStore = await cookies();
  cookieStore.delete("user_session");
  cookieStore.delete('user_refresh');
  return { success: true };
}

export async function getCurrentUser() {
  try {
    const token = await getUserToken();
    if (!token) return null;

    const payload = decodeJwtPayload(token);
    // revalidate: 0 — always fetch fresh personal auth data
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const result = await response.json();
    
    if (response.ok && result?.id) {
      return {
        ...result,
        userType: String(payload.role || '').toLowerCase(),
        _id: result.id
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

    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.message || result.error || "Login failed." };
    }

    const cookieStore = await cookies();
    cookieStore.set("admin_session", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    cookieStore.set('admin_refresh', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
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
  if (!payload) return null;
  return {
    adminId: payload?.sub,
    email: payload?.email,
    fullName: payload?.fullName,
    role: payload?.role,
    stateBase: payload?.stateBaseCode,
    stateBaseName: payload?.stateBaseName,
    mustChangePassword: payload?.mustChangePassword
  };
}

export async function getAdminSummary() {
  try {
    const token = await getAdminToken();
    if (!token) return { success: false, message: 'Unauthorized' };
    const nestApi = process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100';
    const response = await fetch(`${nestApi}/admin/summary`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const data = await response.json();
    return response.ok
      ? { success: true, data }
      : { success: false, message: data.message || 'Unable to load admin summary.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Unable to load admin summary.' };
  }
}

export async function getAdminData(
  stateBaseCode?: string,
  resource?: 'alumni' | 'ambassadors' | 'reunions' | 'messages',
  page = 1,
  pageSize = 25,
) {
  try {
    const token = await getAdminToken();
    if (!token) return { success: false, message: "Unauthorized" };

    const nestApi = process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100';
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (stateBaseCode) query.set('stateBaseCode', stateBaseCode);
    const nestHeaders = { Authorization: `Bearer ${token}` };
    if (resource) {
      const endpoints = {
        alumni: `${nestApi}/admin/alumni?${query}`,
        ambassadors: `${nestApi}/admin/ambassadors?${query}`,
        reunions: `${nestApi}/admin/reunion-registrations?${query}`,
        messages: `${nestApi}/contact/admin/messages?${query}`,
      };
      const response = await fetch(endpoints[resource], { headers: nestHeaders, cache: 'no-store' });
      const responseData = await response.json();
      if (!response.ok) {
        return { success: false, message: responseData.message || `Unable to load ${resource}.` };
      }
      const result = Array.isArray(responseData) ? responseData : responseData.data;
      return {
        success: true,
        [resource]: Array.isArray(result) ? result : [],
        pagination: responseData.pagination,
      };
    }

    // Load the full dataset only for callers that explicitly need all admin lists.
    const [alumniResponse, ambassadorResponse, reunionRes, contactMessagesRes]: [Response, Response, any, any] = await Promise.all([
      fetch(`${nestApi}/admin/alumni?${query}`, { headers: nestHeaders, cache: 'no-store' }),
      fetch(`${nestApi}/admin/ambassadors?${query}`, { headers: nestHeaders, cache: 'no-store' }),
      fetch(`${nestApi}/admin/reunion-registrations?${query}`, { headers: nestHeaders, cache: 'no-store' }),
      fetch(`${nestApi}/contact/admin/messages?${query}`, { headers: nestHeaders, cache: 'no-store' })
    ]);
    const alumniRes = { success: alumniResponse.ok, data: await alumniResponse.json() };
    const ambassadorRes = { success: ambassadorResponse.ok, data: await ambassadorResponse.json() };
    const reunionResponse = reunionRes as Response;
    const reunionData = { success: reunionResponse.ok, data: await reunionResponse.json() };
    const contactResponse = contactMessagesRes as Response;
    const contactData = { success: contactResponse.ok, data: await contactResponse.json() };

    const extractArray = (res: any) => {
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      if (res && res.data && Array.isArray(res.data.data)) return res.data.data;
      if (res && Array.isArray(res.alumni)) return res.alumni;
      if (res && Array.isArray(res.ambassadors)) return res.ambassadors;
      if (res && Array.isArray(res.messages)) return res.messages;
      return [];
    };

    return {
      success: true,
      alumni: extractArray(alumniRes),
      ambassadors: extractArray(ambassadorRes),
      reunions: extractArray(reunionData),
      messages: extractArray(contactData)
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
    const body: Record<string, any> = {};
    if (formData instanceof FormData) {
      formData.forEach((value, key) => {
        body[key] = value;
      });
    } else {
      Object.assign(body, formData);
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/alumni/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, message: result.message || result.error || 'Registration failed.' };
    }
    return result;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function submitAmbassadorRegistration(formData: FormData | any) {
  try {
    const body: Record<string, any> = {};
    if (formData instanceof FormData) {
      formData.forEach((value, key) => {
        body[key] = value;
      });
    } else {
      Object.assign(body, formData);
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/ambassadors/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, message: result.message || result.error || 'Registration failed.' };
    }
    return result;
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/admin/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ userId, userType }), cache: 'no-store' });
    const data = await response.json();
    return response.ok ? data : { success: false, error: data.message || data.error };
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
      body.stateBaseCode = formData.get("stateBaseCode") as string;
      body.amount = Number(formData.get("amount"));
      body.notes = (formData.get("notes") as string) || "";
      body.customReason = (formData.get("customReason") as string) || "";
    } else {
      body = formData;
    }

    const token = await getUserToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/payments/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const result = await response.json();
    return response.ok ? result : { success: false, error: errorMessage(result) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function verifyPayment(reference: string): Promise<any> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/payments/verify/${encodeURIComponent(reference)}`, { cache: 'no-store' });
    return await response.json();
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
    if (!token) {
      return { success: false, error: "Administrator session required. Please log in." };
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/admin/audit-logs?limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.message || data.error || `Failed to fetch logs (Status ${response.status})` };
    }
    const logs = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return { success: true, data: logs };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// ADMIN CONTENT ACTIONS
// ==========================================
export async function deleteRecord(recordId: string, recordType: string, adminEmail: string) {
  try {
    const token = await getAdminToken();
    const endpoint = recordType === 'alumni' ? 'alumni' : 'ambassadors';
    const nestApi = process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100';
    const response = await fetch(`${nestApi}/admin/${endpoint}/${recordId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, message: result.message || 'Failed to delete record.' };
    }
    return { success: true, message: result.message || 'Record deleted successfully.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function sendBroadcast(formData: FormData) {
  try {
    const token = await getAdminToken();
    const body: Record<string, any> = {};
    formData.forEach((value, key) => {
      body[key] = value;
    });
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/admin/broadcasts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const result = await response.json();
    return response.ok ? { ...result, message: result.message || 'Broadcast sent successfully.' } : { success: false, error: result.message || result.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBroadcasts(page = 1) {
  try {
    const token = await getAdminToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/admin/broadcasts?page=${page}&pageSize=20`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const data = await response.json();
    return response.ok
      ? { success: true, data: Array.isArray(data.data) ? data.data : [], pagination: data.pagination }
      : { success: false, error: data.message || data.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserBroadcasts(stateBaseCode?: string, page = 1) {
  try {
    const token = await getUserToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/auth/broadcasts?page=${page}&pageSize=20`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const data = await response.json();
    return response.ok
      ? { success: true, data: Array.isArray(data.data) ? data.data : [], pagination: data.pagination }
      : { success: false, error: data.message || data.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function uploadGalleryImage(formData: FormData) {
  try {
    const token = await getAdminToken();
    const body: Record<string, any> = {};
    formData.forEach((value, key) => { body[key] = value; });
    if (typeof body.role === 'string') body.role = body.role.toUpperCase();
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/gallery`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body), cache: 'no-store' });
    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getGalleryImages(stateBaseCode = 'NAT', admin = false, page = 1, pageSize = 24) {
  try {
    const token = admin ? await getAdminToken() : await getUserToken();
    const query = new URLSearchParams({ stateBaseCode, page: String(page), pageSize: String(pageSize) });
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/gallery?${query}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });
    const data = await response.json();
    return response.ok
      ? { success: true, data: Array.isArray(data) ? data : data.data, pagination: data.pagination }
      : { success: false, error: data.message || data.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateGalleryImage(formData: FormData) {
  try {
    const token = await getAdminToken();
    const id = formData.get('id') as string;
    const body = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
    };
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/gallery/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body), cache: 'no-store' });
    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteGalleryImage(imageId: string) {
  try {
    const token = await getAdminToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/gallery/${imageId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBoardMembers(): Promise<any> {
  try {
    const token = await getAdminToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/admin/board-members`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    const data = await response.json();
    return response.ok ? { success: true, data } : { success: false, error: data.message || data.error };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function saveBoardMember(formData: FormData): Promise<any> {
  try {
    const token = await getAdminToken();
    if (!token) return { success: false, error: 'Unauthorized' };
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/admin/board-members/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body), cache: 'no-store' });
      const data = await response.json();
      return response.ok ? { success: true, data } : { success: false, error: data.message || data.error || 'Failed to update board member.' };
    } else {
      const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/admin/board-members`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body), cache: 'no-store' });
      const data = await response.json();
      return response.ok ? { success: true, data } : { success: false, error: data.message || data.error || 'Failed to create board member.' };
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'An unexpected error occurred while saving the board member.' };
  }
}

export async function deleteBoardMember(memberId: string): Promise<any> {
  try {
    const token = await getAdminToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/admin/board-members/${memberId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getReunionSettings(stateBaseCode = 'NAT', admin = false): Promise<any> {
  try {
    const nestApi = process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100';
    const token = admin ? await getAdminToken() : await getUserToken();
    const response = await fetch(`${nestApi}/reunion/settings?stateBaseCode=${encodeURIComponent(stateBaseCode)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });
    const resData = await response.json();
    const settings = resData.data || resData;
    return response.ok ? { success: true, data: settings } : { success: false, message: resData.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateReunionSettings(settingsData: any, stateBaseCode = 'NAT'): Promise<any> {
  try {
    const token = await getAdminToken();
    const nestApi = process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100';
    const response = await fetch(`${nestApi}/reunion/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...settingsData, stateBaseCode }),
      cache: 'no-store',
    });
    const data = await response.json();
    return response.ok ? { success: true, data } : { success: false, message: data.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getUserDetails(userId: string, userType: 'alumni' | 'ambassador') {
  try {
    const token = await getAdminToken();
    if (!token) return { success: false, error: 'Administrator session required.' };
    const endpoint = userType === 'alumni' ? 'alumni' : 'ambassadors';
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/admin/${endpoint}/${encodeURIComponent(userId)}`,
      { headers: { Authorization: 'Bearer ' + token }, cache: 'no-store' },
    );
    const data = await response.json();
    return response.ok
      ? { success: true, data }
      : { success: false, error: data.message || 'Unable to load member details.' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unable to load member details.' };
  }
}

export async function submitContactForm(formData: FormData) {
  try {
    const body: Record<string, any> = {};
    formData.forEach((value, key) => {
      body[key] = value;
    });

    const token = await getUserToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/contact/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = await response.json();
    return response.ok ? data : { success: false, error: data.message || data.error };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function submitReunionRegistration(formData: FormData): Promise<any> {
  try {
    const body: Record<string, any> = {};
    formData.forEach((value, key) => {
      body[key] = value;
    });
    const token = await getUserToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/reunion/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const result = await response.json();
    return response.ok ? result : { success: false, error: result.message || result.error || 'Registration failed.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getUserReunions(email: string) {
  try {
    const token = await getUserToken();
    if (!token) return { success: false, data: [], message: 'Unauthorized' };

    const nestApi = process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100';
    const response = await fetch(`${nestApi}/reunion/registrations?email=${encodeURIComponent(email)}&page=1&pageSize=25`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) return { success: false, data: [], message: 'Unable to load reunion registrations' };
    const data = await response.json();
    return { success: true, data: Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [] };
  } catch (error: any) {
    return { success: false, data: [], message: error.message || 'Unable to load reunion registrations' };
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
  try {
    const token = await getAdminToken();
    if (!token) return { success: false, error: 'Unauthorized', data: [] };
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/admin/admins`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    const data = await response.json();
    return response.ok ? { success: true, data } : { success: false, error: data.message || data.error, data: [] };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function addNewAdmin(formData: FormData) {
  try {
    const token = await getAdminToken();
    if (!token) return { success: false, error: 'Unauthorized' };
    const body: Record<string, any> = {};
    formData.forEach((value, key) => { body[key] = value; });
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/admin/admins`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body), cache: 'no-store' });
    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAdmin(adminId: string) {
  try {
    const token = await getAdminToken();
    if (!token) return { success: false, error: 'Unauthorized' };
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/admin/admins/${adminId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
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
  try {
    const token = await getUserToken();
    const body: Record<string, any> = {};
    formData.forEach((value, key) => { body[key] = value; });
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/support/tickets`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body), cache: 'no-store' });
    const data = await response.json();
    return response.ok ? data : { success: false, error: data.message || data.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserTickets(page = 1, pageSize = 25) {
  try {
    const token = await getUserToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/support/tickets?page=${page}&pageSize=${pageSize}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    const data = await response.json();
    return response.ok
      ? { success: true, data: Array.isArray(data) ? data : data.data, pagination: data.pagination }
      : { success: false, error: data.message || data.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllSupportTickets(stateBaseCode?: string, page = 1, pageSize = 25): Promise<any> {
  try {
    const token = await getAdminToken();
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (stateBaseCode) params.set('stateBaseCode', stateBaseCode);
    const query = `?${params}`;
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/support/admin/tickets${query}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    const data = await response.json();
    return response.ok
      ? { success: true, data: Array.isArray(data) ? data : data.data, pagination: data.pagination }
      : { success: false, error: data.message || data.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function respondToTicket(formData: FormData | any): Promise<any> {
  try {
    const token = await getAdminToken();
    const ticketId = formData instanceof FormData ? formData.get('ticketId') : formData.ticketId;
    const message = formData instanceof FormData ? formData.get('message') : formData.message;
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/support/admin/tickets/${ticketId}/respond`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ message }), cache: 'no-store' });
    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTicketStatus(ticketId: string, status: string): Promise<any> {
  try {
    const token = await getAdminToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/support/admin/tickets/${ticketId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }), cache: 'no-store' });
    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllPayments(stateBaseCode?: string, page = 1, pageSize = 25): Promise<any> {
  try {
    const token = await getAdminToken();
    const nestApi = process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100';
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (stateBaseCode) params.set('stateBaseCode', stateBaseCode);
    const query = `?${params}`;
    const response = await fetch(`${nestApi}/payments${query}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: errorMessage(error) };
    }
    const data = await response.json();
    return { success: true, data: Array.isArray(data) ? data : data.data, pagination: data.pagination };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load payments.' };
  }
}

export async function updateCurrentUser(payload: any): Promise<any> {
  const token = await getUserToken();
  if (!token) return { success: false, error: 'Not authenticated' };
  try {
    const nestApi = process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100';
    const response = await fetch(`${nestApi}/auth/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    const data = await response.json();
    return response.ok
      ? { success: true, data: data.data ?? data, message: data.message }
      : { success: false, error: data.message || 'Unable to save profile changes' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdminProfileRequests(page = 1): Promise<any> {
  try {
    const token = await getAdminToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    const nestApi = process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100';
    const response = await fetch(`${nestApi}/admin/profile-requests?page=${page}&pageSize=20`, {
      headers: { Authorization: 'Bearer ' + token },
      cache: 'no-store',
    });
    const data = await response.json();
    return response.ok
      ? { success: true, data: Array.isArray(data.data) ? data.data : [], pagination: data.pagination }
      : { success: false, error: data.message || 'Unable to load profile update requests' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unable to load profile update requests' };
  }
}

export async function processAdminProfileRequest(id: string, action: 'approve' | 'reject'): Promise<any> {
  try {
    const token = await getAdminToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    const nestApi = process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100';
    const response = await fetch(`${nestApi}/admin/profile-requests/` + encodeURIComponent(id), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ action }),
      cache: 'no-store',
    });
    const data = await response.json();
    return response.ok
      ? { success: true, data }
      : { success: false, error: data.message || 'Unable to process profile update request' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unable to process profile update request' };
  }
}

export async function registerUser(formData: FormData | any): Promise<any> {
  try {
    const body: Record<string, any> = {};
    if (formData instanceof FormData) {
      formData.forEach((value, key) => {
        body[key] = value;
      });
    } else {
      Object.assign(body, formData);
    }

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

    if (body.stateBase) {
      body.stateBaseCode = STATE_BASE_CODES[body.stateBase] || 'NAT';
      body.stateBaseName = body.stateBase === 'Diaspora' ? 'Diaspora Base' : `${body.stateBase} Base`;
    }

    body.userType = (body.userType || 'alumni').toUpperCase();
    if (!body.fullName) {
      body.fullName = body.email ? body.email.split('@')[0] : 'Member';
    }

    const nestApi = process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100';
    const registerPayload = {
      email: body.email,
      password: body.password,
      fullName: body.fullName,
      userType: body.userType,
      stateBase: body.stateBase,
      stateBaseCode: body.stateBaseCode,
      stateBaseName: body.stateBaseName,
    };
    const response = await fetch(`${nestApi}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerPayload),
      cache: 'no-store',
    });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, message: result.message || result.error || 'Registration failed.' };
    }

    if (result.accessToken) {
      const cookieStore = await cookies();
      cookieStore.set("user_session", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      cookieStore.set("user_refresh", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    return { success: true, ...result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function validateMember(identityNumber: string): Promise<any> {
  try {
    const nestApi = process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100';
    const response = await fetch(`${nestApi}/auth/validate?query=${encodeURIComponent(identityNumber)}`, {
      cache: 'no-store',
    });
    const result = await response.json();
    return result;
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to connect to validation service.' };
  }
}

export async function getPaymentSettings(stateBaseCode = 'NAT', admin = false): Promise<any> {
  try {
    const token = admin ? await getAdminToken() : await getUserToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/payments/settings?stateBaseCode=${encodeURIComponent(stateBaseCode)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });
    const result = await response.json();
    return response.ok ? result : { success: false, error: errorMessage(result) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load payment options.' };
  }
}

export async function updatePaymentSettings(purposes: any[], stateBaseCode = 'NAT'): Promise<any> {
  try {
    const token = await getAdminToken();
    if (!token) return { success: false, error: 'Administrator session required. Please log in.' };
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:5100'}/payments/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ purposes, stateBaseCode }),
      cache: 'no-store',
    });
    const result = await response.json();
    return response.ok ? result : { success: false, error: errorMessage(result) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update payment options.' };
  }
}

function errorMessage(result: any): string {
  const message = result?.message || result?.error;
  return Array.isArray(message) ? message.join(', ') : message || 'Request failed.';
}