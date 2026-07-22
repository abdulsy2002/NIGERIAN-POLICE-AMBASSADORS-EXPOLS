import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const userSession = cookieStore.get('user_session');
  
  if (userSession) {
    try {
      const sessionData = JSON.parse(userSession.value);
      return NextResponse.json({ 
        loggedIn: true, 
        user: {
          fullName: sessionData.fullName,
          email: sessionData.email
        }
      });
    } catch {
      return NextResponse.json({ loggedIn: false }, { status: 401 });
    }
  }
  
  return NextResponse.json({ loggedIn: false }, { status: 401 });
}