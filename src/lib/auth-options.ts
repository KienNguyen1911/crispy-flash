import GoogleProvider from 'next-auth/providers/google';
import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({ 
      clientId: process.env.GOOGLE_CLIENT_ID || '', 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'openid email profile',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      console.log('JWT Callback - Account:', account);
      if (account) {
        token.accessToken = account.access_token;
        console.log('Set accessToken in JWT:', account.access_token);
      }
      console.log('JWT Token after:', token);
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      console.log('Session Callback - Token:', token);
      
      // Use the access token from JWT (either Google token or our JWT)
      if (token.accessToken) {
        session.accessToken = token.accessToken;
        console.log('Session Callback - Set accessToken:', token.accessToken);
      }
      
      console.log('Session Callback - Session after:', session);
      return session;
    },
  },
};

export default authOptions;