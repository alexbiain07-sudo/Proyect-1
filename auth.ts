import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Check if Google OAuth credentials are configured.
 * When not configured, the app falls back to a simple local sign-in flow.
 */
export const isAuthConfigured =
  !!process.env.GOOGLE_CLIENT_ID &&
  !!process.env.GOOGLE_CLIENT_SECRET &&
  !!process.env.NEXTAUTH_SECRET;

// Only initialize NextAuth when credentials are available
const authResult = isAuthConfigured
  ? NextAuth({
      providers: [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          authorization: {
            params: {
              prompt: "consent",
              access_type: "offline",
              response_type: "code",
              scope: "openid email profile",
            },
          },
        }),
      ],
      callbacks: {
        async jwt({ token, account, profile }) {
          if (account && profile) {
            token.googleId = profile.sub;
            token.name = profile.name;
            token.email = profile.email;
            token.picture = profile.picture;
          }
          return token;
        },
        async session({ session, token }) {
          if (session.user) {
            session.user.id = (token.googleId as string) || token.sub || "";
            session.user.name = (token.name as string) || "";
            session.user.email = (token.email as string) || "";
            session.user.image = (token.picture as string) || "";
          }
          return session;
        },
      },
      pages: {
        signIn: "/",
      },
      secret: process.env.NEXTAUTH_SECRET,
    })
  : null;

// Export safe stubs when auth is not configured
const noopHandler = () => new Response("Auth not configured", { status: 501 });

export const handlers = authResult?.handlers ?? { GET: noopHandler, POST: noopHandler };
export const signIn = authResult?.signIn ?? (async () => {});
export const signOut = authResult?.signOut ?? (async () => {});
export const auth = authResult?.auth ?? (async () => null);
