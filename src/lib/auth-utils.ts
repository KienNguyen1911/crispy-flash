import { getSession } from 'next-auth/react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function exchangeGoogleTokenForJWT(googleToken: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/api/auth/google/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken: googleToken }),
    });
    
    if (response.ok) {
      const { access_token } = await response.json();
      console.log('Successfully exchanged Google token for JWT:', access_token);
      return access_token;
    } else {
      console.error('Failed to exchange token:', await response.text());
      throw new Error('Token exchange failed');
    }
  } catch (error) {
    console.error('Error exchanging token:', error);
    throw error;
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  const session = await getSession();
  
  if (!session?.accessToken) {
    return null;
  }
  
  // Check if it's a Google token (longer) or our JWT (shorter)
  // Google tokens are typically much longer than JWT tokens
  if (session.accessToken.length > 500) {
    // Likely a Google token, exchange it
    try {
      return await exchangeGoogleTokenForJWT(session.accessToken);
    } catch (error) {
      console.error('Failed to exchange Google token, using original:', error);
      return session.accessToken;
    }
  }
  
  // Already a JWT token
  return session.accessToken;
}