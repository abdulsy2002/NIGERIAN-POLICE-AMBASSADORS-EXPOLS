import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

function decodeJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const binary = Buffer.from(padded, 'base64').toString('binary');
    const jsonPayload = Array.from(binary)
      .map((char) => `%${('00' + char.charCodeAt(0).toString(16)).slice(-2)}`)
      .join('');

    return JSON.parse(decodeURIComponent(jsonPayload));
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const userSession = cookieStore.get('user_session');

  if (userSession) {
    try {
      const sessionData = decodeJwt(userSession.value);
      if (!sessionData || !sessionData.email) {
        return NextResponse.json({ loggedIn: false }, { status: 401 });
      }

      return NextResponse.json({
        loggedIn: true,
        user: {
          fullName: sessionData.fullName || sessionData.email,
          email: sessionData.email,
          role: sessionData.role,
          stateBaseCode: sessionData.stateBaseCode,
          stateBaseName: sessionData.stateBaseName,
        }
      });
    } catch {
      return NextResponse.json({ loggedIn: false }, { status: 401 });
    }
  }

  return NextResponse.json({ loggedIn: false }, { status: 401 });
}