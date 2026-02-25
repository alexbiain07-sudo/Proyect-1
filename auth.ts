import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
      // On initial sign-in, persist the Google profile data into the JWT
      if (account && profile) {
        token.googleId = profile.sub;
        token.name = profile.name;
        token.email = profile.email;
        token.picture = profile.picture;
        token.locale = (profile as Record<string, unknown>).locale as string | undefined;
        token.emailVerified = (profile as Record<string, unknown>).email_verified as boolean | undefined;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose Google data to the client session
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
    signIn: "/", // Redirect to home for custom sign-in UI
  },
  secret: process.env.NEXTAUTH_SECRET,
});
